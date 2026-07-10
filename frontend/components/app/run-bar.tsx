"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/hooks/use-leadsmith-run";

function StatusPill({ status }: { status: RunStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary">
        <Loader2 className="size-3 animate-spin" aria-hidden />
        Running
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-danger/20 bg-danger-soft px-3 py-1 text-xs font-semibold tracking-wide text-danger">
        <AlertCircle className="size-3" aria-hidden />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-3 py-1 text-xs font-semibold tracking-wide text-success">
      <CheckCircle2 className="size-3" aria-hidden />
      Done
    </span>
  );
}

/**
 * Compact, sticky header for an active/finished run: the request, a status pill,
 * a result summary, and the run actions (cancel / re-run / export / new search).
 * Replaces the full composer once a search is underway.
 */
export function RunBar({
  request,
  status,
  durationSeconds,
  leadCount,
  canExport,
  onNewSearch,
  onRerun,
  onExport,
  onCancel,
}: {
  request: string;
  status: RunStatus;
  durationSeconds?: number;
  leadCount: number;
  canExport: boolean;
  onNewSearch: () => void;
  onRerun: () => void;
  onExport: () => void;
  onCancel: () => void;
}) {
  const running = status === "running";
  const done = status === "done";

  return (
    <div className="sticky top-[64px] z-[1000] border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-6 py-3 sm:px-8">
        <StatusPill status={status} />

        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
            Current thesis
          </p>
          <p
            className="truncate text-[13px] font-medium text-foreground/90"
            title={request}
          >
            {request}
          </p>
        </div>

        {done ? (
          <span className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground/60 md:flex">
            <span className="tnum font-mono text-foreground/80">{leadCount}</span>
            {leadCount === 1 ? "lead" : "leads"}
            {typeof durationSeconds === "number" ? (
              <>
                <span aria-hidden className="text-border/60">
                  /
                </span>
                <span className="tnum font-mono">
                  {durationSeconds.toFixed(1)}s
                </span>
              </>
            ) : null}
          </span>
        ) : null}

        <div className={cn("flex shrink-0 items-center gap-2")}>
          {running ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              <X aria-hidden />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRerun}
              aria-label="Re-run this search"
            >
              <RotateCcw aria-hidden />
              <span className="hidden sm:inline">Re-run</span>
            </Button>
          )}

          {canExport ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExport}
              aria-label="Export leads to CSV"
            >
              <Download aria-hidden />
              <span className="hidden sm:inline">Export</span>
            </Button>
          ) : null}

          <Button type="button" size="sm" onClick={onNewSearch}>
            <Plus aria-hidden />
            <span className="hidden sm:inline">New search</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
