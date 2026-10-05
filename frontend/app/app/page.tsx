"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { NEW_SEARCH_EVENT } from "@/components/app/app-shell";
import { Composer } from "@/components/app/composer";
import { LeadList } from "@/components/app/lead-list";
import { LeadSheet } from "@/components/app/lead-sheet";
import { Pipeline } from "@/components/app/pipeline";
import { BuyerProfile, ProductRead, RunStats, Warnings } from "@/components/app/run-aside";
import { RunHeader } from "@/components/app/run-header";
import { EmptyResult, RunError } from "@/components/app/run-states";
import { TraceView } from "@/components/app/trace-view";
import { Skeleton } from "@/components/ui/controls";
import { useLeadsmithRun } from "@/hooks/use-leadsmith-run";
import { downloadCsv, leadsToCsv } from "@/lib/export";
import { leadsmith } from "@/lib/leadsmith-client";
import { DEFAULT_FLAGS, type Lead, type RunFlags } from "@/lib/types";
import { noLeadsReason } from "@/lib/utils";

function LoadingRun() {
  return (
    <div className="mx-auto grid grid-cols-1 max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8" aria-busy aria-label="Loading run">
      <Skeleton className="h-36 rounded-[1.25rem]" />
      <Skeleton className="h-32 rounded-[1.25rem]" />
      <div className="grid grid-cols-1 gap-3">
        <Skeleton className="h-24 rounded-[1.35rem]" />
        <Skeleton className="h-24 rounded-[1.35rem]" />
      </div>
    </div>
  );
}

function Discover() {
  const run = useLeadsmithRun();
  const router = useRouter();
  const params = useSearchParams();
  const runId = params.get("run");

  const [draft, setDraft] = useState("");
  const [flags, setFlags] = useState<RunFlags>({ ...DEFAULT_FLAGS, mode: "customer" });
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const handled = useRef<string | null>(null);
  const { loadRun, reset, start, continueRun, stop } = run;

  // Open a saved run exactly once per id — a missing run shows a notice
  // instead of re-fetching forever.
  useEffect(() => {
    if (!runId || handled.current === runId) return;
    handled.current = runId;
    setLoading(true);
    setNotice(null);
    leadsmith
      .getRun(runId)
      .then((report) => {
        if (report) {
          loadRun(report);
          setDraft(report.request);
        } else {
          setNotice("That run no longer exists — it may have been deleted.");
          router.replace("/app");
        }
      })
      .catch(() => {
        setNotice("Couldn’t load that run. Is the research engine running?");
        router.replace("/app");
      })
      .finally(() => setLoading(false));
  }, [runId, loadRun, router]);

  const clearRunParam = useCallback(() => {
    if (runId) router.replace("/app");
  }, [runId, router]);

  const newSearch = useCallback(() => {
    reset();
    setSelected(null);
    setDraft("");
    setNotice(null);
    handled.current = null;
    clearRunParam();
  }, [reset, clearRunParam]);

  useEffect(() => {
    window.addEventListener(NEW_SEARCH_EVENT, newSearch);
    return () => window.removeEventListener(NEW_SEARCH_EVENT, newSearch);
  }, [newSearch]);

  const begin = (brief: string, f: RunFlags) => {
    setNotice(null);
    setSelected(null);
    clearRunParam();
    void start(brief, f);
  };

  if (loading) return <LoadingRun />;

  if (run.status === "idle") {
    return <Composer value={draft} onChange={setDraft} flags={flags} onFlagsChange={setFlags} onSubmit={(brief) => begin(brief, flags)} notice={notice} />;
  }

  const effective = run.flags ?? flags;
  const running = run.status === "running";
  const done = run.status === "done";
  const report = run.report;
  const showEmpty = done && report && run.leads.length === 0;

  const editBrief = () => {
    setDraft(run.request);
    reset();
    clearRunParam();
  };

  const exportCsv = () => {
    const slug = run.request.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "leads";
    downloadCsv(`leadsmith-${slug}.csv`, leadsToCsv(run.leads));
  };

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <RunHeader
        status={run.status as Exclude<typeof run.status, "idle">}
        request={run.request}
        productMode={Boolean(run.product)}
        startedAt={run.startedAt}
        finishedAt={run.finishedAt}
        durationSeconds={done && report ? report.duration_seconds : undefined}
        leadCount={run.leads.length}
        canFindMore={done && Boolean(report)}
        onStop={stop}
        onRerun={() => begin(run.request, effective)}
        onFindMore={() => void continueRun(effective)}
        onExport={exportCsv}
        onEdit={editBrief}
        onNew={newSearch}
      />

      <Pipeline
        agents={run.agents}
        status={run.status}
        activeCompany={run.activeCompany}
        found={run.candidatesFound}
        skipped={run.candidatesSkipped}
        qualified={run.leads.length}
      />

      {run.status === "error" && run.error ? <RunError message={run.error} onRetry={() => begin(run.request, effective)} onEdit={editBrief} /> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="grid grid-cols-1 min-w-0 content-start gap-6">
          {showEmpty ? (
            <EmptyResult
              reason={noLeadsReason(report)}
              minScore={effective.minScore}
              found={report.candidates_found}
              skipped={report.candidates_skipped}
              onLowerGate={(score) => {
                const next = { ...effective, minScore: score };
                setFlags(next);
                begin(run.request, next);
              }}
              onEdit={editBrief}
              onRetry={() => begin(run.request, effective)}
            />
          ) : run.leads.length || running ? (
            <LeadList
              leads={run.leads}
              fresh={run.fresh}
              running={running}
              continuing={run.continuing}
              minScore={effective.minScore}
              onSelect={setSelected}
            />
          ) : run.status === "stopped" ? (
            <p className="card p-6 text-ink-2">The run was stopped before any lead qualified.</p>
          ) : null}
        </div>

        <aside className="grid grid-cols-1 content-start gap-6">
          {run.product ? <ProductRead product={run.product} /> : null}
          {run.icp ? <BuyerProfile icp={run.icp} /> : running ? <Skeleton className="h-72 rounded-[1.25rem]" /> : null}
          <Warnings warnings={run.warnings} />
          {done && report ? <RunStats metrics={report.metrics} duration={report.duration_seconds} /> : null}
        </aside>
      </div>

      {done && report?.trace ? <TraceView trace={report.trace} /> : null}

      <LeadSheet lead={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<LoadingRun />}>
      <Discover />
    </Suspense>
  );
}
