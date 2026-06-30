# Leadsmith AI — Architecture & Design

> **Plain English to pipeline.** Describe who you want to sell to (or paste a product URL); Leadsmith discovers real companies on the open web, scores each one against the evidence, challenges weak matches, enriches contacts, and drafts the first outreach — and shows its work the whole way.

This document covers **what Leadsmith is**, **how it is built**, and — most importantly — **how it produces high-quality leads** rather than a long, noisy list you have to re-verify by hand.

---

## 1. Summary

Leadsmith is a **multi-agent lead-discovery engine** with two halves joined by one swappable seam:

- **Backend (`leadsmith/`, Python)** — a layered, free-tier-disciplined agent pipeline that turns a request into a ranked, evidence-backed `RunReport`. Exposed as a CLI (`main.py`) and a streaming HTTP/SSE API (`server.py`).
- **Frontend (`web/`, Next.js 16 + React 19 + Tailwind v4)** — a marketing site and an inspectable dashboard that streams a run live: the agent pipeline, the inferred buyer profile, ranked leads with per-dimension evidence, the critic's verdict, contacts, outreach drafts, run metrics, and a trace graph.

The guiding philosophy is **"show the work."** Every score carries its evidence and a confidence value; a dedicated critic agent is allowed to say *no*; contact emails are labelled *found / guessed / unknown* instead of being passed off as verified; and the full run is traceable. The system optimises for a **short list you can trust**, not a large list you must disqualify.

It is built to run on **free tiers**: OpenRouter (any chat model, free models supported) for reasoning, Google Gemini for embeddings, and Tavily for web search — with rate limiting, caching, and hard scan caps so a single run cannot exhaust a free-tier daily budget.

---

## 2. Architecture

### 2.1 The big picture

```
┌────────────────────────────┐         ┌──────────────────────────────────────┐
│        FRONTEND (web/)      │         │            BACKEND (leadsmith/)        │
│  Next.js · React · Tailwind │         │            Python · asyncio            │
│                             │         │                                        │
│  (marketing) route group    │         │  CLI: main.py                          │
│  /app dashboard             │         │  API: server.py  (FastAPI + SSE)       │
│        │                    │         │            │                           │
│  useLeadsmithRun (reducer)  │         │       pipeline.find()                  │
│        │                    │         │            │                           │
│  ILeadsmithClient ──────────┼────┬────┼──► Orchestrator.find()                 │
│   ├ MockLeadsmithClient     │    │    │            │ (waves + concurrent fanout)│
│   └ HttpLeadsmithClient ────┼─SSE┘    │     agents · core · tools · memory     │
└────────────────────────────┘         └──────────────────────────────────────┘
                 ▲                                          │
                 └────────── identical RunEvent stream ─────┘
```

The **single seam** is the `ILeadsmithClient` interface (`web/lib/leadsmith-client.ts`):

- `MockLeadsmithClient` (default) replays fixtures with realistic timing — the UI works with zero backend.
- `HttpLeadsmithClient` streams Server-Sent Events from `server.py` when `NEXT_PUBLIC_LEADSMITH_API` is set.

Both emit the **same `RunEvent` shapes**, and `web/lib/types.ts` mirrors the backend Pydantic models in `leadsmith/models.py` field-for-field. The dashboard renders identically regardless of data source — the mock is a faithful contract, not a throwaway.

### 2.2 Backend layers (strict, bottom-up DAG — no cycles)

