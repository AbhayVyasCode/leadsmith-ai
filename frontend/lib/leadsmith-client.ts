import type {
  ContinueRequest,
  Lead,
  RunEvent,
  RunFlags,
  RunReport,
  RunSummary,
  RunResponse,
} from "@/lib/types";
import {
  MOCK_ICP,
  MOCK_LEADS,
  MOCK_METRICS,
  MOCK_PRODUCT,
  MOCK_TRACE,
} from "@/lib/mock-data";

/** Mirror of the backend's product-URL detection, for the mock demo path. */
function looksLikeUrl(request: string): boolean {
  return /https?:\/\/\S+|\b[a-z0-9-]+\.(?:com|org|net|io|ai|co|dev|app|so|sh|tech|cloud)\b/i.test(
    request,
  );
}

export interface MemoryItem {
  id: string;
  meta: {
    company: string;
    website: string;
    score: number;
  };
  text: string;
}

export interface MemoryResponse {
  items: MemoryItem[];
  total: number;
}

/**
 * The single seam between UI and backend. The mock implementation simulates the
 * real orchestrator's streamed agent progress; a future HTTP/SSE client only has
 * to implement the same interface — nothing in the UI changes.
 */
export interface ILeadsmithClient {
  run(
    request: string,
    flags: RunFlags,
    handlers: { onEvent: (e: RunEvent) => void; signal?: AbortSignal },
  ): Promise<RunReport>;

  continue(
    request: ContinueRequest,
    handlers: { onEvent: (e: RunEvent) => void; signal?: AbortSignal },
  ): Promise<RunReport>;

  getMemory(limit?: number, offset?: number): Promise<MemoryResponse>;
  deleteMemory(id: string): Promise<boolean>;
  clearMemory(): Promise<boolean>;

  getRuns(limit?: number, offset?: number): Promise<RunResponse>;
  getRun(id: string): Promise<RunReport | null>;
  deleteRun(id: string): Promise<boolean>;
  clearRuns(): Promise<boolean>;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
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

export class MockLeadsmithClient implements ILeadsmithClient {
  async run(
    request: string,
    flags: RunFlags,
    {
      onEvent,
      signal,
    }: { onEvent: (e: RunEvent) => void; signal?: AbortSignal },
  ): Promise<RunReport> {
    // intent (with optional product / reverse-ICP mode)
    onEvent({ type: "phase", agent: "intent", status: "running" });
    const productMode =
      flags.mode === "product" ||
      (flags.mode === "auto" && looksLikeUrl(request));
    if (productMode) {
      await sleep(420, signal);
      onEvent({ type: "product", product: MOCK_PRODUCT });
    }
    await sleep(520, signal);
    onEvent({ type: "icp", icp: MOCK_ICP });
    onEvent({ type: "phase", agent: "intent", status: "done", ms: 640 });

    // discovery
    onEvent({ type: "phase", agent: "discovery", status: "running" });
    await sleep(820, signal);
    const found = Math.min(flags.targetLeads, MOCK_LEADS.length) + 2;
    const skipped = 2;
    onEvent({ type: "candidates", found, skipped });
    onEvent({ type: "phase", agent: "discovery", status: "done", ms: 1980 });

    // recall (RAG) — once per run, shared across companies
    onEvent({ type: "phase", agent: "recall", status: "running" });
    await sleep(360, signal);
    onEvent({ type: "phase", agent: "recall", status: "done", ms: 410 });

    const candidates = MOCK_LEADS.slice(
      0,
      Math.min(flags.targetLeads, MOCK_LEADS.length),
    );
    const accepted: Lead[] = [];

    for (const base of candidates) {
      onEvent({
        type: "company",
        name: base.company.name,
        status: "running",
        detail: "qualifying",
      });
      onEvent({
        type: "phase",
        agent: "qualify",
        status: "running",
        detail: base.company.name,
      });
      await sleep(440, signal);
      onEvent({ type: "phase", agent: "qualify", status: "done" });

      if (base.overall_score < flags.minScore) {
        onEvent({
          type: "company",
          name: base.company.name,
          status: "skipped",
          detail: `score ${base.overall_score} < ${flags.minScore}`,
        });
        continue;
      }

      let lead: Lead = { ...base };

      if (flags.critic) {
        onEvent({
          type: "phase",
          agent: "critic",
          status: "running",
          detail: base.company.name,
        });
        await sleep(320, signal);
        onEvent({ type: "phase", agent: "critic", status: "done" });
        if (base.critique?.verdict === "reject") {
          onEvent({
            type: "company",
            name: base.company.name,
            status: "skipped",
            detail: "rejected by critic",
          });
          continue;
        }
      } else {
        lead = {
          ...lead,
          critique: null,
          flags: lead.flags.filter((f) => f !== "weak-evidence"),
        };
      }

      onEvent({
        type: "phase",
        agent: "enrich",
        status: "running",
        detail: base.company.name,
      });
      await sleep(300, signal);
      onEvent({ type: "phase", agent: "enrich", status: "done" });

      if (flags.outreach) {
        onEvent({
          type: "phase",
          agent: "outreach",
          status: "running",
          detail: base.company.name,
        });
        await sleep(320, signal);
        onEvent({ type: "phase", agent: "outreach", status: "done" });
      } else {
        lead = { ...lead, outreach: null };
      }

      onEvent({ type: "company", name: base.company.name, status: "done" });
      onEvent({ type: "lead", lead });
      accepted.push(lead);
    }

    // Exercise the non-fatal warning path (real backend emits these when a weak
    // model fails a critic/outreach step but the lead is kept).
    if (flags.critic && accepted.length > 0) {
      onEvent({
        type: "warning",
        message: `Critic ran with low confidence for ${accepted[0].company.name} — kept the lead.`,
        company: accepted[0].company.name,
      });
    }

    accepted.sort((a, b) => b.overall_score - a.overall_score);

    const report: RunReport = {
      id: `run::${Date.now()}`,
      request,
      icp: MOCK_ICP,
      product: productMode ? MOCK_PRODUCT : null,
      leads: accepted,
      candidates_found: found,
      candidates_skipped: skipped,
      seen_roots: [],
      metrics: MOCK_METRICS,
      trace: flags.trace ? MOCK_TRACE : null,
      duration_seconds: 8.42,
      created_at: Date.now() / 1000,
    };
    onEvent({ type: "done", report });
    return report;
  }

