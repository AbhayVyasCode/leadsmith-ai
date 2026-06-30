import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CornerDownLeft,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { PipelineStrip } from "@/components/marketing/animated-visuals";
import { CtaGroup } from "@/components/marketing/cta";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { FinalCta } from "@/components/marketing/final-cta";
import { LeadsTableMock } from "@/components/marketing/product-visuals";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { USE_CASES, type UseCase } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Use cases",
  description:
    "Founders, SDR teams, agencies, recruiters, and more describe who they need to reach, then Leadsmith AI finds and qualifies matching companies.",
};

function HeroUseCasePanel() {
  const featured = USE_CASES.slice(0, 3);

  return (
    <div className="premium-panel h-full overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Use-case router</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">product signal -&gt; buyer list</p>
        </div>
        <Badge variant="success">ready</Badge>
      </div>

      <div className="mt-4 grid gap-2.5">
        {featured.map((use, index) => (
          <Link
            key={use.key}
            href={`#${use.key}`}
            className="group grid min-h-[72px] gap-3 rounded-xl border border-border bg-surface/80 p-3 transition-[border-color,background-color] duration-200 hover:border-primary/35 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:grid-cols-[2.25rem_1fr_auto]"
          >
            <span className="tnum flex size-9 items-center justify-center rounded-lg bg-primary-soft font-mono text-xs font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{use.persona}</p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{use.jtbd}</p>
            </div>
            <ArrowRight
              className="hidden size-4 self-center text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
              aria-hidden
            />
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background/70 p-4">
        <PipelineStrip />
      </div>
    </div>
  );
}

function UseCaseIndex() {
  return (
    <Section py="sm" className="border-y border-border/70 bg-surface/40">
      <Reveal>
        <div className="grid gap-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary">
              Choose your motion
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start from the way you sell, hire, invest, or partner. The workflow stays the same:
              describe the target, inspect the evidence, use the ranked list.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((use) => (
              <Link
                key={use.key}
                href={`#${use.key}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/80 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <use.icon className="size-4 text-primary" aria-hidden />
                {use.persona.replace(" and ", " + ")}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function QueryCard({ use }: { use: UseCase }) {
  return (
    <div className="premium-panel h-full overflow-hidden rounded-2xl">
      <div className="border-b border-border px-5 py-4">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Plain-English input
        </span>

        <div className="mt-3 flex min-h-[72px] items-center gap-3 rounded-xl border border-input bg-background px-4 py-3.5 shadow-sm">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="min-w-0 flex-1 font-mono text-sm leading-relaxed text-foreground">
            {use.query}
          </p>
          <CornerDownLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
      </div>

      <div className="px-5 py-4">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Qualified output
        </span>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{use.returns}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {["Ranked accounts", "Evidence", "Draft angle"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-2 text-xs font-medium text-foreground"
            >
              <Check className="size-3.5 text-primary" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonaBlock({ use, reverse }: { use: UseCase; reverse: boolean }) {
  const Icon = use.icon;

  return (
    <Section id={use.key} py="sm" className={cn("border-b border-border/60", reverse && "bg-surface/25")}>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-10">
        <Reveal className={cn(reverse && "lg:order-2")}>
          <div className="max-w-2xl lg:pt-1">
            <span
              className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-6"
              aria-hidden
            >
              <Icon />
            </span>
            <p className="mt-4 font-mono text-sm font-medium uppercase tracking-[0.08em] text-primary">
              Use case
            </p>
            <h2 className="mt-2 text-balance text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-foreground">
              {use.persona}
            </h2>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              {use.jtbd}
            </p>

            <div className="mt-5 grid gap-3">
              <p className="flex items-start gap-2.5 text-base font-medium leading-relaxed text-foreground">
                <Target className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <span>{use.outcome}</span>
              </p>
              <p className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <span>
                  Every account comes with a reason, confidence, and the source signal that made it
                  worth reviewing.
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05} className={cn(reverse && "lg:order-1")}>
          <div className="grid gap-3">
            <QueryCard use={use} />
            <LeadsTableMock />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default function UseCasesPage() {
  return (
    <>
      <Section className="surface-grid overflow-hidden pb-12 pt-24 sm:pb-14 sm:pt-28 lg:pb-16 lg:pt-32" py="none">
        <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
          <Reveal>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                <Sparkles className="size-4 text-primary" aria-hidden />
                Use cases
              </div>
              <h1 className="mt-6 font-display text-balance text-[clamp(2.75rem,6vw,5.15rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
                Find the right companies for the way you go to market.
              </h1>
              <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Founders, SDRs, agencies, recruiters, investors, and partnership teams can all start
                the same way: describe the target account in plain English and inspect the ranked
                list before taking action.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {["Product-led prospecting", "Evidence-backed lists", "Draft outreach included"].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-foreground"
                    >
                      <Check className="size-3.5 text-primary" aria-hidden />
                      {item}
                    </span>
                  ),
                )}
              </div>
              <CtaGroup
                className="mt-7"
                align="start"
                secondaryLabel="See how it works"
                secondaryHref="/how-it-works"
                trust={null}
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <HeroUseCasePanel />
          </Reveal>
        </div>
      </Section>

      <UseCaseIndex />

      {USE_CASES.map((use, i) => (
        <PersonaBlock key={use.key} use={use} reverse={i % 2 === 1} />
      ))}

      <Section py="sm">
        <Reveal>
          <div className="premium-panel relative isolate overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40"
              style={{
                maskImage:
                  "radial-gradient(ellipse 70% 70% at 50% 50%, var(--foreground) 0%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 70% at 50% 50%, var(--foreground) 0%, transparent 75%)",
              }}
            />
            <Eyebrow>Your use case</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-[28ch] text-balance text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
              If you can describe the account, Leadsmith AI can test the market.
            </h2>
            <p className="mx-auto mt-3 max-w-[48ch] text-balance text-lg leading-relaxed text-muted-foreground">
              The persona matters less than the buying signal. Start with a sentence, then inspect
              the companies, evidence, contacts, and draft angles that come back.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href="/product">
                  See the product
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/how-it-works">
                  See how it works
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      <FinalCta />
    </>
  );
}