| Layer | Modules | Responsibility |
|---|---|---|
| **Infra** (`core/`) | `gemini` (LLM gateway), `rate_limiter`, `cache`, `vector_store`, `metrics`, `tracing`, `domain_filter` | The substrate every agent stands on: rate-limited, retried, cached, metered access to models + search; local vector RAG store; observability; junk filtering. |
| **Tools** (`tools/`) | `web_search` (Tavily), `web_scrape` (httpx + BeautifulSoup), `dns_tools` (MX check + email permutation) | The agents' hands — how they touch the outside world. |
| **Agents** (`agents/`) | `base` + `intent`, `discovery`, `qualifier`, `enricher`, `outreach`, `critic`, `product_profile` | Specialists. Each is a *thin* prompt-wrapper returning a validated Pydantic model — one job each. |
| **Memory** (`memory/`) | `rag` (`ResearchMemory`) | Cross-run recall + dedupe via HyDE multi-query and Reciprocal-Rank Fusion. |
| **Orchestration** | `orchestrator` (`Orchestrator.find`), `pipeline.find` | The supervisor: the wave loop, per-company concurrent fan-out, scoring, gating, persistence. |
| **Interfaces** | `main.py` (Rich CLI), `server.py` (FastAPI SSE) | Human + machine entry points. |

**`core/gemini.LLMClient`** (aliased `GeminiClient`) is the most-depended node — the one gateway unifying:
- `structured()` — OpenRouter chat returning JSON validated against a Pydantic schema (works across *any* model);
- `search()` — live web results via Tavily;
- `embed()` — Gemini embeddings for the RAG memory.

Chat (OpenRouter) and embeddings (Gemini) hit different providers with separate quotas, so each gets its **own `RateLimiter`**.

### 2.3 The run, end to end

```
request
  │
  ├─ detect product URL?  ──yes──► product_profile (scrape seller site → invert to buyer ICP)
  │                                        │
  │                                 intent.run_reverse(request, product)
  └─ no ──────────────────────────► intent.run(request)
                                           │
                                          ICP ───► memory.recall(ICP)   ← computed ONCE, shared
                                           │        (HyDE + RRF, calibration context)
                                           ▼
   ╔══════════════ WAVE LOOP ══════════════╗   until: qualified == target_leads
   ║  discovery.run(ICP, rotated query)     ║          OR total_scanned == hard_scan_cap
   ║      │                                 ║          OR wave == max_waves
   ║  dedupe roots: intra-run + cross-run   ║          OR discovery exhausted
   ║      │  (memory.seen_domain)           ║
   ║      ▼  asyncio.gather over companies: ║
   ║   is_blocked? ─► skip (free)           ║   ← no scrape/LLM spent on known junk
   ║   scrape ─► aggregator/empty? ─► skip  ║   ← no qualify LLM call on non-prospects
   ║   qualify (4 dimension scores+evidence)║
   ║   _ground_dimensions (verbatim check)  ║   ← halves confidence for unsupported quotes
   ║   compute_overall_score (conf-weighted)║   ← DETERMINISTIC, in code
   ║   GATE: score < min_score ─► drop      ║
   ║   [critic?] ─► [enrich] ─► [outreach?] ║   ← all NON-FATAL
   ║   memory.remember(lead)                ║
   ║   emit lead                            ║
   ╚════════════════════════════════════════╝
                  │
            sort best-first ─► RunReport (leads + metrics + trace + duration)
```

### 2.4 Frontend architecture

- **Two route trees.** `(marketing)` — landing + content pages with Lenis smooth-scroll, sticky `SiteNav`, footer, and a mobile thumb-zone CTA. `/app` — the dashboard with native scroll, sidebar + header shell.
- **Design system.** OKLCH **semantic tokens** in `globals.css` (raw runtime vars, swapped by `.dark`) bridged to Tailwind v4 utilities via `@theme inline`; a shadcn-style `ui/` kit with a CVA-based `Button`; class-based dark mode (default dark).
- **State.** The whole dashboard is driven by `useLeadsmithRun` — a `useReducer` hook fed a `RunEvent` stream. Pattern: **store ← event-stream ← client-interface ← (mock | SSE → Python orchestrator).**
- **Motion & a11y discipline.** `prefers-reduced-motion` is neutralised globally (CSS) *and* per-component (`useReducedMotion`); animation is GPU-only (transform/opacity); color is **always paired with a label or numeral** (status `sr-only` text, `role="img"` score rings, `aria-valuenow` meters, `aria-sort` headers); focus-visible rings and a skip-to-content link throughout.

---

## 3. How Leadsmith generates high-quality leads

