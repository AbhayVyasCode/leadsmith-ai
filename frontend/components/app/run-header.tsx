"use client";

import { Download, Pencil, Plus, RotateCcw, Sparkles, Square } from "lucide-react";
import { useEffect, useState } from "react";
import type { RunStatus } from "@/hooks/use-leadsmith-run";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

function Elapsed({ startedAt, running, fixed }: { startedAt: number | null; running: boolean; fixed?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  const seconds = fixed ?? (startedAt ? Math.max(0, (now - startedAt) / 1000) : 0);
  if (running) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return (
      <span className="font-mono text-sm text-ink-2 tnum" aria-label={`Elapsed ${m} minutes ${s} seconds`}>
        {m}:{s.toString().padStart(2, "0")}
      </span>
    );
  }
  return <span className="font-mono text-sm text-ink-2 tnum">{formatDuration(seconds)}</span>;
}

const STATUS: Record<Exclude<RunStatus, "idle">, { label: string; tone: "ember" | "ok" | "neutral" | "bad" }> = {
  running: { label: "Researching", tone: "ember" },
  done: { label: "Done", tone: "ok" },
  stopped: { label: "Stopped", tone: "neutral" },
  error: { label: "Failed", tone: "bad" },
};

export function RunHeader({
  status,
  request,
  productMode,
  startedAt,
  finishedAt,
  durationSeconds,
  leadCount,
  canFindMore,
  onStop,
  onRerun,
  onFindMore,
  onExport,
  onEdit,
  onNew,
}: {
  status: Exclude<RunStatus, "idle">;
  request: string;
  productMode: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  durationSeconds?: number;
  leadCount: number;
  canFindMore: boolean;
  onStop: () => void;
  onRerun: () => void;
  onFindMore: () => void;
  onExport: () => void;
  onEdit: () => void;
  onNew: () => void;
}) {
  const meta = STATUS[status];
  const running = status === "running";
  const fixed = durationSeconds ?? (startedAt && finishedAt ? (finishedAt - startedAt) / 1000 : undefined);

  return (
    <header className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex flex-wrap items-center gap-2.5" aria-live="polite">
          <Badge tone={meta.tone} className="h-7 px-3 text-[0.8rem]">
            {running ? <span className="live-dot size-1.5" /> : null}
            {meta.label}
          </Badge>
          <Elapsed startedAt={startedAt} running={running} fixed={running ? undefined : fixed} />
          {productMode ? <Badge tone="outline">Product mode</Badge> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {running ? (
            <Button variant="secondary" size="sm" onClick={onStop}>
              <Square className="size-3.5 fill-current" aria-hidden />
              Stop
            </Button>
          ) : (
            <>
              {leadCount > 0 ? (
                <Button variant="secondary" size="sm" onClick={onExport}>
                  <Download aria-hidden />
                  Export CSV
                </Button>
              ) : null}
              {canFindMore ? (
                <Button variant="secondary" size="sm" onClick={onFindMore}>
                  <Sparkles aria-hidden />
                  Find more
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Pencil aria-hidden />
                Edit brief
              </Button>
              <Button variant="ghost" size="sm" onClick={onRerun}>
                <RotateCcw aria-hidden />
                Run again
              </Button>
            </>
          )}
          {/* Below lg the top bar already carries a "+" new-search button. */}
          <Button variant="ink" size="sm" onClick={onNew} className="hidden lg:inline-flex">
            <Plus aria-hidden />
            New search
          </Button>
        </div>
      </div>
      <h1 className="mt-5 max-w-[48ch] font-display text-[clamp(1.85rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.015em] text-ink">{request}</h1>
    </header>
  );
}
