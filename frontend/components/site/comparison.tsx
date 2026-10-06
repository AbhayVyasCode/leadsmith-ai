import type { CSSProperties } from "react";
import { Check, Minus, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/cn";
import s from "./comparison.module.css";

type Verdict = "yes" | "no" | "some";
type Cell = { v: Verdict; note: string };

const COLUMNS = [
  { name: "Bought lists", short: "Lists" },
  { name: "Web scrapers", short: "Scrapers" },
  { name: "Leadsmith", short: "Leadsmith" },
] as const;

const ROWS: { label: string; cells: [Cell, Cell, Cell] }[] = [
  {
    label: "Fresh from the live web",
    cells: [
      { v: "some", note: "On their refresh schedule" },
      { v: "yes", note: "Live pages" },
      { v: "yes", note: "Live search, in waves" },
    ],
  },
  {
    label: "Judges fit against your ICP",
    cells: [
      { v: "some", note: "Static filters" },
      { v: "no", note: "No judgment" },
      { v: "yes", note: "4 scored dimensions" },
    ],
  },
  {
    label: "Shows evidence for every score",
    cells: [
      { v: "no", note: "—" },
      { v: "no", note: "Raw text only" },
      { v: "yes", note: "Quoted from the company’s site" },
    ],
  },
  {
    label: "Argues against weak matches",
    cells: [
      { v: "no", note: "—" },
      { v: "no", note: "—" },
      { v: "yes", note: "A dedicated critic agent" },
    ],
  },
  {
    label: "Labels uncertain emails",
    cells: [
      { v: "some", note: "Rarely explained" },
      { v: "no", note: "—" },
      { v: "yes", note: "Found · Guessed · Unknown" },
    ],
  },
  {
    label: "Remembers what you’ve researched",
    cells: [
      { v: "no", note: "—" },
      { v: "no", note: "—" },
      { v: "yes", note: "Skips known companies" },
    ],
  },
];

const ICON: Record<Verdict, { icon: typeof Check; cls: string; label: string }> = {
  yes: { icon: Check, cls: "bg-ok/12 text-ok", label: "Yes" },
  some: { icon: Minus, cls: "bg-warn/14 text-warn", label: "Partly" },
  no: { icon: X, cls: "bg-panel-2 text-ink-3", label: "No" },
};

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** Leadsmith's ✓ is a stroke, so the scan can draw it. */
function DrawnCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={s.drawn}>
      <path pathLength={1} d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** The logo, alive: it floats, a glint crosses the lens, a scan line sweeps it and radar rings pulse out. */
function LiveMark({ className, small }: { className?: string; small?: boolean }) {
  return (
    <span aria-hidden className={cn(s.live, small && s.liveSmall, className)} data-loop>
      <span className={s.radar} />
      <span className={cn(s.radar, s.radarLate)} />
      <span className={s.sparkGlow} />
      <LogoMark className="size-full" />
      <span className={s.lens}>
        <span className={s.glint} />
        <span className={s.scanline} />
      </span>
    </span>
  );
}

export function Comparison() {
  return (
    <section aria-labelledby="problem-title" className="pt-28 lg:pt-36">
      <div className="wrapper grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <SectionHeading
          id="problem-title"
          index="01"
          kicker="The problem"
          className="lg:col-span-7"
          title={
            <>
              A list is cheap. Knowing who deserves your{" "}
              <em className={s.under}>
                first message
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className={s.underStroke}>
                  <path pathLength={1} d="M4 13C70 5 150 3 296 8" />
                </svg>
              </em>{" "}
              isn’t.
            </>
          }
        />
        <p className="reveal self-end text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9">
          Lead databases tell you who exists. Scrapers grab whatever is on the page. Neither tells you why a company
          should hear from you this week — and neither shows its work.
        </p>
      </div>

      {/* The scan: on wide screens the table holds still while your scroll moves the
          logo down the Leadsmith column; elsewhere the rows prove themselves as the
          table passes. Pure CSS scroll timeline; without support it is simply shown. */}
      <div className={s.track}>
        <div className={s.stage}>
          <div className="wrapper">
            {/* Phones get a compact verdict matrix (icons only, notes kept for screen
                readers); from sm up the notes are shown and the table may scroll. */}
            <div className={s.card}>
              <span aria-hidden className={s.beamTrack}>
                <span className={s.beam} />
              </span>

              <table className={s.table}>
                <caption className="sr-only">How Leadsmith compares with bought lead lists and web scrapers</caption>
                <colgroup>
                  <col className={s.colLabel} />
                  <col className={s.colThem} />
                  <col className={s.colThem} />
                  <col className={s.colUs} />
                </colgroup>
                <thead>
                  <tr className={s.headRow}>
                    <th scope="col" className="px-4 sm:px-6">
                      <span className="sr-only">Capability</span>
                    </th>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.name}
                        scope="col"
                        className={cn(
                          "px-1.5 text-center align-bottom text-[0.76rem] font-medium text-ink-2 sm:px-4 sm:text-left sm:text-[0.8rem]",
                          col.name === "Leadsmith" && cn(s.usHead, "bg-ember/[0.07] text-ink"),
                        )}
                      >
                        {col.name === "Leadsmith" ? (
                          <span className="inline-flex flex-col items-center gap-1.5 font-display text-base leading-none text-ink sm:flex-row sm:gap-2 sm:text-xl">
                            <span className={s.home}>
                              <LiveMark small className="size-7" />
                            </span>
                            Leadsmith
                          </span>
                        ) : (
                          <>
                            <span aria-hidden className="sm:hidden">
                              {col.short}
                            </span>
                            <span className="sr-only sm:not-sr-only">{col.name}</span>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, k) => (
                    <tr key={row.label} className={s.row} style={vars({ "--k": k })}>
                      <th scope="row" className={cn(s.label, "px-4 text-[0.9rem] font-medium leading-snug text-ink sm:px-6 sm:text-[0.98rem]")}>
                        {row.label}
                      </th>
                      {row.cells.map((cell, i) => {
                        const meta = ICON[cell.v];
                        const Icon = meta.icon;
                        const us = i === 2;
                        return (
                          <td
                            key={i}
                            className={cn(s.cell, us && cn(s.us, "bg-ember/[0.07]"), "px-1.5 align-middle sm:px-4")}
                            style={vars({ "--c": i })}
                          >
                            <span className="flex items-center justify-center gap-2.5 sm:justify-start">
                              <span className={s.slot}>
                                <span
                                  data-v={cell.v}
                                  className={cn(
                                    s.icon,
                                    us && s.usIcon,
                                    "inline-flex size-6 shrink-0 items-center justify-center rounded-full sm:size-5",
                                    meta.cls,
                                  )}
                                >
                                  {us ? <DrawnCheck /> : <Icon className="size-3.5 sm:size-3" strokeWidth={2.6} aria-hidden />}
                                </span>
                              </span>
                              <span className={cn(s.note, "sr-only text-[0.84rem] leading-snug sm:not-sr-only", us ? "text-ink" : "text-ink-2")}>
                                <span className="sr-only">{meta.label}: </span>
                                {cell.note}
                              </span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* the scanner: rides a rail beside the Leadsmith column, then docks in its header */}
              <span aria-hidden className={s.rail}>
                <span className={s.railFill} />
                {ROWS.map((row, k) => (
                  <span key={row.label} className={s.railDot} style={vars({ "--k": k })} />
                ))}
              </span>
              <span aria-hidden className={s.scanner}>
                <span className={s.dock}>
                  <span className={s.bob} data-loop>
                    <LiveMark className={s.scanMark} />
                  </span>
                </span>
              </span>
              <span aria-hidden className={s.columnGlow} />
            </div>

            <p aria-hidden className={s.progress}>
              <span className={s.segments}>
                {ROWS.map((row, k) => (
                  <i key={row.label} style={vars({ "--k": k })} />
                ))}
              </span>
              <span>
                <b className={s.count} /> of 6 proven with evidence
              </span>
            </p>

            <p aria-hidden className="mt-4 flex justify-center gap-5 text-[0.8rem] text-ink-3 sm:hidden">
              {(Object.keys(ICON) as Verdict[]).map((v) => {
                const Icon = ICON[v].icon;
                return (
                  <span key={v} className="inline-flex items-center gap-1.5">
                    <span className={cn("inline-flex size-4 items-center justify-center rounded-full", ICON[v].cls)}>
                      <Icon className="size-2.5" strokeWidth={2.8} />
                    </span>
                    {ICON[v].label}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="pb-28 lg:pb-36" />
    </section>
  );
}
