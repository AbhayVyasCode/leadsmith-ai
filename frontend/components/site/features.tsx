import { Activity, ArrowRight, Check, Download, History, RefreshCw } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { SectionHeading } from "@/components/site/section-heading";
import { Spotlight } from "@/components/site/spotlight";
import { ConfidenceMeter } from "@/components/ui/meter";
import { cn } from "@/lib/cn";
import s from "./features.module.css";

function Tile({ className, title, body, children }: { className?: string; title: string; body: string; children: ReactNode }) {
  return (
    <article data-tile className={cn(s.tile, "reveal", className)}>
      <div className={s.visual}>{children}</div>
      <div className="relative p-6 pt-0 sm:p-7 sm:pt-0">
        <h3 className="font-display text-[1.75rem] leading-[1.08] text-ink">{title}</h3>
        <p className="mt-2.5 max-w-[46ch] text-[0.97rem] leading-relaxed text-ink-2">{body}</p>
      </div>
    </article>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="border-t border-line py-28 lg:py-36">
      <div className="wrapper">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <SectionHeading
            id="features-title"
            index="03"
            kicker="Features"
            className="lg:col-span-8"
            title={
              <>
                Built to be <em>checked</em>, not taken on faith.
              </>
            }
          />
          <p className="reveal self-end text-lg leading-relaxed text-ink-2 lg:col-span-4">
            Every number in Leadsmith arrives with its reasons attached. Read them, disagree with them, act on them.
          </p>
        </div>

        <Spotlight className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Tile
            className="lg:col-span-7"
            title="Every score shows its receipts"
            body="Each dimension cites a verbatim line from the company’s own site. If the line isn’t actually on the page, its confidence is halved automatically."
          >
            <div className={s.receipt}>
              <p className={s.receiptQuote}>
                <span>“Our compliance team is growing — we’re hiring a Head of Security.”</span>
              </p>
              <div className={s.receiptMeta}>
                <span className={s.ok}>
                  <Check aria-hidden className="size-3.5" /> Found on woodgrove.example/careers
                </span>
                <span className={s.muted}>Not on the page → confidence × 0.5</span>
              </div>
            </div>
          </Tile>

          <Tile
            className="lg:col-span-5"
            title="Confidence, kept apart from score"
            body="A 92 built on one hint and a 92 built on five facts look different here — so a thin guess never passes for a sure thing."
          >
            <div className={s.pairs}>
              <div className={s.pair}>
                <span className={s.big}>92</span>
                <div className="min-w-0 flex-1">
                  <p className={s.pairLabel}>Five facts agree</p>
                  <ConfidenceMeter value={0.94} />
                </div>
              </div>
              <div className={s.pair}>
                <span className={s.big}>92</span>
                <div className="min-w-0 flex-1">
                  <p className={s.pairLabel}>Built on one hint</p>
                  <ConfidenceMeter value={0.41} />
                </div>
              </div>
            </div>
          </Tile>

          <Tile
            className="lg:col-span-5"
            title="A critic that’s allowed to say no"
            body="An adversarial second pass reviews every qualified lead. It flags and down-weights — it never silently deletes."
          >
            <ul className={s.verdicts}>
              {[
                { v: "Accept", d: "Scores hold up against the page", tone: "ok" },
                { v: "Weak", d: "Plausible, thinly supported", tone: "warn" },
                { v: "Reject", d: "Contradicted by the text", tone: "bad" },
              ].map((row, i) => (
                <li key={row.v} className={s.verdict} data-tone={row.tone} style={{ "--i": i } as CSSProperties}>
                  <span className={s.verdictPill}>{row.v}</span>
                  <span className={s.verdictText}>{row.d}</span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile
            className="lg:col-span-7"
            title="Emails, labeled honestly"
            body="Every address says where it came from. Guesses are checked against the domain’s mail server and still called guesses."
          >
            <ul className={s.emails}>
              {[
                { k: "Found", d: "Printed on the company’s own site", tone: "ok", e: "dana@woodgrove.example" },
                { k: "Guessed", d: "Name pattern on a mail-verified domain", tone: "warn", e: "luis.ortega@woodgrove.example" },
                { k: "Unknown", d: "We’d rather say so than invent one", tone: "neutral", e: "—" },
              ].map((row) => (
                <li key={row.k} className={s.emailRow} data-tone={row.tone}>
                  <span className={s.emailKind}>{row.k}</span>
                  <span className={s.emailAddr}>{row.e}</span>
                  <span className={s.emailHint}>{row.d}</span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile
            className="lg:col-span-6"
            title="Memory that compounds"
            body="Every qualified company is remembered. Later runs skip what you’ve already researched and use past findings to calibrate new scores."
          >
            <div className={s.memory}>
              <div className={s.memRun}>
                <History aria-hidden className="size-4" />
                <span>
                  <b>Run 1</b> · 12 companies researched
                </span>
              </div>
              <div className={s.memLine} aria-hidden />
              <div className={s.memRun} data-active>
                <RefreshCw aria-hidden className="size-4" />
                <span>
                  <b>Run 2</b> · 9 skipped as known · 3 past leads recalled for calibration
                </span>
              </div>
            </div>
          </Tile>

          <Tile
            className="lg:col-span-6"
            title="Start from your own product"
            body="Paste your URL. Leadsmith reads your site, works out who would buy it, and builds the buyer profile for you."
          >
            <div className={s.product}>
              <span className={s.url}>https://yourproduct.example</span>
              <ArrowRight aria-hidden className={s.productArrow} />
              <div className={s.segments}>
                {["Online-judge platforms", "AI agent frameworks", "Technical hiring tools"].map((seg, i) => (
                  <span key={seg} className={s.segment} style={{ "--i": i } as CSSProperties}>
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          </Tile>
        </Spotlight>

        <ul className="reveal mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          {[
            { icon: Activity, t: "A live trace of every run", d: "Timings, model calls, tokens and cache hits." },
            { icon: Download, t: "One-click CSV export", d: "Scores, contacts, labels and angles." },
            { icon: RefreshCw, t: "Re-run or find more", d: "Continue a search without repeating work." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-start gap-4 bg-panel p-6">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ember/12 text-ember-ink">
                <Icon aria-hidden className="size-[18px]" />
              </span>
              <span>
                <span className="block font-medium text-ink">{t}</span>
                <span className="mt-1 block text-sm text-ink-2">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
