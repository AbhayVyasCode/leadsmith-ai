import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Check, Mail, ShieldCheck } from "lucide-react";

import { Section } from "@/components/marketing/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { CtaGroup } from "@/components/marketing/cta";
import { Stat } from "@/components/marketing/stat";
import { FinalCta } from "@/components/marketing/final-cta";
import { Reveal } from "@/components/motion/reveal";
import {
  LeadCardMock,
  LeadsTableMock,
  OutreachMock,
  TraceMiniMock,
} from "@/components/marketing/product-visuals";
import {
  PipelineStrip,
  SearchMock,
} from "@/components/marketing/animated-visuals";
import { cn } from "@/lib/utils";
import {
  AGENTS,
  TRACE,
  DIFFERENTIATORS,
  EXAMPLE_QUERIES,
  type Agent,
} from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Product",
  description:
    "See how Leadsmith AI's agents discover, qualify, critique, enrich, and draft outreach — with the evidence behind every lead.",
};

/* Helper to pull an agent by key, with a narrowing assertion. */
function agent(key: string): Agent {
  const found = AGENTS.find((a) => a.key === key);
  if (!found) throw new Error(`Unknown agent: ${key}`);
  return found;
}

const intent = agent("intent");
const discovery = agent("discovery");
const qualify = agent("qualify");
const critic = agent("critic");
const enrich = agent("enrich");
const outreach = agent("outreach");

/* ------------------------------------------------------------------ */
/* Shared building blocks for the alternating capability blocks         */
/* ------------------------------------------------------------------ */

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-3">
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One anchored capability block: text column + visual column, alternating which
 * side the visual sits on for large screens (visual stacks below text on mobile).
 */
function CapabilityBlock({
  id,
  eyebrow,
  headline,
  detail,
  bullets,
  visual,
  reverse = false,
}: {
  id: string;
  eyebrow: string;
  headline: string;
  detail: ReactNode;
  bullets: string[];
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <Section id={id}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn(reverse && "lg:order-2")}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display text-balance text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
            {headline}
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            {detail}
          </p>
          <BulletList items={bullets} />
        </Reveal>

        <Reveal delay={0.05} className={cn(reverse && "lg:order-1")}>
          {visual}
        </Reveal>
      </div>
    </Section>
  );
}

/* A small composed "critic verdict" card (tokens only) for the evidence block. */
function CriticVerdictCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Critic verdict
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
          <ShieldCheck className="size-3" aria-hidden />
          accepted
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Holds up. </span>
        Ranking and migration signals are both independently sourced, so the fit
        score is well-supported.
      </p>
      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Evidence checked</span>
          <span className="tnum font-mono font-medium text-foreground">3 / 3</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Weak claims flagged</span>
          <span className="tnum font-mono font-medium text-foreground">0</span>
        </div>
      </div>
    </div>
  );
}

/* A compact contact + email card with a confidence badge for the enrich block. */
function ContactCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
        Best contact
      </span>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">Maya Chen</p>
          <p className="truncate text-sm text-muted-foreground">Head of Growth · Northwind Apparel</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
          <ShieldCheck className="size-3" aria-hidden />
          verified
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 truncate font-mono text-sm text-link">
        <Mail className="size-3.5 shrink-0" aria-hidden />
        maya@northwind.co
      </p>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Dev Patel</p>
            <p className="truncate text-sm text-muted-foreground">Founder · Brightloop Studio</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">
            <ShieldCheck className="size-3" aria-hidden />
            guessed
          </span>
        </div>
        <p className="flex items-center gap-1.5 truncate font-mono text-sm text-muted-foreground">
          <Mail className="size-3.5 shrink-0" aria-hidden />
          dev@brightloop.io
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Every email is labeled verified, guessed, or unknown — never a guess
        passed off as a fact.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const SPECS = [
  { value: "6", label: "Scoring dimensions" },
  { value: "3", label: "Email-confidence states", sub: "verified / guessed / unknown" },
  { value: "$0", label: "Estimated cost", sub: "Gemini free tier" },
  { value: "0", label: "Paid data APIs" },
];