  async continue(
    request: ContinueRequest,
    {
      onEvent,
      signal,
    }: { onEvent: (e: RunEvent) => void; signal?: AbortSignal },
  ): Promise<RunReport> {
    const { report: previousReport, flags } = request;
    const productMode = previousReport.product !== null;

    // Simulate continuation - just add more mock leads
    onEvent({ type: "phase", agent: "intent", status: "running" });
    await sleep(200, signal);
    onEvent({ type: "phase", agent: "intent", status: "done", ms: 220 });

    // discovery
    onEvent({ type: "phase", agent: "discovery", status: "running" });
    await sleep(400, signal);
    const found = Math.min(flags.targetLeads, MOCK_LEADS.length) + 2;
    const skipped = 2;
    onEvent({ type: "candidates", found, skipped });
    onEvent({ type: "phase", agent: "discovery", status: "done", ms: 1200 });

    // recall
    onEvent({ type: "phase", agent: "recall", status: "running" });
    await sleep(200, signal);
    onEvent({ type: "phase", agent: "recall", status: "done", ms: 250 });

    const additionalCandidates: Lead[] = [];
    let mockIndex = previousReport.leads.length;
    while (additionalCandidates.length < flags.targetLeads) {
      const base = MOCK_LEADS[mockIndex % MOCK_LEADS.length];
      const copyNum = Math.floor(mockIndex / MOCK_LEADS.length) + 1;
      const clone = {
        ...base,
        company: {
          ...base.company,
          name: copyNum > 1 ? `${base.company.name} (Batch ${copyNum})` : base.company.name,
          website: copyNum > 1 ? `${copyNum}-${base.company.website}` : base.company.website,
        },
      };
      
      // Only add if we haven't already included this exact name in a prior run
      if (!previousCompanyNames.has(clone.company.name)) {
        additionalCandidates.push(clone);
      }
      mockIndex++;
    }

    const accepted: Lead[] = [];

    for (const base of additionalCandidates) {
      onEvent({
        type: "company",
        name: base.company.name,
        status: "running",
        detail: "qualifying",
      });
      onEvent({
        type: "phase",
        agent: "qualify",
        status: "running",
        detail: base.company.name,
      });
      await sleep(440, signal);
      onEvent({ type: "phase", agent: "qualify", status: "done" });

      if (base.overall_score < flags.minScore) {
        onEvent({
          type: "company",
          name: base.company.name,
          status: "skipped",
          detail: `score ${base.overall_score} < ${flags.minScore}`,
        });
        continue;
      }

      let lead: Lead = { ...base };

      if (flags.critic) {
        onEvent({
          type: "phase",
          agent: "critic",
          status: "running",
          detail: base.company.name,
        });
        await sleep(320, signal);
        onEvent({ type: "phase", agent: "critic", status: "done" });
        if (base.critique?.verdict === "reject") {
          onEvent({
            type: "company",
            name: base.company.name,
            status: "skipped",
            detail: "rejected by critic",
          });
          continue;
        }
      } else {
        lead = {
          ...lead,
          critique: null,
          flags: lead.flags.filter((f) => f !== "weak-evidence"),
        };
      }

      onEvent({
        type: "phase",
        agent: "enrich",
        status: "running",
        detail: base.company.name,
      });
      await sleep(300, signal);
      onEvent({ type: "phase", agent: "enrich", status: "done" });

      if (flags.outreach) {
        onEvent({
          type: "phase",
          agent: "outreach",
          status: "running",
          detail: base.company.name,
        });
        await sleep(320, signal);
        onEvent({ type: "phase", agent: "outreach", status: "done" });
      } else {
        lead = { ...lead, outreach: null };
      }

      onEvent({ type: "company", name: base.company.name, status: "done" });
      onEvent({ type: "lead", lead });
      accepted.push(lead);
    }

    // Non-fatal warning
    if (flags.critic && accepted.length > 0) {
      onEvent({
        type: "warning",
        message: `Critic ran with low confidence for ${accepted[0].company.name} — kept the lead.`,
        company: accepted[0].company.name,
      });
    }

    accepted.sort((a, b) => b.overall_score - a.overall_score);

    const newReport: RunReport = {
      ...previousReport,
      id: `run::${Date.now()}`,
      leads: accepted,
      candidates_found: found,
      candidates_skipped: skipped,
      metrics: MOCK_METRICS,
      trace: flags.trace ? MOCK_TRACE : null,
      duration_seconds: previousReport.duration_seconds + 4.5,
      created_at: Date.now() / 1000,
    };
    onEvent({ type: "done", report: newReport });
    return newReport;
  }

