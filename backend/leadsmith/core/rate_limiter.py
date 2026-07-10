"""Async rate limiter: caps both concurrency and requests-per-minute.

Gemini's free tier limits requests/minute, so every outbound API call passes
through here. Combines a semaphore (max simultaneous calls) with a sliding
60-second window (max calls/minute).
"""

from __future__ import annotations

import asyncio
import time
from collections import deque


class RateLimiter:
    def __init__(self, rpm: int, max_concurrency: int) -> None:
        self._rpm = max(1, rpm)
        self._sem = asyncio.Semaphore(max(1, max_concurrency))
        self._window: deque[float] = deque()
        self._lock = asyncio.Lock()

    async def __aenter__(self) -> "RateLimiter":
        await self._sem.acquire()
        try:
            await self._respect_rpm()
        except BaseException:
            self._sem.release()
            raise
        return self

    async def __aexit__(self, *exc: object) -> None:
        self._sem.release()

    async def _respect_rpm(self) -> None:
        while True:
            async with self._lock:
                now = time.monotonic()
                while self._window and now - self._window[0] >= 60.0:
                    self._window.popleft()
                if len(self._window) < self._rpm:
                    self._window.append(now)
                    return
                wait = 60.0 - (now - self._window[0])
            # Sleep outside the lock so other tasks can re-check.
            await asyncio.sleep(max(0.05, wait))
