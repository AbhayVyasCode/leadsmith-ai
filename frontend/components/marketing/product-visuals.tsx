import { Check, Copy, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Static product mockups — recreations of the app UI used to
   illustrate marketing pages. Server-safe (no hooks).
   ============================================================ */

/** Circular 0–100 score ring, color-banded + numeric (never color-only). */
export function ScoreArc({ value, size = 72 }: { value: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const band = value >= 70 ? "success" : value >= 40 ? "warning" : "danger";
  const offset = c * (1 - value / 100);
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`var(--${band})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="tnum absolute font-mono text-lg font-medium text-foreground">{value}</span>
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="tnum shrink-0 font-mono text-xs text-muted-foreground">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function EmailBadge({ status }: { status: "verified" | "guessed" | "unknown" }) {
  const map = {
    verified: { cls: "bg-success-soft text-success", label: "verified" },
    guessed: { cls: "bg-warning-soft text-warning", label: "guessed" },
    unknown: { cls: "bg-muted text-muted-foreground", label: "unknown" },
  } as const;
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", m.cls)}>
      <ShieldCheck className="size-2.5" aria-hidden />
      {m.label}
    </span>
  );
}

type MockLead = {
  company: string;
  domain: string;
  score: number;
  confidence: number;
  contact: { name: string; role: string; email: string; status: "verified" | "guessed" | "unknown" };
  angle: string;
  flags?: string[];
};

const LEADS: MockLead[] = [
  {
    company: "Northwind Apparel",
    domain: "northwind.co",
    score: 86,
    confidence: 0.82,
    contact: { name: "Maya Chen", role: "Head of Growth", email: "maya@northwind.co", status: "verified" },
    angle: "Ranking page 2 for their main category keywords — clear SEO upside.",
  },
  {
    company: "Brightloop Studio",
    domain: "brightloop.io",
    score: 64,
    confidence: 0.61,
    contact: { name: "Dev Patel", role: "Founder", email: "dev@brightloop.io", status: "guessed" },
    angle: "Recently hired a marketer; no blog or content engine yet.",
    flags: ["weak-evidence"],
  },
  {
    company: "Cedar & Co.",
    domain: "cedarandco.com",
    score: 78,
    confidence: 0.74,
    contact: { name: "Lena Ortiz", role: "VP Marketing", email: "lena@cedarandco.com", status: "verified" },
    angle: "Migrated to Shopify last quarter — strong intent signal.",
  },
];

/** A single detailed lead card (the "evidence behind every score" visual). */
export function LeadCardMock({ className }: { className?: string }) {
  const lead = LEADS[0];
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{lead.company}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{lead.domain}</p>
        </div>
        <ScoreArc value={lead.score} size={64} />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Confidence
        </p>
        <ConfidenceMeter value={lead.confidence} />
      </div>

      <div className="mt-4 rounded-lg bg-muted/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{lead.contact.name}</p>
            <p className="truncate text-xs text-muted-foreground">{lead.contact.role}</p>
          </div>
          <EmailBadge status={lead.contact.status} />
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 truncate font-mono text-xs text-link">
          <Mail className="size-3 shrink-0" aria-hidden />
          {lead.contact.email}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Why it fits — </span>
        {lead.angle}
      </p>
    </div>
  );
}

/** Compact ranked leads table. */
export function LeadsTableMock({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.06em] text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">Company</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
            <th className="px-4 py-3 text-right font-medium">Conf.</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Contact</th>
          </tr>
        </thead>
        <tbody>
          {LEADS.map((l) => {
            const band = l.score >= 70 ? "text-success" : l.score >= 40 ? "text-warning" : "text-danger";
            return (
              <tr key={l.company} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{l.company}</p>
                  <p className="font-mono text-xs text-muted-foreground">{l.domain}</p>
                </td>
                <td className={cn("tnum px-4 py-3 text-right font-mono font-medium", band)}>{l.score}</td>
                <td className="tnum px-4 py-3 text-right font-mono text-muted-foreground">
                  {Math.round(l.confidence * 100)}%
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <p className="text-foreground">{l.contact.name}</p>
                  <p className="text-xs text-muted-foreground">{l.contact.role}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Drafted outreach card (the "outreach, drafted for you" visual). */
export function OutreachMock({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Drafted outreach
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          <Copy className="size-3" aria-hidden />
          Copy
        </span>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">Subject: </span>
        <span className="font-medium text-foreground">A quick idea for Northwind&apos;s category pages</span>
      </p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <p>Hi Maya,</p>
        <p>
          Noticed Northwind ranks just off page one for a few of your core category terms — usually a sign there&apos;s
          quick upside in on-page structure. Worth a 15-minute look?
        </p>
        <p>— Sent with evidence, not a template.</p>
      </div>
    </div>
  );
}

/** Run metrics strip (the transparency visual). */
export function MetricsMock({ className }: { className?: string }) {
  const metrics = [
    { v: "42", l: "LLM calls" },
    { v: "128", l: "Embeddings" },
    { v: "18.4k", l: "Tokens" },
    { v: "$0", l: "Est. cost" },
    { v: "2.3s", l: "Duration" },
  ];
  return (
    <div className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5", className)}>
      {metrics.map((m) => (
        <div key={m.l} className="flex flex-col gap-1 bg-surface p-4">
          <span className="tnum font-mono text-xl font-medium text-foreground">{m.v}</span>
          <span className="text-xs text-muted-foreground">{m.l}</span>
        </div>
      ))}
    </div>
  );
}

/** Stylized static agent-trace graph (supervisor → branches → steps). */
export function TraceMiniMock({ className }: { className?: string }) {
  const steps = ["scrape", "recall", "qualify", "critic", "enrich"];
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-xs font-semibold">S</span>
        </div>
        <span className="text-sm font-medium text-foreground">Supervisor</span>
      </div>
      <div className="ml-4 mt-1 border-l border-border pl-6">
        {["Northwind", "Cedar & Co."].map((branch, bi) => (
          <div key={branch} className={cn("relative", bi > 0 && "mt-4")}>
            <span className="absolute -left-6 top-3 h-px w-4 bg-border" aria-hidden />
            <p className="mb-2 text-xs font-medium text-muted-foreground">{branch}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {steps.map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px]",
                      i < 4
                        ? "border-success/30 bg-success-soft text-success"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {i < 4 ? <Check className="size-2.5" aria-hidden /> : null}
                    {s}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
