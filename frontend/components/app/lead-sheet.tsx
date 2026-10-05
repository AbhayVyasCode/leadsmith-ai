"use client";

import { Check, Copy, ExternalLink, Linkedin, Quote } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { toast } from "sonner";
import { FlagBadges } from "@/components/app/lead-list";
import { Badge } from "@/components/ui/badge";
import { EmailLabel, emailMeta } from "@/components/ui/email-label";
import { ConfidenceMeter } from "@/components/ui/meter";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/overlays";
import { ScoreRing } from "@/components/ui/score-ring";
import { DIMENSION_LABELS, type Lead } from "@/lib/types";
import { cn } from "@/lib/cn";
import { hostOf, hrefOf, scoreBand } from "@/lib/utils";

const VERDICT: Record<string, { tone: "ok" | "warn" | "bad"; label: string; text: string }> = {
  accept: { tone: "ok", label: "Accept", text: "The scores hold up against the page." },
  weak: { tone: "warn", label: "Weak", text: "Plausible, but thinly supported." },
  reject: { tone: "bad", label: "Disagrees", text: "The critic thinks the evidence contradicts the fit. Kept so you can judge." },
};

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-line px-6 py-6 sm:px-8", className)}>
      <h3 className="eyebrow text-ink-3">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success(`${label} copied`);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          toast.error("Couldn’t copy — select the text instead.");
        }
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[0.78rem] text-ink-2 transition-colors hover:border-line-2 hover:text-ink"
    >
      {done ? <Check className="size-3.5 text-ok" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {done ? "Copied" : `Copy ${label.toLowerCase()}`}
    </button>
  );
}

export function LeadSheet({ lead, onOpenChange }: { lead: Lead | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={Boolean(lead)} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>{lead ? <CaseFile lead={lead} /> : null}</SheetContent>
    </Sheet>
  );
}

