"""Lightweight run observability: call counts, tokens, cache hits, cost estimate."""

from __future__ import annotations

from dataclasses import asdict, dataclass

# Rough Gemini Flash pricing (USD per 1M tokens) for an *estimate* only. On the
# free tier the real cost is $0; this just shows what a paid run would cost.
_PRICE_PER_MTOK = 0.15


@dataclass
class Metrics:
    llm_calls: int = 0
    embed_calls: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    scrapes: int = 0
    errors: int = 0
    total_tokens: int = 0
    # Target-N wave loop accounting + non-fatal per-step failure counts.
    waves: int = 0
    total_scanned: int = 0
    critic_failures: int = 0
    outreach_failures: int = 0

    def hit(self) -> None:
        self.cache_hits += 1

    def miss(self) -> None:
        self.cache_misses += 1

    def add_llm(self, tokens: int) -> None:
        self.llm_calls += 1
        self.total_tokens += max(0, tokens)

    def add_embed(self) -> None:
        self.embed_calls += 1

    @property
    def estimated_cost_usd(self) -> float:
        return round(self.total_tokens / 1_000_000 * _PRICE_PER_MTOK, 4)

    def as_dict(self) -> dict:
        d = asdict(self)
        d["estimated_cost_usd"] = self.estimated_cost_usd
        return d
