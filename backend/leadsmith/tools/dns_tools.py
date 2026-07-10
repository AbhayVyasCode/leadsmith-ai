"""Email helpers: domain MX verification and address permutation.

An MX check confirms a domain *accepts mail* — not that a specific mailbox
exists. Guessed addresses are therefore flagged as guesses by the caller.
"""

from __future__ import annotations

import asyncio
import re

import dns.resolver

_GENERIC_LOCALS = {"info", "hello", "contact", "support", "sales", "admin", "team"}


def _resolve_mx(domain: str) -> bool:
    try:
        return len(dns.resolver.resolve(domain, "MX", lifetime=5.0)) > 0
    except Exception:
        return False


async def domain_accepts_mail(domain: str) -> bool:
    if not domain:
        return False
    # dns.resolver is blocking; run it off the event loop.
    return await asyncio.to_thread(_resolve_mx, domain)


def infer_pattern(known_email: str) -> str | None:
    """Infer a permutation template from an existing personal email.

    Recognises the common separators (john.doe / john_doe / john-doe); falls back
    to a bare first name when the local part has no separator to learn from.
    """
    local = known_email.split("@", 1)[0].lower()
    if local in _GENERIC_LOCALS:
        return None
    for sep in (".", "_", "-"):
        if sep in local:
            return f"{{first}}{sep}{{last}}"
    return "{first}"


def permute_email(name: str, domain: str, pattern: str | None) -> str | None:
    parts = re.sub(r"[^a-z ]", "", name.lower()).split()
    if len(parts) < 2 or not domain:
        return None
    first, last = parts[0], parts[-1]
    template = pattern or "{first}.{last}"
    local = template.format(first=first, last=last, f=first[0], l=last[0])
    return f"{local}@{domain}"
