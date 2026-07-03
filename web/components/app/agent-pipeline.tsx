"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  MinusCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { AGENT_LABELS, type AgentState, type AgentStatus } from "@/lib/types";

const EASE = [0.32, 0.72, 0, 1] as const;

const STATUS_LABEL: Record<AgentStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  skipped: "Skipped",
  error: "Error",
};

type NodeVisual = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  ring: string;
  icon_color: string;
  spin?: boolean;
};

const STATUS_VISUAL: Record<AgentStatus, NodeVisual> = {
  pending: {
    icon: Circle,
    ring: "border-dashed border-border text-muted-foreground/30",
    icon_color: "text-muted-foreground/20",
  },
  running: {
    icon: Loader2,
    ring: "border-primary/60 text-primary",
    icon_color: "text-primary",
    spin: true,
  },
  done: {
    icon: CheckCircle2,
    ring: "border-success/40 text-success",
    icon_color: "text-success",
  },
  skipped: {
    icon: MinusCircle,
    ring: "border-border text-muted-foreground/40",
    icon_color: "text-muted-foreground/30",
  },
  error: {
    icon: AlertCircle,
    ring: "border-danger/40 text-danger",
    icon_color: "text-danger",
  },
};

function PipelineNode({
  agent,
}: {
  agent: AgentState;
}) {
  const visual = STATUS_VISUAL[agent.status];
  const Icon = visual.icon;
  const label = AGENT_LABELS[agent.key] ?? agent.label;
  const running = agent.status === "running";
  const done = agent.status === "done";

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span className="relative inline-flex">

        <span
          className={cn(
            "relative inline-flex size-9 items-center justify-center rounded-full border-[1.5px] bg-surface transition-all duration-200",
            visual.ring,
            done && "bg-success-soft",
          )}
        >
          <Icon
            aria-hidden
            className={cn(
              "size-[15px]",
              visual.icon_color,
              visual.spin ? "animate-spin" : undefined,
            )}
          />
        </span>
      </span>

      <span className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            "text-[11px] font-medium leading-none",
            agent.status === "pending"
              ? "text-muted-foreground/30"
              : "text-foreground",
          )}
        >
          {label}
        </span>
        <span className="sr-only">{STATUS_LABEL[agent.status]}.</span>
        {typeof agent.ms === "number" ? (
          <span className="tnum font-mono text-[10px] leading-none text-muted-foreground">
            {agent.ms}ms
          </span>
        ) : null}
      </span>
    </li>
  );
}

function Connector({
  filled,
}: {
  filled: boolean;
}) {
  return (
    <li aria-hidden className="mt-[16px] flex h-px min-w-4 flex-1 self-start">
      <span className="relative h-px w-full overflow-hidden rounded-full bg-border">
        <span 
          className={cn(
            "absolute inset-0 origin-left bg-primary transition-transform duration-300 ease-out",
            filled ? "scale-x-100" : "scale-x-0"
          )}
        />
      </span>
    </li>
  );
}

export function AgentPipeline({
  agents,
  activeCompany,
}: {
  agents: AgentState[];
  activeCompany: string | null;
}) {

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-surface"
      aria-labelledby="agent-pipeline-heading"
    >
      <div className="border-b border-border px-5 py-3">
        <div className="flex items-center justify-between">
          <h2 id="agent-pipeline-heading" className="text-[13px] font-medium text-foreground">
            Agent pipeline
          </h2>
          {activeCompany && (
            <p
              role="status"
              aria-live="polite"
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <Loader2
                aria-hidden
                className={cn(
                  "size-3 text-primary",
                  "animate-spin",
                )}
              />
              <span className="font-medium text-foreground">{activeCompany}</span>
            </p>
          )}
        </div>
      </div>
      <div className="px-5 py-4">
        <nav aria-label="Agent pipeline progress">
          <ol className="flex flex-wrap items-start gap-y-3">
            {agents.map((agent, i) => (
              <div
                key={agent.key}
                className="flex min-w-0 flex-1 basis-[7rem] items-start sm:basis-auto"
              >
                <PipelineNode agent={agent} />
                {i < agents.length - 1 ? (
                  <Connector filled={agent.status === "done"} />
                ) : null}
              </div>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
