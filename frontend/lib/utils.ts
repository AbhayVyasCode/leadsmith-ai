import type { NoLeadsReason, RunReport } from "@/lib/types";

export type ScoreBand = "high" | "mid" | "low";

/** 0–100 fit score → band. Same thresholds everywhere in the UI. */
export function scoreBand(score: number): ScoreBand {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

/** Why a finished run has no leads (mirrors backend RunReport.no_leads_reason). */
export function noLeadsReason(report: RunReport): NoLeadsReason {
  if (report.leads.length > 0) return null;
  if (report.candidates_found === 0) return "no_candidates";
  if (report.candidates_skipped >= report.candidates_found) return "all_known";
  const scanned = report.candidates_found - report.candidates_skipped;
  if ((report.metrics?.errors ?? 0) >= Math.max(1, scanned)) return "errors";
  return "below_gate";
}

/** "https://www.acme.com/" → "acme.com" */
export function hostOf(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

/** Ensure a scheme so an LLM/website string is a safe absolute link. */
export function hrefOf(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** Unix seconds → "just now" / "5m ago" / "3h ago" / "Mar 4". */
export function formatRelative(unixSeconds: number): string {
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 86400 * 6) return `${Math.round(diff / 86400)}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
