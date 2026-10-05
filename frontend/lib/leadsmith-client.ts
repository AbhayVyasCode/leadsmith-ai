import { MOCK_ICP, MOCK_LEADS, MOCK_METRICS, MOCK_PRODUCT, MOCK_TRACE } from "@/lib/mock-data";
import type { AgentKey, AgentStatus, ContinueRequest, Lead, RunEvent, RunFlags, RunReport, RunResponse, RunSummary } from "@/lib/types";

export interface MemoryItem {
  id: string;
  meta: { company: string; website: string; score: number };
  text: string;
}

export interface MemoryResponse {
  items: MemoryItem[];
  total: number;
}

export type EngineHealth =
  | { mode: "demo" }
  | { mode: "live"; reachable: false; base: string }
  | { mode: "live"; reachable: true; base: string; chatModel: string; embeddingModel: string; missing: string[] };

type Handlers = { onEvent: (e: RunEvent) => void; signal?: AbortSignal };

/** The two Convex calls the client needs, addressed as "module:function". */
type ConvexOps = {
  query: <T>(fn: string, args: Record<string, unknown>) => Promise<T>;
  mutation: <T>(fn: string, args: Record<string, unknown>) => Promise<T>;
};

/** The single seam between UI and backend: a live HTTP/SSE client, or a demo. */
export interface ILeadsmithClient {
  readonly mode: "live" | "demo";
  run(request: string, flags: RunFlags, handlers: Handlers): Promise<RunReport>;
  continue(request: ContinueRequest, handlers: Handlers): Promise<RunReport>;
  getMemory(limit?: number, offset?: number): Promise<MemoryResponse>;
  deleteMemory(id: string): Promise<boolean>;
  clearMemory(): Promise<boolean>;
  getRuns(limit?: number, offset?: number): Promise<RunResponse>;
  getRun(id: string): Promise<RunReport | null>;
  deleteRun(id: string): Promise<boolean>;
  clearRuns(): Promise<boolean>;
  health(): Promise<EngineHealth>;
}

/**
 * Read a Server-Sent-Events run stream. An `error` event THROWS with the
 * backend's own message (so the UI shows the real cause), and a stream that
 * ends without `done` is reported as such.
 */
async function readRunStream(res: Response, onEvent: (e: RunEvent) => void): Promise<RunReport> {
  if (!res.ok || !res.body) {
    throw new Error(`The research engine returned ${res.status} ${res.statusText}`.trim());
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let report: RunReport | null = null;

  const handle = (frame: string) => {
    const data = frame
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) return; // comments / keep-alives
    let evt: { type?: string; message?: string; report?: RunReport };
    try {
      evt = JSON.parse(data);
    } catch {
      return;
    }
    if (!evt?.type || evt.type === "progress") return;
    if (evt.type === "error") throw new Error(evt.message || "The research run failed.");
    onEvent(evt as RunEvent);
    if (evt.type === "done" && evt.report) report = evt.report;
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        handle(frame);
      }
      if (done) break;
    }
    if (buffer.trim()) handle(buffer);
  } catch (err) {
    reader.cancel().catch(() => {});
    throw err;
  }
  if (!report) throw new Error("The research engine closed the connection before the run finished.");
  return report;
}

export class HttpLeadsmithClient implements ILeadsmithClient {
  readonly mode = "live" as const;
  private readonly base: string;
  private readonly convexUrl?: string;
  private convexOps: Promise<ConvexOps> | null = null;

  constructor(base: string, convexUrl?: string) {
    this.base = base.replace(/\/$/, "");
    this.convexUrl = convexUrl;
  }

