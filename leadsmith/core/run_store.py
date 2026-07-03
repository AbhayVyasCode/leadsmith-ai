"""A local SQLite-backed store for persisting RunReports."""

import json
import os
import sqlite3
import threading
from typing import List, Dict, Any

class RunStore:
    def __init__(self, path: str) -> None:
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

    def save(self, run_id: str, report_dict: Dict[str, Any]) -> None:
        timestamp = report_dict.get("created_at", 0.0)
        request = report_dict.get("request", "")
        candidates = report_dict.get("candidates_found", 0)
        leads = len(report_dict.get("leads", []))
        duration = report_dict.get("duration_seconds", 0.0)
        
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO runs (id, timestamp, request, candidates, leads, duration, payload) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (run_id, timestamp, request, candidates, leads, duration, json.dumps(report_dict)),
            )
            self._conn.commit()

    def get_summaries(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT id, timestamp, request, candidates, leads, duration FROM runs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()
            
        return [
            {
                "id": r[0],
                "created_at": r[1],
                "request": r[2],
                "candidates_found": r[3],
                "leads_count": r[4],
                "duration_seconds": r[5]
            } for r in rows
        ]

    def get(self, run_id: str) -> Dict[str, Any] | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT payload FROM runs WHERE id = ?", (run_id,)
            ).fetchone()
            if row:
                return json.loads(row[0])
            return None

    def delete(self, run_id: str) -> bool:
        with self._lock:
            cursor = self._conn.execute("DELETE FROM runs WHERE id = ?", (run_id,))
            self._conn.commit()
            return cursor.rowcount > 0
            
    def clear(self) -> None:
        with self._lock:
            self._conn.execute("DELETE FROM runs")
            self._conn.commit()

    def count(self) -> int:
        with self._lock:
            return self._conn.execute("SELECT COUNT(*) FROM runs").fetchone()[0]

    def close(self) -> None:
        with self._lock:
            self._conn.close()
