"use client";

import * as React from "react";
import { History, Trash2, ArrowRight, Loader2, Play } from "lucide-react";
import { leadsmith } from "@/lib/leadsmith-client";
import type { RunSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function RunsPage() {
  const [runs, setRuns] = React.useState<RunSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [clearing, setClearing] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  
  const router = useRouter();

  const fetchRuns = async () => {
    try {
      const res = await leadsmith.getRuns();
      setRuns(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRuns();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all run history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await leadsmith.clearRuns();
      setRuns([]);
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const ok = await leadsmith.deleteRun(id);
      if (ok) {
        setRuns((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id: string) => {
    router.push(`/app?runId=${encodeURIComponent(id)}`);
  };

  return (
    <main className="flex min-h-dvh flex-col p-6 lg:p-10">
      <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <History className="size-5" />
              <h1 className="text-display-md font-bold tracking-tight text-foreground">
                Run History
              </h1>
            </div>
            <p className="text-[14px] text-muted-foreground/80 max-w-xl">
              Review past research runs, continue discovering leads from where you left off, and analyze your discovery pipeline.
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={loading || clearing || runs.length === 0}
            className="shrink-0 text-danger hover:text-danger hover:bg-danger-soft border-danger-soft transition-colors"
          >
            {clearing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
            Clear History
          </Button>
        </header>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl shimmer-premium animate-pulse border border-border" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 py-20">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 border border-border">
              <Play className="size-8 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">No runs yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Head over to the Discover tab and run a search. Your history will automatically appear here.
              </p>
            </div>
            <Button className="mt-2" onClick={() => router.push('/app')}>
              Start Discovering
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {runs.map((run) => {
              const isDeleting = deletingId === run.id;
              const date = new Date(run.created_at * 1000).toLocaleString();
              
              return (
                <div
                  key={run.id}
                  onClick={() => handleView(run.id)}
                  className={`premium-panel group cursor-pointer overflow-hidden rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-all hover:-translate-y-0.5 ${isDeleting ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                >
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-foreground truncate" title={run.request}>
                      "{run.request}"
                    </p>
                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-success"></span>
                        {date}
                      </span>
                      <span className="text-border">•</span>
                      <span>
                        <strong className="text-foreground font-semibold">{run.leads_count}</strong> / {run.candidates_found} leads
                      </span>
                      <span className="text-border">•</span>
                      <span>{formatDuration(run.duration_seconds)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(run.id, e)}
                      disabled={isDeleting}
                      className="size-8 text-muted-foreground/50 hover:text-danger hover:bg-danger/10"
                    >
                      {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2 text-[13px] group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      View Results
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
