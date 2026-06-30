"""Shared domain blocklist + aggregator heuristics for discovery quality.

Centralizes what used to live as discovery._SKIP into one reusable filter so
junk — news/media, review & directory aggregators, social, wikis/forums, code &
data vendors, and freemail — is rejected on ANY model, and so the same list can
also feed Tavily's `exclude_domains` at the source. Buyers are real product
companies, not Slashdot or a "top 10 tools" listicle.

Used by:
  - tools/web_search (Tavily exclude_domains, via EXCLUDE_DOMAINS),
  - agents/discovery (both the LLM-extraction path and the fallback path),
  - agents/orchestrator (Stage-A pre-check before spending a qualify LLM call).
"""

from __future__ import annotations

import re
from urllib.parse import urlparse

# --- Canonical root domains, grouped by class. Substring-matched against a
# host, so "slashdot.org" also catches "m.slashdot.org" / "rss.slashdot.org". ---
_NEWS = {
    "slashdot.org", "techcrunch.com", "theverge.com", "wired.com",
    "venturebeat.com", "zdnet.com", "arstechnica.com", "engadget.com",
    "businessinsider.com", "forbes.com", "cnbc.com", "bloomberg.com",
    "news.ycombinator.com", "techradar.com", "mashable.com", "gizmodo.com",
    "cnet.com", "thenextweb.com", "readwrite.com", "protocol.com",
}
_DIRECTORY = {
    "g2.com", "capterra.com", "getapp.com", "softwareadvice.com", "clutch.co",
    "crunchbase.com", "owler.com", "producthunt.com", "sourceforge.net",
    "alternativeto.net", "trustradius.com", "saashub.com", "slashdot.org",
    "glassdoor.com", "indeed.com", "trustpilot.com", "yelp.com",
    "builtwith.com", "similarweb.com", "tracxn.com", "pitchbook.com",
}
_SOCIAL = {
    "linkedin.com", "twitter.com", "x.com", "facebook.com", "instagram.com",
    "youtube.com", "tiktok.com", "pinterest.com", "threads.net", "bsky.app",
}
_WIKI_FORUM = {
    "wikipedia.org", "fandom.com", "reddit.com", "quora.com",
    "stackoverflow.com", "stackexchange.com", "medium.com", "substack.com",
    "dev.to", "hashnode.com", "hashnode.dev", "blogspot.com", "wordpress.com",
    "tumblr.com",
}
_CODE_DATA = {
    "github.com", "gitlab.com", "bitbucket.org", "npmjs.com", "pypi.org",
    "readthedocs.io", "zoominfo.com", "apollo.io", "rocketreach.co",
    "lusha.com", "leadiq.com",
}
_FREEMAIL = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
    "proton.me", "protonmail.com", "icloud.com", "aol.com", "gmx.com",
}
_SEARCH_MARKET = {
    "google.com", "bing.com", "duckduckgo.com", "amazon.com", "ebay.com",
    "apps.apple.com", "play.google.com", "chrome.google.com",
}
# Job boards / ATS / careers aggregators — they surface for "hiring" buying
# signals but are never the prospect company themselves.
_JOBS = {
    "usajobs.gov", "governmentjobs.com", "indeed.com", "glassdoor.com",
    "ziprecruiter.com", "monster.com", "careerbuilder.com", "simplyhired.com",
    "dice.com", "naukri.com", "prosple.com", "lever.co", "greenhouse.io",
    "workable.com", "smartrecruiters.com", "jobvite.com", "wellfound.com",
    "angel.co", "builtin.com", "themuse.com", "ladders.com",
}

BLOCKLIST: frozenset[str] = frozenset(
    _NEWS | _DIRECTORY | _SOCIAL | _WIKI_FORUM | _CODE_DATA
    | _FREEMAIL | _SEARCH_MARKET | _JOBS
)

# Bounded list for Tavily's `exclude_domains` (it accepts well over this count).
EXCLUDE_DOMAINS: list[str] = sorted(BLOCKLIST)

# Aggregator/listicle heuristics — applied to a result's URL path + title.
_AGG_SUBDOMAINS = (
    "blog.", "news.", "docs.", "support.", "help.", "careers.", "jobs.",
    "wiki.", "forum.", "community.", "status.",
)
_AGG_PATH = re.compile(
    r"/(best|top|top-\d+|blog|news|category|categories|tag|tags|wiki|reviews?|"
    r"alternatives?|compare|vs|roundup|guide|guides|tutorials?|20\d\d)(/|$|-)",
    re.IGNORECASE,
)
_AGG_TITLE = re.compile(
    r"\b(best\s+\d+|top\s*\d+|\d+\s+best|alternatives?|roundup|listicle|"
    r"vs\.?|review|ultimate guide|cheat\s*sheet|comparison)\b",
    re.IGNORECASE,
)


def _host(value: str) -> str:
    """Normalise a URL or bare domain to a lowercase host without a leading www."""
    v = (value or "").strip().lower()
    if not v:
        return ""
    if "://" not in v:
        v = "https://" + v
    net = urlparse(v).netloc.split("@")[-1].split(":")[0]
    return net[4:] if net.startswith("www.") else net


def is_blocked(domain_or_url: str) -> bool:
    """True if the host is on the blocklist (a non-prospect) or is unusable."""
    host = _host(domain_or_url)
    if not host or "." not in host:
        return True
    return any(blocked in host for blocked in BLOCKLIST)


def looks_like_aggregator(url: str = "", title: str = "") -> bool:
    """Heuristic: a news/blog/listicle/category page rather than a company root.

    Cheap and model-independent — catches things the blocklist misses (e.g. a
    company blog on its own domain, or a "top 10" article on a niche site)."""
    host = _host(url)
    if host and any(host.startswith(p) for p in _AGG_SUBDOMAINS):
        return True
    if url:
        u = url if "://" in url else "https://" + url
        path = urlparse(u).path or ""
        if path and path not in ("/",) and _AGG_PATH.search(path):
            return True
    if title and _AGG_TITLE.search(title):
        return True
    return False
