"""Outreach agent: draft a short, personalised first-touch email for a lead."""

from __future__ import annotations

from .base import BaseAgent
from ..models import ICP, Lead, OutreachDraft

_PROMPT = """Write a concise, human first-touch outreach email.

Sender offers solutions for: {pain_points} (industry: {industry}).
Recipient: {contact_name}, {contact_role} at {company}.
Personalised angle to lead with: {angle}
Evidence signals about the company: {signals}

Rules:
- Subject under 60 characters, specific, no clickbait.
- Body under 110 words, 2-3 short paragraphs, one clear ask (a 15-min call).
- Reference the angle naturally. No fake flattery, no "I hope this finds you well".
"""


class OutreachAgent(BaseAgent):
    name = "outreach"

    async def run(self, icp: ICP, lead: Lead) -> OutreachDraft:
        contact = lead.contacts[0] if lead.contacts else None
        prompt = _PROMPT.format(
            pain_points=", ".join(icp.pain_points) or "growth",
            industry=icp.industry,
            contact_name=contact.name if contact else "there",
            contact_role=contact.role if contact else "the team",
            company=lead.company.name,
            angle=lead.qualification.outreach_angle or "n/a",
            signals=", ".join(lead.qualification.signals[:4]) or "n/a",
        )
        return await self.gemini.structured(prompt, OutreachDraft)
