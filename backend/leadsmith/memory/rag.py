"""Research memory: the RAG layer over past leads.

Three jobs:
  - seen_domain(): cheap dedupe so discovery skips companies already researched.
  - recall():      semantic retrieval of similar prior research, injected into
                   the qualifier as calibration context.
  - remember():    embed + persist a qualified lead for future recall.

Embeddings come from Gemini; vectors live in the local VectorStore.
"""

from __future__ import annotations

import re

from ..core.gemini import GeminiClient
from ..core.vector_store import VectorStore
from ..models import ICP, HydeQueries, Lead

# Generic subdomain prefixes that don't change company identity — stripped so
# the same company under www./m./shop. isn't researched twice (entity dedupe).
_GENERIC_SUBDOMAINS = ("www.", "www2.", "m.", "amp.", "shop.", "go.")


def _domain_id(url_or_domain: str) -> str:
    """Normalise a URL or bare domain to a stable id for cross-run dedupe."""
    d = url_or_domain.lower().strip()
    d = re.sub(r"^https?://", "", d)
    d = d.split("/", 1)[0]  # drop path
    d = d.split(":", 1)[0]  # drop port
    for prefix in _GENERIC_SUBDOMAINS:
        if d.startswith(prefix):
            d = d[len(prefix):]
            break
    return f"lead::{d}"


def _lead_summary(lead: Lead) -> str:
    pains = ", ".join(lead.qualification.matched_pain_points) or "n/a"
    signals = "; ".join(lead.qualification.signals[:5]) or "n/a"
    return (
        f"{lead.company.name} ({lead.company.website}) — score {lead.overall_score}. "
        f"Matched pains: {pains}. Signals: {signals}. "
        f"Angle: {lead.qualification.outreach_angle}"
    )


def _literal_query(icp: ICP) -> str:
    return (
        f"Industry {icp.industry}; size {icp.company_size}; "
        f"geography {icp.geography}; pains {', '.join(icp.pain_points)}"
    )


def reciprocal_rank_fusion(rankings: list[list[str]], k: int = 60) -> dict[str, float]:
    """Parameter-free fusion of several ranked id-lists (Cormack et al.).
    Robust to score-scale differences between heterogeneous queries."""
    scores: dict[str, float] = {}
    for ranked in rankings:
        for rank, id_ in enumerate(ranked):
            scores[id_] = scores.get(id_, 0.0) + 1.0 / (k + rank + 1)
    return scores


_HYDE_PROMPT = """We keep a memory of past B2B leads, each stored as a one-line
summary like: "<Company> (<url>) — score N. Matched pains: ...; Signals: ...;
Angle: ...".

For this Ideal Customer Profile, write 2-3 such HYPOTHETICAL summaries that a
PERFECT matching lead would have produced. Use the same vocabulary and format.
ICP: {industry} | {company_size} | {geography}
Pain points: {pain_points}
Buying signals: {buying_signals}
"""


class ResearchMemory:
    """RAG memory with HyDE multi-query recall and asymmetric embeddings.

    recall() costs ~1 cached LLM call (HyDE) + a few cached query embeds per run
    (same ICP across companies → cache hits), well within the free tier.
    """

    def __init__(self, gemini: GeminiClient, store: VectorStore) -> None:
        self._gemini = gemini
        self._store = store

    def seen_domain(self, domain: str) -> bool:
        return self._store.has(_domain_id(domain))

    async def _hyde_queries(self, icp: ICP) -> list[str]:
        try:
            hyde = await self._gemini.structured(
                _HYDE_PROMPT.format(
                    industry=icp.industry,
                    company_size=icp.company_size,
                    geography=icp.geography,
                    pain_points=", ".join(icp.pain_points) or "n/a",
                    buying_signals=", ".join(icp.buying_signals) or "n/a",
                ),
                HydeQueries,
            )
            return [q for q in hyde.queries if q.strip()]
        except Exception:
            return []  # HyDE is an enhancement; degrade to the literal query

    async def recall(self, icp: ICP, top_k: int = 3) -> list[str]:
        if self._store.count() == 0:
            return []

        # Multi-query: the literal ICP query keeps a bad HyDE doc from dominating.
        queries = [_literal_query(icp)] + await self._hyde_queries(icp)

        id_text: dict[str, str] = {}
        rankings: list[list[str]] = []
        for q in queries[:4]:
            vec = await self._gemini.embed(q, task_type="RETRIEVAL_QUERY")
            hits = self._store.query(vec, top_k=top_k * 3, min_score=0.3)
            ranked_ids = []
            for h in hits:
                id_text[h["id"]] = h["text"]
                ranked_ids.append(h["id"])
            rankings.append(ranked_ids)

        fused = reciprocal_rank_fusion(rankings)
        top = sorted(fused, key=lambda i: fused[i], reverse=True)[:top_k]
        return [id_text[i] for i in top]

    async def remember(self, lead: Lead) -> None:
        summary = _lead_summary(lead)
        # Documents are embedded asymmetrically vs. queries (RETRIEVAL_DOCUMENT).
        vec = await self._gemini.embed(summary, task_type="RETRIEVAL_DOCUMENT")
        self._store.upsert(
            id=_domain_id(lead.company.website),
            vector=vec,
            meta={
                "company": lead.company.name,
                "website": lead.company.website,
                "score": lead.overall_score,
            },
            text=summary,
        )
