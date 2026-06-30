"use client";

import type { ComponentType } from "react";
import { Clock, Coins, Database, Hash, Layers, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCost } from "@/lib/utils";
import type { RunMetrics } from "@/lib/types";

interface Stat {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** Numeric value to count up to. */
  value: number;
  decimals?: number;
  suffix?: string;
  /** Optional caption shown beneath the value. */
  caption?: string;
}

/** A single KPI tile: muted icon + overline label + a large tabular numeral. */
function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <StaggerItem>
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em]">
            {stat.label}
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-0.5">
          <CountUp
            value={stat.value}
            decimals={stat.decimals}
            suffix={stat.suffix}
            className="tnum font-mono text-2xl font-semibold tracking-tight text-foreground"
          />
          {stat.caption ? (
            <span className="tnum font-mono text-xs text-success">{stat.caption}</span>
          ) : null}
        </div>
      </Card>
    </StaggerItem>
  );
}

/**
 * Compact KPI strip summarising a run's resource use: duration, LLM/embed
 * calls, cache hits, tokens, and estimated cost. Numbers count up on mount
 * (instant under reduced motion) and stay the focus of each tile.
 */
export function MetricsBar({
  metrics,
  durationSeconds,
}: {
  metrics: RunMetrics;
  durationSeconds: number;
}) {
  const stats: Stat[] = [
    {
      key: "duration",
      label: "Duration",
      icon: Clock,
      value: durationSeconds,
      decimals: 2,
      suffix: "s",
    },
    {
      key: "llm",
      label: "LLM calls",
      icon: Sparkles,
      value: metrics.llm_calls,
    },
    {
      key: "embeds",
      label: "Embeds",
      icon: Layers,
      value: metrics.embed_calls,
    },
    {
      key: "cache",
      label: "Cache hits",
      icon: Database,
      value: metrics.cache_hits,
    },
    {
      key: "tokens",
      label: "Tokens",
      icon: Hash,
      value: metrics.total_tokens,
    },
    {
      key: "cost",
      label: "Est. cost",
      icon: Coins,
      // Cost is shown verbatim, not counted, to preserve the exact figure.
      value: 0,
      caption: "estimated",
    },
  ];

  return (
    <section aria-labelledby="run-metrics-heading" className="flex flex-col gap-4">
      <h2
        id="run-metrics-heading"
        className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground"
      >
        Run metrics
      </h2>

      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) =>
          stat.key === "cost" ? (
            <StaggerItem key={stat.key}>
              <Card className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="size-4 shrink-0" aria-hidden />
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em]">
                    {stat.label}
                  </span>
                </div>
                <div className="mt-auto flex flex-col gap-0.5">
                  <span className="tnum font-mono text-2xl font-semibold tracking-tight text-foreground">
                    {formatCost(metrics.estimated_cost_usd)}
                  </span>
                  <span className="tnum font-mono text-xs text-success">
                    {stat.caption}
                  </span>
                </div>
              </Card>
            </StaggerItem>
          ) : (
            <StatCard key={stat.key} stat={stat} />
          ),
        )}
      </Stagger>
    </section>
  );
}
