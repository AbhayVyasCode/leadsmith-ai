"use client";

import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

/** Sonner, themed through its CSS variables so toasts match the Ember tokens. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-center"
      offset={88}
      style={
        {
          "--normal-bg": "var(--panel)",
          "--normal-border": "var(--line)",
          "--normal-text": "var(--ink)",
          "--border-radius": "999px",
        } as CSSProperties
      }
    />
  );
}
