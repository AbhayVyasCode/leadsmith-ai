"""SQLite or ConvexDB backed cache for LLM responses, scrapes, and embeddings.

Keyed by a content hash so identical requests are free on re-run.
Falls back to SQLite if CONVEX_URL is not set.
"""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import threading
from typing import Any


def make_key(*parts: str) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8", "ignore"))
        h.update(b"\x00")
    return h.hexdigest()


class Cache:
    def __init__(self, path: str) -> None:
        from ..config import Settings

        cfg = Settings()
        self.convex_url = cfg.convex_url

        if self.convex_url:
            from convex import ConvexClient
            self.client = ConvexClient(self.convex_url)
        else:
            os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
            self._lock = threading.Lock()
            self._conn = sqlite3.connect(path, check_same_thread=False)
            self._conn.execute(
                "CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)"
            )
            self._conn.commit()

    def get(self, key: str) -> str | None:
        if self.convex_url:
            try:
                return self.client.query("cache:get", {"key": key})
            except Exception:
                return None

        with self._lock:
            row = self._conn.execute(
                "SELECT v FROM kv WHERE k = ?", (key,)
            ).fetchone()
        return row[0] if row else None

    def set(self, key: str, value: str) -> None:
        if self.convex_url:
            try:
                self.client.mutation("cache:set", {"key": key, "val": value})
            except Exception:
                pass
            return

        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)", (key, value)
            )
            self._conn.commit()

    def get_json(self, key: str) -> Any | None:
        raw = self.get(key)
        return json.loads(raw) if raw is not None else None

    def set_json(self, key: str, value: Any) -> None:
        self.set(key, json.dumps(value, ensure_ascii=False))

    def close(self) -> None:
        if self.convex_url:
            pass
        else:
            with self._lock:
                self._conn.close()
