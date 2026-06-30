"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OutreachDraft } from "@/lib/types";

/**
 * Renders a generated outreach draft (subject + body) for a company with a
 * one-click copy to clipboard. The copy button briefly swaps to a check icon as
 * confirmation and fires a success toast. Body preserves the model's line breaks
 * via `whitespace-pre-line`.
 */
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
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 p-5">
        <div className="flex min-w-0 items-center gap-2">
          <CardTitle className="text-sm">Outreach draft</CardTitle>
          <Badge variant="primary">Draft</Badge>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy outreach draft for ${company}`}
        >
          {copied ? (
            <>
              <Check aria-hidden className="text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy aria-hidden />
              Copy
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Subject
          </span>
          <p className="font-medium text-foreground">{outreach.subject}</p>
        </div>

        <Separator className="my-4" />

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {outreach.body}
        </p>
      </CardContent>
    </Card>
  );
}
