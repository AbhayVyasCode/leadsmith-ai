"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { leadsmith } from "@/lib/leadsmith-client";
import { AGENT_LABELS, DEFAULT_FLAGS } from "@/lib/types";
import type { AgentKey, AgentState, AgentStatus, ICP, Lead, ProductProfile, RunEvent, RunFlags, RunReport } from "@/lib/types";

export type RunStatus = "idle" | "running" | "done" | "stopped" | "error";

const AGENT_ORDER: AgentKey[] = ["intent", "discovery", "recall", "qualify", "critic", "enrich", "outreach"];
const RANK: Record<AgentStatus, number> = { pending: 0, running: 1, done: 2, error: 2, skipped: 3 };

export const leadKey = (l: Lead) => (l.company.website || l.company.name).toLowerCase().replace(/\/$/, "");

interface State {
  status: RunStatus;
  request: string;
  flags: RunFlags | null;
  agents: AgentState[];
  icp: ICP | null;
  product: ProductProfile | null;
  leads: Lead[];
  /** Keys of leads that arrived during the current run/continuation (for "new" highlights). */
  fresh: string[];
  candidatesFound: number;
  candidatesSkipped: number;
  activeCompany: string | null;
  warnings: string[];
  report: RunReport | null;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
  continuing: boolean;
}

const initialState: State = {
  status: "idle",
  request: "",
  flags: null,
  agents: [],
  icp: null,
  product: null,
  leads: [],
  fresh: [],
  candidatesFound: 0,
  candidatesSkipped: 0,
  activeCompany: null,
  warnings: [],
  report: null,
  error: null,
  startedAt: null,
  finishedAt: null,
  continuing: false,
};

/** Agents you switched off render as "Off" (skipped) instead of a fake "done". */
function agentsFor(flags: RunFlags | null, preset?: Partial<Record<AgentKey, AgentStatus>>): AgentState[] {
  return AGENT_ORDER.map((key) => {
    const off = flags && ((key === "critic" && !flags.critic) || (key === "outreach" && !flags.outreach));
    return { key, label: AGENT_LABELS[key], status: off ? "skipped" : (preset?.[key] ?? "pending") };
  });
}

/** A saved run doesn't store its flags, so infer the optional agents from what they left behind. */
function agentsForSaved(r: RunReport): AgentState[] {
  const done = Object.fromEntries(AGENT_ORDER.map((key) => [key, "done"])) as Record<AgentKey, AgentStatus>;
  if (!r.leads.length) return agentsFor(null, done);
  const critic = r.leads.some((l) => l.critique) || Boolean(r.metrics?.critic_failures);
  const outreach = r.leads.some((l) => l.outreach) || Boolean(r.metrics?.outreach_failures);
  return agentsFor({ ...DEFAULT_FLAGS, critic, outreach }, done);
}

function mergeLeads(existing: Lead[], incoming: Lead[]): Lead[] {
  const map = new Map(existing.map((l) => [leadKey(l), l]));
  for (const l of incoming) map.set(leadKey(l), l);
  return [...map.values()].sort((a, b) => b.overall_score - a.overall_score);
}

