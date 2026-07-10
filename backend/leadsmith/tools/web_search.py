"""Async web search via Tavily — the free-tier replacement for Gemini's Google
Search grounding.

Results are cached by query in the shared SQLite cache, so re-runs are instant
and don't spend search quota (mirrors how scrape results are cached).
"""

from __future__ import annotations

import httpx
from tenacity import (
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from ..core.cache import Cache, make_key

_TAVILY_URL = "https://api.tavily.com/search"


def _is_transient(exc: BaseException) -> bool:
    """Retry Tavily 429s, 5xx, and network/timeout errors; surface 4xx (bad key,
    bad request) immediately."""
    if isinstance(exc, httpx.HTTPStatusError):
        code = exc.response.status_code
        return code == 429 or code >= 500
    if isinstance(exc, httpx.TransportError):  # timeouts, connection resets
        return True
    return False


@retry(
    retry=retry_if_exception(_is_transient),
    wait=wait_exponential(multiplier=2, min=2, max=30),
    stop=stop_after_attempt(4),
    reraise=True,
)
async def _tavily_request(payload: dict, headers: dict, timeout: float) -> dict:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(_TAVILY_URL, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def web_search(
    query: str,
    *,
    api_key: str,
    cache: Cache | None = None,
    max_results: int = 8,
    exclude_domains: list[str] | None = None,
    timeout: float = 20.0,
) -> list[dict]:
    """Return a list of {title, url, content} for the query. Cached by
    (query, max_results, exclude-marker) so identical lookups are free on re-run.

    `exclude_domains` is forwarded to Tavily so junk (news/aggregator/social) is
    filtered server-side and never occupies a result slot."""
    # The exclude marker keeps filtered and unfiltered results in distinct cache
    # entries, so an old unfiltered hit can't shadow a filtered request.
    cache_key = make_key(
        "tavily", query, str(max_results), "x1" if exclude_domains else "x0"
    )
    if cache is not None:
        cached = cache.get_json(cache_key)
        if cached is not None:
            return cached

    payload: dict = {
        "api_key": api_key,  # legacy auth; header below is the current method
        "query": query,
        "max_results": max_results,
        "search_depth": "basic",
    }
    if exclude_domains:
        payload["exclude_domains"] = exclude_domains
    headers = {"Authorization": f"Bearer {api_key}"}
    data = await _tavily_request(payload, headers, timeout)

    results = [
        {
            "title": str(r.get("title", "")),
            "url": str(r.get("url", "")),
            "content": str(r.get("content", "")),
        }
        for r in data.get("results", [])
    ]
    if cache is not None and results:
        cache.set_json(cache_key, results)
    return results


def render_results(results: list[dict], *, limit: int | None = None) -> str:
    """Render search results as a compact evidence block for an LLM prompt."""
    rows = results[:limit] if limit else results
    return (
        "\n".join(f"- {r['title']} — {r['url']}\n  {r['content']}" for r in rows)
        or "(no results)"
    )
