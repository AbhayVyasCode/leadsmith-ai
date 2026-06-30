"""Leadsmith HTTP/SSE bridge — exposes the multi-agent pipeline to the web frontend.

POST /api/discover streams Server-Sent Events as a run progresses (the same
structured events the frontend's mock client emits), then a final `done` event
carrying the full RunReport. This is the real-data counterpart to the mock
LeadsmithClient in web/lib/leadsmith-client.ts.

Run:
    uvicorn server:app --reload --port 8000
    # or:  python server.py
"""

from __future__ import annotations

import asyncio
import json
import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from leadsmith.config import Settings
from leadsmith.pipeline import find

app = FastAPI(title="Leadsmith API", version="0.1.0")

# Local-dev CORS: the Next.js dev server runs on a different origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Flags(BaseModel):
    targetLeads: int | None = None  # number of QUALIFIED leads to find
    max: int | None = None  # legacy alias for targetLeads (older clients)
    minScore: int = 40
    mode: str = "auto"  # auto | product | customer
    # Off by default for free-tier safety (each adds LLM calls per lead); the UI
    # lets users opt in. They are robust (non-fatal) when enabled.
    outreach: bool = False
    critic: bool = False
    trace: bool = True

    @property
    def target(self) -> int:
        return self.targetLeads or self.max or 5


class DiscoverRequest(BaseModel):
    request: str
    flags: Flags = Flags()


# Status ordering for the linear-pipeline guard in /api/discover: the UI shows
# one sequential pipeline, but companies are processed concurrently, so phase
# events must never regress to an earlier status.
_PHASE_RANK = {"pending": 0, "running": 1, "done": 2}


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


def _company(msg: str) -> str:
    """Extract the company name from a '· {name}: action' progress line."""
    m = re.match(r"·\s*(.+?):", msg)
    return m.group(1).strip() if m else ""


def _parse_progress(msg: str) -> list[dict]:
    """Translate the orchestrator's text progress into the frontend's structured
    RunEvent stream so the agent pipeline animates with real timing."""
    events: list[dict] = [{"type": "progress", "message": msg}]
    low = msg.lower()

    if "parsing intent" in low:
        events.append({"type": "phase", "agent": "intent", "status": "running"})
    elif "discovering companies" in low:
        events.append({"type": "phase", "agent": "intent", "status": "done"})
        events.append({"type": "phase", "agent": "discovery", "status": "running"})
    elif msg.startswith("Found "):
        events.append({"type": "phase", "agent": "discovery", "status": "done"})
        fm = re.search(r"Found (\d+) candidates", msg)
        sm = re.search(r"\((\d+) already known", msg)
        if fm:
            events.append(
                {
                    "type": "candidates",
                    "found": int(fm.group(1)),
                    "skipped": int(sm.group(1)) if sm else 0,
                }
            )
        events.append({"type": "phase", "agent": "recall", "status": "running"})
        events.append({"type": "phase", "agent": "recall", "status": "done"})
    elif ": scraping" in msg:
        name = _company(msg)
        events.append({"type": "company", "name": name, "status": "running", "detail": "scraping"})
    elif ": qualifying" in msg:
        events.append({"type": "phase", "agent": "qualify", "status": "running", "detail": _company(msg)})
    elif ": critiquing" in msg:
        events.append({"type": "phase", "agent": "qualify", "status": "done"})
        events.append({"type": "phase", "agent": "critic", "status": "running", "detail": _company(msg)})
    elif ": enriching" in msg:
        events.append({"type": "phase", "agent": "qualify", "status": "done"})
        events.append({"type": "phase", "agent": "enrich", "status": "running", "detail": _company(msg)})
    elif ": drafting outreach" in msg:
        events.append({"type": "phase", "agent": "enrich", "status": "done"})
        events.append({"type": "phase", "agent": "outreach", "status": "running", "detail": _company(msg)})
    elif "skipped" in low or "dropped" in low:
        events.append({"type": "company", "name": _company(msg), "status": "skipped", "detail": msg})
    elif msg.startswith("Done."):
        for agent in ("qualify", "critic", "enrich", "outreach"):
            events.append({"type": "phase", "agent": agent, "status": "done"})

    return events


@app.get("/api/health")
async def health() -> dict:
    cfg = Settings()

    def _ok(value: str | None) -> bool:
        return bool(value and value != "your_key_here")

    return {
        "ok": True,
        "chat_model": cfg.openrouter_model,
        "embedding_model": cfg.embedding_model,
        "has_openrouter_key": _ok(cfg.openrouter_api_key),
        "has_tavily_key": _ok(cfg.tavily_api_key),
        "has_gemini_key": _ok(cfg.gemini_api_key),
    }


@app.post("/api/discover")
async def discover(body: DiscoverRequest) -> StreamingResponse:
    # Validate the key up front; stream a single error event if missing.
    try:
        cfg = Settings().validated()
    except RuntimeError as exc:
        message = str(exc)

        async def err_stream():
            yield _sse({"type": "error", "message": message})

        return StreamingResponse(err_stream(), media_type="text/event-stream")

    queue: asyncio.Queue = asyncio.Queue()
    # Concurrency guard: track the furthest status each pipeline phase has
    # reached and never regress it, so a lagging company's progress line can't
    # flip a node backwards. Seeded with intent=running to dedupe the priming
    # event emitted at the top of stream() below.
    phase_rank: dict[str, int] = {"intent": _PHASE_RANK["running"]}

    def emit(event: dict) -> None:
        if event.get("type") == "phase":
            agent = event.get("agent", "")
            rank = _PHASE_RANK.get(event.get("status", ""), -1)
            if rank <= phase_rank.get(agent, -1):
                return  # drop a lagging concurrent company's stale transition
            phase_rank[agent] = rank
        queue.put_nowait(event)

    def on_progress(msg: str) -> None:
        for event in _parse_progress(msg):
            emit(event)

    async def runner() -> None:
        try:
            report = await find(
                body.request,
                cfg=cfg,
                target_leads=body.flags.target,
                mode=body.flags.mode,
                min_score=body.flags.minScore,
                generate_outreach=body.flags.outreach,
                generate_critique=body.flags.critic,
                on_progress=on_progress,
                on_event=emit,  # structured icp/lead/product/warning events
            )
            queue.put_nowait({"type": "done", "report": report.model_dump()})
        except Exception as exc:  # surface any runtime/LLM failure to the UI
            queue.put_nowait({"type": "error", "message": str(exc)})
        finally:
            queue.put_nowait(None)  # sentinel: stream complete

    async def stream():
        yield ": connected\n\n"
        yield _sse({"type": "phase", "agent": "intent", "status": "running"})
        task = asyncio.create_task(runner())
        try:
            while True:
                event = await queue.get()
                if event is None:
                    break
                yield _sse(event)
        finally:
            if not task.done():
                task.cancel()

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=int(os.environ.get("PORT", "8000")),
        reload=bool(os.environ.get("RELOAD")),
    )
