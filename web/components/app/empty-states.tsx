"use client";

import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { EXAMPLE_QUERIES } from "@/lib/mock-data";

/**
 * First-run empty state for the app dashboard: nothing searched yet. Centres the
 * brand mark over a prompt and offers the canned example queries as one-tap
 * chips so a new user can start a run without typing.
 */
export function EmptyInitial({ onPick }: { onPick: (q: string) => void }) {
  return (
    <section
      aria-labelledby="empty-initial-heading"
      className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-16 text-center"
    >
      <Reveal className="flex flex-col items-center">
        <BrandMark className="size-12 opacity-80" />
        <h2
          id="empty-initial-heading"
          className="mt-5 text-xl font-semibold tracking-tight text-foreground"
        >
          Describe your ideal customer
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Write it in plain English. The agents handle discovery, scoring, and
          outreach from there.
        </p>
      </Reveal>

      <Stagger className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLE_QUERIES.map((query) => (
          <StaggerItem key={query}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal py-1.5 text-left"
              onClick={() => onPick(query)}
            >
              {query}
            </Button>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/** Headline + body copy for each backend `no_leads_reason`. */
function noResultsCopy(
  reason: "no_candidates" | "all_known" | "below_gate" | "errors" | null,
  minScore: number,
  found: number,
  skipped: number,
): { heading: string; body: string } {
  switch (reason) {
    case "no_candidates":
      return {
        heading: "No companies discovered",
        body: "Discovery came back empty for this request. Try rephrasing it or broadening the industry, size, or geography.",
      };
    case "all_known":
      return {
        heading: `All ${found} candidates already researched`,
        body: "Every company we found is already in memory from a past run. Try a different request, or clear memory to research them again.",
      };
    case "below_gate":
      return {
        heading: `Scanned ${found - skipped} new companies; none cleared the gate`,
        body: `They were researched but scored below your gate of ${minScore}. Lower the score gate or broaden the request to surface more leads.`,
      };
    case "errors":
      return {
        heading: `All ${found} companies failed to process`,
        body: "The research agents could not finish processing the candidates. Retry the same request, or narrow the target if the run keeps failing.",
      };
    default:
      return {
        heading: "No leads to show",
        body: "Adjust your request or the run flags and try the search again.",
      };
  }
}

/**
 * No-results empty state. The headline and body differ by the backend's
 * `no_leads_reason` so the user always sees a specific, actionable next step —
 * never a generic "no results" blame line (see DESIGN.md §5).
 */
export function EmptyNoResults({
  reason,
  minScore,
  found,
  skipped,
}: {
  reason: "no_candidates" | "all_known" | "below_gate" | "errors" | null;
  minScore: number;
  found: number;
  skipped: number;
}) {
  const { heading, body } = noResultsCopy(reason, minScore, found, skipped);

  return (
    <Reveal className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-16 text-center">
      <span
        className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden
      >
        <SearchX className="size-6" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </Reveal>
  );
}
