"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OutreachDraft } from "@/lib/types";

export function OutreachCard({
  outreach,
  company,
}: {
  outreach: OutreachDraft;
  company: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const payload = `Subject: ${outreach.subject}\n\n${outreach.body}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Outreach copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — try selecting the text manually");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground/70">Outreach draft</span>
          <Badge variant="primary" className="text-[10px]">Draft</Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy outreach draft for ${company}`}
          className="gap-1.5 text-[11px] text-muted-foreground/40 hover:text-foreground"
        >
          {copied ? (
            <>
              <Check aria-hidden className="size-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy aria-hidden className="size-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/30">
            Subject
          </span>
          <p className="text-[13px] font-medium text-foreground/70">{outreach.subject}</p>
        </div>

        <Separator className="my-3 bg-white/[0.04]" />

        <p className="whitespace-pre-line text-[13px] leading-relaxed text-foreground/60">
          {outreach.body}
        </p>
      </div>
    </div>
  );
}
