"""Discovery agent: ICP -> candidate companies.

Searches the live web with Tavily, then asks the model to pick real companies
out of the results. If the model returns nothing usable (it sometimes returns a
blank/empty list even when the search found real companies), we fall back to
deriving candidates directly from the search-result domains — so a successful
search reliably yields candidates. The *qualifier* judges fit later, so the
discovery prompt only needs broad recall, not precision. Cross-run dedupe of
already-known companies happens in the orchestrator (memory.seen_domain).
"""

from __future__ import annotations

from urllib.parse import urlparse

from .base import BaseAgent
from ..core.domain_filter import EXCLUDE_DOMAINS, is_blocked, looks_like_aggregator
from ..models import ICP, Company, CompanyList
from ..tools.web_search import render_results

_PROMPT = """You are building a prospecting list. From the web search results
below, extract the real companies that plausibly match the target, each with its
website.

Target:
- Industry: {industry}
- Size: {company_size}
- Geography: {geography}
- Keywords: {keywords}

Web search results:
{results}

Rules:
- Return up to {limit} entries that are actual companies that BUILD or SELL a
  product/service — NOT directories, listicles, "top N" / "best of" blog posts,
  news/media sites, social profiles, forums, or marketplaces.
- Fill BOTH "name" and "website" (the company's real root URL) for every entry;
  never leave them blank. Add a one-line "reason" it may fit.
- Use only companies that appear in the results; do not invent any.
"""


def _build_query(icp: ICP, wave: int = 0) -> str:
    """Build a search query. Successive waves rotate the keyword window so each
    wave issues a DISTINCT query (different Tavily cache key) — otherwise a
    repeated query returns the same cached results and the wave loop stalls."""
    kws = [k for k in icp.keywords if k]
    picked: list[str] = []
    if kws:
        n = len(kws)
        offset = (wave * 2) % n
        rotated = kws[offset:] + kws[:offset]
        picked = rotated[:3]
    
    # If the LLM generated keywords, rely on them. Appending verbose 
    # industry/geography strings confuses the search engine.
    if picked:
        return " ".join(picked)
        
    # Fallback if no keywords were generated
    parts = [icp.industry]
    # Only append geography if it's concise and not "Global..."
    if icp.geography and len(icp.geography) < 25 and "global" not in icp.geography.lower():
        parts.append(icp.geography)
    
    return " ".join(p for p in parts if p).strip() or icp.industry


def _root_domain(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    net = urlparse(url).netloc.lower()
    return net[4:] if net.startswith("www.") else net


def _candidates_from_results(results: list[dict], limit: int) -> list[Company]:
    """Fallback: derive candidates straight from search-result domains, skipping
    blocklisted/aggregator results, when the model returns nothing usable."""
    companies: list[Company] = []
    seen: set[str] = set()
    for r in results:
        url = r.get("url", "")
        dom = _root_domain(url)
        if not dom or dom in seen or is_blocked(url):
            continue
        if looks_like_aggregator(url, r.get("title", "")):
            continue
        seen.add(dom)
        name = dom.split(".")[0].replace("-", " ").title()
        companies.append(
            Company(name=name, website=f"https://{dom}", reason="From search results.")
        )
        if len(companies) >= limit:
            break
    return companies


class DiscoveryAgent(BaseAgent):
    name = "discovery"

    async def run(
        self,
        icp: ICP,
        *,
        limit: int = 10,
        exclude_domains: set[str] | None = None,
        wave: int = 0,
    ) -> list[Company]:
        """Discover up to `limit` candidate companies for a wave.

        `exclude_domains` is the set of root domains already seen this run (so
        successive waves don't re-return them); `wave` rotates the query.
        Junk is filtered at the Tavily source (EXCLUDE_DOMAINS) and again in code
        (is_blocked / looks_like_aggregator) on both the LLM and fallback paths.
        """
        exclude = {d.lower() for d in (exclude_domains or set())}
        results = await self.gemini.search(
            _build_query(icp, wave),
            max_results=min(25, max(10, limit * 3)),
            exclude_domains=EXCLUDE_DOMAINS,
        )
        if not results:
            return []

        # Pre-filter the evidence shown to the model so it can't even see junk.
        usable = [
            r
            for r in results
            if not is_blocked(r.get("url", ""))
            and not looks_like_aggregator(r.get("url", ""), r.get("title", ""))
        ] or results

        prompt = _PROMPT.format(
            limit=limit,
            industry=icp.industry,
            company_size=icp.company_size,
            geography=icp.geography,
            keywords=", ".join(icp.keywords) or "n/a",
            results=render_results(usable),
        )
        companies: list[Company] = []
        try:
            out = await self.gemini.structured(prompt, CompanyList)
            companies = [c for c in out.companies if c.name and c.website]
        except Exception:
            companies = []

        # The model sometimes returns an empty/blank list even when the search
        # found real companies — fall back to result domains so discovery is
        # never silently empty when search succeeded.
        if not companies:
            companies = _candidates_from_results(usable, limit)

        # Final code-side gate: drop blocklisted domains and dedupe against both
        # this wave and prior waves (exclude_domains), keeping only fresh roots.
        out_companies: list[Company] = []
        seen: set[str] = set()
        for c in companies:
            root = _root_domain(c.website)
            if not root or root in seen or root in exclude or is_blocked(c.website):
                continue
            seen.add(root)
            out_companies.append(c)
            if len(out_companies) >= limit:
                break
        return out_companies
