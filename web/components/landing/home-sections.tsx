import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FeatureCard } from "@/components/marketing/feature-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Accordion } from "@/components/marketing/accordion";
import {
  LeadCardMock,
  OutreachMock,
  TraceMiniMock,
  MetricsMock,
} from "@/components/marketing/product-visuals";
import { PipelineStrip, SearchMock } from "@/components/marketing/animated-visuals";
import { cn } from "@/lib/utils";
import {
  EXAMPLE_QUERIES,
  PROOF_PILLS,
  PROBLEMS,
  TRANSPARENCY,
  USE_CASES,
  FAQ_HOME,
} from "@/lib/marketing-content";

export function ProofStrip() {
  const facts = [
    { value: "01", label: "Tell it what your product does" },
    { value: "06", label: "Agents research, score, and review" },
    { value: "0", label: "Paid data APIs required" },
  ];

  return (
    <Section py="sm" className="border-y border-border/70 bg-surface/45">
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.08em] text-primary">
              What the first run produces
            </p>
            <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-background/80 p-5">
                  <p className="tnum font-mono text-2xl font-semibold text-foreground">{fact.value}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 lg:justify-end">
            {PROOF_PILLS.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3.5 py-1.5 text-sm text-foreground shadow-sm"
              >
                <Check className="size-3.5 text-primary" aria-hidden />
                {p}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export function ProblemSection() {
  const flow = [
    { label: "Product context", detail: "What you sell, who it helps, where pain shows up", icon: FileText },
    { label: "Open-web research", detail: "Company pages, public signals, hiring and market context", icon: Search },
    { label: "Evidence review", detail: "Fit score, confidence, critic verdict, contact quality", icon: ShieldCheck },
  ];

  return (
    <Section id="problem">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Why this exists"
            title="The hardest part of selling is knowing who deserves the first message."
            lead="Leadsmith AI is built for the moment before outreach: when you understand your product, but still need a qualified, explainable list of companies worth contacting."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="premium-panel overflow-hidden rounded-2xl">
            {flow.map((item, index) => (
              <div key={item.label} className="flex gap-4 border-b border-border p-5 last:border-b-0 sm:p-6">
                <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                  <item.icon aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    <span className="tnum mr-2 font-mono text-primary">{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Stagger className="mt-9 grid gap-5 md:grid-cols-3">
        {PROBLEMS.map((p) => (
          <StaggerItem key={p.title}>
            <FeatureCard icon={<p.icon aria-hidden />} title={p.title}>
              {p.body}
            </FeatureCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

function BentoTile({
  className,
  title,
  body,
  children,
}: {
  className?: string;
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "premium-panel flex flex-col rounded-2xl p-6 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 sm:p-7",
        className,
      )}
    >
      <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">{title}</h3>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{body}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

function EngineConsole() {
  const steps = [
    { label: "Intent", value: "buyer profile" },
    { label: "Discovery", value: "open-web accounts" },
    { label: "Qualify", value: "fit + evidence" },
    { label: "Critic", value: "weak-match review" },
    { label: "Enrich", value: "contact confidence" },
    { label: "Outreach", value: "first draft" },
  ];

  return (
    <div className="premium-panel overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Leadsmith run plan</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">input: product context</p>
        </div>
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
          ready
        </span>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-2">
        {steps.map((step, index) => (
          <div key={step.label} className="bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="tnum font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{step.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowRail() {
  const steps = [
    {
      title: "Describe the product",
      body: "Give Leadsmith AI the product, audience, or URL. The intent agent turns that into a buyer profile.",
    },
    {
      title: "Research likely buyers",
      body: "Discovery searches open-web sources for companies with visible pain, timing, or market fit.",
    },
    {
      title: "Score and challenge",
      body: "Qualify ranks accounts, then the critic reviews weak evidence before the final list is shown.",
    },
    {
      title: "Prepare the first move",
      body: "Enrichment finds the likely contact and outreach drafts a message grounded in the account evidence.",
    },
  ];

  return (
    <div className="premium-panel overflow-hidden rounded-2xl">
      {steps.map((step, index) => (
        <div key={step.title} className="grid gap-4 border-b border-border p-5 last:border-b-0 sm:grid-cols-[5rem_1fr] sm:p-6">
          <div className="flex items-center gap-3 sm:block">
            <span className="tnum font-mono text-3xl font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <CircleDot className="size-5 text-primary sm:mt-3" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function QueryUseCaseCard({ use }: { use: (typeof USE_CASES)[number] }) {
  return (
    <Link
      href={`/use-cases#${use.key}`}
      className="group premium-panel flex h-full flex-col rounded-2xl p-6 outline-none transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
          <use.icon aria-hidden />
        </div>
        <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-foreground">{use.persona}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{use.jtbd}</p>
      <div className="mt-5 rounded-xl border border-border bg-background/70 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Example query</p>
        <p className="mt-2 font-mono text-sm leading-relaxed text-foreground">{use.query}</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{use.outcome}</p>
    </Link>
  );
}

export function FeaturesBento() {
  return (
    <Section id="features" className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="The engine"
            title="A research team in a single run."
            lead="Leadsmith AI starts from your product, builds a buyer profile, researches likely companies, scores fit, challenges weak evidence, finds contacts, and prepares the first message."
          />
        </Reveal>
        <Reveal delay={0.05}>
          <EngineConsole />
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <BentoTile
            className="h-full"
            title="Product context becomes the search strategy"
            body="Paste a URL or describe what you sell. The intent agent extracts buyer pain, likely segments, decision-maker roles, and signals worth searching for."
          >
            <SearchMock queries={[...EXAMPLE_QUERIES]} />
          </BentoTile>
        </Reveal>

        <Reveal delay={0.05} className="md:col-span-2">
          <BentoTile
            className="h-full"
            title="One agent per decision"
            body="The system does not blur research, scoring, review, enrichment, and writing into one opaque prompt."
          >
            <PipelineStrip orientation="vertical" />
          </BentoTile>
        </Reveal>

        <Reveal className="md:col-span-3">
          <BentoTile
            className="h-full"
            title="Every account has a case file"
            body="Fit score, confidence, matched pain, buying signal, contact, and outreach angle stay together."
          >
            <LeadCardMock />
          </BentoTile>
        </Reveal>

        <Reveal delay={0.05} className="md:col-span-3">
          <BentoTile
            className="h-full"
            title="The run is inspectable"
            body="Trace the supervisor, branch steps, timings, warnings, and per-company work instead of accepting a black box."
          >
            <TraceMiniMock />
          </BentoTile>
        </Reveal>

        <Reveal className="md:col-span-2">
          <BentoTile
            className="h-full"
            title="Bad fits get a second look"
            body="The critic is designed to disagree. It flags thin evidence before a weak account reaches your final list."
          />
        </Reveal>

        <Reveal delay={0.05} className="md:col-span-4">
          <BentoTile
            className="h-full"
            title="Outreach starts from the proof"
            body="The draft opener uses the signal that qualified the account, so your first message has a specific reason to exist."
          >
            <OutreachMock />
          </BentoTile>
        </Reveal>
      </div>
    </Section>
  );
}

export function HowItWorksCondensed() {
  const outputs = [
    "Buyer profile",
    "Ranked companies",
    "Evidence and score",
    "Contact confidence",
    "Draft opener",
  ];

  return (
    <Section id="how" className="surface-grid border-y border-border/70">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="How it works"
            title="From product signal to a message worth sending."
            lead="The workflow is intentionally visible. Each stage produces something useful, and each output becomes the input for the next agent."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {outputs.map((output) => (
              <span
                key={output}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/85 px-3 py-1.5 text-sm text-foreground"
              >
                <CheckCircle2 className="size-4 text-primary" aria-hidden />
                {output}
              </span>
            ))}
          </div>
          <Button asChild variant="secondary" className="mt-6">
            <Link href="/how-it-works">
              See the full pipeline
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="grid gap-5">
            <WorkflowRail />
            <div className="premium-panel rounded-2xl p-6">
              <p className="mb-5 text-sm font-semibold text-foreground">Live agent status</p>
              <PipelineStrip />
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export function UseCasesTeaser() {
  return (
    <Section className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Use cases"
            title="Useful when the buyer is specific."
            lead="Leadsmith AI works best when the product has a defined pain, market, signal, or timing trigger. The more specific the thesis, the better the lead list."
          />
          <Button asChild variant="ghost" className="mt-6">
            <Link href="/use-cases">
              See all use cases
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="rounded-2xl border border-border bg-surface/60 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {USE_CASES.slice(0, 2).map((use) => (
                <QueryUseCaseCard key={use.key} use={use} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Stagger className="mt-5 grid gap-4 md:grid-cols-4">
        {USE_CASES.slice(2, 6).map((use) => (
          <StaggerItem key={use.key}>
            <Link
              href={`/use-cases#${use.key}`}
              className="group flex h-full min-h-44 flex-col rounded-2xl border border-border bg-surface/80 p-5 outline-none transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                  <use.icon aria-hidden />
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{use.persona}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{use.outcome}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

function TrustLedger() {
  const rows = [
    { label: "Scores", detail: "Shown with dimensions, confidence, and matched evidence" },
    { label: "Contacts", detail: "Labeled as found, guessed, or unknown" },
    { label: "Critic", detail: "Flags thin claims and weak matches before output" },
    { label: "Run metrics", detail: "Calls, cache hits, duration, and estimated cost remain visible" },
  ];

  return (
    <div className="premium-panel overflow-hidden rounded-2xl">
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Audit ledger</p>
        <p className="mt-1 text-sm text-muted-foreground">What stays attached to the output.</p>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2 px-5 py-4 sm:grid-cols-[8rem_1fr]">
            <p className="text-sm font-medium text-foreground">{row.label}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Transparency() {
  return (
    <Section id="transparency" className="border-y border-border/70 bg-surface/35">
      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Trust model"
              title="Trust comes from inspectable uncertainty."
              lead="Leadsmith AI does not hide uncertain work behind a clean table. It labels confidence, keeps evidence attached, and makes the critic visible."
            />
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
            {TRANSPARENCY.map((t) => (
              <StaggerItem key={t.title} className="rounded-2xl border border-border bg-background/70 p-5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary [&_svg]:size-4.5">
                  <t.icon aria-hidden />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">{t.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <div className="grid gap-5">
          <Reveal delay={0.05}>
            <TrustLedger />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="premium-panel rounded-2xl p-6 sm:p-8">
              <p className="mb-4 text-sm font-medium text-foreground">Every run keeps its metrics</p>
              <MetricsMock />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Token usage, call counts, cache hits, duration, and estimated cost stay visible after every run. That makes the workflow easier to trust and easier to improve.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function FaqSummary() {
  const items = ["Free to try", "Open-web research", "Evidence-backed scores", "No fake email certainty"];

  return (
    <div className="premium-panel rounded-2xl p-6">
      <p className="text-sm font-semibold text-foreground">Short version</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="size-4 text-primary" aria-hidden />
            <span className="text-sm text-foreground">{item}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Leadsmith AI is a discovery and qualification workspace. It helps you decide who to contact, but it does not pretend uncertainty is verification.
      </p>
    </div>
  );
}

export function FaqPreview() {
  return (
    <Section id="faq">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title="The practical questions before the first run."
              lead="A few direct answers about data, accuracy, confidence, and what Leadsmith AI will not pretend to do."
            />
          </Reveal>
          <Reveal delay={0.05} className="mt-6">
            <FaqSummary />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="premium-panel rounded-2xl p-4 sm:p-6">
            <Accordion items={[...FAQ_HOME]} defaultOpen={0} />
            <div className="mt-6 border-t border-border pt-5">
              <Button asChild variant="secondary">
                <Link href="/faq">
                  See all FAQs
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
