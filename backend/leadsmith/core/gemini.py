"""LLM gateway: OpenRouter for chat/structured output, Google Gemini for
embeddings, Tavily for web search — all rate-limited, retried, cached, metered.

The agents build on three primitives (interface unchanged from the old client):
  - structured(): JSON validated against a pydantic schema. Works across ANY
                  OpenRouter model (kimi / deepseek / nvidia / ...): the schema
                  is embedded in the prompt and JSON-mode is requested, with a
                  fallback for providers that reject response_format, array-aware
                  defensive parsing, and one corrective re-ask that carries the
                  concrete validation error.
  - search():     live web results via Tavily (replaces Gemini search grounding).
  - embed():      Gemini embedding vector for the RAG memory (asymmetric task
                  types) — kept on Gemini so the existing vector store stays valid.

Chat (NVIDIA) and embeddings (Gemini) hit different providers with separate
quotas, so each gets its own RateLimiter.
"""

from __future__ import annotations

import json
import re
from typing import TypeVar, get_origin

import httpx
import openai
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel, ValidationError
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from ..tools.web_search import web_search
from .cache import Cache, make_key
from .metrics import Metrics
from .rate_limiter import RateLimiter

T = TypeVar("T", bound=BaseModel)


def _is_transient_chat(exc: BaseException) -> bool:
    """Retry chat failures a later attempt could fix: per-minute rate-limit 429s,
    server 5xx, timeouts, connection errors. A *daily*-cap 429 (free-tier quota
    exhausted) won't clear on a 30s backoff, so fail fast. Permanent 4xx (400 bad
    request, 401/403 bad key, 404 no route) surface immediately."""
    if isinstance(exc, openai.APIStatusError):
        if exc.status_code == 429:
            body = f"{getattr(exc, 'message', '')} {getattr(exc, 'body', '')}".lower()
            daily = any(k in body for k in ("per-day", "per day", "daily", "quota"))
            return not daily  # retry per-minute bursts; fail fast on a daily cap
        return exc.status_code >= 500
    if isinstance(exc, (openai.APITimeoutError, openai.APIConnectionError)):
        return True
    return False


def _is_transient_embed(exc: BaseException) -> bool:
    """Same transient/permanent split, for the Gemini embedding SDK."""
    if isinstance(exc, genai_errors.ServerError):
        return True
    if isinstance(exc, genai_errors.ClientError):
        return getattr(exc, "code", None) == 429
    if isinstance(exc, httpx.TransportError):
        return True
    return False


def _retry(predicate):
    # Exponential backoff on transient failures — important on free tiers where
    # 429s are common. Permanent errors are not retried (see predicates above).
    return retry(
        retry=retry_if_exception(predicate),
        wait=wait_exponential(multiplier=2, min=2, max=30),
        stop=stop_after_attempt(4),
        reraise=True,
    )


