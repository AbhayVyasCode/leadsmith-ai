"use client";

import { ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, scoreBand } from "@/lib/utils";
import {
  DIMENSION_LABELS,
  type Contact,
  type CritiqueVerdict,
  type DimensionScore,
  type EmailConfidence,
  type Lead,
} from "@/lib/types";
import { ScoreRing } from "@/components/app/score-ring";
import { ConfidenceMeter } from "@/components/app/confidence-meter";
import { OutreachCard } from "@/components/app/outreach-card";

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

/** Score-band token for the inline dimension bar fill (paired with the numeral). */
const BAND_BAR = {
  high: "bg-success",
  mid: "bg-warning",
  low: "bg-danger",
} as const;

const VERDICT_META: Record<
  CritiqueVerdict,
  { variant: BadgeVariant; label: string }
> = {
  accept: { variant: "success", label: "Accept" },
  weak: { variant: "warning", label: "Weak" },
  reject: { variant: "danger", label: "Reject" },
};

const EMAIL_CONFIDENCE: Record<
  EmailConfidence,
  { variant: BadgeVariant; label: string }
> = {
  found: { variant: "success", label: "Found" },
  guessed: { variant: "warning", label: "Guessed" },
  unknown: { variant: "default", label: "Unknown" },
};

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

function stripScheme(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function href(website: string): string {
  return /^https?:\/\//.test(website) ? website : `https://${website}`;
}

/** Small uppercase eyebrow that labels each section of the drawer. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </h3>
  );
}

/** One dimension: label, an inline fill bar, the score, confidence, and evidence. */
function DimensionRow({ dim }: { dim: DimensionScore }) {
  const clamped = Math.max(0, Math.min(100, dim.score));
  const band = scoreBand(clamped);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          {DIMENSION_LABELS[dim.dimension] ?? dim.dimension}
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="tnum font-mono text-sm font-medium text-foreground">
            {Math.round(clamped)}
          </span>
          <span className="tnum font-mono text-xs text-muted-foreground">
            {dim.confidence.toFixed(2)}
          </span>
        </span>
      </div>
      <span
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label={`${DIMENSION_LABELS[dim.dimension] ?? dim.dimension} score ${Math.round(clamped)} of 100`}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-full origin-left rounded-full",
            BAND_BAR[band],
          )}
          style={{ transform: `scaleX(${clamped / 100})` }}
        />
      </span>
      {dim.evidence ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {dim.evidence}
        </p>
      ) : null}
    </div>
  );
}

function ChipRow({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-muted-foreground">None recorded</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
        >
          <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-border" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ContactRow({ contact }: { contact: Contact }) {
  const conf = EMAIL_CONFIDENCE[contact.email_confidence];
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface-2 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          {contact.name}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {contact.role}
        </span>
      </div>
      {contact.email ? (
        <span className="flex min-w-0 items-center gap-2">
          <Mail aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="tnum min-w-0 flex-1 truncate font-mono text-xs text-foreground">
            {contact.email}
          </span>
          <Badge variant={conf.variant} className="shrink-0">
            {conf.label}
          </Badge>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">No email found</span>
      )}
    </div>
  );
}

/**
 * Side drawer presenting the full anatomy of a single lead — score + confidence,
 * per-dimension scoring with evidence, matched pains and signals, the critic's
 * verdict, recalled memory context, contacts, and the outreach draft. Opens from
 * the right and keeps the leads list in view (a sheet, not a modal). Renders an
 * empty body when no lead is selected so the close animation can play.
 */
export function LeadDrawer({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        {lead ? (
          <>
            <SheetHeader className="gap-2 border-b border-border p-6 pr-14">
              <SheetTitle className="text-balance">{lead.company.name}</SheetTitle>
              <a
                href={href(lead.company.website)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm text-link underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ExternalLink aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{stripScheme(lead.company.website)}</span>
              </a>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-8 p-6">
                {/* Score + confidence + flags */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={lead.overall_score} size={56} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Overall confidence
                      </span>
                      <ConfidenceMeter value={lead.confidence} />
                    </div>
                  </div>
                  {lead.flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {lead.flags.map((flag) => {
                        const meta = flagMeta(flag);
                        return (
                          <Badge key={flag} variant={meta.variant}>
                            {meta.label}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : null}
                </section>

                {/* Scoring */}
                <section className="flex flex-col gap-4">
                  <SectionLabel>Scoring</SectionLabel>
                  <div className="flex flex-col gap-5">
                    {lead.qualification.dimensions.map((dim) => (
                      <DimensionRow key={dim.dimension} dim={dim} />
                    ))}
                  </div>
                </section>

                {/* Matched pains + signals */}
                <section className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <SectionLabel>Matched pain points</SectionLabel>
                    <ChipRow items={lead.qualification.matched_pain_points} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <SectionLabel>Buying signals</SectionLabel>
                    <ChipRow items={lead.qualification.signals} />
                  </div>
                </section>

                {/* Critic verdict */}
                {lead.critique ? (
                  <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <SectionLabel>Critic verdict</SectionLabel>
                      <Badge variant={VERDICT_META[lead.critique.verdict].variant}>
                        {VERDICT_META[lead.critique.verdict].label}
                      </Badge>
                    </div>
                    {lead.critique.issues.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-foreground">
                          Issues
                        </span>
                        <BulletList items={lead.critique.issues} />
                      </div>
                    ) : null}
                    {lead.critique.missing_evidence.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-foreground">
                          Missing evidence
                        </span>
                        <BulletList items={lead.critique.missing_evidence} />
                      </div>
                    ) : null}
                    {lead.critique.issues.length === 0 &&
                    lead.critique.missing_evidence.length === 0 ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        No issues raised — evidence is grounded.
                      </p>
                    ) : null}
                  </section>
                ) : null}

                {/* Recalled context */}
                {lead.recalled_context.length > 0 ? (
                  <section className="flex flex-col gap-3">
                    <SectionLabel>Recalled from memory</SectionLabel>
                    <BulletList items={lead.recalled_context} />
                  </section>
                ) : null}

                {/* Contacts */}
                <section className="flex flex-col gap-3">
                  <SectionLabel>Contacts</SectionLabel>
                  {lead.contacts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {lead.contacts.map((contact, i) => (
                        <ContactRow
                          key={`${contact.name}-${contact.email ?? i}`}
                          contact={contact}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No contacts surfaced yet.
                    </span>
                  )}
                </section>

                {/* Outreach */}
                {lead.outreach ? (
                  <section className="flex flex-col gap-3">
                    <SectionLabel>Outreach</SectionLabel>
                    <OutreachCard
                      outreach={lead.outreach}
                      company={lead.company.name}
                    />
                  </section>
                ) : null}
              </div>
            </ScrollArea>
          </>
        ) : (
          <SheetHeader className="p-6 pr-14">
            <SheetTitle className="text-muted-foreground">No lead selected</SheetTitle>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  );
}