type Action =
  | { kind: "start"; request: string; flags: RunFlags }
  | { kind: "continue"; flags: RunFlags }
  | { kind: "event"; event: RunEvent }
  | { kind: "stop" }
  | { kind: "fail"; message: string }
  | { kind: "load"; report: RunReport }
  | { kind: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "start":
      return { ...initialState, status: "running", request: action.request, flags: action.flags, agents: agentsFor(action.flags), startedAt: Date.now() };
    case "continue":
      return {
        ...state,
        status: "running",
        flags: action.flags,
        // The buyer profile is reused, so intent is settled and the engine
        // goes straight back to discovery.
        agents: agentsFor(action.flags, { intent: "done", discovery: "running" }),
        fresh: [],
        activeCompany: null,
        warnings: [],
        error: null,
        startedAt: Date.now(),
        finishedAt: null,
        continuing: true,
      };
    case "stop":
      return {
        ...state,
        status: "stopped",
        activeCompany: null,
        finishedAt: Date.now(),
        agents: state.agents.map((a) => (a.status === "running" ? { ...a, status: "pending" } : a)),
      };
    case "fail":
      return {
        ...state,
        status: "error",
        error: action.message,
        activeCompany: null,
        finishedAt: Date.now(),
        agents: state.agents.map((a) => (a.status === "running" ? { ...a, status: "error" } : a)),
      };
    case "reset":
      return initialState;
    case "load": {
      const r = action.report;
      return {
        ...initialState,
        status: "done",
        request: r.request,
        icp: r.icp,
        product: r.product ?? null,
        leads: [...r.leads].sort((a, b) => b.overall_score - a.overall_score),
        report: r,
        candidatesFound: r.candidates_found,
        candidatesSkipped: r.candidates_skipped,
        agents: agentsForSaved(r),
      };
    }
    case "event": {
      const e = action.event;
      switch (e.type) {
        case "phase": {
          const agents = state.agents.map((a) => {
            if (a.key !== e.agent) return a;
            // Monotonic: concurrent companies can report out of order, and
            // agents that are switched off stay "Off".
            if (a.status === "skipped" || RANK[e.status] < RANK[a.status]) return a;
            return { ...a, status: e.status, detail: e.detail ?? a.detail, ms: e.ms ?? a.ms };
          });
          return { ...state, agents };
        }
        case "icp":
          return { ...state, icp: e.icp };
        case "product":
          return { ...state, product: e.product };
        case "warning":
          return { ...state, warnings: [...state.warnings, e.message] };
        case "candidates":
          return { ...state, candidatesFound: e.found, candidatesSkipped: e.skipped };
        case "company":
          return { ...state, activeCompany: e.status === "running" ? e.name : state.activeCompany };
        case "lead": {
          const key = leadKey(e.lead);
          const exists = state.leads.some((l) => leadKey(l) === key);
          return {
            ...state,
            leads: exists ? state.leads : [...state.leads, e.lead],
            fresh: state.fresh.includes(key) ? state.fresh : [...state.fresh, key],
          };
        }
        case "done": {
          const leads = state.continuing ? mergeLeads(state.leads, e.report.leads) : [...e.report.leads].sort((a, b) => b.overall_score - a.overall_score);
          return {
            ...state,
            status: "done",
            report: { ...e.report, leads },
            icp: e.report.icp ?? state.icp,
            product: e.report.product ?? state.product,
            leads,
            candidatesFound: e.report.candidates_found,
            candidatesSkipped: e.report.candidates_skipped,
            activeCompany: null,
            finishedAt: Date.now(),
            agents: state.agents.map((a) => (a.status === "running" ? { ...a, status: "done" } : a)),
          };
        }
        case "error":
          return reducer(state, { kind: "fail", message: e.message });
        default:
          return state;
      }
    }
    default:
      return state;
  }
}

export function useLeadsmithRun() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => () => abortRef.current?.abort(), []);

  const execute = useCallback(async (task: (signal: AbortSignal) => Promise<unknown>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await task(controller.signal);
    } catch (err) {
      if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
      dispatch({ kind: "fail", message: (err as Error)?.message || "Something went wrong." });
    }
  }, []);

  const onEvent = useCallback((event: RunEvent) => dispatch({ kind: "event", event }), []);

  const start = useCallback(
    (request: string, flags: RunFlags) => {
      dispatch({ kind: "start", request, flags });
      return execute((signal) => leadsmith.run(request, flags, { onEvent, signal }));
    },
    [execute, onEvent],
  );

  const continueRun = useCallback(
    (flags: RunFlags) => {
      const report = stateRef.current.report;
      if (!report) return Promise.resolve();
      dispatch({ kind: "continue", flags });
      return execute((signal) => leadsmith.continue({ report, flags }, { onEvent, signal }));
    },
    [execute, onEvent],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ kind: "stop" });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ kind: "reset" });
  }, []);

  const loadRun = useCallback((report: RunReport) => {
    abortRef.current?.abort();
    dispatch({ kind: "load", report });
  }, []);

  return { ...state, start, continueRun, stop, reset, loadRun };
}

export type LeadsmithRun = ReturnType<typeof useLeadsmithRun>;
