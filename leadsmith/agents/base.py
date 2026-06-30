"""Shared base for agents. Keeps a handle on the LLM client (see core.gemini)."""

from __future__ import annotations

from ..core.gemini import GeminiClient


class BaseAgent:
    #: Human-readable name used in progress output.
    name: str = "agent"

    def __init__(self, gemini: GeminiClient) -> None:
        self.gemini = gemini
