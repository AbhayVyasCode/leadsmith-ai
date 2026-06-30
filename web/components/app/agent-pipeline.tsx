"use client";

import { motion, useReducedMotion } from "motion/react";
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

/** Short, sentence-case progress word per status, paired with each color (never color-only). */
const STATUS_LABEL: Record<AgentStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  skipped: "Skipped",
  error: "Error",
};

type NodeVisual = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** ring + icon color classes for the node circle */
  ring: string;
  icon_color: string;
  /** whether the icon should spin (running only) */
  spin?: boolean;
};

const STATUS_VISUAL: Record<AgentStatus, NodeVisual> = {
  pending: {
    icon: Circle,
    ring: "border-dashed border-border text-muted-foreground/60",
    icon_color: "text-muted-foreground/50",
  },
  running: {
    icon: Loader2,
    ring: "border-primary text-primary",
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
    ring: "border-border text-muted-foreground",
    icon_color: "text-muted-foreground",
  },
  error: {
    icon: AlertCircle,
    ring: "border-danger/50 text-danger",
    icon_color: "text-danger",
  },
};

function PipelineNode({
  agent,
  reduced,
}: {
  agent: AgentState;
  reduced: boolean | null;
}) {
  const visual = STATUS_VISUAL[agent.status];
  const Icon = visual.icon;
  const label = AGENT_LABELS[agent.key] ?? agent.label;
  const running = agent.status === "running";

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span className="relative inline-flex">
        {/* shimmer halo while running (opacity-only, reduced-motion gated) */}
        {running && !reduced ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ opacity: 0.15, scale: 1 }}
            animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.18, 1] }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
          />
        ) : null}
        <span
          className={cn(
            "relative inline-flex size-9 items-center justify-center rounded-full border bg-surface transition-colors",
            visual.ring,
          )}
        >
          <Icon
            aria-hidden
            className={cn(
              "size-4",
              visual.icon_color,
              visual.spin && !reduced ? "animate-spin" : undefined,
            )}
          />
        </span>
      </span>

      <span className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            "text-xs font-medium leading-none",
            agent.status === "pending"
              ? "text-muted-foreground"
              : "text-foreground",
          )}
        >
          {label}
        </span>
        <span className="sr-only">{STATUS_LABEL[agent.status]}.</span>
        {typeof agent.ms === "number" ? (
          <span className="tnum font-mono text-[11px] leading-none text-muted-foreground">
            {agent.ms}ms
          </span>
        ) : null}
      </span>
    </li>
  );
}

function Connector({
  filled,
  reduced,
}: {
  filled: boolean;
  reduced: boolean | null;
}) {
  return (
    <li aria-hidden className="mt-[18px] flex h-px min-w-6 flex-1 self-start sm:mt-[18px]">
      <span className="relative h-px w-full overflow-hidden rounded-full bg-border">
        {filled ? (
          reduced ? (
            <span className="absolute inset-0 origin-left bg-primary" />
          ) : (
            <motion.span
              className="absolute inset-0 origin-left bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.36, ease: EASE }}
            />
          )
        ) : null}
      </span>
    </li>
  );
}

/**
 * Live agent pipeline: a connected sequence of status nodes that light up as the
 * supervisor advances. Connectors fill (bg-primary) once the preceding node is done.
 * Information-bearing motion only; reduced-motion renders a static equivalent.
 */
export function AgentPipeline({
  agents,
  activeCompany,
}: {
  agents: AgentState[];
  activeCompany: string | null;
}) {
  const reduced = useReducedMotion();

  return (
    <section className="premium-panel overflow-hidden rounded-2xl" aria-labelledby="agent-pipeline-heading">
      <div className="border-b border-border px-5 py-4">
        <h2 id="agent-pipeline-heading" className="text-sm font-semibold text-foreground">
          Agent pipeline
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Each specialist passes evidence to the next step.
        </p>
      </div>
      <div className="p-5">
        <nav aria-label="Agent pipeline progress">
          <ol className="flex flex-wrap items-start gap-y-4">
            {agents.map((agent, i) => (
              <div
                key={agent.key}
                className="flex min-w-0 flex-1 basis-[7.5rem] items-start sm:basis-auto"
              >
                <PipelineNode agent={agent} reduced={reduced} />
                {i < agents.length - 1 ? (
                  <Connector
                    filled={agent.status === "done"}
                    reduced={reduced}
                  />
                ) : null}
              </div>
            ))}
          </ol>
        </nav>

        {activeCompany ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Loader2
              aria-hidden
              className={cn("size-3 text-primary", reduced ? undefined : "animate-spin")}
            />
            <span>
              Processing{" "}
              <span className="font-medium text-foreground">{activeCompany}</span>
              {"..."}
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
