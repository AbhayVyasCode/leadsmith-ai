"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * One pointermove listener for a whole grid: writes the cursor position into
 * --mx/--my on the hovered [data-tile] so CSS can paint a spotlight there.
 */
export function Spotlight({ className, children }: { className?: string; children: ReactNode }) {
  const frame = useRef(0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
    if (!tile) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${clientX - r.left}px`);
      tile.style.setProperty("--my", `${clientY - r.top}px`);
    });
  };

  return (
    <div className={className} onPointerMove={onMove}>
      {children}
    </div>
  );
}