  /**
   * Optional direct Convex reads. The Convex client is imported on first use,
   * in the browser only, so it never ships to setups that don't configure it.
   */
  private convex(): Promise<ConvexOps> | null {
    const url = this.convexUrl;
    if (!url || typeof window === "undefined") return null;
    this.convexOps ??= Promise.all([import("convex/browser"), import("convex/server")]).then(
      ([{ ConvexClient }, { makeFunctionReference }]) => {
        const client = new ConvexClient(url);
        return {
          query: (fn, args) => client.query(makeFunctionReference<"query">(fn), args),
          mutation: (fn, args) => client.mutation(makeFunctionReference<"mutation">(fn), args),
        };
      },
    );
    return this.convexOps;
  }

  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, { cache: "no-store", ...init });
    if (!res.ok) throw new Error(`Request to the research engine failed (${res.status})`);
    return (await res.json()) as T;
  }

  async run(request: string, flags: RunFlags, { onEvent, signal }: Handlers): Promise<RunReport> {
    const res = await fetch(`${this.base}/api/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request, flags }),
      signal,
    });
    return readRunStream(res, onEvent);
  }

  async continue(request: ContinueRequest, { onEvent, signal }: Handlers): Promise<RunReport> {
    const res = await fetch(`${this.base}/api/discover/continue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
    return readRunStream(res, onEvent);
  }

  async getMemory(limit = 100, offset = 0): Promise<MemoryResponse> {
    const cx = await this.convex();
    if (cx) {
      const [items, total] = await Promise.all([
        cx.query<MemoryItem[]>("memory:getAll", { limit, offset }),
        cx.query<number>("memory:count", {}),
      ]);
      return { items, total };
    }
    return this.json(`/api/memory?limit=${limit}&offset=${offset}`);
  }

  async deleteMemory(id: string): Promise<boolean> {
    const cx = await this.convex();
    if (cx) return cx.mutation<boolean>("memory:deleteItem", { id });
    const data = await this.json<{ ok: boolean }>(`/api/memory/${encodeURIComponent(id)}`, { method: "DELETE" });
    return data.ok;
  }

  async clearMemory(): Promise<boolean> {
    const cx = await this.convex();
    if (cx) {
      await cx.mutation("memory:clearAll", {});
      return true;
    }
    const data = await this.json<{ ok: boolean }>(`/api/memory`, { method: "DELETE" });
    return data.ok;
  }

  async getRuns(limit = 50, offset = 0): Promise<RunResponse> {
    const cx = await this.convex();
    if (cx) {
      const [items, total] = await Promise.all([
        cx.query<RunSummary[]>("runs:getSummaries", { limit, offset }),
        cx.query<number>("runs:count", {}),
      ]);
      return { items, total };
    }
    return this.json(`/api/runs?limit=${limit}&offset=${offset}`);
  }

  async getRun(id: string): Promise<RunReport | null> {
    const cx = await this.convex();
    if (cx) {
      const payload = await cx.query<string | null>("runs:get", { id });
      return payload ? (JSON.parse(payload) as RunReport) : null;
    }
    const data = await this.json<{ run: RunReport | null }>(`/api/runs/${encodeURIComponent(id)}`);
    return data.run ?? null;
  }

  async deleteRun(id: string): Promise<boolean> {
    const cx = await this.convex();
    if (cx) return cx.mutation<boolean>("runs:deleteRun", { id });
    const data = await this.json<{ ok: boolean }>(`/api/runs/${encodeURIComponent(id)}`, { method: "DELETE" });
    return data.ok;
  }

  async clearRuns(): Promise<boolean> {
    const cx = await this.convex();
    if (cx) {
      await cx.mutation("runs:clearAll", {});
      return true;
    }
    const data = await this.json<{ ok: boolean }>(`/api/runs`, { method: "DELETE" });
    return data.ok;
  }

  async health(): Promise<EngineHealth> {
    try {
      const h = await this.json<{
        chat_model: string;
        embedding_model: string;
        has_nvidia_key: boolean;
        has_tavily_key: boolean;
        has_gemini_key: boolean;
      }>("/api/health", { signal: AbortSignal.timeout(5000) });
      const missing = [
        !h.has_nvidia_key && "NVIDIA_API_KEY",
        !h.has_tavily_key && "TAVILY_API_KEY",
        !h.has_gemini_key && "GEMINI_API_KEY",
      ].filter((k): k is string => Boolean(k));
      return { mode: "live", reachable: true, base: this.base, chatModel: h.chat_model, embeddingModel: h.embedding_model, missing };
    } catch {
      return { mode: "live", reachable: false, base: this.base };
    }
  }
}

/* ------------------------------------------------------------------------
   Demo client — no backend. Mirrors the real engine's semantics: the critic
   FLAGS weak leads (never drops them) and runs land in an in-memory history.
   ------------------------------------------------------------------------ */

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

const MORE_LEADS: Lead[] = [
  {
    ...MOCK_LEADS[1],
    company: { name: "Litware Payments", website: "https://litware.example", reason: "Card-issuing API." },
    overall_score: 77,
    confidence: 0.71,
  },
  {
    ...MOCK_LEADS[2],
    company: { name: "Proseware Capital", website: "https://proseware.example", reason: "SMB lending platform." },
    overall_score: 69,
    confidence: 0.63,
  },
];

const summaryOf = (l: Lead): MemoryItem => ({
  id: `lead::${l.company.website.replace(/^https?:\/\//, "")}`,
  meta: { company: l.company.name, website: l.company.website, score: l.overall_score },
  text: `${l.company.name} (${l.company.website}) — score ${l.overall_score}. Matched pains: ${l.qualification.matched_pain_points.join(", ") || "n/a"}. Signals: ${l.qualification.signals.join("; ") || "n/a"}. Angle: ${l.qualification.outreach_angle}`,
});

export class MockLeadsmithClient implements ILeadsmithClient {
  readonly mode = "demo" as const;
  private history: RunReport[] = [];
  private memory: MemoryItem[] = MOCK_LEADS.slice(0, 3).map(summaryOf);

