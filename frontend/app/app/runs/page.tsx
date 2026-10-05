"use client";

import Link from "next/link";
import { ArrowRight, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowGlyph, Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/controls";
import { ConfirmDialog } from "@/components/ui/overlays";
import { leadsmith } from "@/lib/leadsmith-client";
import type { RunSummary } from "@/lib/types";
import { formatDuration, formatRelative } from "@/lib/utils";

export default function RunsPage() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    leadsmith
      .getRuns(200)
      .then((r) => setRuns(r.items))
      .catch(() => {
        setError("Couldn’t load your runs. Is the research engine running?");
        setRuns([]);
      });
  }, []);

  const filtered = useMemo(
    () => (runs ?? []).filter((r) => r.request.toLowerCase().includes(query.trim().toLowerCase())),
    [runs, query],
  );

  const stats = useMemo(() => {
    const list = runs ?? [];
    const leads = list.reduce((n, r) => n + r.leads_count, 0);
    const avg = list.length ? list.reduce((n, r) => n + r.duration_seconds, 0) / list.length : 0;
    return [
      { k: "Runs", short: "Runs", v: String(list.length) },
      { k: "Qualified leads", short: "Leads", v: String(leads) },
      { k: "Average run", short: "Avg. run", v: list.length ? formatDuration(avg) : "—" },
    ];
  }, [runs]);

  const remove = async (id: string) => {
    const before = runs;
    setRuns((r) => (r ?? []).filter((x) => x.id !== id));
    try {
      await leadsmith.deleteRun(id);
      toast.success("Run deleted");
    } catch {
      setRuns(before);
      toast.error("Couldn’t delete that run");
    }
  };

  const clearAll = async () => {
    try {
      await leadsmith.clearRuns();
      setRuns([]);
      toast.success("Run history cleared");
    } catch {
      toast.error("Couldn’t clear the history");
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <header>
        <p className="eyebrow text-ink-3">Workspace</p>
        <h1 className="mt-3 font-display text-[clamp(2.75rem,5.5vw,4.25rem)] leading-none tracking-[-0.02em] text-ink">Runs</h1>
        <p className="mt-4 max-w-[52ch] text-ink-2">Every search you’ve run, with its results saved. Open one to review it, export it, or find more.</p>
      </header>

      {/* Stats and toolbar keep their size while loading, so nothing below jumps when the data lands. */}
      <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line" aria-busy={runs === null}>
        {stats.map((s) => (
          <div key={s.k} className="bg-panel px-5 py-4">
            <dt className="text-[0.8rem] text-ink-3">
              <span aria-hidden className="sm:hidden">
                {s.short}
              </span>
              <span className="sr-only sm:not-sr-only">{s.k}</span>
            </dt>
            <dd className="mt-1 flex h-[2.1rem] items-center font-display text-[2.1rem] leading-none text-ink tnum">
              {runs === null ? <Skeleton className="h-7 w-14 rounded-md" /> : s.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex h-11 items-center gap-3">
        {runs && runs.length > 3 ? (
          <label className="flex h-full min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-panel px-5 focus-within:border-ember/50">
            <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
            <span className="sr-only">Filter runs</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by brief…"
              className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        ) : (
          <p className="flex-1 text-[0.9rem] text-ink-3">
            {runs?.length ? `${runs.length} saved ${runs.length === 1 ? "run" : "runs"}` : null}
          </p>
        )}
        {runs?.length ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            aria-label="Clear history"
            className="shrink-0 text-bad hover:text-bad"
          >
            <Trash2 aria-hidden />
            <span className="hidden sm:inline">Clear history</span>
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        {runs === null ? (
          <div className="grid grid-cols-1 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-[1.25rem]" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <div className="card grid place-items-center px-6 py-16 text-center">
            <p className="font-display text-[2rem] leading-tight text-ink">{error ? "Runs unavailable" : "No runs yet"}</p>
            <p className="mt-3 max-w-[44ch] text-ink-2">{error ?? "Your first search will appear here as soon as it finishes."}</p>
            <Link href="/app" className={`${buttonVariants()} mt-7`}>
              Start a search
              <ArrowGlyph />
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-ink-2">No runs match “{query}”.</p>
        ) : (
          <ol className="grid grid-cols-1 gap-3">
            {filtered.map((run) => (
              <li key={run.id} className="group card flex items-stretch overflow-hidden transition-[border-color] hover:border-line-2">
                <Link href={`/app?run=${encodeURIComponent(run.id)}`} className="flex min-w-0 flex-1 items-center gap-5 p-5 sm:p-6">
                  <div className="hidden w-24 shrink-0 sm:block">
                    <p className="text-[0.85rem] font-medium text-ink">{formatRelative(run.created_at)}</p>
                    <p className="mt-0.5 font-mono text-[0.7rem] text-ink-3">
                      {new Date(run.created_at * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[1.45rem] leading-tight text-ink">{run.request}</p>
                    <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] text-ink-2">
                      <span>
                        <b className="font-medium text-ok">{run.leads_count}</b> qualified
                      </span>
                      <span>{run.candidates_found} found</span>
                      <span>{run.total_scanned} scanned</span>
                      <span>{formatDuration(run.duration_seconds)}</span>
                    </p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-ink" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(run.id)}
                  aria-label={`Delete run: ${run.request}`}
                  className="grid w-14 shrink-0 place-items-center border-l border-line text-ink-3 transition-colors hover:bg-bad/10 hover:text-bad"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear all runs?"
        body="This permanently deletes every saved run and its results. Companies stay in memory."
        confirmLabel="Clear history"
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}
