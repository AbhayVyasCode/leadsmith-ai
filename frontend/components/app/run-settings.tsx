"use client";

import { SlidersHorizontal } from "lucide-react";
import { Range, Switch } from "@/components/ui/controls";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "@/components/ui/overlays";
import type { RunFlags } from "@/lib/types";

export function settingsSummary(flags: RunFlags) {
  const parts = [`${flags.targetLeads} leads`, `min ${flags.minScore}`];
  if (flags.critic) parts.push("critic");
  if (flags.outreach) parts.push("drafts");
  return parts.join(" · ");
}

/** Run controls in a popover: target, score gate, critic and outreach toggles. */
export function RunSettings({ flags, onChange }: { flags: RunFlags; onChange: (flags: RunFlags) => void }) {
  const set = <K extends keyof RunFlags>(key: K, value: RunFlags[K]) => onChange({ ...flags, [key]: value });

  return (
    <PopoverRoot>
      <PopoverTrigger className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas px-3.5 text-[0.85rem] text-ink-2 transition-colors hover:border-line-2 hover:text-ink data-[state=open]:border-ember/50 data-[state=open]:text-ink">
        <SlidersHorizontal className="size-4" aria-hidden />
        <span className="font-mono text-[0.78rem]">{settingsSummary(flags)}</span>
      </PopoverTrigger>
      <PopoverContent className="w-[min(23rem,calc(100vw-2rem))] p-5">
        <p className="eyebrow text-ink-3">Run settings</p>
        <div className="mt-5 grid grid-cols-1 gap-6">
          <Range
            id="target-leads"
            label="Leads to find"
            value={flags.targetLeads}
            min={1}
            max={8}
            onValueChange={(v) => set("targetLeads", v)}
          />
          <Range
            id="min-score"
            label="Minimum fit score"
            value={flags.minScore}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => set("minScore", v)}
          />
          <div className="grid grid-cols-1 gap-5 border-t border-line pt-5">
            <Switch
              id="critic"
              label="Critic review"
              description="A second agent argues against each score. About one extra model call per lead."
              checked={flags.critic}
              onCheckedChange={(v) => set("critic", v)}
            />
            <Switch
              id="outreach"
              label="Draft first emails"
              description="A short opener per lead, grounded in its evidence. About one extra model call per lead."
              checked={flags.outreach}
              onCheckedChange={(v) => set("outreach", v)}
            />
          </div>
          <p className="rounded-xl bg-panel-2 p-3 text-[0.78rem] leading-snug text-ink-2">
            Runs stop after 16 companies or 4 search waves, whichever comes first — so a single search can’t drain a free
            tier.
          </p>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
