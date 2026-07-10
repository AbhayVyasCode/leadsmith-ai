import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Check, ShieldCheck, Workflow } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaGroup } from "@/components/marketing/cta";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { Accordion } from "@/components/marketing/accordion";
import { FinalCta } from "@/components/marketing/final-cta";
import { PipelineStrip } from "@/components/marketing/animated-visuals";
import {
  ScoreArc,
  OutreachMock,
  MetricsMock,
  TraceMiniMock,
} from "@/components/marketing/product-visuals";
import { AGENTS, TRACE, TRANSPARENCY, FAQ_GROUPS } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From one sentence to a ranked pipeline — and you can watch every step Leadsmith AI takes.",
};

/* The "How it works" FAQ group, surfaced as a 3-item mini-FAQ. */
const HOW_FAQ = FAQ_GROUPS.find((g) => g.group === "How it works")?.items ?? [];

/* ---------- Per-step illustrative visuals ---------- */
const ICP_CHIPS = ["E-commerce", "EU", "50–200 staff", "Weak SEO", "Shopify"];

function HeroPipelinePanel() {
  return (
    <div className="premium-panel relative overflow-hidden rounded-2xl p-4 shadow-sm sm:p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent-warm)),hsl(var(--success)))]" />
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Pipeline preview</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">input: one plain-English sentence</p>
        </div>
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
          visible run
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/70 p-3.5">
        <p className="font-mono text-sm leading-relaxed text-foreground">
          Find DTC brands with paid acquisition spend and weak organic search.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {AGENTS.map((agent, index) => (
          <div
            key={agent.key}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-3 py-3 transition-[border-color,background-color] duration-200 hover:border-primary/35 hover:bg-surface"
          >
            <span className="tnum flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-mono text-xs font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{agent.label}</p>
              <p className="truncate text-xs text-muted-foreground">{agent.oneLiner}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface/70 p-4">
        <PipelineStrip />
      </div>
    </div>
  );
}

function StepVisual({ stepKey }: { stepKey: string }) {
  switch (stepKey) {
    case "intent":
      return (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 truncate font-mono text-xs text-foreground sm:text-sm">
            &ldquo;mid-sized e-commerce brands in the EU with weak SEO&rdquo;
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ICP_CHIPS.map((c) => (
              <Badge key={c} variant="primary">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      );

    case "discovery":
      return (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {[
            { name: "Northwind Apparel", domain: "northwind.co" },
            { name: "Cedar & Co.", domain: "cedarandco.com" },
          ].map((row) => (
            <div key={row.domain} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{row.domain}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                <Check className="size-3 text-primary" aria-hidden />
                open web
              </span>
            </div>
          ))}
        </div>
      );

    case "qualify":
      return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
          <ScoreArc value={86} />
          <div>
            <p className="text-sm font-medium text-foreground">Fit score</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Six dimensions, combined into one confidence-weighted number.
            </p>
          </div>
        </div>
      );

    case "critic":
      return (
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success-soft px-2.5 py-1 font-mono text-xs text-success">
              <ShieldCheck className="size-3" aria-hidden />
              verdict: accepted
            </span>
            <span className="font-mono text-xs text-muted-foreground">Northwind</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning-soft px-2.5 py-1 font-mono text-xs text-warning">
              <ShieldCheck className="size-3" aria-hidden />
              verdict: weak-evidence
            </span>
            <span className="font-mono text-xs text-muted-foreground">Brightloop</span>
          </div>
        </div>
      );

    case "enrich":
      return (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Maya Chen</p>
              <p className="truncate text-xs text-muted-foreground">Head of Growth</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
              <ShieldCheck className="size-2.5" aria-hidden />
              verified
            </span>
          </div>
          <p className="mt-2 truncate font-mono text-xs text-link">maya@northwind.co</p>
        </div>
      );

    case "outreach":
      return <OutreachMock />;

    default:
      return null;
  }
}

/* ---------- Vertical numbered timeline ---------- */
function StepTimeline() {
  return (
    <ol className="relative ml-3 border-l border-border sm:ml-4">
      {AGENTS.map((agent, i) => {
        const num = String(i + 1).padStart(2, "0");
        return (
          <li key={agent.key} className="relative pb-14 pl-8 last:pb-0 sm:pl-12">
            {/* node marker on the rule */}
            <span
              aria-hidden
              className="absolute -left-[13px] top-0 flex size-6 items-center justify-center rounded-full border border-border bg-surface sm:-left-[17px]"
            >
              <span className="flex size-3 items-center justify-center rounded-full bg-primary-soft text-primary [&_svg]:size-3">
                <agent.icon aria-hidden />
              </span>
            </span>

            <Reveal>
              <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-start lg:gap-10">
                <div>
                  <p className="tnum font-mono text-sm font-medium tracking-[0.04em] text-primary">
                    {num} — {agent.label}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.015em] text-foreground">
                    {agent.oneLiner}
                  </h3>
                  <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
                    {agent.detail}
                  </p>
                </div>
                <div className="lg:pt-1">
                  <StepVisual stepKey={agent.key} />
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Transparency: "You can see everything" ---------- */
function TransparencyItem({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary [&_svg]:size-4.5">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      {/* 1) Hero */}
      <Section className="surface-grid overflow-hidden pt-24 sm:pt-28 lg:pt-32" py="none">
        <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <Reveal>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
              <Workflow className="size-4 text-primary" aria-hidden />
              How it works
            </div>
            <h1 className="mt-6 font-display text-balance text-[clamp(2.75rem,6vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              Leadsmith AI works from one sentence to a ranked pipeline.
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Describe your best buyer in plain English. Leadsmith AI turns it into intent, discovery, qualification, critic review, enrichment, and outreach you can inspect before you sell.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
            {["No paid data APIs", "No credit card", "Every step visible"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-foreground"
              >
                <Check className="size-3.5 text-primary" aria-hidden />
                {item}
              </span>
            ))}
            </div>

            <CtaGroup
              className="mt-8"
              align="start"
              secondaryLabel="Explore the product"
              secondaryHref="/product"
              trust={null}
            />
            <a
              href="#steps"
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-link underline-offset-4 hover:underline"
            >
              Review the six-agent pipeline
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
          </Reveal>

          <Reveal delay={0.05}>
            <HeroPipelinePanel />
          </Reveal>
        </div>
      </Section>

      {/* 2) The six steps — vertical numbered timeline */}
      <Section id="steps">
        <Reveal>
          <SectionHeading
            eyebrow="The pipeline"
            title="Six agents, one job each."
            lead="A supervisor hands work to specialized agents in order — and each one passes its output to the next."
          />
        </Reveal>
        <div className="mt-14">
          <StepTimeline />
        </div>
      </Section>

      {/* 3) You can see everything — transparency */}
      <Section id="transparency">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={TRACE.label}
                title="You can see everything."
                lead={TRACE.detail}
              />
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {TRANSPARENCY.map((t) => (
                <Reveal key={t.title}>
                  <TransparencyItem icon={<t.icon aria-hidden />} title={t.title} body={t.body} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <Reveal>
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
                <p className="mb-4 text-sm font-medium text-foreground">Every run shows its metrics</p>
                <MetricsMock />
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
                <p className="mb-4 text-sm font-medium text-foreground">A live trace of every step</p>
                <TraceMiniMock />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 4) Mini-FAQ */}
      <Section id="faq">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              eyebrowIcon={<Workflow aria-hidden />}
              title="How the pipeline works."
              lead="The questions people ask most about what happens behind a search."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <Accordion items={[...HOW_FAQ]} defaultOpen={0} />
          </Reveal>
        </div>
      </Section>

      {/* 5) Final CTA */}
      <FinalCta />
    </>
  );
}
