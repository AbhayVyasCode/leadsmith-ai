"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { leadsmith, type EngineHealth } from "@/lib/leadsmith-client";
import { cn } from "@/lib/cn";

type EngineState = { health: EngineHealth | null; refresh: () => void };

const EngineContext = createContext<EngineState>({ health: null, refresh: () => {} });

/** Polls the backend's /api/health (on mount, every 30s, and on window focus). */
export function EngineProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<EngineHealth | null>(null);
  const latest = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++latest.current;
    let next = await leadsmith.health();
    // One dropped request shouldn't flash "offline" — confirm it first.
    if (next.mode === "live" && !next.reachable) {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      if (id !== latest.current) return;
      next = await leadsmith.health();
    }
    // A slow, older check must not overwrite a newer answer.
    if (id === latest.current) setHealth(next);
  }, []);

  useEffect(() => {
    const check = () => void refresh();
    check();
    const id = window.setInterval(check, 30_000);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, [refresh]);

  const value = useMemo(() => ({ health, refresh: () => void refresh() }), [health, refresh]);
  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export const useEngine = () => useContext(EngineContext);

type Tone = "ok" | "warn" | "bad" | "idle";

export function describeEngine(health: EngineHealth | null): { tone: Tone; label: string; detail: string } {
  if (!health) return { tone: "idle", label: "Checking engine", detail: "Contacting the research engine…" };
  if (health.mode === "demo") return { tone: "warn", label: "Demo mode", detail: "No engine configured — runs use sample data." };
  if (!health.reachable) return { tone: "bad", label: "Engine offline", detail: `Can’t reach ${health.base}` };
  if (health.missing.length) return { tone: "warn", label: "Keys missing", detail: `Set ${health.missing.join(", ")}` };
  return { tone: "ok", label: "Engine online", detail: health.chatModel };
}

const DOT: Record<Tone, string> = {
  ok: "bg-ok shadow-[0_0_0_3px_color-mix(in_oklab,var(--ok)_22%,transparent)]",
  warn: "bg-warn shadow-[0_0_0_3px_color-mix(in_oklab,var(--warn)_22%,transparent)]",
  bad: "bg-bad shadow-[0_0_0_3px_color-mix(in_oklab,var(--bad)_22%,transparent)]",
  idle: "bg-line-2 animate-pulse",
};

export function EngineDot({ tone, className }: { tone: Tone; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2 shrink-0 rounded-full", DOT[tone], className)} />;
}

/** Sidebar status card. */
export function EngineStatusCard() {
  const { health } = useEngine();
  const { tone, label, detail } = describeEngine(health);
  return (
    <div role="status" className="min-w-0 rounded-2xl border border-line bg-canvas p-3.5">
      <p className="flex items-center gap-2 text-[0.85rem] font-medium text-ink">
        <EngineDot tone={tone} />
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[0.7rem] text-ink-3" title={detail}>
        {detail}
      </p>
    </div>
  );
}
