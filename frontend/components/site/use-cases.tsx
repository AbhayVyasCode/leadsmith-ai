"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { clsx } from "clsx";
import { SectionHeading } from "@/components/site/section-heading";
import { ScoreRing } from "@/components/ui/score-ring";
import s from "./use-cases.module.css";

type UseCase = {
  key: string;
  label: string;
  job: string;
  brief: string;
  get: string;
  signals: string[];
  example: { name: string; score: number; quote: string };
};

const CASES: UseCase[] = [
  {
    key: "founders",
    label: "Founders",
    job: "Find your first twenty customers.",
    brief: "Seed-stage workflow tools selling to finance teams in the UK",
    get: "Companies with a live finance-ops pain, the person who owns it, and an opener that references it.",
    signals: ["Hiring a first finance-ops lead", "Spreadsheet-heavy job posts", "Recent seed round"],
    example: { name: "Litware Finance", score: 84, quote: "We still close the books in spreadsheets." },
  },
  {
    key: "sdr",
    label: "SDR teams",
    job: "Build a week of accounts before lunch.",
    brief: "EU logistics companies running legacy TMS software, 200–1,000 employees",
    get: "A ranked account list with evidence your reps can quote, plus labeled contacts to sequence.",
    signals: ["Legacy TMS named in job posts", "New operations leadership", "Expansion announcements"],
    example: { name: "Wingtip Freight", score: 79, quote: "Experience with our in-house TMS required." },
  },
  {
    key: "agencies",
    label: "Agencies",
    job: "Show clients why every prospect is on the list.",
    brief: "Dental groups in Florida with outdated websites and no online booking",
    get: "Prospects with the exact gap your pitch fixes, quoted straight from their own site.",
    signals: ["No booking page", "Dated site build", "Several locations"],
    example: { name: "Proseware Dental", score: 88, quote: "Call our front desk to book an appointment." },
  },
  {
    key: "recruiters",
    label: "Recruiters",
    job: "Map the companies with real momentum.",
    brief: "Series B fintechs hiring several senior engineers in Berlin",
    get: "Teams that are visibly growing, the hiring manager to approach, and why now.",
    signals: ["Multiple senior openings", "New funding round", "New office or region"],
    example: { name: "Adatum Pay", score: 81, quote: "We’re growing our Berlin engineering hub." },
  },
  {
    key: "investors",
    label: "Investors",
    job: "Turn a thesis into a sourced market map.",
    brief: "Bootstrapped vertical SaaS for veterinary clinics in North America",
    get: "A structured list where every company comes with the evidence that put it there.",
    signals: ["Vertical focus on the homepage", "Self-serve pricing", "No funding announcements"],
    example: { name: "Fourth Coffee Vet", score: 77, quote: "Built by vets, for independent clinics." },
  },
  {
    key: "partners",
    label: "Partnerships",
    job: "Find products that complete yours.",
    brief: "Shopify apps that complement email marketing for subscription brands",
    get: "Potential partners with the overlap spelled out, so the first call starts specific.",
    signals: ["Integrations page", "Subscription-brand customers", "Partner program"],
    example: { name: "Northwind Subscriptions", score: 83, quote: "Integrates with the tools you already use." },
  },
];

export function UseCases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const current = CASES[active];

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = CASES.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="use-cases" aria-labelledby="cases-title" className="border-t border-line py-28 lg:py-36">
      <div className="wrapper">
        <SectionHeading
          id="cases-title"
          index="05"
          kicker="Use cases"
          title={
            <>
              Whoever you sell to, <em>start with a sentence.</em>
            </>
          }
        />

        <div role="tablist" aria-label="Use cases" className={clsx(s.tabs, "reveal")}>
          {CASES.map((c, i) => (
            <button
              key={c.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${c.key}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onKey}
              className={s.tab}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div
          key={current.key}
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${current.key}`}
          tabIndex={0}
          className={s.panel}
        >
          <div className={s.left}>
            <h3 className="font-display text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.02] text-ink">{current.job}</h3>
            <div className={s.brief}>
              <span className={s.briefTag}>Brief</span>
              <span>{current.brief}</span>
            </div>
          </div>
          <div className={s.right}>
            <p className="eyebrow text-ink-3">What you get</p>
            <p className="mt-3 text-lg leading-relaxed text-ink">{current.get}</p>
            <p className="eyebrow mt-8 text-ink-3">Signals it looks for</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {current.signals.map((sig) => (
                <li key={sig} className={s.signal}>
                  {sig}
                </li>
              ))}
            </ul>
            <div className={s.example}>
              <ScoreRing score={current.example.score} size={46} />
              <div className="min-w-0">
                <p className="font-medium text-ink">{current.example.name}</p>
                <p className="mt-0.5 font-display text-[1.05rem] italic leading-snug text-ink-2">“{current.example.quote}”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
