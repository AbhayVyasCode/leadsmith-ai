"""A local SQLite-backed store or ConvexDB-backed store for persisting RunReports.

Falls back to local SQLite if CONVEX_URL is not set.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading


class RunStore:
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
                "CREATE TABLE IF NOT EXISTS runs ("
                "id TEXT PRIMARY KEY, "
                "timestamp REAL, "
                "request TEXT, "
                "candidates INTEGER, "
                "leads INTEGER, "
                "duration REAL, "
                "payload TEXT)"
            )
            self._conn.commit()

    def save(self, run_id: str, report_dict: dict) -> None:
        timestamp = report_dict.get("created_at", 0.0)
        request = report_dict.get("request", "")
        candidates = report_dict.get("candidates_found", 0)
        leads = len(report_dict.get("leads", []))
        duration = report_dict.get("duration_seconds", 0.0)

        if self.convex_url:
            try:
                self.client.mutation(
                    "runs:save",
                    {
                        "id": run_id,
                        "timestamp": float(timestamp),
                        "request": str(request),
                        "candidates": int(candidates),
                        "leads": int(leads),
                        "duration": float(duration),
                        "payload": json.dumps(report_dict),
                    },
                )
            except Exception:
                pass
            return

        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO runs (id, timestamp, request, candidates, leads, duration, payload) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    run_id,
                    timestamp,
                    request,
                    candidates,
                    leads,
                    duration,
                    json.dumps(report_dict),
                ),
            )
            self._conn.commit()

    def get_summaries(self, limit: int = 50, offset: int = 0) -> list[dict]:
        if self.convex_url:
            try:
                return self.client.query(
                    "runs:getSummaries", {"limit": limit, "offset": offset}
                )
            except Exception:
                return []

        with self._lock:
            rows = self._conn.execute(
                "SELECT id, timestamp, request, candidates, leads, duration, payload FROM runs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()

        res = []
        for r in rows:
            total_scanned = r[3]  # Fallback to candidates_found
            if r[6]:
                try:
                    payload = json.loads(r[6])
                    total_scanned = payload.get(
                        "metrics", {}
                    ).get("total_scanned", total_scanned)
                except Exception:
                    pass
            res.append(
                {
                    "id": r[0],
                    "created_at": r[1],
                    "request": r[2],
                    "candidates_found": r[3],
                    "leads_count": r[4],
                    "duration_seconds": r[5],
                    "total_scanned": total_scanned,
                }
            )
        return res

    def get(self, run_id: str) -> dict | None:
        if self.convex_url:
            try:
                payload = self.client.query("runs:get", {"id": run_id})
                return json.loads(payload) if payload else None
            except Exception:
                return None

        with self._lock:
            row = self._conn.execute(
                "SELECT payload FROM runs WHERE id = ?", (run_id,)
            ).fetchone()
            if row:
                return json.loads(row[0])
            return None

    def delete(self, run_id: str) -> bool:
        if self.convex_url:
            try:
                return self.client.mutation("runs:deleteRun", {"id": run_id})
            except Exception:
                return False

        with self._lock:
            cursor = self._conn.execute(
                "DELETE FROM runs WHERE id = ?", (run_id,)
            )
            self._conn.commit()
            return cursor.rowcount > 0

    def clear(self) -> None:
        if self.convex_url:
            try:
                self.client.mutation("runs:clearAll")
            except Exception:
                pass
            return

        with self._lock:
            self._conn.execute("DELETE FROM runs")
            self._conn.commit()

    def count(self) -> int:
        if self.convex_url:
            try:
                return self.client.query("runs:count")
            except Exception:
                return 0

        with self._lock:
            return self._conn.execute("SELECT COUNT(*) FROM runs").fetchone()[0]

    def close(self) -> None:
        if self.convex_url:
            pass
        else:
            with self._lock:
                self._conn.close()
