"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Thin horizontal confidence bar for a 0..1 value. The fill is animated via
 * `transform: scaleX` (transform-origin left) — never the width property — and
 * renders statically under reduced motion. A mono label shows the raw value.
 */
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
      <span className="relative h-1.5 w-full min-w-12 overflow-hidden rounded-full bg-muted">
        {reduced ? (
          <span
            className="absolute inset-0 origin-left rounded-full bg-primary"
            style={{ transform: `scaleX(${clamped})` }}
          />
        ) : (
          <motion.span
            className="absolute inset-0 origin-left rounded-full bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: clamped }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        )}
      </span>
      <span className="tnum shrink-0 font-mono text-xs text-muted-foreground">
        {clamped.toFixed(2)}
      </span>
    </div>
  );
}
