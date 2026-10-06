import type { CSSProperties } from "react";
import { HeroDemo } from "@/components/site/hero-demo";
import { EmailLabel } from "@/components/ui/email-label";
import { ScoreRing } from "@/components/ui/score-ring";
import s from "./hero.module.css";

type DemoLead = {
  name: string;
  domain: string;
  score: number;
  source: string;
  quote: string;
  contact: string;
  role: string;
  email: "verified" | "found" | "guessed";
};

/** Example briefs and the leads each one returns (fictional companies on .example domains). */
const SCENES: { brief: string; leads: [DemoLead, DemoLead, DemoLead] }[] = [
  {
    brief: "Series A fintechs without a public security page",
    leads: [
      { name: "Woodgrove Pay", domain: "woodgrove.example", score: 87, source: "careers page", quote: "Hiring our first Head of Security & Compliance", contact: "Dana Whitfield", role: "CTO", email: "verified" },
      { name: "Fabrikam Ledger", domain: "fabrikam.example", score: 81, source: "pricing page", quote: "Security documentation available on request", contact: "Arjun Mehta", role: "VP Engineering", email: "guessed" },
      { name: "Contoso Treasury", domain: "contoso.example", score: 74, source: "press page", quote: "Now live for business customers across the EU", contact: "Lena Ortiz", role: "Co-founder", email: "found" },
    ],
  },
  {
    brief: "Shopify brands with strong ads but weak SEO",
    leads: [
      { name: "Alpine Ski House", domain: "alpineskihouse.example", score: 85, source: "homepage", quote: "New drops every Friday, free shipping on all orders", contact: "Priya Nair", role: "Head of Growth", email: "verified" },
      { name: "Wingtip Toys", domain: "wingtiptoys.example", score: 79, source: "blog", quote: "Holiday gift guide 2023 — our latest post", contact: "Marco Silva", role: "Founder", email: "found" },
      { name: "Coho Winery", domain: "cohowinery.example", score: 72, source: "homepage", quote: "Join the club and save 20% on your first case", contact: "Ana Torres", role: "E-commerce Lead", email: "guessed" },
    ],
  },
  {
    brief: "B2B SaaS teams in Europe hiring their first SDR",
    leads: [
      { name: "Litware Analytics", domain: "litware.example", score: 88, source: "careers page", quote: "We’re hiring our first SDR to open the DACH market", contact: "Jonas Weber", role: "CEO", email: "verified" },
      { name: "Trey Research", domain: "treyresearch.example", score: 80, source: "careers page", quote: "Join our founding sales team, remote across the EU", contact: "Elise Martin", role: "Head of Sales", email: "found" },
      { name: "Proseware Cloud", domain: "proseware.example", score: 73, source: "jobs board", quote: "Sales Development Representative (EMEA), first hire", contact: "Sofia Rossi", role: "COO", email: "guessed" },
    ],
  },
];

const BRIEFS = SCENES.map((scene) => scene.brief);
const vars = (v: Record<string, string | number>) => v as CSSProperties;

function DemoCard({ lead, index }: { lead: DemoLead; index: number }) {
  return (
    <li className={s.card} style={vars({ "--j": index })}>
      <div className={s.cardHead}>
        <ScoreRing score={lead.score} size={46} animate={false} className={s.ring} />
        <div className="min-w-0">
          <p className={s.name}>{lead.name}</p>
          <p className={s.domain}>{lead.domain}</p>
        </div>
      </div>
      <div>
        <p className={s.source}>Evidence · {lead.source}</p>
        <p className={s.quote}>
          <mark className={s.mark}>“{lead.quote}”</mark>
        </p>
      </div>
      <div className={s.foot}>
        <p className={s.person}>
          <span className="font-medium text-ink">{lead.contact}</span> · {lead.role}
        </p>
        <span className={s.badge}>
          <EmailLabel kind={lead.email} />
        </span>
      </div>
    </li>
  );
}

export function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className="wrapper flex flex-col items-center text-center">
        <a href="#how" className={s.pill} data-loop>
          <span className="live-dot" />
          <span>
            6 agents <span className={s.dot}>·</span>{" "}
            <span className={s.hideSm}>
              live web <span className={s.dot}>·</span>{" "}
            </span>
            evidence on every score
          </span>
          <svg aria-hidden viewBox="0 0 16 16" className={s.pillArrow}>
            <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" />
          </svg>
        </a>

        <h1 id="hero-title" className={s.title}>
          <span className={s.line}>
            {["Leads,", "forged", "from"].map((word, i) => (
              <span key={word}>
                <span className={s.word} style={vars({ "--i": i })}>
                  {word}
                </span>{" "}
              </span>
            ))}
          </span>
          <span className={`${s.line} ${s.lineLast}`}>
            <span className={s.word} style={vars({ "--i": 3 })}>
              <em className={s.accent}>
                evidence.
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className={s.stroke}>
                  <path pathLength={1} d="M4 13C70 5 150 3 296 8" />
                  <path pathLength={1} d="M40 17C110 11 190 10 270 13" />
                </svg>
              </em>
            </span>
          </span>
        </h1>

        <p className={s.lead}>
          Describe your buyer in one sentence. Leadsmith’s agents search the open web and return ranked leads — every
          score backed by a quote.
        </p>

        <HeroDemo briefs={BRIEFS}>
          <div className={s.skeletons}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={s.skel}>
                <span className={s.skRing} />
                <span className={s.skLine} />
                <span className={`${s.skLine} ${s.skShort}`} />
                <span className={`${s.skQuote} ${s.skQuoteFirst}`} />
                <span className={`${s.skQuote} ${s.skQuoteLast}`} />
                <span className={s.skFoot} />
              </div>
            ))}
          </div>
          {SCENES.map((scene, i) => (
            <ol key={scene.brief} className={s.scene} data-scene-id={i} data-active={i === 0 ? "" : undefined}>
              {scene.leads.map((lead, j) => (
                <DemoCard key={lead.domain} lead={lead} index={j} />
              ))}
            </ol>
          ))}
        </HeroDemo>

        <p className={s.stack}>
          Runs on <b>NVIDIA NIM</b> · <b>Tavily</b> · <b>Gemini</b>
          <span className={s.stackSep} aria-hidden />
          No bought lists
        </p>
      </div>
    </section>
  );
}
