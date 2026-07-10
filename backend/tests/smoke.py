"""Offline smoke test for the network-free core.

Exercises the cache, vector store, rate limiter, and scoring without touching
Gemini. Run:  python tests/smoke.py
"""

from __future__ import annotations

import asyncio
import os
import sys
import tempfile
import time

# Make 'leadsmith' importable when run from anywhere.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from leadsmith.core.cache import Cache, make_key  # noqa: E402
from leadsmith.core.rate_limiter import RateLimiter  # noqa: E402
from leadsmith.core.tracing import Tracer  # noqa: E402
from leadsmith.core.vector_store import VectorStore  # noqa: E402
from leadsmith.memory.rag import _domain_id, reciprocal_rank_fusion  # noqa: E402
from leadsmith.models import (  # noqa: E402
    Company,
    DimensionScore,
    ICP,
    Lead,
    Qualification,
    RunReport,
    compute_confidence,
    compute_overall_score,
)
from leadsmith.tools.dns_tools import infer_pattern, permute_email  # noqa: E402


def test_cache(tmp: str) -> None:
    c = Cache(os.path.join(tmp, "cache.sqlite"))
    k = make_key("structured", "model", "Schema", "prompt text")
    assert c.get(k) is None
    c.set(k, '{"a": 1}')
    assert c.get(k) == '{"a": 1}'
    c.set_json(k, {"b": 2})
    assert c.get_json(k) == {"b": 2}
    c.close()
    print("  cache: set/get/json OK")


def test_vector_store(tmp: str) -> None:
    vs = VectorStore(os.path.join(tmp, "vec.sqlite"))
    vs.upsert("a", [1.0, 0.0, 0.0], {"name": "A"}, "alpha")
    vs.upsert("b", [0.0, 1.0, 0.0], {"name": "B"}, "beta")
    vs.upsert("c", [0.9, 0.1, 0.0], {"name": "C"}, "gamma")
    assert vs.has("a") and not vs.has("z")
    assert vs.count() == 3
    hits = vs.query([1.0, 0.0, 0.0], top_k=2)
    assert [h["id"] for h in hits] == ["a", "c"], hits  # nearest first
    assert hits[0]["score"] > hits[1]["score"]
    vs.close()
    print("  vector_store: upsert/has/cosine-rank OK")


def test_scoring() -> None:
    dims = [
        DimensionScore(dimension="industry_fit", score=80, evidence="x"),
        DimensionScore(dimension="size_fit", score=60, evidence="x"),
        DimensionScore(dimension="pain_severity", score=90, evidence="x"),
        DimensionScore(dimension="buying_intent", score=40, evidence="x"),
        DimensionScore(dimension="irrelevant", score=100, evidence="x"),  # ignored
    ]
    weights = {
        "industry_fit": 0.30,
        "size_fit": 0.20,
        "pain_severity": 0.30,
        "buying_intent": 0.20,
    }
    # 80*.3 + 60*.2 + 90*.3 + 40*.2 = 24+12+27+8 = 71
    assert compute_overall_score(dims, weights) == 71
    assert compute_overall_score([], weights) == 0
    print("  scoring: weighted average + ignores unknown dims OK")


def test_confidence_weighting() -> None:
    weights = {"a": 0.5, "b": 0.5}
    # Equal confidence (default 1.0) → weighted == unweighted (backward compat).
    dims = [
        DimensionScore(dimension="a", score=100, evidence="x"),
        DimensionScore(dimension="b", score=0, evidence="x"),
    ]
    assert compute_overall_score(dims, weights) == 50
    assert compute_overall_score(dims, weights, confidence_weighting=True) == 50
    # Down-weight the low-confidence high score → overall drops toward the
    # confident low score.
    dims2 = [
        DimensionScore(dimension="a", score=100, evidence="x", confidence=0.2),
        DimensionScore(dimension="b", score=0, evidence="x", confidence=1.0),
    ]
    weighted = compute_overall_score(dims2, weights, confidence_weighting=True)
    # eff: a=0.5*0.2=0.1, b=0.5*1.0=0.5 → (100*0.1 + 0*0.5)/0.6 = 16.67 → 17
    assert weighted == 17, weighted
    # Aggregate confidence = weight-averaged: 0.5*0.2 + 0.5*1.0 = 0.6
    assert compute_confidence(dims2, weights) == 0.6
    print("  confidence: weighting down-weights unsure dims + aggregate OK")


def test_rrf() -> None:
    # 'x' is rank 0 in list 1 and rank 1 in list 2 → should top the fusion.
    rankings = [["x", "y", "z"], ["y", "x"]]
    fused = reciprocal_rank_fusion(rankings)
    order = sorted(fused, key=lambda i: fused[i], reverse=True)
    assert order[0] == "x", order
    assert set(order) == {"x", "y", "z"}
    print("  rrf: reciprocal-rank fusion ranks shared hits highest OK")


