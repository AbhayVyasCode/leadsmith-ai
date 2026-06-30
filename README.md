# Leadsmith AI

A **free**, multi-agent, AI-powered lead discovery engine. Describe your ideal customer profile in plain English (or paste a product URL) and let a coordinated graph of specialized agents discover matching companies, score their fit against live website evidence, verify key decision-makers, and draft personalized outreach emails — all powered by free-tier API services, with a persistent RAG memory that refines results over time.

---

## 🚀 Key Highlights & Advanced Features

Unlike simple, linear scraping scripts, Leadsmith is built as an asynchronous agent graph with advanced verification and calibration guardrails:

*   **Multi-Agent Orchestration**: Powered by a supervisor pattern that coordinates specialized agents (`Intent`, `Discovery`, `Qualifier`, `Critic`, `Enricher`, `Outreach`) rather than running a rigid sequential script.
*   **Confidence-Weighted Scoring**: The `Qualifier` scores prospects across four dimensions (`industry_fit`, `size_fit`, `pain_severity`, `buying_intent`). Instead of requesting a single subjective fit score from the LLM, the overall score is computed deterministically in code as a weight-averaged value scaled by the model's confidence for each dimension.
*   **Model-Independent Grounding Check**: To prevent hallucination, each score must cite a verbatim quote from the company's page. The system cross-references this quote in Python code. If the quote is missing or fabricated, the confidence score for that dimension is halved.
*   **Reverse-ICP (Product Mode)**: Paste a product website URL (e.g. `https://my-saas-tool.com`). The `ProductProfile` agent will scrape the site, analyze its features, and invert the value proposition to automatically generate a buyer ICP profile.
*   **Reflexion Critic (Adversarial Gate)**: An opt-in adversarial agent that reviews qualified leads, skeptically attempting to refute evidence. If it finds discrepancies, it adds a confidence penalty and flags the lead rather than silently discarding it.
*   **Advanced HyDE RAG Memory**: A local SQLite/NumPy vector memory stores research history. Subsequent searches use **Hypothetical Document Embeddings (HyDE)** to bridge vocabulary gaps, combined with **Reciprocal Rank Fusion (RRF)** to fuse keyword and conceptual searches.
*   **Zero-Cost Technical Signals**: Captures HTTP response headers during scrapes (e.g. Vercel, Shopify, WordPress) to provide tech-stack hints to the qualifier.
*   **MX-Verified Email Permutations**: Verifies guessed email formats at the domain MX record level.

---

## 📐 System Architecture

```
                         ┌─────────────────────────────┐
    "find e-comm brands  │        Orchestrator         │  (supervisor / wave loop)
     with weak SEO"  ───▶│  async · rate-limited · RAG  │
     (or product URL)    └──────────────┬──────────────┘
                                        │
    Intent ─▶ Discovery ─▶ ┌─ per company, concurrently ──────────────────────┐
                           │  scrape → recall(HyDE RAG) → qualify → score gate │
                           │      → [critic] → enrich → [outreach]             │
                           └───────────────────────────────────────────────────┘
                                        │
                                remember(RAG) → ranked RunReport (+ trace)
```

### Module Responsibilities

