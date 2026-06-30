"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AlertCircle, RotateCcw, Search, ShieldCheck, Target } from "lucide-react";
import { useLeadsmithRun } from "@/hooks/use-leadsmith-run";
import { DEFAULT_FLAGS, type Lead, type RunFlags } from "@/lib/types";
import { noLeadsReason } from "@/lib/utils";
import { leadsToCsv, downloadCsv } from "@/lib/export";
import { SearchPanel } from "@/components/app/search-panel";
import { RunBar } from "@/components/app/run-bar";
import { AgentPipeline } from "@/components/app/agent-pipeline";
import { IcpPanel } from "@/components/app/icp-panel";
import { ProductCard } from "@/components/app/product-card";
import { LeadsTable } from "@/components/app/leads-table";
import { LeadDrawer } from "@/components/app/lead-drawer";
import { MetricsBar } from "@/components/app/metrics-bar";
import { EmptyNoResults } from "@/components/app/empty-states";
import { SignalGrid } from "@/components/landing/signal-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// React Flow (@xyflow/react) is heavy and only rendered on the "Agent trace"
// tab — load it lazily so it stays out of the /app route bundle until opened.
const TraceGraph = dynamic(
  () => import("@/components/app/trace-graph").then((m) => m.TraceGraph),
  { ssr: false, loading: () => <Skeleton className="h-[520px] w-full" /> },
);

function LeadsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading leads" aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

function WorkspaceHeader({
  running,
  done,
  leadCount,
}: {
  running: boolean;
  done: boolean;
  leadCount: number;
}) {
  const stats = [
    { label: "Status", value: running ? "Researching" : done ? "Complete" : "Ready", icon: Search },
    { label: "Qualified leads", value: String(leadCount), icon: Target },
    { label: "Evidence review", value: "Visible", icon: ShieldCheck },
  ];

  return (
    <div className="premium-panel rounded-2xl p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-end">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-primary">Pipeline review</p>
        <h1 className="mt-2 text-balance font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
          Inspect the companies that survived the run.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Scores, contacts, critic notes, and outreach angles stay attached to each account so the list is easier to trust and refine.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface/80 p-4">
            <stat.icon className="size-4 text-primary" aria-hidden />
            <p className="mt-3 tnum font-mono text-lg font-semibold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const run = useLeadsmithRun();
  const [flags, setFlags] = React.useState<RunFlags>(DEFAULT_FLAGS);
  const [selected, setSelected] = React.useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

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
  const hasTrace = Boolean(flags.trace && run.report?.trace);
  const hasRail = Boolean(run.icp || run.product);

  if (idle) {
    return (
      <>
        <section className="relative flex min-h-[calc(100dvh-60px)] items-center overflow-hidden">
          <SignalGrid />
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:py-12">
            <SearchPanel onRun={handleRun} running={running} onCancel={run.cancel} />
          </div>
        </section>
        <LeadDrawer lead={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      </>
    );
  }

  return (
    <>
      <RunBar
        request={run.request}
        status={run.status}
        durationSeconds={run.report?.duration_seconds}
        leadCount={run.leads.length}
        canExport={run.leads.length > 0}
        onNewSearch={run.reset}
        onRerun={() => run.request && handleRun(run.request, flags)}
        onExport={handleExport}
        onCancel={run.cancel}
      />

      <div className="surface-grid mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 lg:py-8">
        <div className="flex flex-col gap-5">
          <WorkspaceHeader running={running} done={done} leadCount={run.leads.length} />

          {errored && (
            <div role="alert" className="premium-panel flex flex-col gap-3 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                <span className="text-sm font-medium">The research run stopped</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {run.error ??
                  "One of the agents could not finish. Retry the same request, or adjust the query if the target is too narrow."}
              </p>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => run.request && handleRun(run.request, flags)}
                  disabled={!run.request}
                >
                  <RotateCcw aria-hidden />
                  Retry
                </Button>
              </div>
            </div>
          )}

          <AgentPipeline agents={run.agents} activeCompany={run.activeCompany} />

          {run.warnings.length > 0 && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-soft px-4 py-2.5 text-sm text-warning"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              <span>
                {run.warnings.length} step{run.warnings.length > 1 ? "s" : ""} hit a
                non-fatal issue — the affected leads were kept.
              </span>
            </div>
          )}

          {/* Results + context rail */}
          <div
            className={cn(
              "grid gap-5",
              hasRail && "xl:grid-cols-[minmax(0,1fr)_22rem]",
            )}
          >
            <div className="flex min-w-0 flex-col gap-4">
              {running && run.leads.length === 0 ? (
                <LeadsSkeleton />
              ) : run.leads.length > 0 ? (
                <>
                  {done && run.leads.length < flags.targetLeads ? (
                    <p className="text-sm text-muted-foreground">
                      Found{" "}
                      <span className="tnum font-mono text-foreground">{run.leads.length}</span>{" "}
                      of{" "}
                      <span className="tnum font-mono text-foreground">{flags.targetLeads}</span>{" "}
                      requested. Lower the score gate or broaden the request to surface more candidates.
                    </p>
                  ) : null}
                  <Tabs defaultValue="leads" className="gap-4">
                    <TabsList>
                      <TabsTrigger value="leads">Leads ({run.leads.length})</TabsTrigger>
                      {hasTrace && <TabsTrigger value="trace">Agent trace</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="leads">
                      <LeadsTable leads={run.leads} onSelect={openLead} />
                    </TabsContent>
                    {hasTrace && run.report?.trace && (
                      <TabsContent value="trace">
                        <TraceGraph trace={run.report.trace} />
                      </TabsContent>
                    )}
                  </Tabs>
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

            {hasRail && (
              <aside className="flex flex-col gap-6 xl:sticky xl:top-28 xl:self-start">
                {run.product && (
                  <Reveal>
                    <ProductCard product={run.product} />
                  </Reveal>
                )}
                {run.icp && (
                  <Reveal>
                    <IcpPanel icp={run.icp} />
                  </Reveal>
                )}
              </aside>
            )}
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
