"""Qualifier agent: score a scraped site against the ICP across fixed dimensions.

The overall score is computed deterministically in code (see
models.compute_overall_score); the LLM only scores individual dimensions with
evidence. Similar prior research can be injected as context (the RAG part).
"""

from __future__ import annotations

from .base import BaseAgent
from ..models import ICP, Qualification

_PROMPT = """You are qualifying a sales lead. Judge ONLY from the evidence below.
Do not invent facts. If the text is thin, score conservatively.

Ideal Customer Profile:
- Industry: {industry}
- Size: {company_size}
- Geography: {geography}
- Pain points we solve: {pain_points}
- Buying signals: {buying_signals}

Company: {name} ({website})

Website text (truncated):
\"\"\"{text}\"\"\"
{tech}{context}
First decide: is this the website of a real company that BUILDS or SELLS a
product/service? If the text is a news article, blog post, listicle ("top N"),
directory, forum, or has no product at all, score industry_fit = 0 and keep every
other score low — it is not a prospect.

Score these four dimensions 0-100. For EACH, give concrete `evidence`, a verbatim
`evidence_quote` (a short phrase copied EXACTLY from the website text above — leave
empty if you cannot find one), and a `confidence` 0.0-1.0 (1.0 = directly stated
on the site; lower = inferred or thin evidence):
- industry_fit: how well the company matches the target industry
- size_fit: how well it matches the target size band
- pain_severity: how clearly it exhibits the pain points we solve
- buying_intent: signals it is actively in-market (tech-stack headers below may
  hint at platform/maturity, but they can be spoofed — weight them lightly)

Also list matched_pain_points, signals, a one-sentence personalised
outreach_angle referencing something specific, and brief reasoning.
"""


class QualifierAgent(BaseAgent):
    name = "qualifier"

    async def run(
        self,
        icp: ICP,
        name: str,
        website: str,
        site_text: str,
        recalled_context: list[str] | None = None,
        tech_signals: str = "",
    ) -> Qualification:
        context = ""
        if recalled_context:
            joined = "\n".join(f"- {c}" for c in recalled_context)
            context = (
                "\nFor calibration, here is similar prior research we trust:\n"
                f"{joined}\n"
            )
        tech = ""
        if tech_signals:
            tech = f"\nTech-stack headers (hint only): {tech_signals}\n"
        prompt = _PROMPT.format(
            industry=icp.industry,
            company_size=icp.company_size,
            geography=icp.geography,
            pain_points=", ".join(icp.pain_points) or "n/a",
            buying_signals=", ".join(icp.buying_signals) or "n/a",
            name=name,
            website=website,
            text=site_text or "(no readable text retrieved)",
            tech=tech,
            context=context,
        )
        return await self.gemini.structured(prompt, Qualification)