  // Basic mock implementation for memory
  private mockMemory: MemoryItem[] = MOCK_LEADS.map((l) => ({
    id: `lead::${l.company.website}`,
    meta: {
      company: l.company.name,
      website: l.company.website,
      score: l.overall_score,
    },
    text: `${l.company.name} (${l.company.website}) — score ${l.overall_score}. Matched pains: n/a. Signals: n/a. Angle: mock`,
  }));

  async getMemory(limit = 100, offset = 0): Promise<MemoryResponse> {
    await sleep(200);
    return {
      items: this.mockMemory.slice(offset, offset + limit),
      total: this.mockMemory.length,
    };
  }

  async deleteMemory(id: string): Promise<boolean> {
    await sleep(200);
    const prev = this.mockMemory.length;
    this.mockMemory = this.mockMemory.filter((m) => m.id !== id);
    return this.mockMemory.length < prev;
  }

  async clearMemory(): Promise<boolean> {
    await sleep(200);
    this.mockMemory = [];
    return true;
  }

  // Mock implementation for runs
  private mockRunHistory: RunReport[] = [];

  async getRuns(limit = 50, offset = 0): Promise<RunResponse> {
    await sleep(200);
    const summaries: RunSummary[] = this.mockRunHistory.map(r => ({
      id: r.id,
      created_at: r.created_at,
      request: r.request,
      candidates_found: r.candidates_found,
      leads_count: r.leads.length,
      duration_seconds: r.duration_seconds,
      total_scanned: r.metrics?.total_scanned || r.candidates_found
    })).sort((a, b) => b.created_at - a.created_at);

    return {
      items: summaries.slice(offset, offset + limit),
      total: summaries.length,
    };
  }

  async getRun(id: string): Promise<RunReport | null> {
    await sleep(200);
    return this.mockRunHistory.find(r => r.id === id) || null;
  }

  async deleteRun(id: string): Promise<boolean> {
    await sleep(200);
    const prev = this.mockRunHistory.length;
    this.mockRunHistory = this.mockRunHistory.filter(r => r.id !== id);
    return this.mockRunHistory.length < prev;
  }

