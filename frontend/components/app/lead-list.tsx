"use client";

import { ChevronRight } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { leadKey } from "@/hooks/use-leadsmith-run";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/controls";
import { EmailLabel } from "@/components/ui/email-label";
import { ConfidenceMeter } from "@/components/ui/meter";
import { ScoreRing } from "@/components/ui/score-ring";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/cn";
import { radioGroupKeys } from "@/lib/a11y";
import { hostOf } from "@/lib/utils";
import s from "./lead-list.module.css";

export const FLAG_META: Record<string, { tone: "warn" | "bad" | "neutral"; label: string }> = {
  "weak-evidence": { tone: "warn", label: "Weak evidence" },
  "rejected-by-critic": { tone: "bad", label: "Critic disagrees" },
  "critic-failed": { tone: "neutral", label: "Critic unavailable" },
  "enrich-failed": { tone: "neutral", label: "No contacts" },
  "outreach-failed": { tone: "neutral", label: "No draft" },
};

export function FlagBadges({ flags }: { flags: string[] }) {
  if (!flags.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {flags.map((flag) => {
        const meta = FLAG_META[flag] ?? { tone: "neutral" as const, label: flag };
        return (
          <Badge key={flag} tone={meta.tone}>
            {meta.label}
          </Badge>
        );
      })}
    </span>
  );
}

type SortKey = "fit" | "confidence" | "name";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "fit", label: "Fit" },
  { key: "confidence", label: "Confidence" },
  { key: "name", label: "A–Z" },
];
const SORT_KEYS = SORTS.map((o) => o.key);

export function LeadList({
  leads,
  fresh,
  running,
  continuing,
  minScore,
  onSelect,
}: {
  leads: Lead[];
  fresh: string[];
  running: boolean;
  continuing: boolean;
  minScore: number;
  onSelect: (lead: Lead) => void;
}) {
  const [sort, setSort] = useState<SortKey>("fit");
  const sorted = useMemo(() => {
    const copy = [...leads];
    copy.sort((a, b) =>
      sort === "name" ? a.company.name.localeCompare(b.company.name) : sort === "confidence" ? b.confidence - a.confidence : b.overall_score - a.overall_score,
    );
    return copy;
  }, [leads, sort]);

  return (
    <section aria-labelledby="leads-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="leads-title" className="font-display text-[2rem] leading-none text-ink">
          Qualified leads <span className="ml-1 font-mono text-base text-ink-3 tnum">{leads.length}</span>
        </h2>
        {leads.length > 1 ? (
          <div
            role="radiogroup"
            aria-label="Sort leads"
            onKeyDown={(e) => radioGroupKeys(e, SORT_KEYS, sort, setSort)}
            className="flex gap-1 rounded-full border border-line bg-panel p-1"
          >
            {SORTS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={sort === opt.key}
                tabIndex={sort === opt.key ? 0 : -1}
                onClick={() => setSort(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-[0.8rem] font-medium transition-colors pointer-coarse:py-2",
                  sort === opt.key ? "bg-ink text-canvas" : "text-ink-2 hover:text-ink",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ol className="mt-5 grid grid-cols-1 gap-3">
        {sorted.map((lead) => {
          const key = leadKey(lead);
          const contact = lead.contacts[0];
          const isNew = continuing && fresh.includes(key);
          return (
            <li key={key} className={s.item} data-fresh={fresh.includes(key) || undefined}>
              <button
                type="button"
                onClick={() => onSelect(lead)}
                className={s.row}
                aria-label={`Open ${lead.company.name} — fit ${lead.overall_score}, confidence ${lead.confidence.toFixed(2)}`}
              >
                <ScoreRing score={lead.overall_score} size={54} />
                <span className={s.main}>
                  <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[1.05rem] font-semibold text-ink">{lead.company.name}</span>
                    <span className="font-mono text-[0.75rem] text-ink-3">{hostOf(lead.company.website)}</span>
                    {isNew ? <Badge tone="ember">New</Badge> : null}
                  </span>
                  {lead.qualification.outreach_angle ? (
                    <span className="mt-1 line-clamp-2 text-[0.9rem] leading-snug text-ink-2">{lead.qualification.outreach_angle}</span>
                  ) : null}
                  <span className="mt-2.5 block max-w-[15rem]">
                    <ConfidenceMeter value={lead.confidence} />
                  </span>
                </span>
                <span className={s.contact}>
                  {contact ? (
                    <>
                      <span className="block truncate text-[0.9rem] font-medium text-ink">{contact.name}</span>
                      <span className="block truncate text-[0.8rem] text-ink-3">{contact.role}</span>
                      <span className="mt-1.5 flex min-w-0 items-center gap-2">
                        {contact.email ? <span className="truncate font-mono text-[0.75rem] text-ink-2">{contact.email}</span> : null}
                        <EmailLabel kind={contact.email ? contact.email_confidence : "unknown"} />
                      </span>
                    </>
                  ) : (
                    <span className="text-[0.85rem] text-ink-3">No contact found</span>
                  )}
                </span>
                <span className={s.flags}>
                  <FlagBadges flags={lead.flags} />
                </span>
                <ChevronRight className={s.chevron} aria-hidden />
              </button>
            </li>
          );
        })}

        {running
          ? Array.from({ length: leads.length ? 1 : 3 }).map((_, i) => (
              <li key={`skeleton-${i}`} aria-hidden className={s.skeleton} style={{ "--i": i } as CSSProperties}>
                <Skeleton className="size-[54px] rounded-full" />
                <div className="grid grid-cols-1 flex-1 gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-1.5 w-48" />
                </div>
              </li>
            ))
          : null}
      </ol>

      {running ? (
        <p className="mt-4 text-[0.85rem] text-ink-3">
          Leads appear here as soon as they clear your minimum fit score of <span className="font-mono text-ink-2">{minScore}</span>.
        </p>
      ) : null}
    </section>
  );
}
