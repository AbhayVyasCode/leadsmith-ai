# Running Leadsmith end-to-end (real data)

Leadsmith has two parts:

- **Backend** — the Python multi-agent engine (`leadsmith/`, `main.py`) + a thin
  web bridge (`server.py`) that streams runs to the UI.
- **Frontend** — the Next.js app in `web/`.

You need a **free Gemini API key**: https://aistudio.google.com/apikey

There are two ways to test with real data: the **full stack** (UI + backend) or the
**CLI only** (fastest sanity check).

---

## A. Full stack — UI showing real leads

### 1. Backend (terminal 1)

```powershell
# from the repo root: D:\Personal\sales agent
copy .env.example .env            # then edit .env and set GEMINI_API_KEY=...

.\.venv\Scripts\Activate.ps1      # activate the existing venv
pip install -r requirements.txt   # installs fastapi + uvicorn (new) alongside the rest

python server.py                  # serves http://localhost:8000  (uvicorn)
```

Verify it's up (terminal 3, or a browser):

```powershell
curl http://localhost:8000/api/health
# {"ok":true,"model":"gemini-2.0-flash","has_key":true}
```

> If `has_key` is `false`, your `.env` key isn't being read — check the file is in
> the repo root and the line reads `GEMINI_API_KEY=your_actual_key`.

### 2. Frontend (terminal 2)

```powershell
cd web
bun install                       # first time only
bun run dev                       # http://localhost:3000
```

`web/.env.local` is already set to `NEXT_PUBLIC_LEADSMITH_API=http://localhost:8000`,
so the app talks to the real backend. Open **http://localhost:3000/app**, type a
request (e.g. *"mid-sized e-commerce brands with weak SEO"*), set the flags, and
click **Find leads** — the agents stream live and real leads fill the table, with
the trace graph and metrics from the actual run.

> First run is slower and may hit free-tier rate limits (~15 req/min). Lower
> **Max companies** to 3–4 for a quick test. Re-runs are faster (disk cache).

### Switch back to mock data

Delete or rename `web/.env.local`, then restart `bun run dev`. The UI runs on
built-in fixtures with no backend or key required.

---

## B. CLI only — fastest real-data check (no frontend)

```powershell
# repo root, venv activated, .env with GEMINI_API_KEY set
python main.py "digital marketing agencies in India with outdated websites" --max 4
python main.py "B2B SaaS startups in Europe hiring marketers" --min-score 55 --outreach --out leads.json
python main.py "mid-sized e-commerce brands with weak SEO" --critic --trace
```

Flags: `--max` companies · `--min-score` gate · `--outreach` draft emails ·
`--critic` adversarial re-check · `--trace` print the agent-graph timings ·
`--out` write the full JSON report.

Offline core tests (no key needed):

```powershell
python tests/smoke.py
```

---

## Ports & troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE :8000` | Something's on 8000 — run `set PORT=8010 && python server.py` and set `NEXT_PUBLIC_LEADSMITH_API=http://localhost:8010` in `web/.env.local`. |
| `EADDRINUSE :3000` | `set PORT=3210 && bun run dev` (or `bun run dev -- -p 3210`). |
| UI shows an error toast/state | Check terminal 1 — a Gemini 429 (rate limit) or missing key surfaces as the run's error. Lower `--max` / Max companies. |
| `has_key:false` | `.env` not found or key still `your_key_here`. |
| CORS error in browser console | Make sure you're hitting the backend via `http://localhost:8000` (the server allows all origins in dev). |

The frontend↔backend contract lives in **one place**: `web/lib/leadsmith-client.ts`
(`HttpLeadsmithClient`) talks to `server.py`'s `POST /api/discover` (SSE). Both speak
the same event shapes defined in `web/lib/types.ts`, which mirror
`leadsmith/models.py`.
