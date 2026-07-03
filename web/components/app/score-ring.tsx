"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn, scoreBand } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

const BAND_COLOR = {
  high: "text-emerald-400",
  mid: "text-amber-400",
  low: "text-red-400",
} as const;

const BAND_TRACK = {
  high: "text-emerald-500/10",
  mid: "text-amber-500/10",
  low: "text-red-500/10",
} as const;

export function ScoreRing({
  score,
  size = 40,
}: {
  score: number;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));
  const value = Math.round(clamped);
  const band = scoreBand(clamped);

  const stroke = Math.max(2.5, Math.round(size * 0.08));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const fraction = clamped / 100;
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
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={BAND_TRACK[band]}
          stroke="currentColor"
        />
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
              transition={{ duration: 0.6, ease: EASE }}
            />
          )}
        </g>
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center tnum font-mono font-semibold leading-none",
          BAND_COLOR[band],
        )}
        style={{ fontSize: Math.max(10, Math.round(size * 0.28)) }}
      >
        {value}
      </span>
    </span>
  );
}
