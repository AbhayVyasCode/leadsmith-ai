"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_FLAGS, type RunFlags } from "@/lib/types";
import { EXAMPLE_QUERIES } from "@/lib/marketing-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface SearchPanelProps {
  onRun: (request: string, flags: RunFlags) => void;
  running: boolean;
  onCancel: () => void;
}

const TOGGLES: {
  key: "outreach" | "critic" | "trace";
  label: string;
  hint: string;
}[] = [
  {
    key: "critic",
    label: "Critic review",
    hint: "Challenge weak matches before they reach the list",
  },
  {
    key: "outreach",
    label: "Draft outreach",
    hint: "Write a first message from the evidence",
  },
  {
    key: "trace",
    label: "Live trace",
    hint: "Record agent states, timings, and warnings",
  },
];

const MODES: { value: "customer" | "product"; label: string; hint: string }[] =
  [
    {
      value: "customer",
      label: "Target account search",
      hint: "Describe the companies you want",
    },
    {
      value: "product",
      label: "Product-to-buyer search",
      hint: "Paste a product URL or describe an offer",
    },
  ];

const WORKFLOW = [
  {
    icon: FileText,
    label: "Profile",
    body: "Extract buyer, pain, role, region, and timing clues",
  },
  {
    icon: Search,
    label: "Discover",
    body: "Search public signals for matching companies",
  },
  {
    icon: ShieldCheck,
    label: "Qualify",
    body: "Score fit, attach evidence, and challenge weak matches",
  },
];

const OUTPUTS = [
  "Fit-ranked company list",
  "Evidence and confidence per account",
  "Contact direction and first-message angle",
];

function looksLikeUrl(s: string): boolean {
  return /https?:\/\/\S+|\b[a-z0-9-]+\.(?:com|org|net|io|ai|co|dev|app|so|sh|tech|cloud)\b/i.test(
    s,
  );
}

function SettingSummary({
  flags,
  activeToggles,
}: {
  flags: RunFlags;
  activeToggles: number;
}) {
  return (
    <span className="tnum hidden font-mono text-xs text-muted-foreground sm:inline">
      {flags.targetLeads} leads / min {flags.minScore}
      {activeToggles > 0 ? ` / ${activeToggles} checks` : ""}
    </span>
  );
}

