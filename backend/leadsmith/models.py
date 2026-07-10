"""Structured data models. Pydantic schemas double as Gemini response schemas."""

from __future__ import annotations

import time
import uuid

from pydantic import BaseModel, Field


class ProductProfile(BaseModel):
    """What a SELLER's product is — extracted from its own website — so we can
    reverse-derive the ICP of companies that would BUY/embed it (product mode).

    Every field has a default so the structured parse tolerates omissions on weak
    free models, and a degraded (scrape-failed) profile can still be constructed.
    """

    product_name: str = ""
    what_it_does: str = Field(
        default="", description="1-2 sentences on what the product does."
    )
    category: str = ""
    key_features: list[str] = Field(default_factory=list)
    pricing_motion: str = Field(
        default="unknown", description="self-serve | sales-led | unknown"
    )
    customer_segments: list[str] = Field(
        default_factory=list,
        description="Buyer segments who would embed/buy this product.",
    )
    target_customers_description: str = Field(
        default="", description="One paragraph describing the ideal buyer."
    )
    evidence_quotes: list[str] = Field(
        default_factory=list,
        description="Verbatim spans copied from the site that ground the above.",
    )


class ICP(BaseModel):
    """Ideal Customer Profile parsed from a natural-language request."""

    industry: str
    company_size: str
    geography: str
    pain_points: list[str] = Field(default_factory=list)
    buying_signals: list[str] = Field(
        default_factory=list,
        description="Observable signals a company is ready to buy, e.g. 'hiring marketers'.",
    )
    decision_maker_roles: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class Company(BaseModel):
    name: str
    website: str
    reason: str = ""


class CompanyList(BaseModel):
    companies: list[Company] = Field(default_factory=list)


class DimensionScore(BaseModel):
    """A single scored dimension with its supporting evidence."""

    dimension: str = Field(
        description="One of: industry_fit, size_fit, pain_severity, buying_intent."
    )
    score: int = Field(ge=0, le=100)
    evidence: str = Field(description="Concrete evidence from the site for this score.")
    evidence_quote: str = Field(
        default="",
        description="A short VERBATIM phrase copied from the site text supporting "
        "this score (used for a deterministic grounding check). Optional.",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="How well-supported this score is by hard evidence (1.0 = "
        "directly stated on the site; lower = inferred or thin evidence).",
    )


class Qualification(BaseModel):
    dimensions: list[DimensionScore] = Field(default_factory=list)
    matched_pain_points: list[str] = Field(default_factory=list)
    signals: list[str] = Field(default_factory=list)
    outreach_angle: str = ""
    reasoning: str = ""


class Contact(BaseModel):
    name: str
    role: str
    email: str | None = None
    email_confidence: str = "unknown"  # found | guessed | unknown
    linkedin: str | None = None  # public LinkedIn profile URL (from web search)
    twitter: str | None = None  # X / Twitter URL, if surfaced
    source: str = ""


class ContactList(BaseModel):
    contacts: list[Contact] = Field(default_factory=list)


class OutreachDraft(BaseModel):
    subject: str
    body: str
    channel: str = "email"


class HydeQueries(BaseModel):
    """Hypothetical past-lead summaries used to bridge the query/document
    vocabulary gap during RAG recall (the HyDE technique)."""

    queries: list[str] = Field(
        default_factory=list,
        description="2-3 short summaries an IDEAL matching lead would have produced, "
        "phrased like stored research ('Matched pains: ...; Signals: ...; Angle: ...').",
    )


class Critique(BaseModel):
    """A Critic agent's adversarial verdict on a qualification."""

    verdict: str = Field(description="accept | weak | reject")
    grounded: bool = Field(
        description="Are the dimension scores actually supported by the cited evidence?"
    )
    confidence_penalty: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="How much to reduce overall confidence (0 = fully trustworthy).",
    )
    issues: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)


class Lead(BaseModel):
    company: Company
    qualification: Qualification
    overall_score: int = 0  # computed in code from weighted dimensions
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Aggregate evidence confidence."
    )
    contacts: list[Contact] = Field(default_factory=list)
    outreach: OutreachDraft | None = None
    critique: Critique | None = None
    flags: list[str] = Field(default_factory=list)
    links: list[str] = Field(
        default_factory=list,
        description="Company-level related/social links (LinkedIn, X, etc.) from the site.",
    )
    recalled_context: list[str] = Field(
        default_factory=list, description="Similar prior research injected from memory."
    )


class RunReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request: str
    icp: ICP
    # Set only in product/reverse-ICP mode: the scraped seller product this run's
    # ICP was derived from. None for the plain "describe an ICP" path.
    product: ProductProfile | None = None
    leads: list[Lead] = Field(default_factory=list)
    candidates_found: int = Field(
        default=0, description="Companies returned by discovery before dedupe."
    )
    candidates_skipped: int = Field(
        default=0, description="Candidates dropped as already-researched (dedupe)."
    )
    # Root domains seen during discovery (for continuation / pagination).
    seen_roots: list[str] = Field(default_factory=list)
    metrics: dict = Field(default_factory=dict)
    trace: dict | None = None
    duration_seconds: float = 0.0
    created_at: float = Field(default_factory=time.time)

    def no_leads_reason(self) -> str | None:
        """Classify *why* a run produced no leads (None when leads exist):
        "no_candidates" (discovery found nothing), "all_known" (every candidate
        was already researched and deduped), "errors" (every scanned company
        failed to process — usually an API/rate-limit error, not a low score), or
        "below_gate" (fresh candidates were scanned but none cleared the gate)."""
        if self.leads:
            return None
        if self.candidates_found == 0:
            return "no_candidates"
        if self.candidates_skipped >= self.candidates_found:
            return "all_known"
        scanned = self.candidates_found - self.candidates_skipped
        if self.metrics.get("errors", 0) >= max(1, scanned):
            return "errors"
        return "below_gate"


def compute_overall_score(
    dimensions: list[DimensionScore],
    weights: dict[str, float],
    *,
    confidence_weighting: bool = False,
) -> int:
    """Weighted average of dimension scores. Unknown dimensions are ignored;
    missing weighted dimensions simply don't contribute.

    When confidence_weighting is on, each dimension's weight is scaled by its
    confidence, so scores the model is unsure about pull less weight. With the
    default confidence of 1.0 this is identical to the unweighted result, so the
    behaviour is backward compatible.
    """
    total_w = 0.0
    acc = 0.0
    for d in dimensions:
        w = weights.get(d.dimension)
        if w is None:
            continue
        eff = w * d.confidence if confidence_weighting else w
        acc += d.score * eff
        total_w += eff
    return round(acc / total_w) if total_w else 0


def compute_confidence(
    dimensions: list[DimensionScore], weights: dict[str, float]
) -> float:
    """Weight-averaged confidence across the scored dimensions (0.0-1.0)."""
    total_w = 0.0
    acc = 0.0
    for d in dimensions:
        w = weights.get(d.dimension)
        if w is None:
            continue
        acc += d.confidence * w
        total_w += w
    return round(acc / total_w, 3) if total_w else 0.0
