"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { Contact, EmailConfidence, Lead } from "@/lib/types";
import { ScoreRing } from "@/components/app/score-ring";
import { ConfidenceMeter } from "@/components/app/confidence-meter";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Variants for staggering table rows in — mirrors the shared Stagger helper. */
const ROW_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const ROW_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

type SortKey = "score" | "confidence" | "company";
type SortDir = "asc" | "desc";

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

/** Email-confidence badge variant + sentence-case label (paired, never color-only). */
const EMAIL_CONFIDENCE: Record<
  EmailConfidence,
  { variant: BadgeVariant; label: string }
> = {
  found: { variant: "success", label: "Found" },
  guessed: { variant: "warning", label: "Guessed" },
  unknown: { variant: "default", label: "Unknown" },
};

/** Flag badge variant + readable label. */
const FLAG_META: Record<string, { variant: BadgeVariant; label: string }> = {
  "weak-evidence": { variant: "warning", label: "Weak evidence" },
  "rejected-by-critic": { variant: "danger", label: "Rejected by critic" },
  "critic-failed": { variant: "warning", label: "Critic skipped" },
  "enrich-failed": { variant: "warning", label: "No contacts" },
  "outreach-failed": { variant: "warning", label: "Outreach skipped" },
};

function flagMeta(flag: string): { variant: BadgeVariant; label: string } {
  return FLAG_META[flag] ?? { variant: "default", label: flag };
}

function topContact(lead: Lead): Contact | null {
  return lead.contacts[0] ?? null;
}

function stripScheme(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Compare two leads by the active sort key. */
function compareLeads(a: Lead, b: Lead, key: SortKey): number {
  if (key === "company") {
    return a.company.name.localeCompare(b.company.name);
  }
  if (key === "confidence") return a.confidence - b.confidence;
  return a.overall_score - b.overall_score;
}

/** Invoke onSelect on Enter/Space from a button-like row. */
function makeRowKeyHandler(onActivate: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      onActivate();
    }
  };
}

function FlagBadges({ flags }: { flags: string[] }) {
  if (flags.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => {
        const meta = flagMeta(flag);
        return (
          <Badge key={flag} variant={meta.variant}>
            {meta.label}
          </Badge>
        );
      })}
    </div>
  );
}

function ContactCell({ contact }: { contact: Contact | null }) {
  if (!contact) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  const conf = EMAIL_CONFIDENCE[contact.email_confidence];
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate text-sm font-medium text-foreground">
        {contact.name}
      </span>
      <span className="truncate text-xs text-muted-foreground">
        {contact.role}
      </span>
      {contact.email ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <Mail aria-hidden className="size-3 shrink-0 text-muted-foreground" />
          <span className="tnum truncate font-mono text-xs text-foreground">
            {contact.email}
          </span>
          <Badge variant={conf.variant} className="shrink-0">
            {conf.label}
          </Badge>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">No email</span>
      )}
    </div>
  );
}

function SortButton({
  label,
  active,
  dir,
  align = "left",
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  align?: "left" | "right";
  onClick: () => void;
}) {
  const Icon = dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Sort by ${label.toLowerCase()}`}
      className={cn(
        "group inline-flex items-center gap-1 rounded-md text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active && "text-foreground",
        align === "right" && "flex-row-reverse",
      )}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span>{label}</span>
      <Icon
        aria-hidden
        className={cn(
          "size-3.5 transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
        )}
      />
    </button>
  );
}

/**
 * Results centerpiece: a sortable, keyboard-navigable leads table on desktop
 * (md+) that collapses to stacked cards on mobile. Rows behave like buttons —
 * click or Enter/Space selects a lead — and stagger in on mount.
 */
export function LeadsTable({
  leads,
  onSelect,
}: {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}) {
  const reduced = useReducedMotion();
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const next = [...leads];
    next.sort((a, b) => {
      const cmp = compareLeads(a, b, sortKey);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return next;
  }, [leads, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Sensible defaults: text ascending, numbers descending (best first).
      setSortDir(key === "company" ? "asc" : "desc");
    }
  }

  return (
    <section aria-label="Discovered leads">
      {/* Desktop: real table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border text-left">
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex justify-end">
                    <SortButton
                      label="Score"
                      align="right"
                      active={sortKey === "score"}
                      dir={sortDir}
                      onClick={() => toggleSort("score")}
                    />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex justify-end">
                    <SortButton
                      label="Confidence"
                      align="right"
                      active={sortKey === "confidence"}
                      dir={sortDir}
                      onClick={() => toggleSort("confidence")}
                    />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5">
                  <SortButton
                    label="Company"
                    active={sortKey === "company"}
                    dir={sortDir}
                    onClick={() => toggleSort("company")}
                  />
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/50"
                >
                  Top contact
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/50"
                >
                  Outreach angle
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/50"
                >
                  Flags
                </th>
              </tr>
            </thead>
            <motion.tbody
              initial={reduced ? undefined : "hidden"}
              animate={reduced ? undefined : "show"}
              variants={reduced ? undefined : ROW_CONTAINER}
            >
              {sorted.map((lead) => {
                const contact = topContact(lead);
                return (
                  <motion.tr
                    key={`${lead.company.name}-${lead.company.website}`}
                    variants={reduced ? undefined : ROW_ITEM}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${lead.company.name}`}
                    onClick={() => onSelect(lead)}
                    onKeyDown={makeRowKeyHandler(() => onSelect(lead))}
                    className="table-row-premium cursor-pointer align-top outline-none focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <td className="px-5 py-4 text-right align-middle">
                      <div className="flex justify-end">
                        <ScoreRing score={lead.overall_score} size={42} />
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <ConfidenceMeter value={lead.confidence} />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-semibold tracking-[-0.01em] text-foreground">
                          {lead.company.name}
                        </span>
                        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink
                            aria-hidden
                            className="size-3 shrink-0"
                          />
                          <span className="truncate">
                            {stripScheme(lead.company.website)}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <ContactCell contact={contact} />
                    </td>
                    <td className="max-w-[18rem] px-5 py-4 align-middle">
                      <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {lead.qualification.outreach_angle || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <FlagBadges flags={lead.flags} />
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <Stagger className="flex flex-col gap-3 md:hidden">
        {sorted.map((lead) => {
          const contact = topContact(lead);
          return (
            <StaggerItem
              key={`${lead.company.name}-${lead.company.website}`}
              y={8}
            >
              <Card
                role="button"
                tabIndex={0}
                aria-label={`Open ${lead.company.name}`}
                onClick={() => onSelect(lead)}
                onKeyDown={makeRowKeyHandler(() => onSelect(lead))}
                className="cursor-pointer p-4 outline-none transition-all duration-200 hover:bg-muted/50 hover:shadow-md focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-start gap-3">
                  <ScoreRing score={lead.overall_score} size={48} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium text-foreground">
                      {lead.company.name}
                    </span>
                    <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink aria-hidden className="size-3 shrink-0" />
                      <span className="truncate">
                        {stripScheme(lead.company.website)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-1">
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Confidence
                  </span>
                  <ConfidenceMeter value={lead.confidence} />
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <span className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Top contact
                  </span>
                  <ContactCell contact={contact} />
                </div>

                {lead.qualification.outreach_angle ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <span className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                      Outreach angle
                    </span>
                    <span className="line-clamp-3 text-sm text-muted-foreground">
                      {lead.qualification.outreach_angle}
                    </span>
                  </div>
                ) : null}

                {lead.flags.length > 0 ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <FlagBadges flags={lead.flags} />
                  </div>
                ) : null}
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
