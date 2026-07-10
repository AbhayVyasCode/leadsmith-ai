import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A single KPI/spec: large mono tabular numeral + label (+ optional sub). */
export function Stat({
  value,
  label,
  sub,
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="tnum font-mono text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {value}
      </span>
      <span className="mt-1.5 text-sm font-medium text-foreground">{label}</span>
      {sub ? (
        <span className="mt-0.5 text-sm text-muted-foreground">{sub}</span>
      ) : null}
    </div>
  );
}
