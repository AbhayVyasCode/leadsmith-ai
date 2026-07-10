"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { Contact, EmailConfidence, Lead } from "@/lib/types";
import { ScoreRing } from "@/components/app/score-ring";
import { ConfidenceMeter } from "@/components/app/confidence-meter";

const EASE = [0.32, 0.72, 0, 1] as const;

const ROW_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const ROW_ITEM = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

export type SortKey = "score" | "confidence" | "company";
export type SortDir = "asc" | "desc";

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

const EMAIL_CONFIDENCE: Record<
  EmailConfidence,
  { variant: BadgeVariant; label: string }
> = {
  found: { variant: "success", label: "Found" },
  guessed: { variant: "warning", label: "Guessed" },
  unknown: { variant: "default", label: "Unknown" },
  verified: { variant: "success", label: "Verify" },
  verify: { variant: "success", label: "Verify" },
};

const FLAG_META: Record<string, { variant: BadgeVariant; label: string }> = {
  "weak-evidence": { variant: "warning", label: "Weak evidence" },
  "rejected-by-critic": { variant: "danger", label: "Rejected" },
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

function compareLeads(a: Lead, b: Lead, key: SortKey): number {
  if (key === "company") return a.company.name.localeCompare(b.company.name);
  if (key === "confidence") return a.confidence - b.confidence;
  return a.overall_score - b.overall_score;
}

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
    return <span className="text-[12px] text-muted-foreground/30">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => {
        const meta = flagMeta(flag);
        return (
          <Badge key={flag} variant={meta.variant} className="text-[10px]">
            {meta.label}
          </Badge>
        );
      })}
    </div>
  );
}

function ContactCell({ contact }: { contact: Contact | null }) {
  if (!contact) {
    return <span className="text-[12px] text-muted-foreground/30">—</span>;
  }
  const conf = EMAIL_CONFIDENCE[contact.email_confidence];
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[13px] font-medium text-foreground/80">
        {contact.name}
      </span>
      <span className="truncate text-[11px] text-muted-foreground/40">
        {contact.role}
      </span>
      {contact.email ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <Mail aria-hidden className="size-3 shrink-0 text-muted-foreground/30" />
          <span className="tnum truncate font-mono text-[11px] text-foreground/60">
            {contact.email}
          </span>
          {contact.email_confidence !== "guessed" && (
            <Badge variant={conf.variant} className="shrink-0 text-[9px]">
              {conf.label}
            </Badge>
          )}
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground/30">No email</span>
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
        "group inline-flex items-center gap-1 rounded text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/40 transition-colors hover:text-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active && "text-foreground/70",
        align === "right" && "flex-row-reverse",
      )}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span>{label}</span>
      <Icon
        aria-hidden
        className={cn(
          "size-3 transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-30",
        )}
      />
    </button>
  );
}

export function LeadsTable({
  leads,
  onSelect,
  sortKey,
  sortDir,
  onSortChange,
}: {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey, dir: SortDir) => void;
}) {
  const reduced = useReducedMotion();

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
      onSortChange(key, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortChange(key, key === "company" ? "asc" : "desc");
    }
  }

  return (
    <section aria-label="Discovered leads">
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-white/[0.06] md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/[0.06] text-left">
                <th scope="col" className="px-4 py-3 text-right">
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
                <th scope="col" className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <SortButton
                      label="Conf"
                      align="right"
                      active={sortKey === "confidence"}
                      dir={sortDir}
                      onClick={() => toggleSort("confidence")}
                    />
                  </div>
                </th>
                <th scope="col" className="px-4 py-3">
                  <SortButton
                    label="Company"
                    active={sortKey === "company"}
                    dir={sortDir}
                    onClick={() => toggleSort("company")}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/30"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/30"
                >
                  Angle
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/30"
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
                    className="cursor-pointer border-b border-white/[0.03] align-top outline-none transition-colors duration-100 hover:bg-white/[0.02] focus-visible:bg-white/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring last:border-b-0"
                  >
                    <td className="px-4 py-3.5 text-right align-middle">
                      <div className="flex justify-end">
                        <ScoreRing score={lead.overall_score} size={38} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <ConfidenceMeter value={lead.confidence} />
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium text-foreground/80">
                          {lead.company.name}
                        </span>
                        <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground/40">
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
                    <td className="px-4 py-3.5 align-middle">
                      <ContactCell contact={contact} />
                    </td>
                    <td className="max-w-[16rem] px-4 py-3.5 align-middle">
                      <span className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground/50">
                        {lead.qualification.outreach_angle || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <FlagBadges flags={lead.flags} />
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <Stagger className="flex flex-col gap-2 md:hidden">
        {sorted.map((lead) => {
          const contact = topContact(lead);
          return (
            <StaggerItem
              key={`${lead.company.name}-${lead.company.website}`}
              y={6}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`Open ${lead.company.name}`}
                onClick={() => onSelect(lead)}
                onKeyDown={makeRowKeyHandler(() => onSelect(lead))}
                className="cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 outline-none transition-all duration-150 hover:bg-white/[0.03] focus-visible:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-start gap-3">
                  <ScoreRing score={lead.overall_score} size={44} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[13px] font-medium text-foreground/80">
                      {lead.company.name}
                    </span>
                    <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground/40">
                      <ExternalLink aria-hidden className="size-3 shrink-0" />
                      <span className="truncate">
                        {stripScheme(lead.company.website)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <ConfidenceMeter value={lead.confidence} />
                </div>

                {contact && (
                  <div className="mt-3 border-t border-white/[0.04] pt-3">
                    <ContactCell contact={contact} />
                  </div>
                )}

                {lead.qualification.outreach_angle && (
                  <div className="mt-3 border-t border-white/[0.04] pt-3">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/30">
                      Angle
                    </span>
                    <span className="line-clamp-2 text-[12px] text-muted-foreground/50">
                      {lead.qualification.outreach_angle}
                    </span>
                  </div>
                )}

                {lead.flags.length > 0 && (
                  <div className="mt-3 border-t border-white/[0.04] pt-3">
                    <FlagBadges flags={lead.flags} />
                  </div>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