def _extract_json(raw: str) -> str | None:
    """Pull the first balanced JSON value — object {...} OR array [...] — out of
    a model reply, tolerating ```json fences and surrounding prose. Bracket
    counting is string-aware so a bracket inside a string value doesn't close
    the value early. Array-aware because models often emit a bare [...] for
    single-list schemas (CompanyList/ContactList/HydeQueries)."""
    s = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    s = re.sub(r"\s*```$", "", s).strip()
    candidates = [i for i in (s.find("{"), s.find("[")) if i != -1]
    if not candidates:
        return None
    start = min(candidates)
    open_c = s[start]
    close_c = "}" if open_c == "{" else "]"
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(s)):
        c = s[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
        elif c == open_c:
            depth += 1
        elif c == close_c:
            depth -= 1
            if depth == 0:
                return s[start : i + 1]
    return None


def _single_list_field(schema: type[BaseModel]) -> str | None:
    """Name of the schema's sole list-typed field, else None. Used to wrap a
    bare-array reply (e.g. [{...}]) into {field: [...]} before validating."""
    list_fields = [
        name
        for name, f in schema.model_fields.items()
        if get_origin(f.annotation) is list
    ]
    return list_fields[0] if len(list_fields) == 1 else None


def _wrap_bare_list(snippet: str, schema: type[T]) -> dict | None:
    field = _single_list_field(schema)
    if field is None:
        return None
    try:
        data = json.loads(snippet)
    except (json.JSONDecodeError, ValueError):
        return None
    return {field: data} if isinstance(data, list) else None


def _unwrap_schema_echo(snippet: str, schema: type[T]) -> dict | None:
    """Some models (notably free OpenRouter ones) echo the JSON *schema* shape —
    ``{"type": "object", "properties": {<field>: <value>, ...}, "required": [...]}``
    — instead of a plain instance, nesting the real values under "properties".
    Lift those out so they can be validated against the schema. Returns None when
    the reply isn't a "properties"-wrapped object."""
    try:
        data = json.loads(snippet)
    except (json.JSONDecodeError, ValueError):
        return None
    if isinstance(data, dict) and isinstance(data.get("properties"), dict):
        return data["properties"]
    return None


def _format_validation_error(err: ValidationError | None) -> str:
    """Compact field-level summary of a pydantic validation error for re-asks."""
    if err is None:
        return ""
    try:
        parts = [
            f"{'.'.join(str(p) for p in e.get('loc', ()))}: {e.get('msg', '')}".strip(
                ": "
            )
            for e in err.errors()[:6]
        ]
        return "; ".join(p for p in parts if p)
    except Exception:
        return str(err)[:300]


class LLMClient:
    def __init__(
        self,
        *,
        nvidia_api_key: str,
        nvidia_model: str,
        nvidia_base_url: str,
        embedding_model: str,
        gemini_api_key: str,
        tavily_api_key: str,
        chat_limiter: RateLimiter,
        embed_limiter: RateLimiter,
        cache: Cache,
        metrics: Metrics,
    ) -> None:
        self._chat = openai.AsyncOpenAI(
            api_key=nvidia_api_key,
            base_url=nvidia_base_url,
            # Bound every request so a stalled free-tier endpoint fails fast and
            # is retried/surfaced, instead of hanging up to the SDK's 600s default.
            timeout=httpx.Timeout(60.0, connect=10.0),
            max_retries=0,  # retries/backoff are handled by tenacity (_retry)
            default_headers={
                "HTTP-Referer": "https://getleadsmith.ai",
                "X-Title": "Leadsmith",
            },
        )
        self._model = nvidia_model
        self._gemini = genai.Client(api_key=gemini_api_key)
        self._embedding_model = embedding_model
        self._tavily_api_key = tavily_api_key
        self._chat_limiter = chat_limiter
        self._embed_limiter = embed_limiter
        self._cache = cache
        self._metrics = metrics

    # --- structured chat (OpenRouter, any model) ---------------------------

    async def structured(self, prompt: str, schema: type[T]) -> T:
        key = make_key("structured", self._model, schema.__name__, prompt)
        cached = self._cache.get(key)
        if cached is not None:
            self._metrics.hit()
            return schema.model_validate_json(cached)
        self._metrics.miss()

        instructed = (
            f"{prompt}\n\nReturn ONLY a single JSON value (no markdown fences, no "
            f"prose) matching this JSON schema:\n"
            f"{json.dumps(schema.model_json_schema())}\n\n"
            "Output a JSON INSTANCE with real values — NOT the schema itself. Do "
            'not include "type", "properties", "$defs", "required", or "title" '
            "keys; emit only the data fields and their values."
        )
        text = await self._chat_json(instructed)
        parsed, err = self._coerce(text, schema)

        if parsed is None:
            # One corrective re-ask carrying the concrete validation reason — far
            # more likely to fix a constraint/field mismatch than a generic nudge.
            detail = _format_validation_error(err)
            text = await self._chat_json(
                f"{instructed}\n\nYour previous reply did not satisfy the schema"
                + (f" ({detail})" if detail else "")
                + ". Reply with corrected JSON only.\nPrevious reply:\n"
                + text
            )
            parsed, err = self._coerce(text, schema)

        if parsed is None:
            detail = _format_validation_error(err)
            raise ValueError(
                f"Model output did not satisfy schema {schema.__name__}"
                + (f": {detail}" if detail else "")
                + f"\n{text[:500]}"
            )
        self._cache.set(key, parsed.model_dump_json())
        return parsed

    def _coerce(
        self, text: str, schema: type[T]
    ) -> tuple[T | None, ValidationError | None]:
        snippet = _extract_json(text) or text
        try:
            return schema.model_validate_json(snippet), None
        except ValidationError as exc:
            # Common case: model emitted a bare array for a single-list schema.
            wrapped = _wrap_bare_list(snippet, schema)
            if wrapped is not None:
                try:
                    return schema.model_validate(wrapped), None
                except ValidationError:
                    pass
            # Some models echo the JSON-schema envelope (real values nested under
            # "properties") instead of a bare instance — lift them out and retry.
            unwrapped = _unwrap_schema_echo(snippet, schema)
            if unwrapped is not None:
                try:
                    return schema.model_validate(unwrapped), None
                except ValidationError:
                    pass
            return None, exc

    async def _chat_json(self, prompt: str) -> str:
        """Ask the model for JSON. Prefers response_format=json_object; falls
        back to a plain call (relying on the in-prompt schema) when a provider
        rejects that parameter — detected by status code OR an error body that
        names response_format / json mode."""
        try:
            return await self._call_chat(prompt, json_mode=True)
        except openai.APIStatusError as exc:
            body = f"{getattr(exc, 'message', '')} {getattr(exc, 'body', '')}".lower()
            rejected_format = (
                "response_format" in body
                or "response format" in body
                or "json_object" in body
                or "json mode" in body
            )
            if exc.status_code in (400, 404, 422) or rejected_format:
                return await self._call_chat(prompt, json_mode=False)
            raise

    @_retry(_is_transient_chat)
    async def _call_chat(self, prompt: str, *, json_mode: bool) -> str:
        kwargs: dict = {
            "model": self._model,
            "messages": [{"role": "user", "content": prompt}],
            # Every call here is structured JSON extraction, so decode greedily
            # (0.0) for maximum format adherence on weak free models — diversity
            # buys nothing when we just want the schema filled from evidence.
            "temperature": 0.0,
            # Bound output length: our structured replies are small, and this
            # caps worst-case generation time / cost on a misbehaving model.
            "max_tokens": 4096,
            # Many OpenRouter models (nvidia/nemotron, deepseek-r1, ...) are
            # reasoning models; disable thinking so the reply is clean JSON and
            # latency stays low. Ignored by non-reasoning models.
            "extra_body": {"reasoning": {"enabled": False}},
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        async with self._chat_limiter:
            resp = await self._chat.chat.completions.create(**kwargs)
        self._metrics.add_llm(_chat_tokens(resp))
        # OpenRouter can return HTTP 200 with no choices (upstream provider
        # error, moderation, in-body error). Treat as empty so the caller's
        # re-ask path runs, instead of an opaque IndexError.
        if not getattr(resp, "choices", None):
            return ""
        return resp.choices[0].message.content or ""

    # --- web search (Tavily) ----------------------------------------------

    async def search(
        self,
        query: str,
        *,
        max_results: int = 8,
        exclude_domains: list[str] | None = None,
    ) -> list[dict]:
        """Live web results as a list of {title, url, content}. Cached by query.
        Not routed through the chat/embed limiters (separate provider quota).
        `exclude_domains` is forwarded to Tavily to drop junk at the source."""
        return await web_search(
            query,
            api_key=self._tavily_api_key,
            cache=self._cache,
            max_results=max_results,
            exclude_domains=exclude_domains,
        )

    # --- embeddings (Gemini) ----------------------------------------------

    async def embed(self, text: str, *, task_type: str | None = None) -> list[float]:
        # task_type makes embeddings asymmetric: queries and documents are
        # embedded differently. It is part of the cache key so query/document
        # vectors never collide.
        key = make_key("embed", self._embedding_model, task_type or "", text)
        cached = self._cache.get_json(key)
        if cached is not None:
            self._metrics.hit()
            return cached
        self._metrics.miss()

        values = await self._call_embed(text, task_type)
        self._metrics.add_embed()
        self._cache.set_json(key, values)
        return values

    @_retry(_is_transient_embed)
    async def _call_embed(self, text: str, task_type: str | None) -> list[float]:
        cfg = types.EmbedContentConfig(task_type=task_type) if task_type else None
        async with self._embed_limiter:
            resp = await self._gemini.aio.models.embed_content(
                model=self._embedding_model, contents=text, config=cfg
            )
        return list(resp.embeddings[0].values)


def _chat_tokens(resp: object) -> int:
    usage = getattr(resp, "usage", None)
    return int(getattr(usage, "total_tokens", 0) or 0)


# Backward-compatible alias: agents/base.py, memory/rag.py, and the orchestrator
# import GeminiClient. The gateway is no longer Gemini-only, but the name stays
# so those modules don't need to change.
GeminiClient = LLMClient
