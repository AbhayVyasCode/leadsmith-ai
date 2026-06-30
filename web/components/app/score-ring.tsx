"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn, scoreBand } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Text-color token per band — paired with the visible numeral, never color-only. */
const BAND_COLOR = {
  high: "text-success",
  mid: "text-warning",
  low: "text-danger",
} as const;

/**
 * SVG circular progress ring that fills to `score`/100 on mount, stroked by
 * score band (high=success / mid=warning / low=danger). The numeric score sits
 * at the center so color is always paired with a value. Static (full) arc under
 * reduced motion.
 */
export function ScoreRing({
  score,
  size = 44,
}: {
  score: number;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));
  const value = Math.round(clamped);
  const band = scoreBand(clamped);

  // Geometry: stroke scales gently with size, never thinner than 3px.
  const stroke = Math.max(3, Math.round(size * 0.09));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const fraction = clamped / 100;
  // Dash offset: full circumference = empty arc, 0 = full arc.
  const targetOffset = circumference * (1 - fraction);

  return (
    <span
      role="img"
      aria-label={`Fit score ${value} of 100`}
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="-rotate-90"
      >
        {/* track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-border"
          stroke="currentColor"
        />
        {/* value arc */}
        <g className={BAND_COLOR[band]}>
          {reduced ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={targetOffset}
            />
          ) : (
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              stroke="currentColor"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 0.7, ease: EASE }}
            />
          )}
        </g>
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center tnum font-mono font-semibold leading-none",
          BAND_COLOR[band],
        )}
        style={{ fontSize: Math.max(10, Math.round(size * 0.3)) }}
      >
        {value}
      </span>
    </span>
  );
}
