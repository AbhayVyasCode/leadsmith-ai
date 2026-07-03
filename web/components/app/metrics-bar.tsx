"use client";

import type { ComponentType } from "react";
import { Clock, Coins, Database, Hash, Layers, Zap } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCost } from "@/lib/utils";
import type { RunMetrics } from "@/lib/types";

interface Stat {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  value: number;
  decimals?: number;
  suffix?: string;
  caption?: string;
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <StaggerItem>
      <div className="flex flex-col gap-2 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground/30">
          <Icon className="size-3.5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
            {stat.label}
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-0.5">
          <CountUp
            value={stat.value}
            decimals={stat.decimals}
            suffix={stat.suffix}
            className="tnum text-[20px] font-semibold tracking-[-0.02em] text-foreground/80"
          />
          {stat.caption ? (
            <span className="tnum font-mono text-[10px] text-emerald-400/60">
              {stat.caption}
            </span>
          ) : null}
        </div>
      </div>
    </StaggerItem>
  );
}

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
      icon: Zap,
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
  ];

  return (
    <section
      aria-labelledby="run-metrics-heading"
      className="flex flex-col gap-3"
    >
      <h2
        id="run-metrics-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/30"
      >
        Run metrics
      </h2>

      <Stagger className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
        <StaggerItem>
          <div className="flex flex-col gap-2 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <Coins className="size-3.5 shrink-0" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                Est. cost
              </span>
            </div>
            <div className="mt-auto flex flex-col gap-0.5">
              <span className="tnum text-[20px] font-semibold tracking-[-0.02em] text-foreground/80">
                {formatCost(metrics.estimated_cost_usd)}
              </span>
              <span className="tnum font-mono text-[10px] text-emerald-400/60">
                free tier
              </span>
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
