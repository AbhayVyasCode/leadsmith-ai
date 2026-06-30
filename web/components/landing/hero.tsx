"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/marketing/section";
import { SignalGrid } from "@/components/landing/signal-grid";
import { SearchMock } from "@/components/marketing/animated-visuals";
import { HERO, EXAMPLE_QUERIES } from "@/lib/marketing-content";
import { LeadsTableMock, TraceMiniMock } from "@/components/marketing/product-visuals";

const EASE = [0.32, 0.72, 0, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
  };
  const word = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  };

  return (
    <section className="relative isolate overflow-hidden pb-10 pt-20 sm:pb-12 sm:pt-24 lg:pb-14 lg:pt-28">
      <SignalGrid />
      <span aria-hidden className="grain-overlay z-[1]" />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)] lg:gap-16">
          <div className="flex flex-col items-start text-left">
            {reduced ? (
              <h1 className="text-balance font-display text-[clamp(2.75rem,6vw,5.25rem)] font-semibold leading-[1.01] tracking-[-0.025em] text-foreground">
                {HERO.headline.join(" ")}
              </h1>
            ) : (
              <motion.h1
                className="flex flex-wrap gap-x-[0.28em] text-balance font-display text-[clamp(2.75rem,6vw,5.25rem)] font-semibold leading-[1.01] tracking-[-0.025em] text-foreground"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {HERO.headline.map((w, i) => (
                  <motion.span key={i} variants={word} className="inline-block">
                    {w}
                  </motion.span>
                ))}
              </motion.h1>
            )}

            <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {HERO.sub}
            </p>

            <div className="mt-8 w-full max-w-2xl">
              <SearchMock queries={[...EXAMPLE_QUERIES]} />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={HERO.primary.href}>
                  {HERO.primary.label}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href={HERO.secondary.href}>{HERO.secondary.label}</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {HERO.trust.split(". ").map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden />
                  {item.replace(/\.$/, "")}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary-soft blur-3xl" />
            <div className="premium-panel overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-danger" />
                  <span className="size-2.5 rounded-full bg-accent-warm" />
                  <span className="size-2.5 rounded-full bg-success" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">live run</span>
              </div>
              <div className="grid gap-4 p-4 sm:p-5">
                <LeadsTableMock />
                <TraceMiniMock />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
