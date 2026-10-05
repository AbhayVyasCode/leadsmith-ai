"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { radioGroupKeys } from "@/lib/a11y";

/**
 * Icon toggle. Both icons are rendered and swapped with the `dark:` variant,
 * so the correct icon shows before hydration (no flash, no mounted-state).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
      className={clsx(
        "relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-panel-2 hover:text-ink",
        className,
      )}
    >
      <Sun className="size-[18px] rotate-0 scale-100 transition-transform duration-500 ease-[var(--ease-ember)] dark:-rotate-90 dark:scale-0" aria-hidden />
      <Moon className="absolute size-[18px] rotate-90 scale-0 transition-transform duration-500 ease-[var(--ease-ember)] dark:rotate-0 dark:scale-100" aria-hidden />
    </button>
  );
}

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;
const THEME_VALUES = OPTIONS.map((o) => o.value);

/** Three-way segmented switch (footer / settings). */
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      onKeyDown={(e) => radioGroupKeys<string>(e, THEME_VALUES, theme ?? "system", setTheme)}
      className={clsx("inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-1", className)}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            // Before mount the theme is unknown, so "System" holds the tab stop.
            tabIndex={(mounted ? active : value === "system") ? 0 : -1}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={clsx(
              "inline-flex size-8 items-center justify-center rounded-full transition-colors duration-200",
              active ? "bg-ink text-canvas" : "text-ink-3 hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
