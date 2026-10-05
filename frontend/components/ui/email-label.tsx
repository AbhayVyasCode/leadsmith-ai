import { Badge } from "@/components/ui/badge";

type Kind = "found" | "verify" | "verified" | "guessed" | "unknown" | string;

const META: Record<string, { tone: "ok" | "warn" | "neutral"; label: string; hint: string }> = {
  found: { tone: "ok", label: "Found", hint: "Printed on the company’s own site" },
  verify: { tone: "ok", label: "Verified", hint: "Confirmed deliverable by Hunter.io" },
  verified: { tone: "ok", label: "Verified", hint: "Confirmed deliverable by Hunter.io" },
  guessed: { tone: "warn", label: "Guessed", hint: "Name pattern on a domain whose mail server we checked" },
  unknown: { tone: "neutral", label: "Unknown", hint: "No email found" },
};

export function emailMeta(kind: Kind) {
  return META[kind] ?? META.unknown;
}

/** Honest email-confidence label — a guess never looks like a fact. */
export function EmailLabel({ kind, className }: { kind: Kind; className?: string }) {
  const meta = emailMeta(kind);
  return (
    <Badge tone={meta.tone} title={meta.hint} className={className}>
      {meta.label}
    </Badge>
  );
}
