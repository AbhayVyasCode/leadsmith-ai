import Link from "next/link";
import { AlertOctagon, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoLeadsReason } from "@/lib/types";

/** Why a finished run has no leads — and the one action most likely to fix it. */
export function EmptyResult({
  reason,
  minScore,
  found,
  skipped,
  onLowerGate,
  onEdit,
  onRetry,
}: {
  reason: NoLeadsReason;
  minScore: number;
  found: number;
  skipped: number;
  onLowerGate: (score: number) => void;
  onEdit: () => void;
  onRetry: () => void;
}) {
  const lower = Math.max(0, minScore - 20);
  const copy =
    reason === "no_candidates"
      ? { title: "No companies found", body: "The search didn’t surface any real company sites for this brief. Broaden the industry, region or size and try again." }
      : reason === "all_known"
        ? { title: `All ${found} candidates were already researched`, body: "Every company found is already in memory from an earlier run. Try a different angle — or clear memory to research them again." }
        : reason === "errors"
          ? { title: "Every company failed to process", body: "This is usually a rate limit or an outage at a model or search provider. Wait a minute, then run it again." }
          : { title: `${found - skipped} companies scanned — none cleared ${minScore}`, body: "They were researched but scored below your minimum. Lower the bar to see the near-misses, or broaden the brief." };

  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-panel-2 text-ink-3">
        <SearchX className="size-5" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-[1.9rem] leading-tight text-ink">{copy.title}</h2>
      <p className="mt-3 max-w-[48ch] text-ink-2">{copy.body}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {reason === "below_gate" && minScore > 0 ? <Button onClick={() => onLowerGate(lower)}>Lower to {lower} and run again</Button> : null}
        {reason === "errors" ? <Button onClick={onRetry}>Run again</Button> : null}
        {reason === "all_known" ? (
          <Link href="/app/memory" className="inline-flex h-11 items-center rounded-full border border-line-2 bg-panel px-5 text-[0.9375rem] font-medium text-ink hover:bg-panel-2">
            Open memory
          </Link>
        ) : null}
        <Button variant="ghost" onClick={onEdit}>
          Edit brief
        </Button>
      </div>
    </div>
  );
}

/** A failed run, showing the engine's real error message. */
export function RunError({ message, onRetry, onEdit }: { message: string; onRetry: () => void; onEdit: () => void }) {
  const lower = message.toLowerCase();
  const hint = lower.includes("missing required configuration")
    ? "Add the missing keys to backend/.env and restart the engine."
    : lower.includes("429") || lower.includes("rate") || lower.includes("quota")
      ? "A provider is rate-limiting requests. Wait a minute, or lower “Leads to find”."
      : lower.includes("fetch") || lower.includes("network") || lower.includes("returned 5")
        ? "The research engine may be offline. Check the terminal running uvicorn."
        : "Check the terminal running the engine for details.";
  return (
    <div role="alert" className="card border-bad/30 p-6 sm:p-8">
      <p className="flex items-center gap-2 font-medium text-bad">
        <AlertOctagon className="size-5" aria-hidden />
        The run stopped with an error
      </p>
      <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-panel-2 p-4 font-mono text-[0.8rem] leading-relaxed text-ink">{message}</pre>
      <p className="mt-3 text-[0.9rem] text-ink-2">{hint}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onRetry}>Run again</Button>
        <Button variant="ghost" onClick={onEdit}>
          Edit brief
        </Button>
      </div>
    </div>
  );
}