This is the part that matters. Quality is not one trick — it is a stack of compounding mechanisms, each removing a specific failure mode of naïve "AI lead-gen."

### 3.1 Plain English → a precise, structured ICP

The **Intent agent** converts a free-text request into a typed `ICP` (industry, company size, geography, pain points, buying signals, decision-maker roles, keywords). Crucially, pain points and buying signals are constrained to be **observable from a company's public web presence** — so downstream agents look for evidence that actually exists, not abstractions. This gives every later step a single, sharp brief to work from.

### 3.2 Product mode (reverse-ICP): start from what you sell

If the request is a **product URL**, the **Product-Profile agent** scrapes the seller's own site and *inverts* it — "what this product does" becomes "which companies would buy/embed it" — producing a `ProductProfile` (segments, buyer description, evidence quotes) that feeds `intent.run_reverse`. This finds buyers for a product even when you can't articulate the customer yourself. A failed scrape **degrades gracefully** to the plain ICP path instead of fabricating a garbage profile.

### 3.3 Open-web discovery, not resold lists — with aggressive junk filtering

The **Discovery agent** searches live web results (Tavily) and extracts real companies that *build or sell* something. Quality controls layer up:

- **`domain_filter` blocklist** rejects news/media, review & directory aggregators (G2, Capterra…), social, wikis/forums, code/data vendors, freemail, and job boards — applied at the Tavily source (`exclude_domains`), to the evidence shown to the model, *and* in code on both the LLM and fallback paths.
- **`looks_like_aggregator`** heuristics catch "top 10 / best-of / vs / roundup" listicles and `blog./news./docs.` subdomains that a static blocklist would miss.
- **Fallback path:** weak free models sometimes return an empty list even when search succeeded — so Discovery falls back to deriving candidates straight from result domains. Discovery is never silently empty when search worked.
- **Wave query rotation** ensures each wave issues a *distinct* query (different cache key), so the loop never stalls on repeated cached results.

The discovery prompt only needs broad recall; **precision is the qualifier's job** later.

### 3.4 Deterministic scoring — the LLM judges dimensions, code computes the score

The **Qualifier** scores four dimensions 0–100, each with concrete evidence: `industry_fit`, `size_fit`, `pain_severity`, `buying_intent`. The **overall score is computed in code**, not asked of the model:

```
SCORE_WEIGHTS = { industry_fit: 0.30, size_fit: 0.20, pain_severity: 0.30, buying_intent: 0.20 }
overall = weighted_average(dimension_scores, SCORE_WEIGHTS)   # deterministic, reproducible
```

This separates *judgment* (which LLMs are good at, locally) from *arithmetic* (which they are unreliable at), making scores reproducible and the weighting explicit and tunable.

### 3.5 Evidence grounding — a model-independent anti-hallucination guard

Each dimension must cite a **verbatim `evidence_quote`** copied from the scraped page. After qualification, `_ground_dimensions` normalises the page text and **halves the confidence of any dimension whose quote does not actually appear** in it (for quotes long enough to be meaningful). This catches fabricated evidence with **zero extra LLM cost** and works on *any* model — a weak model can't inflate a score by inventing a quote.

### 3.6 Confidence as a first-class citizen

Every dimension carries a `confidence` (0–1). The overall score uses **confidence-weighting** — a high score the model is unsure about pulls *less* weight:

```
effective_weight = base_weight × confidence
```

So a confident 70 can outrank a shaky 90. Aggregate confidence is surfaced separately in the UI (`ConfidenceMeter`), so **a high score never hides weak support**.

### 3.7 The Critic — an adversarial reviewer allowed to say no

When enabled, a **Reflexion-style Critic** re-reads the page and is explicitly prompted to *refute* weak scores, returning a verdict (`accept` / `weak` / `reject`), a `confidence_penalty`, and the specific unsupported claims. Two deliberate design choices keep it useful rather than destructive:

- It runs **only on gate-passing leads** (bounded, free-tier friendly).
- It **annotates, never deletes** — a `reject` flags the lead `rejected-by-critic` and applies a confidence penalty, but the lead stays in the list for the human to judge. A too-eager free model can't silently wipe your results.

