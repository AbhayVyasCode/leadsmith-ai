"""Critic agent: a Reflexion-style adversarial check on a qualification.

Runs ONLY on leads that pass the score gate (so it's bounded and free-tier
friendly) and only when explicitly enabled. Its job is to catch hallucinated or
thinly-evidenced dimension scores: it re-reads the site text and decides whether
each score is actually supported, returning a verdict and a confidence penalty.
This filters plausible-but-wrong leads before they reach outreach.
"""

from __future__ import annotations

from .base import BaseAgent
from ..models import ICP, Critique, Qualification

_PROMPT = """You are a skeptical sales-ops reviewer. A junior analyst scored a
lead. Your job is to REFUTE weak scores, not to agree. Judge ONLY from the
website text — if a dimension's score is not clearly supported by the text,
treat it as inflated.

Ideal Customer Profile: {industry} | {company_size} | {geography}
Pain points we solve: {pain_points}

The analyst's scored dimensions (with their cited evidence):
{dimensions}

Actual website text (the only allowed source of truth):
\"\"\"{text}\"\"\"

Decide:
- verdict: "accept" (scores are well-grounded), "weak" (some scores are thinly
  supported but plausible), or "reject" (scores are CLEARLY fabricated or
  contradicted by the text). Reserve "reject" for fabrication — if the evidence
  is merely thin or partly inferred, use "weak", not "reject".
- grounded: true only if the cited evidence genuinely appears in / follows from
  the website text.
- confidence_penalty: 0.0 (fully trustworthy) up to 1.0 (untrustworthy).
- issues: specific unsupported claims.
- missing_evidence: what evidence would be needed to justify the scores.
When the text is thin, prefer "weak" over "reject".
"""


class CriticAgent(BaseAgent):
    name = "critic"

    async def run(
        self,
        icp: ICP,
        site_text: str,
        qual: Qualification,
    ) -> Critique:
        dims = "\n".join(
            f"- {d.dimension}: {d.score} (conf {d.confidence}) — {d.evidence}"
            for d in qual.dimensions
        )
        prompt = _PROMPT.format(
            industry=icp.industry,
            company_size=icp.company_size,
            geography=icp.geography,
            pain_points=", ".join(icp.pain_points) or "n/a",
            dimensions=dims or "(none)",
            text=site_text or "(no readable text retrieved)",
        )
        return await self.gemini.structured(prompt, Critique)
