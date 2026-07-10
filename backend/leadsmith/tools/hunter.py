"""Async email finder and verifier using Hunter.io.

Provides cached wrappers around Hunter's Email Finder and Email Verifier APIs.
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

_FINDER_URL = "https://api.hunter.io/v2/email-finder"
_VERIFIER_URL = "https://api.hunter.io/v2/email-verifier"


def _is_transient(exc: BaseException) -> bool:
    if isinstance(exc, httpx.HTTPStatusError):
        code = exc.response.status_code
        return code == 429 or code >= 500
    if isinstance(exc, httpx.TransportError):
        return True
    return False


@retry(
    retry=retry_if_exception(_is_transient),
    wait=wait_exponential(multiplier=2, min=2, max=30),
    stop=stop_after_attempt(3),
    reraise=True,
)
async def _hunter_get(url: str, params: dict, timeout: float = 10.0) -> dict:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


async def hunter_find_email(
    domain: str,
    first_name: str,
    last_name: str,
    *,
    api_key: str,
    cache: Cache | None = None,
) -> dict | None:
    """Find a professional email address for a person. Cached by domain + name.

    Returns the data dictionary if found, else None.
    """
    if not api_key or not domain or not first_name or not last_name:
        return None

    cache_key = make_key("hunter_find", domain, first_name.lower(), last_name.lower())
    if cache is not None:
        cached = cache.get_json(cache_key)
        if cached is not None:
            return cached

    params = {
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name,
        "api_key": api_key,
    }
    try:
        res = await _hunter_get(_FINDER_URL, params)
        data = res.get("data")
        if data and cache is not None:
            cache.set_json(cache_key, data)
        return data
    except Exception:
        return None


async def hunter_verify_email(
    email: str,
    *,
    api_key: str,
    cache: Cache | None = None,
) -> dict | None:
    """Verify an email address. Cached by email address.

    Returns the verifier data dictionary if checked, else None.
    """
    if not api_key or not email:
        return None

    cache_key = make_key("hunter_verify", email.lower())
    if cache is not None:
        cached = cache.get_json(cache_key)
        if cached is not None:
            return cached

    params = {
        "email": email,
        "api_key": api_key,
    }
    try:
        res = await _hunter_get(_VERIFIER_URL, params)
        data = res.get("data")
        if data and cache is not None:
            cache.set_json(cache_key, data)
        return data
    except Exception:
        return None