export default function ProductPage() {
  return (
    <>
      {/* 1 — Hero */}
      <Section className="pt-28 sm:pt-32">
        <Reveal>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Product"
            title="A multi-agent engine that finds and qualifies your leads."
            lead="Six specialized agents, one plain-English request. Here's what each one does — and why splitting the work makes the leads better."
          />
        </Reveal>
        <Reveal className="mt-9 flex justify-center">
          <CtaGroup
            align="center"
            secondaryLabel="See how it works"
            secondaryHref="/how-it-works"
          />
        </Reveal>
        <Reveal delay={0.05} className="mt-14">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
            <PipelineStrip className="justify-center" />
          </div>
        </Reveal>
      </Section>

      {/* 2 — Capability blocks (alternating) */}

      {/* Discovery = Intent + Discovery */}
      <CapabilityBlock
        id="discovery"
        eyebrow={`${intent.label} + ${discovery.label}`}
        headline="From a plain sentence to real companies on the open web."
        detail={
          <>
            {intent.detail} Then the discovery agent takes that profile and{" "}
            {discovery.oneLiner.charAt(0).toLowerCase() + discovery.oneLiner.slice(1)}
          </>
        }
        bullets={[intent.bullets[0], discovery.bullets[0], discovery.bullets[1]]}
        visual={
          <div className="flex flex-col gap-4">
            <SearchMock queries={[...EXAMPLE_QUERIES]} />
            <LeadsTableMock />
          </div>
        }
      />

      {/* Qualify */}
      <CapabilityBlock
        id="qualify"
        eyebrow={qualify.label}
        headline="Every lead scored 0–100, so the best matches rise."
        detail={qualify.detail}
        bullets={qualify.bullets}
        visual={<LeadCardMock />}
        reverse
      />

      {/* Evidence = Critic */}
      <CapabilityBlock
        id="evidence"
        eyebrow={critic.label}
        headline="An agent whose only job is to argue against each lead."
        detail={critic.detail}
        bullets={critic.bullets}
        visual={
          <div className="flex flex-col gap-4">
            <LeadCardMock />
            <CriticVerdictCard />
          </div>
        }
      />

      {/* Enrich */}
      <CapabilityBlock
        id="enrich"
        eyebrow={enrich.label}
        headline="The right contact and email — with honest confidence."
        detail={enrich.detail}
        bullets={enrich.bullets}
        visual={<ContactCard />}
        reverse
      />

      {/* Outreach */}
      <CapabilityBlock
        id="outreach"
        eyebrow={outreach.label}
        headline="A personalized first message you can actually send."
        detail={outreach.detail}
        bullets={outreach.bullets}
        visual={<OutreachMock />}
      />

      {/* Trace */}
      <CapabilityBlock
        id="trace"
        eyebrow={TRACE.label}
        headline="Nothing is a black box. Watch every step."
        detail={TRACE.detail}
        bullets={[
          "See the supervisor and every per-company branch",
          "Timings on each node — scrape, recall, qualify, critic, enrich",
          "Full transparency, not just a list of names",
        ]}
        visual={<TraceMiniMock />}
        reverse
      />

      {/* 3 — Why a team of agents */}
      <Section className="border-y border-border bg-surface">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Why multi-agent"
              title="A team beats one mega-prompt."
              lead="One model doing everything blurs the work and hides its mistakes. Splitting it into specialized agents — with an adversarial critic checking the rest — means each step is sharp, traceable, and arguable."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <ul className="flex flex-col gap-3">
              {DIFFERENTIATORS.map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary [&_svg]:size-4">
                    <Check aria-hidden />
                  </span>
                  <span className="text-base font-medium text-foreground">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 4 — Spec strip */}
      <Section>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="The honest facts"
            title="What it actually does — by the numbers."
          />
        </Reveal>
        <Reveal delay={0.05} className="mt-12">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {SPECS.map((s) => (
              <div key={s.label} className="bg-surface p-6 sm:p-8">
                <Stat value={s.value} label={s.label} sub={s.sub} />
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* 5 — Final CTA */}
      <FinalCta />
    </>
  );
}
