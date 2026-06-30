"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Ambient radar/signal background — GPU-only (transform + opacity).
 * A faint dot-grid plus slow concentric "signal" rings and a soft drifting glow,
 * all built from the primary accent at low opacity and masked to fade at the edges.
 * Renders static (no animation) under reduced motion.
 */
export function SignalGrid({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  // Radial fade so the grid/glow never touches the section edges.
  // Mask alpha only (color value is irrelevant to a mask) — use a token, not #000.
  const edgeMask =
    "radial-gradient(ellipse 80% 70% at 50% 38%, var(--foreground) 0%, var(--foreground) 45%, transparent 78%)";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "center",
          maskImage: edgeMask,
          WebkitMaskImage: edgeMask,
        }}
      />

      {/* Concentric signal rings, centered on the focal point */}
      <div
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
        style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
      >
        {[0, 1, 2].map((i) => {
          const size = 280 + i * 220;
          const ring = (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full border border-primary/15"
              style={{
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
              }}
            />
          );
          if (reduced) return ring;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full border border-primary/15"
              style={{
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
              }}
              initial={{ scale: 0.92, opacity: 0.25 }}
              animate={{ scale: [0.92, 1.06, 0.92], opacity: [0.25, 0.55, 0.25] }}
              transition={{
                duration: 9 + i * 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.8,
              }}
            />
          );
        })}
      </div>

      {/* Soft drifting accent glow */}
      {reduced ? (
        <div
          className="absolute left-1/2 top-[34%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--primary-soft) 0%, transparent 65%)",
            maskImage: edgeMask,
            WebkitMaskImage: edgeMask,
          }}
        />
      ) : (
        <motion.div
          className="absolute left-1/2 top-[34%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--primary-soft) 0%, transparent 65%)",
            maskImage: edgeMask,
            WebkitMaskImage: edgeMask,
          }}
          initial={{ scale: 1, opacity: 0.22 }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.22, 0.4, 0.22] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        />
      )}
    </div>
  );
}
