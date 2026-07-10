import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Hammer, Network, ShieldCheck, Sparkles } from "lucide-react";

import { Eyebrow } from "@/components/marketing/eyebrow";
import { FeatureCard } from "@/components/marketing/feature-card";
import { FinalCta } from "@/components/marketing/final-cta";
import { LeadCardMock, TraceMiniMock } from "@/components/marketing/product-visuals";
import { Section } from "@/components/marketing/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { PRINCIPLES } from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why we built a lead-discovery engine that shows its work.",
};

const STORY = [
  {
    title: "Prospecting lists got too easy to buy and too hard to trust.",
    body: "A giant spreadsheet can look productive while still leaving you with the same work: checking whether each company fits, whether the signal is current, and whether the contact is real.",
  },
  {
    title: "Lead scoring should not ask for blind faith.",
    body: "A number without evidence is just another guess. Leadsmith AI keeps score, confidence, source signals, critic notes, and outreach angle together so you can inspect the reasoning.",
  },
  {
    title: "The product is built around pushback.",
    body: "The critic agent exists to challenge weak matches before they become part of your pipeline. A smaller list that survived review is more useful than a large list you distrust.",
  },
];

function StoryPanel() {
  return (
    <div className="premium-panel overflow-hidden rounded-2xl">
      {STORY.map((item, index) => (
        <div key={item.title} className="grid gap-3 border-b border-border p-5 last:border-b-0 sm:grid-cols-[4rem_1fr] sm:p-6">
          <span className="tnum font-mono text-2xl font-semibold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <Section className="surface-grid overflow-hidden pb-12 pt-24 sm:pb-14 sm:pt-28 lg:pb-16 lg:pt-32" py="none">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <Reveal>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                <Sparkles className="size-4 text-primary" aria-hidden />
                About Leadsmith AI
              </div>
              <h1 className="mt-6 font-display text-balance text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
                We think prospecting should show its work.
              </h1>
              <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Leadsmith AI is a multi-agent lead-discovery engine for people who want to know why a company belongs in the pipeline before they reach out.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                {["Evidence over volume", "Critic before output", "You stay in control"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-2">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden />
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/app">
                    Open the app
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/how-it-works">See how it works</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid gap-4">
              <LeadCardMock />
              <TraceMiniMock />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section py="sm">
        <div className="grid items-start gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <Reveal>
            <div className="max-w-xl">
              <Eyebrow icon={<Network aria-hidden />}>Why this exists</Eyebrow>
              <h2 className="mt-4 text-balance text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
                Better prospecting starts with evidence you can inspect.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We built Leadsmith AI because the hardest part of selling is not writing another email. It is knowing which companies deserve the first message.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <StoryPanel />
          </Reveal>
        </div>
      </Section>

      <Section id="principles" className="border-y border-border/70 bg-surface/35" py="sm">
        <Reveal>
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <Eyebrow icon={<ShieldCheck aria-hidden />}>Principles</Eyebrow>
              <h2 className="mt-4 text-balance text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
                The rules we build by.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:justify-self-end">
              A few commitments decide what ships: visible evidence, honest limits, useful specificity, and no fake certainty.
            </p>
          </div>
        </Reveal>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <StaggerItem key={p.title}>
              <FeatureCard icon={<p.icon aria-hidden />} title={p.title}>
                {p.body}
              </FeatureCard>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section py="sm">
        <Reveal>
          <div className="premium-panel relative isolate overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-[62ch]">
                <Eyebrow icon={<Hammer aria-hidden />}>Building in the open</Eyebrow>
                <h2 className="mt-4 text-balance text-[clamp(1.75rem,2.8vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-foreground">
                  A small team, building transparently.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  The product gets better when users point out weak matches, missing signals, confusing scores, and workflows that should be faster. Send feedback directly to{" "}
                  <a className="font-medium text-link underline-offset-4 hover:underline" href={`mailto:${siteConfig.email}`}>
                    {siteConfig.email}
                  </a>
                  .
                </p>
              </div>
              <Button asChild size="lg" variant="secondary" className="shrink-0">
                <Link href="/contact">
                  Send us feedback
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
