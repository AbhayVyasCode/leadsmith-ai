"""Product-profile agent: the seed of reverse-ICP / "product mode".

When the user pastes a PRODUCT URL instead of describing a customer, this agent
scrapes the seller's own site and INVERTS it — turning "what this product does"
into "which companies would buy/embed it". Its output (a ProductProfile) feeds
IntentAgent.run_reverse to produce a buyer ICP.

Failure is non-fatal: if the site can't be read or the model can't extract a
usable profile, run() returns a near-empty ProductProfile (what_it_does == "")
and the orchestrator falls back to the plain "describe an ICP" path rather than
building a garbage reverse-ICP from nothing.
"""

from __future__ import annotations

from .base import BaseAgent
from ..core.cache import Cache
from ..models import ProductProfile
from ..tools.web_scrape import scrape_site

_PROMPT = """You are a B2B go-to-market analyst. Below is the text of a company's
OWN product website. This is the SELLER's product — do NOT treat this company as
the customer; your job is to figure out who would BUY it.

Judge ONLY from the text. Extract:
- product_name
- what_it_does: 1-2 plain sentences
- category: short noun phrase (e.g. "code-execution sandbox API", "email CRM")
- key_features: the concrete capabilities stated
- pricing_motion: "self-serve" if there is self-signup / usage or tier pricing,
  "sales-led" if it is "contact us" / "book a demo" only, else "unknown"
- evidence_quotes: 2-4 SHORT verbatim phrases copied exactly from the text

Then INVERT the product into its buyers:
- customer_segments: the kinds of COMPANIES that would buy or embed this product.
  Be specific and name the category (e.g. "online-judge / competitive-programming
  platforms", "AI-agent frameworks that execute LLM-generated code", "technical
  hiring / coding-assessment tools"). Do NOT list the seller itself.
- target_customers_description: one paragraph describing the ideal buyer and the
  observable pain this product removes for them.

Product website text (truncated):
\"\"\"{text}\"\"\"
"""


class ProductProfileAgent(BaseAgent):
    name = "product_profile"

    async def run(self, url: str, cache: Cache | None = None) -> ProductProfile:
        site = await scrape_site(url, cache=cache)
        if not site.text:
            # Nothing readable — signal degraded by leaving what_it_does empty.
            return ProductProfile(product_name=site.domain)
        try:
            return await self.gemini.structured(
                _PROMPT.format(text=site.text), ProductProfile
            )
        except Exception:
            # Extraction failed on a weak model — degrade, don't crash the run.
            return ProductProfile(product_name=site.domain)
