import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowGlyph, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import s from "./final-cta.module.css";

const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  x: `${(i * 47 + 11) % 100}%`,
  delay: `${-((i * 0.97) % 8).toFixed(2)}s`,
  dur: `${6 + (i % 4) * 1.4}s`,
  drift: `${(i % 2 ? 1 : -1) * (8 + ((i * 5) % 26))}px`,
}));

/** The forge: a dark island in both themes (`dark` re-scopes every token). */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="py-20 lg:py-28">
      <div className="wrapper">
        <div className={cn("dark", s.forge)}>
          <div aria-hidden className={s.heat} data-loop />
          <div aria-hidden className={s.sparks} data-loop>
            {SPARKS.map((p, i) => (
              <span key={i} style={{ "--x": p.x, "--delay": p.delay, "--dur": p.dur, "--drift": p.drift } as CSSProperties} />
            ))}
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="eyebrow text-ink-3">Ready when you are</p>
            <h2 id="cta-title" className="mt-6 font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] tracking-[-0.025em] text-ink">
              Your next customers are already <em className="text-ember-ink">on the web.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-2">
              Describe them in one sentence. Leadsmith does the research — and shows you every reason.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/app" className={buttonVariants({ size: "lg" })}>
                Start a search
                <ArrowGlyph />
              </Link>
              <Link href="#faq" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
