"""Async public-website scraper.

Fetches a company's homepage plus likely "people" pages, strips to readable
text, and harvests visible emails. Only public pages; respects a short timeout.
Results are cached by URL set so re-runs are instant.
"""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from ..core.cache import Cache, make_key

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; leadsmith-research/0.2; +https://getleadsmith.ai)"
}
_CANDIDATE_PATHS = ["", "about", "about-us", "team", "contact", "leadership"]
_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
_MAX_TEXT = 12_000

# Response headers that reveal the tech stack / platform — a zero-cost buying
# signal (e.g. Shopify, Wix, Vercel/Next.js, WordPress, Drupal, ASP.NET). These
# are passed to the qualifier as raw evidence; the LLM decides how much they
# matter (headers can be spoofed or hidden, so they are a hint, not ground truth).
_INTERESTING_HEADERS = {
    "server",
    "x-powered-by",
    "x-generator",
    "x-aspnet-version",
    "x-drupal-cache",
    "x-shopify-stage",
    "x-wix-request-id",
    "x-vercel-id",
    "x-nextjs-cache",
    "x-pingback",
}


@dataclass
class SiteContent:
    domain: str
    text: str = ""
    emails: list[str] = field(default_factory=list)
    links: list[str] = field(default_factory=list)  # social / related links found
    fetched_pages: list[str] = field(default_factory=list)
    headers: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "domain": self.domain,
            "text": self.text,
            "emails": self.emails,
            "links": self.links,
            "fetched_pages": self.fetched_pages,
            "headers": self.headers,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "SiteContent":
        return cls(
            domain=d["domain"],
            text=d.get("text", ""),
            emails=d.get("emails", []),
            links=d.get("links", []),  # optional → old cache entries still load
            fetched_pages=d.get("fetched_pages", []),
            headers=d.get("headers", {}),  # optional → old cache entries still load
        )

    def tech_signals(self) -> str:
        """Render captured headers as a short evidence string for the qualifier."""
        if not self.headers:
            return ""
        return "; ".join(f"{k}: {v}" for k, v in sorted(self.headers.items()))


def _root(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}"


def _clean(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    return re.sub(r"\s+", " ", soup.get_text(" ")).strip()


# Social / professional networks a company links from its own site — free,
# ToS-safe "related links" (we read the company's public markup, not the network).
_SOCIAL = (
    "linkedin.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "instagram.com",
    "github.com",
    "youtube.com",
)


def _extract_links(html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    out: list[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        low = href.lower()
        if low.startswith("http") and any(s in low for s in _SOCIAL):
            out.append(href.split("?")[0].rstrip("/"))
    return out


async def scrape_site(
    website: str, cache: Cache | None = None, timeout: float = 12.0
) -> SiteContent:
    root = _root(website)
    domain = urlparse(root).netloc.replace("www.", "")

    cache_key = make_key("scrape", root)
    if cache is not None:
        cached = cache.get_json(cache_key)
        if cached is not None:
            return SiteContent.from_dict(cached)

    content = SiteContent(domain=domain)
    seen: set[str] = set()
    link_set: set[str] = set()

    async with httpx.AsyncClient(
        headers=_HEADERS, timeout=timeout, follow_redirects=True
    ) as client:
        async def fetch(path: str) -> tuple[str, str, dict[str, str]] | None:
            url = urljoin(root + "/", path)
            try:
                r = await client.get(url)
            except httpx.HTTPError:
                return None
            if r.status_code != 200 or "text/html" not in r.headers.get(
                "content-type", ""
            ):
                return None
            tech = {
                k.lower(): v
                for k, v in r.headers.items()
                if k.lower() in _INTERESTING_HEADERS
            }
            return url, r.text, tech

        results = await asyncio.gather(*(fetch(p) for p in _CANDIDATE_PATHS))

    for res in results:
        if res is None:
            continue
        url, html, tech = res
        content.fetched_pages.append(url)
        for k, v in tech.items():
            content.headers.setdefault(k, v)  # homepage (first) wins
        for email in _EMAIL_RE.findall(html):
            low = email.lower()
            if low not in seen and not low.endswith((".png", ".jpg", ".svg")):
                seen.add(low)
        link_set.update(_extract_links(html))
        if len(content.text) < _MAX_TEXT:
            content.text = (content.text + "\n" + _clean(html))[:_MAX_TEXT]

    content.emails = sorted(seen)
    content.links = sorted(link_set)[:25]
    if cache is not None:
        cache.set_json(cache_key, content.to_dict())
    return content
