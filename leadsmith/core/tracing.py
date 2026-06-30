"""In-process trace tree over the agent graph — zero LLM calls, async-safe.

Each agent step opens a span; spans nest via a contextvar so concurrent
per-company tasks (created by asyncio.gather) each build their own subtree under
the run root. Exported as a JSON tree and rendered in the CLI with --trace.
"""

from __future__ import annotations

import contextvars
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Iterator

_current: contextvars.ContextVar["Span | None"] = contextvars.ContextVar(
    "leadsmith_current_span", default=None
)


@dataclass
class Span:
    name: str
    attrs: dict = field(default_factory=dict)
    start: float = field(default_factory=time.monotonic)
    end: float | None = None
    children: list["Span"] = field(default_factory=list)

    @property
    def ms(self) -> float:
        return round(((self.end or time.monotonic()) - self.start) * 1000, 1)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "ms": self.ms,
            "attrs": self.attrs,
            "children": [c.to_dict() for c in self.children],
        }


class Tracer:
    def __init__(self) -> None:
        self.root = Span("run")
        _current.set(self.root)

    @contextmanager
    def span(self, span_name: str, /, **attrs: object) -> Iterator[Span]:
        # span_name is positional-only so callers can pass an attr literally
        # named "name" (e.g. span("company", name=company.name)).
        parent = _current.get() or self.root
        s = Span(span_name, dict(attrs))
        parent.children.append(s)
        token = _current.set(s)
        try:
            yield s
        finally:
            s.end = time.monotonic()
            _current.reset(token)

    def finish(self) -> None:
        self.root.end = time.monotonic()

    def export(self) -> dict:
        return self.root.to_dict()
