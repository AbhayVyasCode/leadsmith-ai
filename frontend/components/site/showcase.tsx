import { Brain, Check, Compass, Download, History, Plus, RefreshCw } from "lucide-react";
import type { CSSProperties } from "react";
import { LogoMark } from "@/components/brand/logo";
import { SectionHeading } from "@/components/site/section-heading";
import { EmailLabel } from "@/components/ui/email-label";
import { ConfidenceMeter } from "@/components/ui/meter";
import { ScoreRing } from "@/components/ui/score-ring";
import s from "./showcase.module.css";

const ROWS = [
  { name: "Woodgrove Pay", host: "woodgrove.example", score: 87, conf: 0.86, person: "Dana Whitfield · CTO", email: "found", active: true },
  { name: "Fabrikam Ledger", host: "fabrikam.example", score: 81, conf: 0.74, person: "Arjun Mehta · VP Eng", email: "guessed" },
  { name: "Contoso Treasury", host: "contoso.example", score: 74, conf: 0.69, person: "Lena Ortiz · Founder", email: "found" },
  { name: "Tailspin Credit", host: "tailspin.example", score: 62, conf: 0.48, person: "Mara Koenig · Founder", email: "unknown", flag: "Weak evidence" },
];

const PIPE = ["Intent", "Discover", "Recall", "Qualify", "Critic", "Enrich", "Draft"];

const DIMS = [
  { label: "Industry fit", v: 94 },
  { label: "Size fit", v: 78 },
  { label: "Pain severity", v: 88 },
  { label: "Buying intent", v: 81 },
];

const NOTES = [
  { t: "Streams as it works", d: "Leads appear the moment they clear your score gate — no waiting for the whole run." },
  { t: "A case file per lead", d: "Scorecard, verbatim quotes, the critic’s notes, people with labeled emails and a draft." },
  { t: "Export, re-run, find more", d: "Take a CSV to your CRM, or continue the search without repeating any work." },
];

export function Showcase() {
  return (
    <section aria-labelledby="desk-title" className="overflow-clip border-t border-line py-28 lg:py-36">
      <div className="wrapper">
        <SectionHeading
          center
          id="desk-title"
          index="04"
          kicker="The workspace"
          title={
            <>
              Your <em>research desk.</em>
            </>
          }
          lead="Leads stream in the moment they qualify. Open any one for its full case file — then export it, re-run the search, or ask for more."
        />

        <div className={s.stage}>
          <div className={s.frame} role="img" aria-label="Preview of the Leadsmith workspace showing a finished run with four ranked leads and one lead's case file open.">
            <aside className={s.side}>
              <div className={s.brand}>
                <LogoMark className="size-6 text-ink" />
                <span>Leadsmith</span>
              </div>
              <span className={s.newBtn}>
                <Plus className="size-3.5" /> New search
              </span>
              <nav className={s.nav}>
                <span data-active>
                  <Compass className="size-4" /> Discover
                </span>
                <span>
                  <History className="size-4" /> Runs
                </span>
                <span>
                  <Brain className="size-4" /> Memory
                </span>
              </nav>
              <span className={s.engine}>
                <i /> Engine online
              </span>
            </aside>

            <div className={s.main}>
              <div className={s.runHead}>
                <div className="min-w-0">
                  <p className={s.kicker}>Brief</p>
                  <p className={s.query}>Series A fintechs in the US without a public security page</p>
                </div>
                <div className={s.actions}>
                  <span className={s.done}>
                    <Check className="size-3" /> Done · 2m 14s
                  </span>
                  <span className={s.ghost}>
                    <Download className="size-3.5" /> Export
                  </span>
                  <span className={s.ghost}>
                    <RefreshCw className="size-3.5" /> Find more
                  </span>
                </div>
              </div>

              <ol className={s.pipe}>
                {PIPE.map((p) => (
                  <li key={p}>
                    <span className={s.pipeDot}>
                      <Check className="size-2.5" />
                    </span>
                    {p}
                  </li>
                ))}
              </ol>

              <div className={s.list}>
                {ROWS.map((row, i) => (
                  <div key={row.name} className={s.row} data-active={row.active || undefined} style={{ "--i": i } as CSSProperties}>
                    <ScoreRing score={row.score} size={42} animate={false} />
                    <div className={s.rowMain}>
                      <p className={s.rowName}>
                        {row.name} <span>{row.host}</span>
                      </p>
                      <ConfidenceMeter value={row.conf} className={s.rowMeter} />
                    </div>
                    <div className={s.rowPerson}>
                      <span>{row.person}</span>
                      <EmailLabel kind={row.email} />
                    </div>
                    {row.flag ? <span className={s.flag}>{row.flag}</span> : <span />}
                  </div>
                ))}
              </div>
            </div>

            <div className={s.sheet}>
              <div className={s.sheetHead}>
                <ScoreRing score={87} size={58} animate={false} />
                <div className="min-w-0">
                  <p className={s.sheetName}>Woodgrove Pay</p>
                  <p className={s.sheetHost}>woodgrove.example</p>
                </div>
              </div>
              <p className={s.sheetLabel}>Why it fits</p>
              <p className={s.sheetQuote}>“We’re hiring a Head of Security &amp; Compliance to lead our SOC 2 program.”</p>
              <p className={s.sheetLabel}>Scorecard</p>
              <div className={s.dims}>
                {DIMS.map((d) => (
                  <div key={d.label} className={s.dim} style={{ "--v": d.v } as CSSProperties}>
                    <span>{d.label}</span>
                    <b>{d.v}</b>
                    <i />
                  </div>
                ))}
              </div>
              <p className={s.sheetLabel}>People</p>
              <div className={s.sheetPerson}>
                <span>Dana Whitfield · CTO</span>
                <EmailLabel kind="found" />
              </div>
              <div className={s.sheetPerson}>
                <span>Luis Ortega · Head of Security</span>
                <EmailLabel kind="guessed" />
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {NOTES.map((note, i) => (
            <li key={note.t} className="reveal border-t border-line pt-6">
              <p className="font-mono text-xs text-ember-ink">0{i + 1}</p>
              <p className="mt-3 font-display text-2xl text-ink">{note.t}</p>
              <p className="mt-2 text-[0.97rem] leading-relaxed text-ink-2">{note.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
