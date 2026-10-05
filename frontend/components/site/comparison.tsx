import { Check, Minus, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/cn";

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

export function Comparison() {
  return (
    <section aria-labelledby="problem-title" className="py-28 lg:py-36">
      <div className="wrapper grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <SectionHeading
          id="problem-title"
          index="01"
          kicker="The problem"
          className="lg:col-span-7"
          title={
            <>
              A list is cheap. Knowing who deserves your <em>first message</em> isn’t.
            </>
          }
        />
        <p className="reveal self-end text-lg leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9">
          Lead databases tell you who exists. Scrapers grab whatever is on the page. Neither tells you why a company
          should hear from you this week — and neither shows its work.
        </p>

        <div className="reveal lg:col-span-12">
          {/* Phones get a compact verdict matrix (icons only, notes kept for screen
              readers); from sm up the notes are shown and the table may scroll. */}
          <div className="overflow-x-auto rounded-3xl border border-line bg-panel shadow-card">
            <table className="w-full border-collapse text-left sm:min-w-[640px]">
              <caption className="sr-only">How Leadsmith compares with bought lead lists and web scrapers</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-5 sm:w-[31%] sm:px-6">
                    <span className="sr-only">Capability</span>
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.name}
                      scope="col"
                      className={cn(
                        "w-[4.6rem] px-1.5 py-5 text-center align-bottom text-[0.76rem] font-medium text-ink-2 sm:w-auto sm:px-4 sm:text-left sm:text-[0.8rem]",
                        col.name === "Leadsmith" && "bg-ember/[0.07] text-ink",
                      )}
                    >
                      {col.name === "Leadsmith" ? (
                        <span className="inline-flex flex-col items-center gap-1.5 font-display text-base leading-none text-ink sm:flex-row sm:gap-2 sm:text-xl">
                          <LogoMark className="size-5" />
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
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-4 py-4 text-[0.9rem] font-medium leading-snug text-ink sm:px-6 sm:text-[0.98rem]">
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => {
                      const meta = ICON[cell.v];
                      const Icon = meta.icon;
                      return (
                        <td key={i} className={cn("px-1.5 py-4 align-middle sm:px-4 sm:align-top", i === 2 && "bg-ember/[0.07]")}>
                          <span className="flex items-start justify-center gap-2.5 sm:justify-start">
                            <span
                              className={cn(
                                "inline-flex size-6 shrink-0 items-center justify-center rounded-full sm:mt-0.5 sm:size-5",
                                meta.cls,
                              )}
                            >
                              <Icon className="size-3.5 sm:size-3" strokeWidth={2.6} aria-hidden />
                            </span>
                            <span className={cn("sr-only text-[0.84rem] leading-snug sm:not-sr-only", i === 2 ? "text-ink" : "text-ink-2")}>
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
          </div>
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
    </section>
  );
}
