"""Intent agent: natural-language request -> structured ICP.

Two entry points:
  - run(request): the request DESCRIBES the ideal customer (original behaviour).
  - run_reverse(request, product): the request was a PRODUCT URL; derive the ICP
    of companies that would BUY that product (reverse-ICP / product mode).
"""

from __future__ import annotations

import re
from urllib.parse import urlparse

from .base import BaseAgent
from ..models import ICP, ProductProfile

_PROMPT = """You are a B2B market-research analyst.
Convert the user's request into a precise Ideal Customer Profile (ICP).

- If size/geography are implied but unstated, make a sensible explicit choice.
- pain_points and buying_signals must be observable from a company's public
  website or public web presence.
- keywords should help find such companies via web search.

User request:
\"\"\"{request}\"\"\"
"""

_REVERSE_PROMPT = """You are a B2B market-research analyst. Below is a structured
profile of a PRODUCT (extracted from the seller's own website). Produce the Ideal
Customer Profile of the companies that would BUY or embed this product.

Product:
- Name: {product_name}
- What it does: {what_it_does}
- Category: {category}
- Key features: {features}
- Likely buyer segments (from analysis): {segments}
- Ideal-buyer notes: {target_desc}

Rules:
- industry, company_size, geography describe the BUYER company — never the product.
- pain_points are the buyer pains THIS PRODUCT REMOVES (observable on a buyer's
  site or job posts), NOT the product's features.
- buying_signals are observable signs a buyer has that pain and is in-market.
- keywords are buyer-category nouns plus capability/need terms that would surface
  such companies via web search (e.g. the buyer segments, not the product name).
- decision_maker_roles are who at the BUYER would evaluate adopting this.

Extra constraints from the user's original request (honor geography/size if present):
\"\"\"{request}\"\"\"
"""

# Tolerant URL/domain extraction. Common gTLDs/ccTLDs used by SaaS so a bare
# domain ("rustbox.orkait.com") is detected, while plain phrases ("e-commerce")
# are not. The frontend Mode control can still override the auto-detection.
_URL_RE = re.compile(r"https?://[^\s)>\]\"']+", re.IGNORECASE)
_BARE_DOMAIN_RE = re.compile(
    r"\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})(/[^\s)>\]\"']*)?",
    re.IGNORECASE,
)
_KNOWN_TLDS = {
    "com", "org", "net", "io", "ai", "co", "dev", "app", "xyz", "tech", "cloud",
    "so", "sh", "gg", "tools", "site", "page", "inc", "studio", "team", "run",
    "us", "uk", "eu", "de", "fr", "in", "ca", "au", "jp", "me", "info", "biz",
}


def detect_product_url(request: str) -> str | None:
    """Return the first product URL in the request (with scheme), else None.

    Matches an explicit http(s):// URL anywhere, or a bare known-TLD domain.
    Trailing punctuation is stripped. Lenient on purpose; the UI lets the user
    flip out of product mode if a URL was only an example."""
    text = (request or "").strip()
    if not text:
        return None
    m = _URL_RE.search(text)
    if m:
        url = m.group(0).rstrip(".,;:!?)]}\"'")
        return url if urlparse(url).netloc else None
    for bm in _BARE_DOMAIN_RE.finditer(text):
        host = bm.group(1)
        tld = host.rsplit(".", 1)[-1].lower()
        if tld in _KNOWN_TLDS:
            path = (bm.group(2) or "").rstrip(".,;:!?)]}\"'")
            return f"https://{host}{path}"
    return None


class IntentAgent(BaseAgent):
    name = "intent"

    async def run(self, request: str) -> ICP:
        return await self.gemini.structured(_PROMPT.format(request=request), ICP)

    async def run_reverse(self, request: str, product: ProductProfile) -> ICP:
        """Derive the BUYER ICP from a scraped product profile (product mode)."""
        prompt = _REVERSE_PROMPT.format(
            product_name=product.product_name or "(unknown)",
            what_it_does=product.what_it_does or "(unknown)",
            category=product.category or "(unknown)",
            features=", ".join(product.key_features) or "n/a",
            segments=", ".join(product.customer_segments) or "n/a",
            target_desc=product.target_customers_description or "n/a",
            request=request,
        )
        return await self.gemini.structured(prompt, ICP)