  async clearRuns(): Promise<boolean> {
    await sleep(200);
    this.mockRunHistory = [];
    return true;
  }
}

/**
 * Real client: streams Server-Sent Events from the Python FastAPI bridge
 * (see ../../server.py). The backend emits the SAME RunEvent shapes as the mock,
 * plus a final `done` event carrying the full RunReport — so the UI is identical.
 */
export class HttpLeadsmithClient implements ILeadsmithClient {
  constructor(private readonly base: string) {}

  async run(
    request: string,
    flags: RunFlags,
    {
      onEvent,
      signal,
    }: { onEvent: (e: RunEvent) => void; signal?: AbortSignal },
  ): Promise<RunReport> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request, flags }),
      signal,
    });

    if (!res.ok || !res.body) {
      const message = `Leadsmith backend returned ${res.status} ${res.statusText}`;
      onEvent({ type: "error", message });
      throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalReport: RunReport | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue; // skip SSE comments / keep-alives
        const json = dataLine.slice(5).trim();
        if (!json) continue;
        let evt: { type: string; [key: string]: unknown };
        try {
          evt = JSON.parse(json);
        } catch {
          continue;
        }
        if (evt.type === "progress") continue; // raw log line, not part of the UI model
        onEvent(evt as unknown as RunEvent);
        if (evt.type === "done") {
          finalReport = (evt as unknown as { report: RunReport }).report;
        }
      }
    }

    if (!finalReport)
      throw new Error("Stream ended before a final report arrived");
    return finalReport;
  }

  async continue(
    request: ContinueRequest,
    {
      onEvent,
      signal,
    }: { onEvent: (e: RunEvent) => void; signal?: AbortSignal },
  ): Promise<RunReport> {
    const res = await fetch(
      `${this.base.replace(/\/$/, "")}/api/discover/continue`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal,
      },
    );

    if (!res.ok || !res.body) {
      const message = `Leadsmith backend returned ${res.status} ${res.statusText}`;
      onEvent({ type: "error", message });
      throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalReport: RunReport | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const json = dataLine.slice(5).trim();
        if (!json) continue;
        let evt: { type: string; [key: string]: unknown };
        try {
          evt = JSON.parse(json);
        } catch {
          continue;
        }
        if (evt.type === "progress") continue;
        if (evt.type === "error") {
          throw new Error(evt.message as string);
        }
        onEvent(evt as unknown as RunEvent);
        if (evt.type === "done") {
          finalReport = (evt as unknown as { report: RunReport }).report;
        }
      }
    }

    if (!finalReport)
      throw new Error("Stream ended before a final report arrived");
    return finalReport;
  }

  async getMemory(limit = 100, offset = 0): Promise<MemoryResponse> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/memory?limit=${limit}&offset=${offset}&_t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch memory");
    return res.json();
  }

  async deleteMemory(id: string): Promise<boolean> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/memory/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete memory item");
    const data = await res.json();
    return data.ok;
  }

  async clearMemory(): Promise<boolean> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/memory`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear memory");
    const data = await res.json();
    return data.ok;
  }

  async getRuns(limit = 50, offset = 0): Promise<RunResponse> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/runs?limit=${limit}&offset=${offset}&_t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch runs");
    return res.json();
  }

  async getRun(id: string): Promise<RunReport | null> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/runs/${encodeURIComponent(id)}?_t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch run");
    }
    const data = await res.json();
    return data.run;
  }

  async deleteRun(id: string): Promise<boolean> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/runs/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete run");
    const data = await res.json();
    return data.ok;
  }

  async clearRuns(): Promise<boolean> {
    const res = await fetch(`${this.base.replace(/\/$/, "")}/api/runs`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear runs");
    const data = await res.json();
    return data.ok;
  }
}

/**
 * Default client. If NEXT_PUBLIC_LEADSMITH_API is set (e.g. http://localhost:8000)
 * the UI talks to the real Python backend; otherwise it runs on mock fixtures.
 */
const API_BASE = process.env.NEXT_PUBLIC_LEADSMITH_API;
export const leadsmith: ILeadsmithClient = API_BASE
  ? new HttpLeadsmithClient(API_BASE)
  : new MockLeadsmithClient();
