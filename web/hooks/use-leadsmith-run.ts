"use client";

import { useCallback, useReducer, useRef } from "react";
import type {
  AgentKey,
  AgentState,
  ContinueRequest,
  ICP,
  Lead,
  ProductProfile,
  RunEvent,
  RunFlags,
  RunReport,
} from "@/lib/types";
import { AGENT_LABELS } from "@/lib/types";
import { leadsmith } from "@/lib/leadsmith-client";

export type RunStatus = "idle" | "running" | "done" | "error";

const AGENT_ORDER: AgentKey[] = [
  "intent",
  "discovery",
  "recall",
  "qualify",
  "critic",
  "enrich",
  "outreach",
];

function initialAgents(): AgentState[] {
  return AGENT_ORDER.map((key) => ({
    key,
    label: AGENT_LABELS[key],
    status: "pending",
  }));
}

interface State {
  status: RunStatus;
  request: string;
  agents: AgentState[];
  icp: ICP | null;
  product: ProductProfile | null;
  leads: Lead[];
  candidatesFound: number;
  candidatesSkipped: number;
  activeCompany: string | null;
  warnings: string[];
  report: RunReport | null;
  error: string | null;
}

function initialState(): State {
  return {
    status: "idle",
    request: "",
    agents: initialAgents(),
    icp: null,
    product: null,
    leads: [],
    candidatesFound: 0,
    candidatesSkipped: 0,
    activeCompany: null,
    warnings: [],
    report: null,
    error: null,
  };
}

type Action =
  | { kind: "start"; request: string }
  | { kind: "event"; event: RunEvent }
  | { kind: "reset" };

function applyAgent(
  agents: AgentState[],
  key: AgentKey,
  patch: Partial<AgentState>,
): AgentState[] {
  return agents.map((a) => (a.key === key ? { ...a, ...patch } : a));
}

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "start":
      return { ...initialState(), status: "running", request: action.request };
    case "reset":
      return initialState();
    case "event": {
      const e = action.event;
      switch (e.type) {
        case "phase":
          return {
            ...state,
            agents: applyAgent(state.agents, e.agent, {
              status: e.status,
              detail: e.detail,
              ms: e.ms ?? state.agents.find((a) => a.key === e.agent)?.ms,
            }),
          };
        case "icp":
          return { ...state, icp: e.icp };
        case "product":
          return { ...state, product: e.product };
        case "warning":
          // Non-fatal (e.g. a critic/outreach step failed on one lead). Record
          // it for inline display; do NOT touch run status or the agent nodes.
          return { ...state, warnings: [...state.warnings, e.message] };
        case "candidates":
          return {
            ...state,
            candidatesFound: e.found,
            candidatesSkipped: e.skipped,
          };
        case "company":
          return {
            ...state,
            activeCompany:
              e.status === "running" ? e.name : state.activeCompany,
          };
        case "lead":
          return { ...state, leads: [...state.leads, e.lead] };
        case "done":
          return {
            ...state,
            status: "done",
            report: e.report,
            icp: e.report.icp,
            product: e.report.product ?? state.product,
            // Backend returns ALL qualified leads (never trimmed), so this
            // overwrite can't drop a lead the user already watched stream in.
            leads: e.report.leads,
            activeCompany: null,
            agents: state.agents.map((a) =>
              a.status === "running" || a.status === "pending"
                ? { ...a, status: a.status === "running" ? "done" : a.status }
                : a,
            ),
          };
        case "error":
          return {
            ...state,
            status: "error",
            error: e.message,
            activeCompany: null,
            // Mark the in-flight agent as errored so the pipeline shows where it
            // stopped, instead of leaving a node spinning forever.
            agents: state.agents.map((a) =>
              a.status === "running" ? { ...a, status: "error" } : a,
            ),
          };
        default:
          return state;
      }
    }
    default:
      return state;
  }
}

export function useLeadsmithRun() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (request: string, flags: RunFlags) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ kind: "start", request });
    try {
      await leadsmith.run(request, flags, {
        signal: controller.signal,
        onEvent: (event) => dispatch({ kind: "event", event }),
      });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      dispatch({
        kind: "event",
        event: { type: "error", message: (err as Error).message },
      });
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ kind: "reset" });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ kind: "reset" });
  }, []);

  const continueRun = useCallback(
    async (flags: RunFlags) => {
      const { report } = state;
      if (!report) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Don't reset the state - we want to keep existing leads and append new ones
      // The backend will return a new report with all leads (old + new)
      dispatch({ kind: "start", request: report.request });
      try {
        const continueRequest: ContinueRequest = { report, flags };
        await leadsmith.continue(continueRequest, {
          signal: controller.signal,
          onEvent: (event) => dispatch({ kind: "event", event }),
        });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        dispatch({
          kind: "event",
          event: { type: "error", message: (err as Error).message },
        });
      }
    },
    [state.report],
  );

  const loadRun = useCallback((report: RunReport) => {
    abortRef.current?.abort();
    dispatch({ kind: "start", request: report.request });
    dispatch({ kind: "event", event: { type: "done", report } });
  }, []);

  return { ...state, start, cancel, reset, continue: continueRun, loadRun };
}