  private async stream(
    request: string,
    flags: RunFlags,
    pool: Lead[],
    { onEvent, signal }: Handlers,
    base?: RunReport,
  ): Promise<RunReport> {
    const phase = (agent: AgentKey, status: AgentStatus, detail?: string) => onEvent({ type: "phase", agent, status, detail });
    const productMode = base ? base.product !== null : flags.mode === "product";

    if (!base) {
      phase("intent", "running");
      if (productMode) {
        await sleep(600, signal);
        onEvent({ type: "product", product: MOCK_PRODUCT });
      }
      await sleep(800, signal);
      onEvent({ type: "icp", icp: MOCK_ICP });
      phase("intent", "done");
    }
    phase("discovery", "running");
    await sleep(900, signal);
    onEvent({ type: "candidates", found: base ? base.candidates_found + 6 : 14, skipped: base ? base.candidates_skipped + 2 : 3 });
    phase("discovery", "done");
    phase("recall", "running");
    await sleep(350, signal);
    phase("recall", "done");

    const kept: Lead[] = [];
    for (const original of pool.slice(0, Math.max(1, flags.targetLeads))) {
      const name = original.company.name;
      onEvent({ type: "company", name, status: "running", detail: "scraping" });
      phase("qualify", "running", name);
      await sleep(700, signal);
      if (original.overall_score < flags.minScore) {
        onEvent({ type: "company", name, status: "skipped", detail: `score ${original.overall_score} < ${flags.minScore}` });
        continue;
      }
      let lead: Lead = { ...original, flags: [...original.flags] };
      if (flags.critic) {
        phase("critic", "running", name);
        await sleep(450, signal);
      } else {
        lead = { ...lead, critique: null, flags: lead.flags.filter((f) => f !== "weak-evidence" && f !== "rejected-by-critic") };
      }
      phase("enrich", "running", name);
      await sleep(400, signal);
      if (flags.outreach && lead.outreach) {
        phase("outreach", "running", name);
        await sleep(400, signal);
      } else if (!flags.outreach) {
        lead = { ...lead, outreach: null };
      }
      onEvent({ type: "lead", lead });
      kept.push(lead);
    }
    for (const agent of ["qualify", "critic", "enrich", "outreach"] as AgentKey[]) phase(agent, "done");
    if (flags.critic && kept.length > 1) {
      onEvent({ type: "warning", message: `Critic returned an unreadable answer for ${kept[1].company.name} — the lead was kept and flagged.`, company: kept[1].company.name });
    }

    kept.sort((a, b) => b.overall_score - a.overall_score);
    const report: RunReport = {
      id: `demo-${Date.now()}`,
      request,
      icp: base?.icp ?? MOCK_ICP,
      product: productMode ? (base?.product ?? MOCK_PRODUCT) : null,
      leads: kept,
      candidates_found: base ? base.candidates_found + 6 : 14,
      candidates_skipped: base ? base.candidates_skipped + 2 : 3,
      seen_roots: [],
      metrics: MOCK_METRICS,
      trace: MOCK_TRACE,
      duration_seconds: base ? 41.6 : 134.2,
      created_at: Date.now() / 1000,
    };
    this.history.unshift(report);
    this.memory.unshift(...kept.map(summaryOf).filter((m) => !this.memory.some((x) => x.id === m.id)));
    onEvent({ type: "done", report });
    return report;
  }

  run(request: string, flags: RunFlags, handlers: Handlers): Promise<RunReport> {
    return this.stream(request, flags, MOCK_LEADS, handlers);
  }

  continue({ report, flags }: ContinueRequest, handlers: Handlers): Promise<RunReport> {
    return this.stream(report.request, flags, MORE_LEADS, handlers, report);
  }

  async getMemory(limit = 100, offset = 0): Promise<MemoryResponse> {
    await sleep(250);
    return { items: this.memory.slice(offset, offset + limit), total: this.memory.length };
  }

  async deleteMemory(id: string): Promise<boolean> {
    const before = this.memory.length;
    this.memory = this.memory.filter((m) => m.id !== id);
    return this.memory.length < before;
  }

  async clearMemory(): Promise<boolean> {
    this.memory = [];
    return true;
  }

  async getRuns(limit = 50, offset = 0): Promise<RunResponse> {
    await sleep(250);
    const items: RunSummary[] = this.history.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      request: r.request,
      candidates_found: r.candidates_found,
      leads_count: r.leads.length,
      duration_seconds: r.duration_seconds,
      total_scanned: r.metrics.total_scanned ?? r.candidates_found,
    }));
    return { items: items.slice(offset, offset + limit), total: items.length };
  }

  async getRun(id: string): Promise<RunReport | null> {
    return this.history.find((r) => r.id === id) ?? null;
  }

  async deleteRun(id: string): Promise<boolean> {
    const before = this.history.length;
    this.history = this.history.filter((r) => r.id !== id);
    return this.history.length < before;
  }

  async clearRuns(): Promise<boolean> {
    this.history = [];
    return true;
  }

  async health(): Promise<EngineHealth> {
    return { mode: "demo" };
  }
}

/** Live engine when NEXT_PUBLIC_LEADSMITH_API is set (e.g. http://localhost:8000); otherwise the demo. */
const API_BASE = process.env.NEXT_PUBLIC_LEADSMITH_API;
export const leadsmith: ILeadsmithClient = API_BASE
  ? new HttpLeadsmithClient(API_BASE, process.env.NEXT_PUBLIC_CONVEX_URL)
  : new MockLeadsmithClient();
