/**
 * Frontend domain types. These mirror the backend pydantic models in
 * `leadsmith/models.py` exactly, so the mock client and a future real API client
 * are interchangeable behind `LeadsmithClient`.
 */

export interface ICP {
  industry: string;
  company_size: string;
  geography: string;
  pain_points: string[];
  buying_signals: string[];
  decision_maker_roles: string[];
  keywords: string[];
}

export interface Company {
  name: string;
  website: string;
  reason: string;
}

export type DimensionKey =
  "industry_fit" | "size_fit" | "pain_severity" | "buying_intent";

export interface DimensionScore {
  dimension: DimensionKey | string;
  score: number; // 0–100
  evidence: string;
  evidence_quote?: string; // verbatim span from the site (grounding check)
  confidence: number; // 0–1
}

export interface Qualification {
  dimensions: DimensionScore[];
  matched_pain_points: string[];
  signals: string[];
  outreach_angle: string;
  reasoning: string;
}

export type EmailConfidence = "found" | "guessed" | "unknown";

export interface Contact {
  name: string;
  role: string;
  email: string | null;
  email_confidence: EmailConfidence;
  linkedin: string | null;
  twitter: string | null;
  source: string;
}

export interface OutreachDraft {
  subject: string;
  body: string;
  channel: string;
}

export type CritiqueVerdict = "accept" | "weak" | "reject";

export interface Critique {
  verdict: CritiqueVerdict;
  grounded: boolean;
  confidence_penalty: number;
  issues: string[];
  missing_evidence: string[];
}

export interface Lead {
  company: Company;
  qualification: Qualification;
  overall_score: number;
  confidence: number; // 0–1
  contacts: Contact[];
  outreach: OutreachDraft | null;
  critique: Critique | null;
  flags: string[];
  links: string[];
  recalled_context: string[];
}

export interface RunMetrics {
  llm_calls: number;
  embed_calls: number;
  cache_hits: number;
  cache_misses: number;
  scrapes: number;
  errors: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

export interface TraceNode {
  name: string;
  ms: number;
  attrs: Record<string, string | number>;
  children: TraceNode[];
}

export type NoLeadsReason =
  "no_candidates" | "all_known" | "below_gate" | "errors" | null;

/**
 * The seller's product, scraped + analyzed in product/reverse-ICP mode. Mirrors
 * `ProductProfile` in leadsmith/models.py. null on the plain "describe an ICP" path.
 */
export interface ProductProfile {
  product_name: string;
  what_it_does: string;
  category: string;
  key_features: string[];
  pricing_motion: string;
  customer_segments: string[];
  target_customers_description: string;
  evidence_quotes: string[];
}

export interface RunReport {
  id: string;
  request: string;
  icp: ICP;
  product: ProductProfile | null;
  leads: Lead[];
  candidates_found: number;
  candidates_skipped: number;
  seen_roots: string[];
  metrics: RunMetrics;
  trace: TraceNode | null;
  duration_seconds: number;
  created_at: number;
}

export interface RunSummary {
  id: string;
  created_at: number;
  request: string;
  candidates_found: number;
  leads_count: number;
  duration_seconds: number;
}

export interface RunResponse {
  items: RunSummary[];
  total: number;
}

/* ---------- run configuration (mirrors CLI flags) ---------- */

/** Customer-search vs product/reverse-ICP mode (auto-detects a product URL). */
export type SearchMode = "auto" | "customer" | "product";

export interface RunFlags {
  targetLeads: number; // how many QUALIFIED leads to find (wave-loop target)
  minScore: number; // --min-score
  mode: SearchMode; // auto | customer | product
  outreach: boolean; // --outreach
  critic: boolean; // --critic
  trace: boolean; // --trace
}

export interface ContinueRequest {
  report: RunReport;
  flags: RunFlags;
}

export const DEFAULT_FLAGS: RunFlags = {
  // targetLeads = how many QUALIFIED leads to return; the backend discovers in
  // waves until it has this many or hits a free-tier scan cap. critic/outreach
  // each add ~1 LLM call per lead, so they stay OFF by default (toggle on as
  // quota allows — they're robust/non-fatal when enabled).
  targetLeads: 5,
  minScore: 40,
  mode: "auto",
  outreach: false,
  critic: false,
  trace: true, // trace is free — no extra API calls
};

/* ---------- streaming progress model ---------- */

export type AgentKey =
  | "intent"
  | "discovery"
  | "recall"
  | "qualify"
  | "critic"
  | "enrich"
  | "outreach";

export type AgentStatus = "pending" | "running" | "done" | "skipped" | "error";

export interface AgentState {
  key: AgentKey;
  label: string;
  status: AgentStatus;
  detail?: string;
  ms?: number;
}

/** Events emitted by the client as a run streams. */
export type RunEvent =
  | {
      type: "phase";
      agent: AgentKey;
      status: AgentStatus;
      detail?: string;
      ms?: number;
    }
  | { type: "icp"; icp: ICP }
  | { type: "product"; product: ProductProfile }
  | { type: "candidates"; found: number; skipped: number }
  | { type: "company"; name: string; status: AgentStatus; detail?: string }
  | { type: "lead"; lead: Lead }
  // Non-fatal per-step failure (e.g. critic/outreach on a weak model). Surfaced
  // as an inline warning; does NOT abort the run (unlike a terminal `error`).
  | { type: "warning"; message: string; company?: string }
  | { type: "done"; report: RunReport }
  | { type: "error"; message: string };

export const DIMENSION_LABELS: Record<string, string> = {
  industry_fit: "Industry fit",
  size_fit: "Size fit",
  pain_severity: "Pain severity",
  buying_intent: "Buying intent",
};

export const AGENT_LABELS: Record<AgentKey, string> = {
  intent: "Intent",
  discovery: "Discovery",
  recall: "Recall (RAG)",
  qualify: "Qualifier",
  critic: "Critic",
  enrich: "Enricher",
  outreach: "Outreach",
};