function CaseFile({ lead }: { lead: Lead }) {
  const q = lead.qualification;
  const verdict = lead.critique ? (VERDICT[lead.critique.verdict?.toLowerCase?.() ?? ""] ?? { tone: "warn" as const, label: lead.critique.verdict || "Unclear", text: "The critic returned an unusual verdict." }) : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto overscroll-contain">
      {/* Header */}
      <div className="px-6 pb-6 pt-7 sm:px-8">
        <div className="flex items-start gap-5 pr-10">
          <ScoreRing score={lead.overall_score} size={72} />
          <div className="min-w-0">
            <SheetTitle className="font-display text-[2.2rem] leading-[1.02] text-ink">{lead.company.name}</SheetTitle>
            <SheetDescription asChild>
              <a
                href={hrefOf(lead.company.website)}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[0.8rem] text-ink-2 underline-offset-4 hover:text-ember-ink hover:underline"
              >
                {hostOf(lead.company.website)}
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </SheetDescription>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="mb-1.5 text-[0.8rem] text-ink-3">Evidence confidence</p>
            <ConfidenceMeter value={lead.confidence} className="max-w-[18rem]" />
          </div>
          <FlagBadges flags={lead.flags} />
        </div>
      </div>

      {q.outreach_angle || q.reasoning ? (
        <Section title="Why it fits">
          {q.outreach_angle ? <p className="font-display text-[1.55rem] leading-[1.25] text-ink">{q.outreach_angle}</p> : null}
          {q.reasoning ? <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{q.reasoning}</p> : null}
        </Section>
      ) : null}

      <Section title="Scorecard">
        <div className="grid grid-cols-1 gap-5">
          {q.dimensions.map((d) => {
            const v = Math.max(0, Math.min(100, Math.round(d.score)));
            const band = scoreBand(v);
            return (
              <div key={d.dimension}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-ink">{DIMENSION_LABELS[d.dimension] ?? d.dimension}</span>
                  <span className="font-mono text-sm text-ink tnum">
                    {v}
                    <span className="text-ink-3"> · conf {d.confidence.toFixed(2)}</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
                  <div
                    className={cn("h-full origin-left rounded-full", band === "high" ? "bg-ok" : band === "mid" ? "bg-warn" : "bg-bad")}
                    style={{ transform: `scaleX(${v / 100})`, animation: "none" } as CSSProperties}
                  />
                </div>
                {d.evidence ? <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-2">{d.evidence}</p> : null}
                {d.evidence_quote ? (
                  <blockquote className="mt-2 flex gap-2 border-l-2 border-ember pl-3 font-display text-[1.08rem] italic leading-snug text-ink">
                    <Quote className="mt-1 size-3.5 shrink-0 text-ember-ink" aria-hidden />
                    {d.evidence_quote}
                  </blockquote>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      {q.matched_pain_points.length || q.signals.length ? (
        <Section title="Signals & pains">
          <div className="grid grid-cols-1 gap-4">
            {q.matched_pain_points.length ? (
              <div>
                <p className="mb-2 text-[0.8rem] text-ink-3">Matched pains</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.matched_pain_points.map((p) => (
                    <Badge key={p} tone="warn">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {q.signals.length ? (
              <div>
                <p className="mb-2 text-[0.8rem] text-ink-3">Buying signals</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.signals.map((p) => (
                    <Badge key={p} tone="ember">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {lead.critique && verdict ? (
        <Section title="Critic">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={verdict.tone} className="h-7 px-3 text-[0.8rem]">
              {verdict.label}
            </Badge>
            <span className="font-mono text-[0.8rem] text-ink-2">confidence −{lead.critique.confidence_penalty.toFixed(2)}</span>
          </div>
          <p className="mt-3 text-[0.92rem] text-ink-2">{verdict.text}</p>
          {lead.critique.issues.length ? (
            <ul className="mt-4 grid grid-cols-1 gap-2">
              {lead.critique.issues.map((issue) => (
                <li key={issue} className="rounded-xl border border-line bg-panel px-3.5 py-2.5 text-[0.88rem] text-ink">
                  {issue}
                </li>
              ))}
            </ul>
          ) : null}
          {lead.critique.missing_evidence.length ? (
            <ul className="mt-3 grid grid-cols-1 gap-2">
              {lead.critique.missing_evidence.map((m) => (
                <li key={m} className="rounded-xl border border-dashed border-line-2 px-3.5 py-2.5 text-[0.85rem] text-ink-2">
                  Missing: {m}
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : null}

      <Section title="People">
        {lead.contacts.length ? (
          <ul className="grid grid-cols-1 gap-2.5">
            {lead.contacts.map((c, i) => {
              const kind = c.email ? c.email_confidence : "unknown";
              return (
                <li key={`${c.name}-${i}`} className="rounded-2xl border border-line bg-panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-[0.85rem] text-ink-3">{c.role}</p>
                    </div>
                    <EmailLabel kind={kind} />
                  </div>
                  <p className="mt-2 text-[0.78rem] text-ink-3">{emailMeta(kind).hint}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {c.email ? (
                      <>
                        <span className="mr-1 truncate font-mono text-[0.82rem] text-ink">{c.email}</span>
                        <CopyButton text={c.email} label="Email" />
                      </>
                    ) : null}
                    {c.linkedin ? (
                      <a
                        href={hrefOf(c.linkedin)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[0.78rem] text-ink-2 hover:text-ink"
                      >
                        <Linkedin className="size-3.5" aria-hidden />
                        Profile
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[0.92rem] text-ink-2">No people found on the site or in public search.</p>
        )}
      </Section>

      {lead.outreach ? (
        <Section title="Draft opener">
          <div className="rounded-2xl border border-line bg-panel">
            <p className="border-b border-line px-4 py-3 text-[0.92rem] text-ink">
              <span className="mr-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">Subject</span>
              {lead.outreach.subject}
            </p>
            <p className="whitespace-pre-line px-4 py-4 text-[0.92rem] leading-relaxed text-ink-2">{lead.outreach.body}</p>
          </div>
          <div className="mt-3">
            <CopyButton text={`Subject: ${lead.outreach.subject}\n\n${lead.outreach.body}`} label="Draft" />
          </div>
        </Section>
      ) : null}

      {lead.recalled_context.length ? (
        <Section title="From memory">
          <ul className="grid grid-cols-1 gap-2">
            {lead.recalled_context.map((r) => (
              <li key={r} className="rounded-xl bg-panel-2 px-3.5 py-2.5 text-[0.84rem] leading-snug text-ink-2">
                {r}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {lead.links.length ? (
        <Section title="Links" className="pb-10">
          <ul className="flex flex-wrap gap-2">
            {lead.links.map((link) => (
              <li key={link}>
                <a
                  href={hrefOf(link)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[0.75rem] text-ink-2 hover:text-ink"
                >
                  {hostOf(link)}
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <div className="pb-6" />
      )}
    </div>
  );
}
