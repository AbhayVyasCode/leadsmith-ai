import type { Lead } from "@/lib/types";

/** Quote a CSV cell when it contains a comma, quote, or newline. */
function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Flatten the ranked leads into a CSV string (one row per lead, top contact). */
export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    "Company",
    "Website",
    "Score",
    "Confidence",
    "Contact",
    "Role",
    "Email",
    "Email confidence",
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
      c?.email_confidence ?? "",
      l.qualification.outreach_angle ?? "",
      l.flags.join("; "),
    ]
      .map(csvCell)
      .join(",");
  });
  return [headers.map(csvCell).join(","), ...rows].join("\n");
}

/** Trigger a client-side download of a CSV string. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
