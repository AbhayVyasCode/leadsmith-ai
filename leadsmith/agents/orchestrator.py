"""Orchestrator: coordinates the multi-agent lead discovery pipeline."""

from __future__ import annotations

import asyncio
import math
import time
from collections.abc import Callable

from ..config import SCORE_WEIGHTS, Settings
from ..core.cache import Cache
from ..core.domain_filter import is_blocked, looks_like_aggregator
from ..core.gemini import GeminiClient
from ..core.metrics import Metrics
from ..core.rate_limiter import RateLimiter
from ..core.tracing import Tracer
from ..core.vector_store import VectorStore
from ..memory.rag import ResearchMemory
from ..models import (
    ICP,
    Company,
    CompanyList,
    DimensionScore,
    Lead,
    ProductProfile,
    Qualification,
    RunReport,
    compute_confidence,
    compute_overall_score,
)
from ..tools.web_scrape import scrape_site
from ..tools.web_search import render_results
from .base import BaseAgent
from .critic import CriticAgent
from .discovery import DiscoveryAgent
from .enricher import EnricherAgent
from .intent import IntentAgent
from .outreach import OutreachAgent
from .product_profile import ProductProfileAgent
from .qualifier import QualifierAgent


def _noop(_: str) -> None:
    pass


def _noop_event(_: dict) -> None:
    pass


def _normalize(s: str) -> str:
    return s.strip().lower()


def _ground_dimensions(qual: Qualification, text: str) -> None:
    """Down-weight any dimension whose evidence_quote isn't in the scraped text."""
    for d in qual.dimensions:
        if d.evidence_quote and d.evidence_quote not in text:
            d.confidence *= 0.5


def _root_domain(url: str) -> str:
    from urllib.parse import urlparse

    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    net = urlparse(url).netloc.lower()
    return net[4:] if net.startswith("www.") else net


def detect_product_url(text: str) -> str | None:
    """Extract the first plausible product URL from a free-text request."""
    import re

    # Look for a fully-qualified URL
    m = re.search(r"https?://[^\s]+", text)
    if m:
        return m.group(0)
    # Or a bare domain with a known TLD (very permissive — caller validates)
    m = re.search(
        r"\b[a-z0-9-]+\.(?:com|org|net|io|ai|co|dev|app|so|sh|tech|cloud)\b", text
    )
    if m:
        return "https://" + m.group(0)
    return None


ProgressFn = Callable[[str], None]
EventFn = Callable[[dict], None]


