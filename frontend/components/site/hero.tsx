import Link from "next/link";
import type { CSSProperties } from "react";
import { ForgeConsole } from "@/components/site/forge-console";
import { ArrowGlyph, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import s from "./hero.module.css";

const LEDGER = [
  { value: 4, label: "fit dimensions per company — each one backed by a quote from its site" },
  { value: 1, label: "critic agent whose only job is to argue the score down" },
  { value: 0, label: "bought lead lists. Everything comes from the live, public web" },
];

// Deterministic ember particles (server-rendered, no hydration mismatch).
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  x: `${(i * 61 + 7) % 100}%`,
  delay: `${-((i * 1.37) % 11).toFixed(2)}s`,
  dur: `${9 + (i % 5) * 1.6}s`,
  drift: `${(i % 2 ? 1 : -1) * (14 + ((i * 7) % 30))}px`,
  size: `${2 + (i % 3)}px`,
}));

export function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div aria-hidden className={s.backdrop} data-loop>
        <div className={s.grid} />
        <div className={s.glow} />
        <div className={s.embers}>
          {EMBERS.map((e, i) => (
            <span
              key={i}
              style={{ "--x": e.x, "--delay": e.delay, "--dur": e.dur, "--drift": e.drift, "--size": e.size } as CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="wrapper relative">
        <p className={cn("eyebrow flex items-center gap-2.5 text-ink-2", s.fade)}>
          <span className="live-dot" />
          Multi-agent lead research
        </p>

        <h1 id="hero-title" className={cn("font-display text-ink", s.title)}>
          <span className={s.line}>
            <span style={{ "--i": 0 } as CSSProperties}>Leads, forged</span>
          </span>
          <span className={s.line}>
            <span style={{ "--i": 1 } as CSSProperties}>
              from <em className="text-ember-ink">evidence.</em>
            </span>
          </span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <p className={cn("max-w-[50ch] text-lg leading-relaxed text-ink-2 sm:text-xl", s.rise)}>
              Describe who you sell to — or paste your product’s URL. Leadsmith’s agents research the open web, score
              every company against your buyer profile with quotes from its own site, and hand you the right people
              with a first draft.
            </p>
            <div className={cn("mt-9 flex flex-wrap gap-3", s.rise)} style={{ "--delay": "0.5s" } as CSSProperties}>
              <Link href="/app" className={buttonVariants({ size: "lg" })}>
                Start a search
                <ArrowGlyph />
              </Link>
              <Link href="#how" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                See how it works
              </Link>
            </div>
          </div>

          <ul className="lg:col-span-5 lg:col-start-8" aria-label="Leadsmith in numbers">
            {LEDGER.map((row, i) => (
              <li
                key={row.label}
                className={cn("flex items-baseline gap-5 border-t border-line py-4 last:border-b", s.rise)}
                style={{ "--delay": `${0.6 + i * 0.12}s` } as CSSProperties}
              >
                <span className="sr-only">{row.value}</span>
                <span
                  aria-hidden
                  className={cn("font-display text-[3.25rem] leading-none text-ink tnum", s.count)}
                  style={{ "--to": row.value } as CSSProperties}
                />
                <span className="text-[0.95rem] leading-snug text-ink-2">{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn("wrapper relative mt-16 lg:mt-24", s.consoleIn)}>
        <ForgeConsole />
      </div>
    </section>
  );
}