This filters plausible-but-wrong leads before outreach while keeping the human in control.

### 3.8 RAG memory — every run calibrates against the last

`ResearchMemory` makes Leadsmith better the more you use it:

- **`seen_domain()`** — cheap cross-run dedupe so discovery skips companies already researched (normalised domain id strips `www./m./shop.` etc.).
- **`recall()`** — semantic retrieval of similar past leads, injected into the qualifier as *calibration context* ("here is similar prior research we trust"). It uses **HyDE** (generate hypothetical ideal-lead summaries to bridge the query/document vocabulary gap) plus a literal ICP query, fused with parameter-free **Reciprocal-Rank Fusion** so a bad HyDE doc can't dominate. Embeddings are **asymmetric** (queries vs documents) for better retrieval.
- **`remember()`** — embeds and persists each qualified lead for future recall.

Recall is computed **once per run** and shared across every company (same ICP → cache hits), keeping it within free-tier budget.

### 3.9 Honest enrichment — no fabricated contacts

The **Enricher** finds decision-makers the free way, cheapest first: named people in the scraped text → public LinkedIn profiles surfaced by web search (read from result titles; LinkedIn is *not* scraped) → missing emails filled by **permutation, kept only if the domain's MX accepts mail**. Every email is labelled **`found` / `guessed` / `unknown`** — a guess never masquerades as verification. Enrichment is **non-fatal**: a lead survives even if no contact is found (flagged `enrich-failed`).

### 3.10 Outreach grounded in the qualifying evidence

The **Outreach agent** drafts a short first-touch email from the *same evidence that qualified the lead* — the personalised angle, matched signals, and the specific contact — not generic merge tokens. You get a draft to edit and send in your own voice; the system never sends anything for you.

### 3.11 Robustness that protects quality

- **Non-fatal degradation everywhere.** Critic, enrichment, outreach, and memory-write failures flag the lead and emit a warning but **never drop a gate-passing lead.** Quality work isn't lost to one flaky step on a weak model.
- **"Target-N" semantics.** The control means "find *N qualified* leads," not "scan N companies." Discovery runs in **waves** (over-fetching by `overfetch_factor` to absorb non-buyers) until it has N, hits the `hard_scan_cap`, or runs out of candidates.
- **Resilient structured parsing.** `LLMClient.structured()` survives weak free models: JSON-mode with a plain-call fallback, bare-array wrapping, schema-echo unwrapping, and one corrective re-ask carrying the concrete validation error — so a malformed reply is repaired, not fatal.
- **Transparent failure classification.** When a run yields nothing, `RunReport.no_leads_reason()` tells you *why* — `no_candidates`, `all_known`, `below_gate`, or `errors` (usually an API rate limit) — so the UI gives an actionable next step instead of blaming the request.

### 3.12 Full transparency — trust through inspectable uncertainty

Every run exposes its **trace** (supervisor → discovery → recall → per-company scrape/qualify/critic/enrich/outreach, with timings) and **metrics** (LLM calls, embeds, cache hits, tokens, estimated cost, duration). You can see exactly where each result came from. The product's trust model is *not* "trust the table" — it's "here is the evidence, the confidence, the critic's verdict, and the run cost; judge for yourself."

---

## 4. Tech stack

**Backend:** Python · asyncio · Pydantic (+ pydantic-settings) · OpenRouter via the `openai` SDK (any chat model) · Google Gemini (`google-genai`) embeddings · Tavily web search · httpx · BeautifulSoup4 · dnspython · NumPy · tenacity (retry/backoff) · Rich (CLI) · FastAPI + Uvicorn (SSE bridge) · SQLite (cache + vector store).

**Frontend:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 (OKLCH tokens) · Radix UI primitives · `motion` · Lenis (smooth scroll) · `@xyflow/react` (trace graph, lazy-loaded) · `cmdk` · `next-themes` · `sonner` · `lucide-react`.

---

## 5. Configuration & running

**Required keys** (copy `.env.example` → `.env`):

