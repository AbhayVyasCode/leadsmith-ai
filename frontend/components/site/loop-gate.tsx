"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Pauses decorative CSS loops (embers, glow, marquee, sparks) while they are
 * off-screen, so the page can go idle instead of animating what nobody sees.
 * Progressive enhancement: without JS, `[data-loop]` elements simply keep
 * running. The pause rule lives in globals.css.
 */
export function LoopGate() {
  const pathname = usePathname();

  useEffect(() => {
    const loops = document.querySelectorAll<HTMLElement>("[data-loop]");
    if (!loops.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
      },
      { rootMargin: "120px 0px" },
    );
    loops.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
