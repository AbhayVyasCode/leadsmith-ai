"use client";

import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from "react";
import s from "./forge-console.module.css";

/**
 * Hero "forge console": a scripted replay of one research run. Every beat is
 * a CSS animation-delay. JS only (1) starts the run once it is on screen and
 * (2) re-mounts it when the run's own fade-out animation ends — so the loop
 * is driven by the CSS clock, never by a drifting timer.
 */

const QUERY = "Series A fintechs in the US without a public security page";

const STEPS = [
  { name: "Intent", out: "Fintech · Series A · US", d1: 2.9, d2: 3.6 },
  { name: "Discover", out: "38 found · 9 already known", d1: 3.6, d2: 4.6 },
  { name: "Qualify", out: "4 dimensions · quotes checked", d1: 4.6, d2: 6.2 },
  { name: "Critic", out: "1 flagged as weak", d1: 6.2, d2: 7.0 },
  { name: "Enrich", out: "9 people · 6 emails", d1: 7.0, d2: 7.9 },
  { name: "Draft", out: "3 first-touch emails", d1: 7.9, d2: 8.7 },
];

type Lead = {
  score: number;
  tone: "high" | "mid";
  name: string;
  host: string;
  quote: string;
  person: string;
  email: "Found" | "Guessed" | "Unknown";
  flag?: string;
  d: number;
};

const LEADS: Lead[] = [
  {
    score: 91,
    tone: "high",
    name: "Woodgrove Pay",
    host: "woodgrove.example",
    quote: "We're hiring a Head of Security & Compliance",
    person: "Dana Whitfield · CTO",
    email: "Found",
    d: 5.2,
  },
  {
    score: 84,
    tone: "high",
    name: "Fabrikam Ledger",
    host: "fabrikam.example",
    quote: "Backed by a $14M Series A",
    person: "Arjun Mehta · VP Engineering",
    email: "Guessed",
    d: 6.4,
  },
  {
    score: 62,
    tone: "mid",
    name: "Tailspin Credit",
    host: "tailspin.example",
    quote: "Trusted by 400+ credit unions",
    person: "Mara Koenig · Founder",
    email: "Unknown",
    flag: "Weak evidence",
    d: 7.4,
  },
];

export function ForgeConsole() {
  const [cycle, setCycle] = useState(0);
  const [play, setPlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const pending = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (!entry.isIntersecting) return;
        setPlay(true);
        if (pending.current) {
          pending.current = false;
          setCycle((c) => c + 1);
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !e.animationName.includes("fade-out")) return;
    if (visible.current && !document.hidden) setCycle((c) => c + 1);
    else pending.current = true; // resume when scrolled back into view
  };

  return (
    <div
      ref={ref}
      className={s.frame}
      role="img"
      aria-label="Animated example of a Leadsmith run: one sentence becomes three scored leads with quoted evidence, contacts and drafts."
    >
      <div key={cycle} className={s.run} data-play={play || undefined} onAnimationEnd={onAnimationEnd}>
        <div className={s.chrome}>
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.path}>leadsmith / new-search</span>
          <span className={s.status}>
            <span className={s.statusRun}>
              <span className="live-dot" /> Researching
            </span>
            <span className={s.statusDone}>Done · 2m 14s</span>
          </span>
        </div>

        <div className={s.query}>
          <span className={s.queryLabel}>Brief</span>
          <span className={s.queryText}>
            <span className={s.typed}>{QUERY}</span>
            <span className={s.caret} />
          </span>
        </div>

        <div className={s.body}>
          <ol className={s.steps}>
            {STEPS.map((step, i) => (
              <li key={step.name} className={s.step} style={{ "--d1": `${step.d1}s`, "--d2": `${step.d2}s` } as CSSProperties}>
                <span className={s.state}>
                  <span className={s.pending} />
                  <span className={s.spinner} />
                  <svg className={s.check} viewBox="0 0 16 16">
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                </span>
                <span className={s.stepName}>
                  <span className={s.stepNum}>0{i + 1}</span>
                  {step.name}
                </span>
                <span className={s.stepOut}>{step.out}</span>
              </li>
            ))}
          </ol>

          <div className={s.leads}>
            <div className={s.leadsHead}>
              <span>Qualified leads</span>
              <span>Ranked by fit</span>
            </div>
            {LEADS.map((lead) => (
              <article
                key={lead.name}
                className={s.lead}
                data-tone={lead.tone}
                style={{ "--d": `${lead.d}s`, "--value": lead.score } as CSSProperties}
              >
                <div className={s.ring}>
                  <span className={s.ringNum} style={{ "--to": lead.score } as CSSProperties} />
                </div>
                <div className={s.leadMain}>
                  <div className={s.leadTop}>
                    <span className={s.leadName}>{lead.name}</span>
                    <span className={s.leadHost}>{lead.host}</span>
                    {lead.flag ? <span className={s.flag}>{lead.flag}</span> : null}
                  </div>
                  <p className={s.quote}>
                    <span>“{lead.quote}”</span>
                  </p>
                  <p className={s.person}>
                    {lead.person}
                    <span className={s.email} data-kind={lead.email}>
                      {lead.email}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={s.footer}>
          <span>
            <b className={s.num} style={{ "--to": 42 } as CSSProperties} /> LLM calls
          </span>
          <span>
            <b>61.2k</b> tokens
          </span>
          <span>
            <b className={s.num} style={{ "--to": 18 } as CSSProperties} /> cache hits
          </span>
          <span>
            <b>$0.00</b> est. cost
          </span>
        </div>
      </div>
    </div>
  );
}
