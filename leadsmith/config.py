"""Typed configuration, loaded from environment / .env via pydantic-settings.

Stack: OpenRouter (any chat model) for reasoning/structured calls, Tavily for
web search, and Google Gemini for embeddings (kept free + local-RAG-compatible).
"""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Scoring dimensions the qualifier must fill, and their relative weights.
# Overall fit is computed in code (deterministic) rather than asked of the LLM.
SCORE_WEIGHTS: dict[str, float] = {
    "industry_fit": 0.30,
    "size_fit": 0.20,
    "pain_severity": 0.30,
    "buying_intent": 0.20,
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- Chat / reasoning model: NVIDIA Build API ---
    nvidia_api_key: str = Field(default="")
    nvidia_model: str = "meta/llama-3.1-70b-instruct"
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"

    # --- Web search: Tavily (replaces Gemini Google Search grounding) ---
    tavily_api_key: str = Field(default="")

    # --- Embeddings: Google Gemini (free tier; keeps the RAG memory valid) ---
    gemini_api_key: str = Field(default="")
    embedding_model: str = "gemini-embedding-001"

    # NVIDIA API caps (adjust as needed for your plan)
    rpm_limit: int = 20
    max_concurrency: int = 4

    # Gemini embeddings have a separate quota from NVIDIA chat, so they get
    # their own limiter — sharing one would make embeds eat the chat budget.
    embed_rpm_limit: int = 100
    embed_max_concurrency: int = 4

    # --- Target-N wave loop (find N qualified leads, not "scan N companies") ---
    # Each wave discovers ~ceil(remaining_target * overfetch_factor) candidates
    # (over-fetching to absorb non-buyers), bounded per wave and by a hard cap so
    # a single run can't exhaust the free-tier daily budget. The shared RPM
    # limiter only protects per-minute bursts — these caps protect the daily cap.
    overfetch_factor: float = 2.0
    max_per_wave: int = 8
    hard_scan_cap: int = 16
    max_waves: int = 4

    data_dir: str = ".leadsmith_data"
    hunter_api_key: str | None = None

    def validated(self) -> "Settings":
        missing: list[str] = []
        if not self.nvidia_api_key or self.nvidia_api_key == "your_key_here":
            missing.append(
                "NVIDIA_API_KEY (chat model) — get one at https://build.nvidia.com/"
            )
        if not self.tavily_api_key or self.tavily_api_key == "your_key_here":
            missing.append(
                "TAVILY_API_KEY (web search) — free key at https://app.tavily.com"
            )
        if not self.gemini_api_key or self.gemini_api_key == "your_key_here":
            missing.append(
                "GEMINI_API_KEY (embeddings) — free key at https://aistudio.google.com/apikey"
            )
        if missing:
            raise RuntimeError(
                "Missing required configuration. Copy .env.example to .env and set:\n  - "
                + "\n  - ".join(missing)
            )
        return self
