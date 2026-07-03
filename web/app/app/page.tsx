"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Download,
  Plus,
  RotateCcw,
  Search,
  Target,
  Zap,
} from "lucide-react";
import { useLeadsmithRun } from "@/hooks/use-leadsmith-run";
import { leadsmith } from "@/lib/leadsmith-client";
import { DEFAULT_FLAGS, type Lead, type RunFlags } from "@/lib/types";
import { noLeadsReason } from "@/lib/utils";
import { leadsToCsv, downloadCsv } from "@/lib/export";
import { SearchPanel } from "@/components/app/search-panel";
import { AgentPipeline } from "@/components/app/agent-pipeline";
import { IcpPanel } from "@/components/app/icp-panel";
import { ProductCard } from "@/components/app/product-card";
import { QuickFilters } from "@/components/app/quick-filters";
import { LeadsTable, type SortKey, type SortDir } from "@/components/app/leads-table";
import { LeadDrawer } from "@/components/app/lead-drawer";
import { MetricsBar } from "@/components/app/metrics-bar";
import { EmptyNoResults } from "@/components/app/empty-states";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



function LeadsSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-label="Loading leads" aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
        >
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function StatusPill({ running, done }: { running: boolean; done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        running
          ? "bg-primary/10 text-primary"
          : done
            ? "bg-success-soft text-success"
            : "bg-muted text-muted-foreground/50",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          running ? "bg-primary animate-pulse" : done ? "bg-success" : "bg-muted-foreground/30",
        )}
      />
      {running ? "Researching" : done ? "Complete" : "Ready"}
    </span>
  );
}

function WorkspaceContent() {
  const run = useLeadsmithRun();
  const searchParams = useSearchParams();
  const [flags, setFlags] = React.useState<RunFlags>(DEFAULT_FLAGS);
  const [selected, setSelected] = React.useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [hydrating, setHydrating] = React.useState(false);

  const [sortKey, setSortKey] = React.useState<SortKey>("score");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  React.useEffect(() => {
    const runId = searchParams?.get("runId");
    if (runId && run.status === "idle" && !hydrating) {
      setHydrating(true);
      leadsmith.getRun(runId).then((report) => {
        if (report) {
          run.loadRun(report);
        }
      }).catch(console.error).finally(() => setHydrating(false));
    }
  }, [searchParams, run.status, hydrating, run]);

  const handleRun = React.useCallback(
    (request: string, f: RunFlags) => {
      setFlags(f);
      run.start(request, f);
    },
    [run],
  );

  const openLead = React.useCallback((lead: Lead) => {
    setSelected(lead);
    setDrawerOpen(true);
  }, []);

  const handleExport = React.useCallback(() => {
    if (run.leads.length === 0) return;
    downloadCsv(`leadsmith-leads-${Date.now()}.csv`, leadsToCsv(run.leads));
  }, [run.leads]);

  const idle = run.status === "idle";
  const running = run.status === "running";
  const done = run.status === "done";
  const errored = run.status === "error";
  const hasRail = Boolean(run.icp || run.product);

  if (idle && hydrating) {
    return (
      <div className="flex min-h-[calc(100dvh-56px)] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Loading run...</span>
        </div>
      </div>
    );
  }

  if (idle) {
    return (
      <div className="flex min-h-[calc(100dvh-56px)] items-center justify-center px-4 py-12">
        <SearchPanel onRun={handleRun} running={running} onCancel={run.cancel} />
        <LeadDrawer lead={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      </div>
    );
  }

  const errorSection = errored ? (
    <div
      role="alert"
      className="rounded-xl border border-danger/20 bg-danger-soft p-4"
    >
      <div className="flex items-center gap-2 text-danger">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        <span className="text-[13px] font-medium">The research run stopped</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {run.error ??
          "One of the agents could not finish. Retry the same request, or adjust the query."}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => run.request && handleRun(run.request, flags)}
        disabled={!run.request}
        className="mt-3 gap-1.5 text-[12px]"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  ) : null;

  const resultsSection = (
    <div className="flex min-w-0 flex-col gap-4">
      {running && run.leads.length === 0 ? (
        <LeadsSkeleton />
      ) : run.leads.length > 0 ? (
        <>
          {done && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-muted-foreground">
                <span className="tnum font-mono text-foreground">{run.leads.length}</span>
                {" "}qualified lead{run.leads.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => run.continue && run.continue(flags)}
                disabled={running}
                className="gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
              >
                Find more
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </div>
          )}
          <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden premium-panel shadow-sm">
            <QuickFilters sortKey={sortKey} onSortChange={(k, d) => { setSortKey(k); setSortDir(d); }} />
            <LeadsTable leads={run.leads} onSelect={openLead} sortKey={sortKey} sortDir={sortDir} onSortChange={(k, d) => { setSortKey(k); setSortDir(d); }} />
          </div>
        </>
      ) : done && run.report ? (
        <EmptyNoResults
          reason={noLeadsReason(run.report)}
          minScore={flags.minScore}
          found={run.report.candidates_found}
          skipped={run.report.candidates_skipped}
        />
      ) : null}
    </div>
  );

  const railSection = hasRail ? (
    <div className="flex flex-col gap-4">
      {run.product && <ProductCard product={run.product} />}
      {run.icp && <IcpPanel icp={run.icp} />}
    </div>
  ) : null;

  return (
    <>
      <div className="sticky top-[56px] z-[990] border-b border-border bg-surface shadow-sm">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 py-3 sm:px-6">
          <StatusPill running={running} done={done} />

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-medium text-foreground"
              title={run.request}
            >
              {run.request}
            </p>
          </div>

          {done ? (
            <span className="hidden items-center gap-2 text-[12px] text-muted-foreground md:flex">
              <span className="tnum font-mono text-foreground">{run.leads.length}</span>
              leads
              {typeof run.report?.duration_seconds === "number" && (
                <>
                  <span className="text-border">/</span>
                  <span className="tnum font-mono">{run.report.duration_seconds.toFixed(1)}s</span>
                </>
              )}
            </span>
          ) : null}

          <div className="flex items-center gap-1.5">
            {running ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={run.cancel}
                className="gap-1.5 text-[12px] text-muted-foreground"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => run.request && handleRun(run.request, flags)}
                className="gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Re-run
              </Button>
            )}

            {done && run.leads.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
              >
                <Download className="size-3.5" aria-hidden />
                Export
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={run.reset}
              className="gap-1.5"
            >
              <Plus className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-5">
          {errorSection}

          <AgentPipeline
            agents={run.agents}
            activeCompany={run.activeCompany}
          />

          <div className="flex flex-col gap-5">
            {railSection}
            {resultsSection}
          </div>

          {done && run.report && (
            <MetricsBar
              metrics={run.report.metrics}
              durationSeconds={run.report.duration_seconds}
            />
          )}
        </div>
      </div>

      <LeadDrawer lead={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

export default function WorkspacePage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-[calc(100dvh-56px)] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
      </div>
    }>
      <WorkspaceContent />
    </React.Suspense>
  );
}