| Var | Purpose | Free source |
|---|---|---|
| `OPENROUTER_API_KEY` | Chat / structured reasoning (any model) | openrouter.ai/keys |
| `TAVILY_API_KEY` | Web search | app.tavily.com |
| `GEMINI_API_KEY` | Embeddings (keeps the RAG memory valid) | aistudio.google.com/apikey |

**Key tunables** (`leadsmith/config.py`): `openrouter_model` (default `nvidia/nemotron-3-super-120b-a12b:free`), `rpm_limit` (20), `max_concurrency` (4), `embed_rpm_limit` (100), `overfetch_factor` (2.0), `max_per_wave` (8), `hard_scan_cap` (16), `max_waves` (4), `data_dir` (`.leadsmith_data`).

**CLI:**
```bash
python main.py "mid-sized e-commerce brands in the US with weak SEO"
python main.py "..." --target-leads 8 --min-score 50 --outreach --critic --trace --out leads.json
python main.py "https://rustbox.orkait.com/"   # product mode: find its buyers
```

**API + web:**
```bash
uvicorn server:app --reload --port 8000        # backend (SSE at POST /api/discover, GET /api/health)
# in web/ — set NEXT_PUBLIC_LEADSMITH_API=http://localhost:8000, then:
bun dev                                          # (or npm/pnpm) — omit the env var to run on mock data
```

**Offline core tests** (no network/keys): `python tests/smoke.py` — exercises cache, vector store, rate limiter, scoring, confidence-weighting, RRF, dedupe, email permutation, no-leads classification, and concurrent tracing.

---

## 6. Core data models (`leadsmith/models.py` ⇄ `web/lib/types.ts`)

- **`ICP`** — industry, company_size, geography, pain_points, buying_signals, decision_maker_roles, keywords.
- **`ProductProfile`** — product_name, what_it_does, category, key_features, pricing_motion, customer_segments, target_customers_description, evidence_quotes (product/reverse-ICP mode).
- **`DimensionScore`** — dimension, score (0–100), evidence, evidence_quote (verbatim), confidence (0–1).
- **`Qualification`** — dimensions[], matched_pain_points, signals, outreach_angle, reasoning.
- **`Contact`** — name, role, email, email_confidence (found/guessed/unknown), linkedin, twitter, source.
- **`Critique`** — verdict (accept/weak/reject), grounded, confidence_penalty, issues, missing_evidence.
- **`Lead`** — company, qualification, overall_score, confidence, contacts[], outreach, critique, flags[], links[], recalled_context[].
- **`RunReport`** — request, icp, product, leads[], candidates_found, candidates_skipped, metrics, trace, duration_seconds, created_at; `no_leads_reason()`.

---

## 7. Known limitations & honest caveats

In the spirit of the product, the things it does *not* do and the rough edges worth knowing:

- **Discovery is recall-oriented; the qualifier and critic do the precision work.** Expect to skim a short list, not a zero-false-positive one.
- **Email guessing verifies the *domain*, not the *mailbox*.** A `guessed` email means the domain accepts mail and the pattern is plausible — not that the address exists. The label is honest about this.
- **It does not send email, guarantee deliverability, or fabricate missing contacts.** It is a discovery + qualification + drafting workspace; you remain responsible for GDPR/CAN-SPAM and the like.
- **Blocklist matching is substring-based** (`is_blocked`), which can occasionally over-block a legitimate domain whose host *contains* a blocklisted string (e.g. a host ending in a blocklisted domain). Worth tightening to host-equality / suffix matching if you see false skips.
- **Free-model variance.** On weak free OpenRouter models, structured output can need the corrective re-ask, and scores are noisier — the grounding check, confidence-weighting, and critic exist precisely to dampen this. A stronger model raises quality directly.
- **Tests cover the offline core**, not the LLM-dependent agent/orchestrator integration paths (which require live keys); the dashboard has no automated tests yet.
- **`server.py` uses `CORS allow_origins=["*"]`** for local dev — lock this down before any public deployment.

---

*Leadsmith AI — multi-agent lead discovery that shows its work.*