def test_dedupe() -> None:
    base = _domain_id("https://www.example.com/about?x=1")
    assert base == "lead::example.com", base
    # Scheme, www., path, port, and m. prefix all normalise to the same id.
    assert _domain_id("example.com") == base
    assert _domain_id("http://m.example.com") == base
    assert _domain_id("https://example.com:443/team") == base
    assert _domain_id("shop.example.com") == base
    assert _domain_id("other.com") != base
    print("  dedupe: _domain_id normalises scheme/www/path/port/subdomain OK")


def test_email_permutation() -> None:
    assert infer_pattern("info@acme.com") is None  # generic local skipped
    assert infer_pattern("jane.doe@acme.com") == "{first}.{last}"
    assert infer_pattern("jane_doe@acme.com") == "{first}_{last}"
    assert infer_pattern("jane-doe@acme.com") == "{first}-{last}"
    assert infer_pattern("jane@acme.com") == "{first}"
    assert permute_email("Jane Doe", "acme.com", "{first}.{last}") == "jane.doe@acme.com"
    assert permute_email("Jane Q. Doe", "acme.com", None) == "jane.doe@acme.com"
    assert permute_email("Jane Doe", "acme.com", "{f}{last}") == "jdoe@acme.com"
    assert permute_email("Madonna", "acme.com", None) is None  # needs 2+ name parts
    print("  email: infer_pattern separators + permute_email OK")


def test_no_leads_reason() -> None:
    icp = ICP(industry="SaaS", company_size="SMB", geography="US")
    assert (
        RunReport(request="x", icp=icp, candidates_found=0).no_leads_reason()
        == "no_candidates"
    )
    assert (
        RunReport(
            request="x", icp=icp, candidates_found=5, candidates_skipped=5
        ).no_leads_reason()
        == "all_known"
    )
    assert (
        RunReport(
            request="x", icp=icp, candidates_found=5, candidates_skipped=1
        ).no_leads_reason()
        == "below_gate"
    )
    lead = Lead(
        company=Company(name="A", website="a.com"), qualification=Qualification()
    )
    assert RunReport(request="x", icp=icp, leads=[lead]).no_leads_reason() is None
    print("  report: no_leads_reason classifies empty-result cause OK")


def test_tracing() -> None:
    tracer = Tracer()
    with tracer.span("discovery", limit=5):
        pass
    with tracer.span("company", name="Acme"):
        with tracer.span("scrape"):
            pass
        with tracer.span("qualify"):
            pass
    tracer.finish()
    tree = tracer.export()
    assert tree["name"] == "run"
    names = [c["name"] for c in tree["children"]]
    assert names == ["discovery", "company"], names
    company = tree["children"][1]
    assert [c["name"] for c in company["children"]] == ["scrape", "qualify"]
    assert company["attrs"] == {"name": "Acme"}
    assert isinstance(tree["ms"], float)
    print("  tracing: nested spans + export tree OK")


async def test_tracing_concurrent() -> None:
    # The real risk with contextvars + asyncio.gather: do concurrent per-company
    # tasks keep separate subtrees, or do spans bleed across tasks?
    tracer = Tracer()

    async def work(i: int) -> None:
        with tracer.span("company", name=f"c{i}"):
            with tracer.span("scrape"):
                await asyncio.sleep(0.01)
            with tracer.span("qualify"):
                await asyncio.sleep(0.01)

    await asyncio.gather(*(work(i) for i in range(4)))
    tracer.finish()
    tree = tracer.export()
    companies = [c for c in tree["children"] if c["name"] == "company"]
    assert len(companies) == 4, len(companies)
    for c in companies:
        names = [ch["name"] for ch in c["children"]]
        assert names == ["scrape", "qualify"], (c["attrs"], names)
    print("  tracing(concurrent): per-task subtrees nest correctly, no bleed OK")


async def test_rate_limiter() -> None:
    # 3 requests/min -> 4th must wait. Use a tiny window check via concurrency.
    rl = RateLimiter(rpm=100, max_concurrency=2)
    active = 0
    peak = 0

    async def worker() -> None:
        nonlocal active, peak
        async with rl:
            active += 1
            peak = max(peak, active)
            await asyncio.sleep(0.05)
            active -= 1

    await asyncio.gather(*(worker() for _ in range(6)))
    assert peak <= 2, f"concurrency cap breached: peak={peak}"
    print(f"  rate_limiter: concurrency capped at {peak} (<=2) OK")


async def main() -> int:
    print("Running offline core smoke test...")
    with tempfile.TemporaryDirectory() as tmp:
        test_cache(tmp)
        test_vector_store(tmp)
        test_scoring()
        test_confidence_weighting()
        test_rrf()
        test_dedupe()
        test_email_permutation()
        test_no_leads_reason()
        test_tracing()
        await test_tracing_concurrent()
        await test_rate_limiter()
    print("ALL CORE TESTS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
