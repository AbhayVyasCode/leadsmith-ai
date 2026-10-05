import { AlertTriangle, Check, Minus } from "lucide-react";
import type { RunStatus } from "@/hooks/use-leadsmith-run";
import type { AgentState } from "@/lib/types";
import { cn } from "@/lib/cn";
import s from "./pipeline.module.css";

const STATUS_TEXT: Record<AgentState["status"], string> = {
  pending: "Waiting",
  running: "Working",
  done: "Done",
  skipped: "Off",
  error: "Failed",
};

const LABEL: Record<string, string> = {
  intent: "Intent",
  discovery: "Discover",
  recall: "Recall",
  qualify: "Qualify",
  critic: "Critic",
  enrich: "Enrich",
  outreach: "Draft",
};

/** What the engine is doing when no single company is in focus. */
function idleActivity(agents: AgentState[]): string {
  const at = (key: AgentState["key"]) => agents.find((a) => a.key === key)?.status;
  if (at("intent") === "running") return "Reading your brief and building the buyer profile…";
  if (at("discovery") === "running") return "Searching the web for companies that match…";
  return "Researching candidates…";
}

export function Pipeline({
  agents,
  status,
  activeCompany,
  found,
  skipped,
  qualified,
}: {
  agents: AgentState[];
  status: RunStatus;
  activeCompany: string | null;
  found: number;
  skipped: number;
  qualified: number;
}) {
  const running = status === "running";
  return (
    <section aria-label="Research progress" className="card overflow-hidden">
      <ol className={s.track}>
        {agents.map((agent, i) => (
          <li key={agent.key} className={s.step} data-status={agent.status}>
            {i > 0 ? (
              <span aria-hidden className={s.connector} data-filled={agent.status === "running" || agent.status === "done" || undefined} />
            ) : null}
            <span className={s.node}>
              {agent.status === "done" ? (
                <Check className="size-4" strokeWidth={2.6} aria-hidden />
              ) : agent.status === "skipped" ? (
                <Minus className="size-4" aria-hidden />
              ) : agent.status === "error" ? (
                <AlertTriangle className="size-4" aria-hidden />
              ) : agent.status === "running" ? (
                <span className={s.spinner} aria-hidden />
              ) : (
                <span className={s.dot} aria-hidden />
              )}
            </span>
            <span className={s.label}>{LABEL[agent.key] ?? agent.label}</span>
            <span className={s.state}>{STATUS_TEXT[agent.status]}</span>
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-panel-2/40 px-5 py-3.5 text-[0.88rem] sm:px-6">
        <p className={cn("min-w-0 truncate", running ? "text-ink" : "text-ink-2")}>
          {running
            ? activeCompany
              ? <>Reading <span className="font-medium">{activeCompany}</span>…</>
              : idleActivity(agents)
            : status === "done"
              ? "Run complete."
              : status === "stopped"
                ? "Stopped — results so far are kept below."
                : "The run stopped with an error."}
        </p>
        <p className="flex shrink-0 gap-4 font-mono text-[0.78rem] text-ink-2 tnum">
          <span>
            <b className="font-medium text-ink">{found}</b> found
          </span>
          <span>
            <b className="font-medium text-ink">{skipped}</b> known
          </span>
          <span>
            <b className="font-medium text-ink">{qualified}</b> qualified
          </span>
        </p>
      </div>
    </section>
  );
}
