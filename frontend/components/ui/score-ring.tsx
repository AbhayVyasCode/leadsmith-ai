import type { CSSProperties } from "react";
import { clsx } from "clsx";
import { scoreBand } from "@/lib/utils";
import s from "./score-ring.module.css";

/**
 * Fit-score ring: conic-gradient sweep + counter, both animated in CSS via
 * registered custom properties (no JS, server-safe). Color is never the only
 * signal — the number is always printed in the middle.
 */
export function ScoreRing({
  score,
  size = 44,
  animate = true,
  className,
}: {
  score: number;
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <span
      role="img"
      aria-label={`Fit score ${v} of 100`}
      data-band={scoreBand(v)}
      className={clsx(s.ring, animate && s.animate, className)}
      style={{ "--value": v, "--size": `${size}px` } as CSSProperties}
    >
      <span aria-hidden className={s.num} style={{ "--to": v } as CSSProperties} />
    </span>
  );
}