class Orchestrator:
    def __init__(self, cfg: Settings) -> None:
        self.cfg = cfg
        self.metrics = Metrics()
        self._chat_limiter = RateLimiter(cfg.rpm_limit, cfg.max_concurrency)
        self._embed_limiter = RateLimiter(
            cfg.embed_rpm_limit, cfg.embed_max_concurrency
        )
        self._cache = Cache(f"{cfg.data_dir}/cache.sqlite")
        self._store = VectorStore(f"{cfg.data_dir}/memory.sqlite")
        self.gemini = GeminiClient(
            nvidia_api_key=cfg.nvidia_api_key,
            nvidia_model=cfg.nvidia_model,
            nvidia_base_url=cfg.nvidia_base_url,
            embedding_model=cfg.embedding_model,
            gemini_api_key=cfg.gemini_api_key,
            tavily_api_key=cfg.tavily_api_key,
            chat_limiter=self._chat_limiter,
            embed_limiter=self._embed_limiter,
            cache=self._cache,
            metrics=self.metrics,
        )
        self.memory = ResearchMemory(self.gemini, self._store)
        self.intent = IntentAgent(self.gemini)
        self.discovery = DiscoveryAgent(self.gemini)
        self.qualifier = QualifierAgent(self.gemini)
        self.enricher = EnricherAgent(self.gemini)
        self.outreach = OutreachAgent(self.gemini)
        self.critic = CriticAgent(self.gemini)
        self.product_profile = ProductProfileAgent(self.gemini)
        self._tracer = Tracer()

    async def find(
        self,
        request: str,
        *,
        target_leads: int = 5,
        scan_cap: int | None = None,
        mode: str = "auto",
        min_score: int = 40,
        generate_outreach: bool = False,
        generate_critique: bool = False,
        on_progress: ProgressFn = _noop,
        on_event: EventFn = _noop_event,
    ) -> RunReport:
        """Find up to `target_leads` qualified leads.

        Discovery runs in bounded WAVES until `target_leads` pass the score gate,
        a per-run `scan_cap` is hit, or candidates run out — so the control means
        "give me N leads", not "scan N companies".

        `mode`: "auto" (detect a product URL), "product" (force reverse-ICP from a
        URL when present), or "customer" (always treat the request as an ICP
        description). When a product URL is detected, the seller's site is scraped
        and the ICP of its BUYERS is derived; a failed scrape degrades to the
        plain path rather than to a garbage reverse-ICP.
        """
        started = time.monotonic()
        self._tracer = Tracer()  # fresh trace root for this run

        target_leads = max(1, target_leads)
        cap = scan_cap if scan_cap is not None else self.cfg.hard_scan_cap

        # --- intent, with optional product / reverse-ICP mode ---
        product: ProductProfile | None = None
        url = detect_product_url(request) if mode != "customer" else None
        if url:
            with self._tracer.span("product"):
                on_progress(
                    "Detected a product URL — scraping the product to find its buyers..."
                )
                product = await self.product_profile.run(url, self._cache)
            if product.what_it_does:  # usable profile -> reverse-ICP
                on_event({"type": "product", "product": product.model_dump()})
                with self._tracer.span("intent"):
                    on_progress("Parsing intent into an ICP...")
                    icp = await self.intent.run_reverse(request, product)
            else:
                # Degraded scrape/extract: fall back to the plain path so a failed
                # product fetch behaves like the old behaviour, not worse.
                product = None
                with self._tracer.span("intent"):
                    on_progress("Parsing intent into an ICP...")
                    icp = await self.intent.run(request)
        else:
            with self._tracer.span("intent"):
                on_progress("Parsing intent into an ICP...")
                icp = await self.intent.run(request)
        on_event({"type": "icp", "icp": icp.model_dump()})

        # Recall depends only on the ICP, so compute it once and share it across
        # every per-company task in every wave.
        with self._tracer.span("recall"):
            recalled = await self.memory.recall(icp)

        on_progress(f"Discovering companies in {icp.industry} / {icp.geography}...")

        seen_roots: set[str] = set()  # intra-run dedupe across waves
        qualified: list[Lead] = []
        discovered = 0  # unique candidate roots seen across all waves
        known_skipped = 0  # candidates dropped as already-researched (cross-run)
        total_scanned = 0  # companies actually processed (post-dedupe)
        wave = 0
        announced = False

        while (
            len(qualified) < target_leads
            and total_scanned < cap
            and wave < self.cfg.max_waves
        ):
            remaining = target_leads - len(qualified)
            batch = math.ceil(remaining * self.cfg.overfetch_factor)
            batch = min(batch, self.cfg.max_per_wave, cap - total_scanned)
            if batch <= 0:
                break

            with self._tracer.span("discovery", wave=wave + 1, limit=batch):
                companies = await self.discovery.run(
                    icp, limit=batch, exclude_domains=seen_roots, wave=wave
                )
            wave += 1
            self.metrics.waves = wave

            fresh: list[Company] = []
            new_roots = 0
            for c in companies:
                root = _root_domain(c.website)
                if not root or root in seen_roots:
                    continue
                seen_roots.add(root)
                discovered += 1
                new_roots += 1
                if self.memory.seen_domain(c.website):
                    known_skipped += 1  # already researched in a prior run
                    continue
                fresh.append(c)

            if not announced and discovered:
                on_progress(
                    f"Found {discovered} candidates"
                    + (
                        f" ({known_skipped} already known, skipped)"
                        if known_skipped
                        else ""
                    )
                )
                announced = True

            if new_roots == 0:
                break  # discovery exhausted / only repeats -> stop, don't spin

            results = await asyncio.gather(
                *(
                    self._process(
                        icp,
                        c,
                        recalled,
                        min_score,
                        generate_outreach,
                        generate_critique,
                        on_progress,
                        on_event,
                    )
                    for c in fresh
                ),
                return_exceptions=True,
            )
            total_scanned += len(fresh)
            self.metrics.total_scanned = total_scanned
            for res in results:
                if isinstance(res, Lead):
                    qualified.append(res)
                elif isinstance(res, BaseException):
                    self.metrics.errors += 1

            on_progress(
                f"wave {wave}: {len(qualified)}/{target_leads} qualified "
                f"after scanning {total_scanned}"
            )

        if not announced:
            on_progress("Found 0 candidates")

        # Do NOT trim: every lead the user watched stream in stays in the report
        # (we just stop discovering once we have enough). Sort best-first.
        qualified.sort(key=lambda l: l.overall_score, reverse=True)
        on_progress(f"Done. {len(qualified)} qualified leads.")
        self._tracer.finish()

        return RunReport(
            request=request,
            icp=icp,
            product=product,
            leads=qualified,
            candidates_found=discovered,
            candidates_skipped=known_skipped,
            seen_roots=sorted(seen_roots),
            metrics=self.metrics.as_dict(),
            trace=self._tracer.export(),
            duration_seconds=round(time.monotonic() - started, 2),
        )

    async def continue_find(
        self,
        previous_report: RunReport,
        *,
        target_leads: int | None = None,
        scan_cap: int | None = None,
        min_score: int | None = None,
        generate_outreach: bool | None = None,
        generate_critique: bool | None = None,
        on_progress: ProgressFn = _noop,
        on_event: EventFn = _noop_event,
    ) -> RunReport:
        """Continue finding leads from a previous run's state.

        This method resumes discovery from where the previous run left off,
        preserving the seen_roots to avoid re-discovering the same companies.
        The ICP, product profile, and recalled context are reused from the
        previous run.
        """
        started = time.monotonic()
        self._tracer = Tracer()  # fresh trace root for this continuation

        # Extract state from previous report
        request = previous_report.request
        icp = previous_report.icp
        product = previous_report.product
        qualified = []  # Do not copy previous leads, start fresh for new run
        discovered = previous_report.candidates_found
        known_skipped = previous_report.candidates_skipped
        total_scanned = previous_report.metrics.get("total_scanned", 0)
        wave = previous_report.metrics.get("waves", 0)
        seen_roots = set(previous_report.seen_roots)

        start_scanned = previous_report.metrics.get("total_scanned", 0)
        start_wave = previous_report.metrics.get("waves", 0)

        # Use new params or fall back to previous run's implied defaults
        # Note: we can't know the exact previous target_leads/cap/min_score,
        # so we use the provided values or sensible defaults.
        target_leads = max(1, target_leads or 5)
        cap = scan_cap if scan_cap is not None else self.cfg.hard_scan_cap
        min_score = 40 if min_score is None else min_score
        generate_outreach = (
            generate_outreach if generate_outreach is not None else False
        )
        generate_critique = (
            generate_critique if generate_critique is not None else False
        )

        # Recompute recalled context (cheap, uses persistent memory)
        with self._tracer.span("recall"):
            recalled = await self.memory.recall(icp)

        on_progress(f"Continuing discovery in {icp.industry} / {icp.geography}...")

        announced = False

        while (
            len(qualified) < target_leads
            and (total_scanned - start_scanned) < cap
            and (wave - start_wave) < self.cfg.max_waves
        ):
            remaining = target_leads - len(qualified)
            batch = math.ceil(remaining * self.cfg.overfetch_factor)
            batch = min(batch, self.cfg.max_per_wave, cap - (total_scanned - start_scanned))
            if batch <= 0:
                break

            with self._tracer.span("discovery", wave=wave + 1, limit=batch):
                companies = await self.discovery.run(
                    icp, limit=batch, exclude_domains=seen_roots, wave=wave
                )
            wave += 1
            self.metrics.waves = wave

            fresh: list[Company] = []
            new_roots = 0
            for c in companies:
                root = _root_domain(c.website)
                if not root or root in seen_roots:
                    continue
                seen_roots.add(root)
                discovered += 1
                new_roots += 1
                if self.memory.seen_domain(c.website):
                    known_skipped += 1  # already researched in a prior run
                    continue
                fresh.append(c)

            if not announced and discovered > previous_report.candidates_found:
                on_progress(
                    f"Found {discovered} candidates"
                    + (
                        f" ({known_skipped} already known, skipped)"
                        if known_skipped
                        else ""
                    )
                )
                announced = True

            if new_roots == 0:
                break  # discovery exhausted / only repeats -> stop, don't spin

            results = await asyncio.gather(
                *(
                    self._process(
                        icp,
                        c,
                        recalled,
                        min_score,
                        generate_outreach,
                        generate_critique,
                        on_progress,
                        on_event,
                    )
                    for c in fresh
                ),
                return_exceptions=True,
            )
            total_scanned += len(fresh)
            self.metrics.total_scanned = total_scanned
            for res in results:
                if isinstance(res, Lead):
                    qualified.append(res)
                elif isinstance(res, BaseException):
                    self.metrics.errors += 1

            on_progress(
                f"wave {wave}: {len(qualified)}/{target_leads} qualified "
                f"after scanning {total_scanned}"
            )

        if not announced:
            on_progress("Found 0 new candidates")

        # Sort best-first
        qualified.sort(key=lambda l: l.overall_score, reverse=True)
        on_progress(f"Done. {len(qualified)} qualified leads total.")
        self._tracer.finish()

        return RunReport(
            request=request,
            icp=icp,
            product=product,
            leads=qualified,
            candidates_found=discovered,
            candidates_skipped=known_skipped,
            seen_roots=sorted(seen_roots),
            metrics=self.metrics.as_dict(),
            trace=self._tracer.export(),
            duration_seconds=round(time.monotonic() - started, 2),
        )

    async def _process(
        self,
        icp: ICP,
        company: Company,
        recalled: list[str],
        min_score: int,
        generate_outreach: bool,
        generate_critique: bool,
        on_progress: ProgressFn,
        on_event: EventFn = _noop_event,
    ) -> Lead | None:
        with self._tracer.span("company", name=company.name):
            # Stage-A (pre-scrape): blocklist check is free — never spend a scrape
            # or LLM call on a known non-vendor (news/aggregator/social) domain.
            if is_blocked(company.website):
                on_progress(f"· {company.name}: skipped (not a vendor/product site)")
                return None

            with self._tracer.span("scrape"):
                on_progress(f"· {company.name}: scraping")
                site = await scrape_site(company.website, cache=self._cache)
                self.metrics.scrapes += 1

            # Stage-A (post-scrape): no readable text or an aggregator/listicle
            # page -> skip BEFORE the qualify LLM call (conserves free-tier budget).
            if not site.text or looks_like_aggregator(company.website):
                on_progress(f"· {company.name}: skipped (no usable company page)")
                return None

            with self._tracer.span("qualify"):
                on_progress(f"· {company.name}: qualifying")
                qual = await self.qualifier.run(
                    icp,
                    company.name,
                    company.website,
                    site.text,
                    recalled,
                    tech_signals=site.tech_signals(),
                )
            # Down-weight any dimension whose cited quote isn't in the scraped
            # text (model-independent hallucination guard, no extra LLM call).
            _ground_dimensions(qual, site.text)
            score = compute_overall_score(
                qual.dimensions, SCORE_WEIGHTS, confidence_weighting=True
            )
            confidence = compute_confidence(qual.dimensions, SCORE_WEIGHTS)
            if score < min_score:
                on_progress(f"· {company.name}: skipped (score {score} < {min_score})")
                return None

            lead = Lead(
                company=company,
                qualification=qual,
                overall_score=score,
                confidence=confidence,
                recalled_context=recalled,
                links=site.links,
            )

            # Reflexion-style critic: gate-passing leads only, only if enabled.
            # NON-FATAL: a weak-model JSON failure flags the lead and is reported
            # as a warning, but never drops the qualified lead.
            if generate_critique:
                try:
                    with self._tracer.span("critic"):
                        on_progress(f"· {company.name}: critiquing (score {score})")
                        critique = await self.critic.run(icp, site.text, qual)
                    lead.critique = critique
                    lead.confidence = round(
                        confidence * (1.0 - critique.confidence_penalty), 3
                    )
                    # The critic ANNOTATES; it must not silently delete a
                    # gate-passing lead. A too-eager free model would otherwise
                    # reject decent leads and wipe the whole list. The confidence
                    # penalty above already down-weights a reject; we just flag it
                    # so the user can judge (and still rank/sort it).
                    if critique.verdict == "reject":
                        lead.flags.append("rejected-by-critic")
                        on_progress(f"· {company.name}: critic flagged weak fit (kept)")
                    elif critique.verdict == "weak":
                        lead.flags.append("weak-evidence")
                except Exception as exc:
                    self.metrics.critic_failures += 1
                    lead.flags.append("critic-failed")
                    on_event(
                        {
                            "type": "warning",
                            "message": f"Critic failed for {company.name}: {exc}",
                            "company": company.name,
                        }
                    )

            # Enrichment (NON-FATAL): keep the lead even if contact-finding fails.
            try:
                with self._tracer.span("enrich"):
                    on_progress(f"· {company.name}: enriching (score {score})")
                    lead.contacts = await self.enricher.run(icp, company.name, site)
            except Exception as exc:
                lead.flags.append("enrich-failed")
                on_event(
                    {
                        "type": "warning",
                        "message": f"Enrichment failed for {company.name}: {exc}",
                        "company": company.name,
                    }
                )

            # Outreach (NON-FATAL): a failed draft leaves outreach=None + a flag.
            if generate_outreach:
                try:
                    with self._tracer.span("outreach"):
                        on_progress(f"· {company.name}: drafting outreach")
                        lead.outreach = await self.outreach.run(icp, lead)
                except Exception as exc:
                    self.metrics.outreach_failures += 1
                    lead.flags.append("outreach-failed")
                    on_event(
                        {
                            "type": "warning",
                            "message": f"Outreach failed for {company.name}: {exc}",
                            "company": company.name,
                        }
                    )

            # Best-effort persistence — never drop a lead over a memory write.
            try:
                await self.memory.remember(lead)
            except Exception:
                pass

            on_progress(f"· {company.name}: finished")

            # Stream the finished lead so it appears as soon as it's accepted.
            on_event({"type": "lead", "lead": lead.model_dump()})
            return lead

    def close(self) -> None:
        self._cache.close()
        self._store.close()
