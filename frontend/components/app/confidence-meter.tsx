"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

export function ConfidenceMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="meter"
      aria-label={`Confidence ${pct} percent`}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={1}
    >
      <span className="relative h-1 w-full min-w-10 overflow-hidden rounded-full bg-white/[0.06]">
        {reduced ? (
          <span
            className="absolute inset-0 origin-left rounded-full bg-primary/60"
            style={{ transform: `scaleX(${clamped})` }}
          />
        ) : (
          <motion.span
            className="absolute inset-0 origin-left rounded-full bg-primary/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: clamped }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        )}
      </span>
      <span className="tnum shrink-0 font-mono text-[10px] text-muted-foreground/30">
        {clamped.toFixed(2)}
      </span>
    </div>
  );
}
