import type { Lead } from "@/lib/types";

/**
 * One CSV cell. Values come from scraped websites and model output, so cells
 * that a spreadsheet would treat as a formula (= + - @, tab, CR) are prefixed
 * with an apostrophe to neutralise CSV/formula injection.
 */
function csvCell(v: string | number | null | undefined): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const EMAIL_LABEL: Record<string, string> = {
  found: "Found",
  verify: "Verified",
  verified: "Verified",
  guessed: "Guessed",
  unknown: "Unknown",
};

/** Ranked leads → CSV (one row per lead, top contact). */
export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    "Company",
    "Website",
    "Fit score",
    "Confidence",
    "Contact",
    "Role",
    "Email",
    "Email label",
    "Outreach angle",
    "Flags",
  ];
  const rows = leads.map((l) => {
    const c = l.contacts[0];
    return [
      l.company.name,
      l.company.website,
      l.overall_score,
      l.confidence.toFixed(2),
      c?.name ?? "",
      c?.role ?? "",
      c?.email ?? "",
      c ? (EMAIL_LABEL[c.email_confidence] ?? c.email_confidence) : "",
      l.qualification.outreach_angle ?? "",
      l.flags.join("; "),
    ]
      .map(csvCell)
      .join(",");
  });
  return [headers.map(csvCell).join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