export function SearchPanel({ onRun, running, onCancel }: SearchPanelProps) {
  const [request, setRequest] = React.useState("");
  const [flags, setFlags] = React.useState<RunFlags>(DEFAULT_FLAGS);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const trimmed = request.trim();
  const canSubmit = trimmed.length > 0 && !running;
  const urlDetected = looksLikeUrl(trimmed);
  const effectiveMode: "customer" | "product" =
    flags.mode === "auto" ? (urlDetected ? "product" : "customer") : flags.mode;
  const activeToggles = TOGGLES.filter((t) => flags[t.key]).length;

  const submit = React.useCallback(() => {
    const value = request.trim();
    if (!value || running) return;
    onRun(value, flags);
  }, [request, running, flags, onRun]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const applyExample = (q: string) => {
    setRequest(q);
    textareaRef.current?.focus();
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[26rem_minmax(0,1fr)] lg:items-stretch">
      <aside className="grid gap-5">
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-background to-accent-warm/[0.03] shadow-lg shadow-primary/[0.03]">
          <div className="relative px-7 py-7 sm:px-8 sm:py-8">
            {/* Decorative accent line — refined */}
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-primary via-primary/50 to-accent-warm/30" />

            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[13px] font-semibold text-primary ring-1 ring-primary/10">
              <Sparkles className="size-3.5" aria-hidden />
              Discovery command
            </div>
            <h1 className="mt-6 text-balance font-display text-[clamp(1.85rem,3.4vw,2.85rem)] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
              Build an account list from a buyer signal.
            </h1>
            <p className="mt-4 text-[0.9375rem] leading-[1.65] text-muted-foreground/70">
              Describe a market, product, hiring trigger, technology clue, or
              timing signal. Leadsmith turns it into a ranked list you can
              inspect before outreach.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/40 bg-surface/60 shadow-md">
          <div className="border-b border-border/40 px-6 py-4">
            <p className="text-sm font-bold tracking-[-0.01em] text-foreground">
              Run sequence
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground/60">
              A compact view of what happens after submit.
            </p>
          </div>
          <div className="px-6 pb-5 pt-4">
            <div className="flex flex-col gap-2">
              {WORKFLOW.map((step, index) => (
                <div
                  key={step.label}
                  className="group flex items-start gap-4 rounded-xl border border-transparent p-3.5 transition-all duration-200 hover:border-primary/15 hover:bg-primary/[0.03]"
                >
                  <span className="tnum flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary transition-all duration-200 group-hover:bg-primary/15 group-hover:scale-105">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <step.icon className="size-4 text-primary/70" aria-hidden />
                      {step.label}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground/60">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="grid min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-surface/80 shadow-xl shadow-black/[0.03] backdrop-blur-sm lg:grid-rows-[auto_1fr_auto] dark:border-white/[0.06] dark:shadow-black/[0.15]">
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 sm:px-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold tracking-[-0.01em] text-foreground">
                New research run
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose how Leadsmith should interpret your input.
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={running}
                  className="gap-2"
                >
                  <SlidersHorizontal className="size-4" aria-hidden />
                  Controls
                  <SettingSummary flags={flags} activeToggles={activeToggles} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="flag-target">
                        Target qualified leads
                      </Label>
                      <span className="tnum font-mono text-sm text-foreground">
                        {flags.targetLeads}
                      </span>
                    </div>
                    <Slider
                      id="flag-target"
                      value={[flags.targetLeads]}
                      onValueChange={([v]) =>
                        setFlags((f) => ({ ...f, targetLeads: v }))
                      }
                      min={1}
                      max={8}
                      step={1}
                      aria-label="Number of qualified leads to find"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="flag-min-score">Minimum score</Label>
                      <span className="tnum font-mono text-sm text-foreground">
                        {flags.minScore}
                      </span>
                    </div>
                    <Slider
                      id="flag-min-score"
                      value={[flags.minScore]}
                      onValueChange={([v]) =>
                        setFlags((f) => ({ ...f, minScore: v }))
                      }
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Minimum qualifying score"
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t border-border pt-4">
                    {TOGGLES.map(({ key, label, hint }) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <Label
                            htmlFor={`flag-${key}`}
                            className="cursor-pointer"
                          >
                            {label}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {hint}
                          </span>
                        </div>
                        <Switch
                          id={`flag-${key}`}
                          checked={flags[key]}
                          onCheckedChange={(checked) =>
                            setFlags((f) => ({ ...f, [key]: checked }))
                          }
                          aria-label={label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {MODES.map((m) => {
              const active = effectiveMode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setFlags((f) => ({ ...f, mode: m.value }))}
                  disabled={running}
                  aria-pressed={active}
                  title={m.hint}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-lg px-5 text-sm font-semibold outline-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <Label htmlFor="search-request" className="sr-only">
          Describe who you want to find
        </Label>
        <div className="relative">
          <Textarea
            id="search-request"
            ref={textareaRef}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example: B2B SaaS companies hiring their first RevOps lead"
            className="min-h-56 resize-none border-0 bg-transparent px-6 py-7 text-lg leading-relaxed shadow-none placeholder:text-muted-foreground/50 focus-visible:border-0 focus-visible:outline-none"
            aria-describedby="search-hint"
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-border/40 bg-gradient-to-r from-primary/[0.03] to-transparent px-6 py-4 sm:flex-row sm:items-center">
          <p id="search-hint" className="text-[13px] leading-relaxed text-muted-foreground/70">
            {effectiveMode === "product"
              ? "Leadsmith reads the offer first, then searches for companies likely to need it."
              : "Leadsmith starts from your target-account description and builds the buyer profile."}
          </p>
          <div className="flex items-center gap-2.5 sm:ml-auto">
            {running ? (
              <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="min-w-[140px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:brightness-110"
              aria-busy={running}
            >
              {running ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Searching
                </>
              ) : (
                <>
                  <Search aria-hidden />
                  Build pipeline
                  <ArrowRight aria-hidden />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="px-6 py-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                Try a researched query
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyExample(q)}
                    disabled={running}
                    className="h-auto max-w-full whitespace-normal rounded-full border-border/50 py-2 text-left font-normal text-muted-foreground/80 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.04] hover:text-foreground"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-5">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-primary/80">
                Output packet
              </p>
              <div className="mt-3 grid gap-2.5">
                {OUTPUTS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-primary/70"
                      aria-hidden
                    />
                    <p className="text-[13px] leading-relaxed text-foreground/70">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
