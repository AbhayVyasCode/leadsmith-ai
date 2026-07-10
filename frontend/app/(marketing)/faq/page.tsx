import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";

import { Section } from "@/components/marketing/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Accordion } from "@/components/marketing/accordion";
import { FinalCta } from "@/components/marketing/final-cta";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { FAQ_GROUPS } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about pricing, accuracy, data, privacy, and how Leadsmith AI works.",
};

export default function FaqPage() {
  return (
    <>
      {/* 1) Hero */}
      <Section className="pt-28 sm:pt-32" py="none">
        <Reveal>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="FAQ"
            title="Questions, answered."
            lead="Everything you might want to know before your first search."
          />
        </Reveal>
      </Section>

      {/* 2) Grouped FAQs — sticky group label left, accordion right */}
      <Section py="sm" className="pt-16 sm:pt-20">
        <div className="flex flex-col gap-16 sm:gap-20">
          {FAQ_GROUPS.map((group, i) => (
            <div
              key={group.group}
              className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-12"
            >
              <Reveal>
                <div className="lg:sticky lg:top-24">
                  <h2 className="text-balance text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground">
                    {group.group}
                  </h2>
                  <p className="mt-2 font-mono text-xs tabular-nums tracking-[0.04em] text-muted-foreground">
                    {String(group.items.length).padStart(2, "0")}{" "}
                    {group.items.length === 1 ? "question" : "questions"}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <Accordion
                  items={group.items}
                  defaultOpen={i === 0 ? 0 : -1}
                />
              </Reveal>
            </div>
          ))}
        </div>
      </Section>

      {/* 3) Still have a question? */}
      <Section py="sm">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 sm:px-12 sm:py-14">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-[56ch]">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                  <MessageCircleQuestion aria-hidden />
                </span>
                <h2 className="mt-5 text-balance text-[clamp(1.5rem,2.5vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
                  Still have a question?
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  If something here didn&rsquo;t cover it, send us a note. We read
                  every message and answer in plain English.
                </p>
              </div>
              <Button asChild size="lg" variant="secondary" className="shrink-0">
                <Link href="/contact">
                  Contact us
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 4) Final CTA */}
      <FinalCta />
    </>
  );
}