| Layer | Module | Description / Responsibility |
| :--- | :--- | :--- |
| **User Interfaces** | [📂 `main.py`](file:///d:/Personal/leadsmith/main.py) | Full-featured Rich CLI. Renders real-time progress, tables, and agent trace trees. |
| | [📂 `server.py`](file:///d:/Personal/leadsmith/server.py) | FastAPI HTTP/SSE server streaming live JSON events to the frontend dashboard. |
| **Agent Graph** | [📂 `leadsmith/agents/orchestrator.py`](file:///d:/Personal/leadsmith/leadsmith/agents/orchestrator.py) | Coordinates wave looping, concurrency limits, and agent gates. |
| | [📂 `leadsmith/agents/intent.py`](file:///d:/Personal/leadsmith/leadsmith/agents/intent.py) | Normalizes natural requests or product profiles into a structured `ICP`. |
| | [📂 `leadsmith/agents/product_profile.py`](file:///d:/Personal/leadsmith/leadsmith/agents/product_profile.py) | Scrapes and extracts product features for reverse-ICP mapping. |
| | [📂 `leadsmith/agents/discovery.py`](file:///d:/Personal/leadsmith/leadsmith/agents/discovery.py) | Interacts with search APIs (Tavily) to find candidates; falls back to domain parsing. |
| | [📂 `leadsmith/agents/qualifier.py`](file:///d:/Personal/leadsmith/leadsmith/agents/qualifier.py) | Scores companies using live page text and calibration context. |
| | [📂 `leadsmith/agents/critic.py`](file:///d:/Personal/leadsmith/leadsmith/agents/critic.py) | skeptical adversarial validator checking candidate logic. |
| | [📂 `leadsmith/agents/enricher.py`](file:///d:/Personal/leadsmith/leadsmith/agents/enricher.py) | Grabs on-page emails and matches public LinkedIn profiles. |
| | [📂 `leadsmith/agents/outreach.py`](file:///d:/Personal/leadsmith/leadsmith/agents/outreach.py) | Drafts personalized contextual first-touch outreach emails. |
| **RAG Memory** | [📂 `leadsmith/memory/rag.py`](file:///d:/Personal/leadsmith/leadsmith/memory/rag.py) | Orchestrates HyDE query expansion, RRF, and domain deduplication. |
| **Infrastructure** | [📂 `leadsmith/core/gemini.py`](file:///d:/Personal/leadsmith/leadsmith/core/gemini.py) | Unified API gateway for OpenRouter, Google Gemini, and Tavily with fallback recovery. |
| | [📂 `leadsmith/core/vector_store.py`](file:///d:/Personal/leadsmith/leadsmith/core/vector_store.py) | Pure Python/NumPy SQLite vector database. |
| | [📂 `leadsmith/core/rate_limiter.py`](file:///d:/Personal/leadsmith/leadsmith/core/rate_limiter.py) | Adaptive concurrency and RPM rate limiting. |
| | [📂 `leadsmith/core/cache.py`](file:///d:/Personal/leadsmith/leadsmith/core/cache.py) | Disk-backed SQLite cache for scrapes, embeddings, and completions. |
| | [📂 `leadsmith/core/tracing.py`](file:///d:/Personal/leadsmith/leadsmith/core/tracing.py) | Contextvar-driven execution tracing for observability. |

---

## 🛠️ Installation & Setup

### Prerequisites
*   Python 3.10+
*   Node.js (for Next.js web application, optional)
*   API keys (Free tiers available for all):
    *   **OpenRouter**: Reasoning models ([Get Key](https://openrouter.ai/keys))
    *   **Tavily**: Web Search ([Get Key](https://app.tavily.com))
    *   **Google AI Studio**: Gemini Embeddings ([Get Key](https://aistudio.google.com/apikey))

### 1. Backend Setup
1.  Clone the repository and navigate to the project directory:
    ```bash
    python -m venv .venv
    # On Windows:
    .\.venv\Scripts\Activate.ps1
    # On Linux/macOS:
    source .venv/bin/activate
    
    pip install -r requirements.txt
    ```
2.  Configure your environment secrets:
    ```bash
    copy .env.example .env
    ```
    Open `.env` and fill in the API keys:
    ```env
    OPENROUTER_API_KEY=your_openrouter_key
    TAVILY_API_KEY=your_tavily_key
    GEMINI_API_KEY=your_gemini_key
    ```

### 2. Frontend Setup (Next.js Dashboard)
The dashboard can run either in **Mock Mode** (requires no backend or API keys, perfect for demos) or **Live Mode** (connected to the Python FastAPI server).
```bash
cd web
bun install # Or npm install / pnpm install
bun dev
```

---

## 💻 How to Use

### CLI Options

You can invoke the Rich CLI tool via `main.py`.

```bash
# Simple search with default parameters
python main.py "digital marketing agencies in Germany"

# Force reverse product mapping (auto-detects URLs normally)
python main.py "https://example-product.com" --mode product

# Advanced pipeline run (enables adversarial critic, outreach drafts, and traces)
python main.py "B2B SaaS startups in Europe hiring developers" --target-leads 5 --min-score 50 --critic --outreach --trace --out report.json
```

**Common Flags:**
*   `--target-leads` / `--max`: Target number of *qualified* leads (wave loop stops when hit).
*   `--min-score`: Hard gate (leads below this fit score are skipped).
*   `--critic`: Runs the Reflexion critic on qualified leads to inspect evidence.
*   `--outreach`: Drafts personalized outreach emails based on matches.
*   `--trace`: Outputs a visual timeline tree showing execution times of each agent.
*   `--out`: Saves the structured JSON run report to a file.

### API Server

Run the web backend to connect the live Next.js app:
```bash
# In the root project folder
uvicorn server:app --reload --port 8000
```
Then, ensure the Next.js app is run with the API URL specified:
```bash
# In the web/ directory
NEXT_PUBLIC_LEADSMITH_API=http://localhost:8000 bun dev
```

---

## 🧪 Testing

Leadsmith includes offline verification tests to validate all core utilities (caches, RRF fusion, domain normalization, rate-limit constraints, confidence scoring math, and concurrent trace nesting) without using API credits:

```bash
python tests/smoke.py
```

---

## 🛡️ GDPR & CAN-SPAM Compliance Notes
*   Leadsmith only gathers publicly accessible information on the open web.
*   It does **not** scrape LinkedIn pages (it reads search index snippets only) to protect user accounts and terms of service.
*   Email predictions are marked as `guessed` or `found` transparently. Before using outreach drafts, users are responsible for complying with local regulations (such as GDPR, CCPA, and CAN-SPAM).

---

## 🗺️ Roadmap
*   [ ] Human-in-the-loop validation gate before RAG storage.
*   [ ] Live WebSocket/SSE trace streaming on the dashboard graph view.
*   [ ] Hybrid sparse BM25 + dense Vector search when local memory scales past 500 records.
*   [ ] Pluggable third-party enrichers (Apollo/Hunter.io native integrations).

---

*Leadsmith AI — Multi-agent lead discovery that shows its work.*
