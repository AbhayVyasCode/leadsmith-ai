import { Check, CornerDownRight, Flag, MailCheck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { SectionHeading } from "@/components/site/section-heading";
import { StepIndex } from "@/components/site/step-index";
import s from "./how-it-works.module.css";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/* ---------------------------------------------------------------- visuals */

function IntentVisual() {
  const fields = [
    ["Industry", "Fintech"],
    ["Stage", "Series A"],
    ["Region", "United States"],
    ["Size", "20–200 people"],
    ["Pain", "No public security page"],
    ["Signal", "Hiring security roles"],
    ["Decides", "CTO · Head of Security"],
  ];
  return (
    <div className={s.vis}>
      <p className={s.brief}>
        <span className={s.tag}>Brief</span>
        Series A fintechs in the US without a public security page
      </p>
      <CornerDownRight aria-hidden className={s.turn} />
      <dl className={s.icp}>
        {fields.map(([k, v], n) => (
          <div key={k} className={s.chip} style={i(n)}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DiscoverVisual() {
  const results = [
    { url: "g2.com/categories/fintech", verdict: "Directory — dropped", kept: false },
    { url: "techcrunch.com/…/fintech-series-a", verdict: "News — dropped", kept: false },
    { url: "woodgrove.example", verdict: "Company — kept", kept: true },
    { url: "best-fintech-startups.blog", verdict: "Listicle — dropped", kept: false },
    { url: "fabrikam.example", verdict: "Company — kept", kept: true },
    { url: "northwind.example", verdict: "Researched before — skipped", kept: false },
  ];
  return (
    <div className={s.vis}>
      <p className={s.visHead}>
        <span>Wave 1</span>
        <span>25 results · “fintech series A compliance”</span>
      </p>
      <ul className={s.results}>
        {results.map((r, n) => (
          <li key={r.url} className={s.result} data-kept={r.kept || undefined} style={i(n)}>
            <span className={s.url}>{r.url}</span>
            <span className={s.verdict}>
              {r.kept ? <Check aria-hidden className="size-3.5" /> : null}
              {r.verdict}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QualifyVisual() {
  const dims = [
    { label: "Industry fit", score: 94, conf: "0.95" },
    { label: "Size fit", score: 78, conf: "0.80" },
    { label: "Pain severity", score: 88, conf: "0.70" },
    { label: "Buying intent", score: 81, conf: "0.90" },
  ];
  return (
    <div className={s.vis}>
      <div className={s.scoreHead}>
        <div>
          <p className={s.company}>Woodgrove Pay</p>
          <p className={s.host}>woodgrove.example</p>
        </div>
        <p className={s.overall}>
          <span className="sr-only">Overall fit 87</span>
          <span aria-hidden className={s.overallNum} style={{ "--to": 87 } as CSSProperties} />
          <span className={s.overallLabel}>overall fit</span>
        </p>
      </div>
      <div className={s.dims}>
        {dims.map((d, n) => (
          <div key={d.label} className={s.dim} style={{ "--i": n, "--v": d.score } as CSSProperties}>
            <div className={s.dimTop}>
              <span>{d.label}</span>
              <span className={s.dimVal}>
                {d.score}
                <small> · conf {d.conf}</small>
              </span>
            </div>
            <div className={s.bar}>
              <span />
            </div>
          </div>
        ))}
      </div>
      <blockquote className={s.quote}>
        <p>“We’re hiring a Head of Security &amp; Compliance to lead our SOC 2 program.”</p>
        <footer>
          <Check aria-hidden className="size-3.5" /> Quote found on woodgrove.example/careers
        </footer>
      </blockquote>
    </div>
  );
}

function CriticVisual() {
  return (
    <div className={s.vis}>
      <div className={s.criticHead}>
        <span className={s.verdictWeak}>Verdict · Weak</span>
        <span className={s.penalty}>confidence −0.12</span>
      </div>
      <p className={s.criticQuote}>
        “Buying intent rests on a single job post, and size is inferred from the careers page rather than stated.”
      </p>
      <ul className={s.missing}>
        <li style={i(0)}>Missing: a recent funding or headcount source</li>
        <li style={i(1)}>Missing: a named owner for security</li>
      </ul>
      <p className={s.kept}>
        <Flag aria-hidden className="size-3.5" /> Flagged “Weak evidence” — the lead stays in your list.
      </p>
    </div>
  );
}

function EnrichVisual() {
  const people = [
    { initials: "DW", name: "Dana Whitfield", role: "CTO", email: "dana@woodgrove.example", kind: "found", label: "Found on site" },
    { initials: "LO", name: "Luis Ortega", role: "Head of Security", email: "luis.ortega@woodgrove.example", kind: "guessed", label: "Guessed · MX checked" },
    { initials: "PR", name: "Priya Raman", role: "VP Finance", email: "No email found", kind: "unknown", label: "Unknown" },
  ];
  return (
    <div className={s.vis}>
      <ul className={s.people}>
        {people.map((p, n) => (
          <li key={p.name} className={s.person} style={i(n)}>
            <span aria-hidden className={s.avatar}>
              {p.initials}
            </span>
            <span className={s.personMain}>
              <span className={s.personName}>
                {p.name} <span className={s.personRole}>· {p.role}</span>
              </span>
              <span className={s.personEmail}>{p.email}</span>
            </span>
            <span className={s.label} data-kind={p.kind}>
              {p.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DraftVisual() {
  return (
    <div className={s.vis}>
      <div className={s.mail}>
        <p className={s.mailRow}>
          <span>To</span> Dana Whitfield, CTO
        </p>
        <p className={s.mailRow}>
          <span>Subject</span> The page your next enterprise buyer will ask for
        </p>
        <div className={s.mailBody}>
          <p style={i(0)}>Hi Dana — saw you’re hiring a Head of Security &amp; Compliance to lead SOC 2. Congrats on the Series A.</p>
          <p style={i(1)}>Buyers at your stage usually ask for a public trust page before the first call. We help fintech teams ship one in a week.</p>
          <p style={i(2)}>Worth a 15-minute look?</p>
        </div>
      </div>
      <p className={s.grounded}>
        <MailCheck aria-hidden className="size-3.5" /> Grounded in: careers post · missing trust page · Series A
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ steps */

type Step = { id: string; n: string; name: string; title: string; body: string; visual: ReactNode };

const STEPS: Step[] = [
  {
    id: "intent",
    n: "01",
    name: "Intent",
    title: "Your sentence becomes a buyer profile.",
    body: "The intent agent turns plain English into structure: industry, size, region, the pains you solve, the signals that show a company is in-market, and who decides. Paste a product URL instead and it reads your site first, then works out who would buy it.",
    visual: <IntentVisual />,
  },
  {
    id: "discover",
    n: "02",
    name: "Discover",
    title: "The open web, searched in waves.",
    body: "Discovery runs live searches until it has enough strong candidates. Directories, news, listicles and job boards are dropped before they cost a model call — and companies you’ve already researched are skipped.",
    visual: <DiscoverVisual />,
  },
  {
    id: "qualify",
    n: "03",
    name: "Qualify",
    title: "Four dimensions, each with a quote.",
    body: "The qualifier reads each company’s own pages and scores industry fit, size fit, pain severity and buying intent. Every score cites a line from the site — and if that line isn’t really on the page, its confidence is cut in half.",
    visual: <QualifyVisual />,
  },
  {
    id: "critic",
    n: "04",
    name: "Critic",
    title: "A second agent argues the score down.",
    body: "Switch on the critic and every qualified lead gets an adversarial review. Thin evidence is flagged and costs confidence — but the lead stays in your list, so the final call is yours.",
    visual: <CriticVisual />,
  },
  {
    id: "enrich",
    n: "05",
    name: "Enrich",
    title: "The right people, with honest labels.",
    body: "Enrichment finds the people likely to own the problem — on the company’s site and through public search — and labels every email: found on the site, guessed from a verified mail domain, or unknown.",
    visual: <EnrichVisual />,
  },
  {
    id: "draft",
    n: "06",
    name: "Draft",
    title: "A first message worth sending.",
    body: "Optionally, Leadsmith drafts a short first-touch email from the same evidence that qualified the lead. It never sends anything — you edit and send from your own inbox.",
    visual: <DraftVisual />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="border-t border-line py-28 lg:py-36">
      <div className="wrapper grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="self-start lg:sticky lg:top-28 lg:col-span-5">
          <SectionHeading
            id="how-title"
            index="02"
            kicker="How it works"
            title={
              <>
                Six agents. One sentence in, a <em>ranked pipeline</em> out.
              </>
            }
            lead="Each agent does one job and hands clean context to the next — so every step can be inspected, and argued with."
          />
          <StepIndex steps={STEPS.map(({ id, n, name }) => ({ id, n, name }))} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          {STEPS.map((step) => (
            <article key={step.id} id={`step-${step.id}`} aria-labelledby={`step-${step.id}-title`} className={s.card}>
              <div className="p-6 sm:p-8">
                <p className="eyebrow flex items-center gap-3 text-ink-3">
                  <span className="text-ember-ink">{step.n}</span>
                  {step.name}
                </p>
                <h3 id={`step-${step.id}-title`} className="mt-4 font-display text-[2rem] leading-[1.05] tracking-[-0.01em] text-ink sm:text-[2.35rem]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink-2">{step.body}</p>
              </div>
              <div className={s.stage}>{step.visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
