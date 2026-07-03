"""A small, dependency-light local vector store (the RAG substrate).

Vectors persist in SQLite as float32 blobs; similarity search is cosine over a
NumPy matrix loaded on demand. No external vector DB needed — fully free and
local, which is plenty for a single-user research memory.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading

import numpy as np


class VectorStore:
    def __init__(self, path: str) -> None:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS vectors ("
            "id TEXT PRIMARY KEY, dim INTEGER, vec BLOB, meta TEXT, text TEXT)"
        )
        self._conn.commit()

    def has(self, id: str) -> bool:
        with self._lock:
            row = self._conn.execute(
                "SELECT 1 FROM vectors WHERE id = ?", (id,)
            ).fetchone()
        return row is not None

    def upsert(self, id: str, vector: list[float], meta: dict, text: str) -> None:
        arr = np.asarray(vector, dtype=np.float32)
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO vectors (id, dim, vec, meta, text) "
                "VALUES (?, ?, ?, ?, ?)",
                (id, arr.shape[0], arr.tobytes(), json.dumps(meta), text),
            )
            self._conn.commit()

    def query(
        self, vector: list[float], top_k: int = 5, min_score: float = 0.0
    ) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT id, dim, vec, meta, text FROM vectors"
            ).fetchall()
        if not rows:
            return []

        q = np.asarray(vector, dtype=np.float32)
        q_norm = float(np.linalg.norm(q)) or 1.0

        # Stack every stored vector of matching dimensionality into one matrix and
        # score them all with a single matmul, instead of looping cosine per row.
        kept: list[tuple] = []
        mats: list[np.ndarray] = []
        for id_, dim, blob, meta, text in rows:
            v = np.frombuffer(blob, dtype=np.float32)
            if v.shape[0] != q.shape[0]:
                continue  # dimension mismatch (e.g. embedding model changed)
            mats.append(v)
            kept.append((id_, meta, text))
        if not mats:
            return []

        matrix = np.vstack(mats)  # (N, dim)
        norms = np.linalg.norm(matrix, axis=1)
        norms[norms == 0.0] = 1.0
        sims = (matrix @ q) / (norms * q_norm)  # (N,) cosine similarity

        results = [
            {"id": id_, "score": float(s), "meta": json.loads(meta), "text": text}
            for (id_, meta, text), s in zip(kept, sims)
            if s >= min_score
        ]
        results.sort(key=lambda r: r["score"], reverse=True)
        return results[:top_k]

    def get_all(self, limit: int = 100, offset: int = 0) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT id, meta, text FROM vectors LIMIT ? OFFSET ?", (limit, offset)
            ).fetchall()
        return [
            {"id": id_, "meta": json.loads(meta), "text": text}
            for id_, meta, text in rows
        ]

    def delete(self, id: str) -> bool:
        with self._lock:
            cursor = self._conn.execute("DELETE FROM vectors WHERE id = ?", (id,))
            self._conn.commit()
            return cursor.rowcount > 0

    def clear(self) -> None:
        with self._lock:
            self._conn.execute("DELETE FROM vectors")
            self._conn.commit()

    def count(self) -> int:
        with self._lock:
            return self._conn.execute("SELECT COUNT(*) FROM vectors").fetchone()[0]

    def close(self) -> None:
        with self._lock:
            self._conn.close()
