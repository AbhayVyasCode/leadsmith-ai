"""Convenience entry points around the Orchestrator."""

from __future__ import annotations

from collections.abc import Callable

from .agents.orchestrator import Orchestrator
from .config import Settings
from .models import RunReport


async def find(
    request: str,
    *,
    cfg: Settings,
    target_leads: int = 5,
    scan_cap: int | None = None,
    mode: str = "auto",
    min_score: int = 40,
    generate_outreach: bool = False,
    generate_critique: bool = False,
    on_progress: Callable[[str], None] | None = None,
    on_event: Callable[[dict], None] | None = None,
) -> RunReport:
    orch = Orchestrator(cfg)
    try:
        return await orch.find(
            request,
            target_leads=target_leads,
            scan_cap=scan_cap,
            mode=mode,
            min_score=min_score,
            generate_outreach=generate_outreach,
            generate_critique=generate_critique,
            on_progress=on_progress or (lambda _: None),
            on_event=on_event or (lambda _: None),
        )
    finally:
        orch.close()


async def continue_find(
    previous_report: RunReport,
    *,
    cfg: Settings,
    target_leads: int | None = None,
    scan_cap: int | None = None,
    min_score: int | None = None,
    generate_outreach: bool | None = None,
    generate_critique: bool | None = None,
    on_progress: Callable[[str], None] | None = None,
    on_event: Callable[[dict], None] | None = None,
) -> RunReport:
    """Continue finding leads from a previous run's state."""
    orch = Orchestrator(cfg)
    try:
        return await orch.continue_find(
            previous_report,
            target_leads=target_leads,
            scan_cap=scan_cap,
            min_score=min_score,
            generate_outreach=generate_outreach,
            generate_critique=generate_critique,
            on_progress=on_progress or (lambda _: None),
            on_event=on_event or (lambda _: None),
        )
    finally:
        orch.close()
