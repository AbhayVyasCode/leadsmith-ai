"""Enricher agent: find decision-makers, their public profiles, and likely
emails — the free, no-Apollo path.

Sources, cheapest first:
  1. Named people in the scraped site text.
  2. Public LinkedIn profiles surfaced by web search — we read the result title
     ("Name - Role - Company | LinkedIn") and URL; we do NOT scrape LinkedIn.
  3. Missing emails filled by permutation, kept only if the domain accepts mail.

Company-level social/related links (LinkedIn company page, X, etc.) are harvested
from the company's own site by the scraper and attached to the lead upstream.
"""

from __future__ import annotations

import re

from .base import BaseAgent
from ..models import ICP, Contact, ContactList
from ..tools.dns_tools import domain_accepts_mail, infer_pattern, permute_email
from ..tools.web_scrape import SiteContent

_EXTRACT_PROMPT = """From the website text below, extract real named people who
work at the company, with their roles. Only include people actually named in the
text; include their email if it appears. Do not invent anyone.

Website text:
\"\"\"{text}\"\"\"
"""


def _parse_linkedin_title(title: str) -> tuple[str, str]:
    """(name, role) from a LinkedIn search-result title, e.g.
    'Jane Doe - Head of Growth - Acme | LinkedIn' -> ('Jane Doe', 'Head of Growth')."""
    t = re.sub(r"\s*[|\-–]\s*LinkedIn.*$", "", title or "", flags=re.I).strip()
    parts = re.split(r"\s+[-–]\s+", t)
    name = parts[0].strip() if parts else ""
    role = parts[1].strip() if len(parts) > 1 else ""
    return name, role


def _merge_contacts(primary: list[Contact], extra: list[Contact]) -> list[Contact]:
    """Merge extra contacts into primary, deduped by name; copy a LinkedIn URL
    onto an existing match that lacks one."""
    by_name = {c.name.lower(): c for c in primary}
    for c in extra:
        existing = by_name.get(c.name.lower())
        if existing:
            if c.linkedin and not existing.linkedin:
                existing.linkedin = c.linkedin
        else:
            primary.append(c)
            by_name[c.name.lower()] = c
    return primary


class EnricherAgent(BaseAgent):
    name = "enricher"

    async def run(
        self, icp: ICP, company_name: str, site: SiteContent
    ) -> list[Contact]:
        contacts: list[Contact] = []

        if site.text:
            found = await self.gemini.structured(
                _EXTRACT_PROMPT.format(text=site.text), ContactList
            )
            for c in found.contacts:
                c.source = "company website"
                c.email_confidence = "found" if c.email else "unknown"
                contacts.append(c)

        roles = icp.decision_maker_roles or [
            "Founder",
            "CEO",
            "Marketing Director",
            "Head of Growth",
        ]

        # Free people-finder: public LinkedIn profiles from web-search results.
        contacts = _merge_contacts(
            contacts, await self._linkedin_people(company_name, roles)
        )

        # Fill missing emails by permutation (MX-verified), if anyone needs one.
        if any(not c.email for c in contacts):
            pattern = next(
                (infer_pattern(e) for e in site.emails if infer_pattern(e)), None
            )
            if await domain_accepts_mail(site.domain):
                for c in contacts:
                    if not c.email:
                        guess = permute_email(c.name, site.domain, pattern)
                        if guess:
                            c.email = guess
                            c.email_confidence = "guessed"
        return contacts

    async def _linkedin_people(
        self, company_name: str, roles: list[str]
    ) -> list[Contact]:
        if not company_name:
            return []
        query = f'"{company_name}" ({" OR ".join(roles[:3])}) linkedin'
        results = await self.gemini.search(query, max_results=8)
        out: list[Contact] = []
        seen: set[str] = set()
        for r in results:
            url = (r.get("url") or "").split("?")[0]
            if "linkedin.com/in/" not in url.lower():
                continue
            name, role = _parse_linkedin_title(r.get("title", ""))
            key = name.lower()
            # Require a plausible person name (>= two words) and dedupe.
            if not name or len(name.split()) < 2 or key in seen:
                continue
            seen.add(key)
            out.append(
                Contact(
                    name=name,
                    role=role or "Decision maker",
                    linkedin=url,
                    source="linkedin (web search)",
                )
            )
            if len(out) >= 4:
                break
        return out
