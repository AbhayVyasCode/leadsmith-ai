import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NoLeadsReason, RunReport } from "@/lib/types";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ScoreBand = "low" | "mid" | "high";

/** Map a 0–100 fit score to a semantic band (matches backend min-score gating). */
export function scoreBand(score: number): ScoreBand {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

/** Tailwind text/bg token name for a score band. */
export const bandToken: Record<ScoreBand, { fg: string; bg: string; label: string }> = {
  high: { fg: "text-success", bg: "bg-success-soft", label: "Strong fit" },
  mid: { fg: "text-warning", bg: "bg-warning-soft", label: "Possible fit" },
  low: { fg: "text-danger", bg: "bg-danger-soft", label: "Weak fit" },
};

/** Format a USD cost estimate, showing the free-tier reality. */
export function formatCost(usd: number): string {
  if (!usd) return "$0";
  return `$${usd.toFixed(4)}`;
}

/** Compact thousands formatting for token counts. */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/**
 * Classify why a run produced no leads (mirrors backend RunReport.no_leads_reason):
 * "no_candidates" | "all_known" | "below_gate" | null when leads exist.
 */
export function noLeadsReason(report: RunReport): NoLeadsReason {
  if (report.leads.length > 0) return null;
  if (report.candidates_found === 0) return "no_candidates";
  if (report.candidates_skipped >= report.candidates_found) return "all_known";
  const scanned = report.candidates_found - report.candidates_skipped;
  // Every scanned company errored (usually an API rate limit) — not low scores.
  if ((report.metrics?.errors ?? 0) >= Math.max(1, scanned)) return "errors";
  return "below_gate";
}
