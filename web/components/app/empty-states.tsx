"use client";

import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { EXAMPLE_QUERIES } from "@/lib/mock-data";

export function EmptyInitial({ onPick }: { onPick: (q: string) => void }) {
  return (
    <section
      aria-labelledby="empty-initial-heading"
      className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-16 text-center"
    >
      <Reveal className="flex flex-col items-center">
        <BrandMark className="size-10 opacity-40" />
        <h2
          id="empty-initial-heading"
          className="mt-5 text-lg font-medium text-foreground/70"
        >
          Describe your ideal customer
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground/40">
          Write it in plain English. The agents handle discovery, scoring, and
          outreach from there.
        </p>
      </Reveal>

      <Stagger className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLE_QUERIES.map((query) => (
          <StaggerItem key={query}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal rounded-full border-white/[0.06] py-1.5 text-left text-[12px] text-muted-foreground/40 transition-all duration-150 hover:border-primary/20 hover:bg-primary/[0.04] hover:text-foreground/70"
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
        body: `They were researched but scored below your gate of ${minScore}. Lower the score gate or broaden the request.`,
      };
    case "errors":
      return {
        heading: `All ${found} companies failed to process`,
        body: "The research agents could not finish processing. Retry the same request, or narrow the target.",
      };
    default:
      return {
        heading: "No leads to show",
        body: "Adjust your request or the run flags and try again.",
      };
  }
}

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
        className="flex size-10 items-center justify-center rounded-full bg-white/[0.04] text-muted-foreground/20"
        aria-hidden
      >
        <SearchX className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-medium text-foreground/70">
        {heading}
      </h2>
      <p className="mt-2 text-[13px] text-muted-foreground/40">{body}</p>
    </Reveal>
  );
}
