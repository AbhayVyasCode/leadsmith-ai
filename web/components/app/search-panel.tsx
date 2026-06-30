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

const TOGGLES: { key: "outreach" | "critic" | "trace"; label: string; hint: string }[] = [
  { key: "critic", label: "Critic review", hint: "Challenge weak matches before they reach the list" },
  { key: "outreach", label: "Draft outreach", hint: "Write a first message from the evidence" },
  { key: "trace", label: "Live trace", hint: "Record agent states, timings, and warnings" },
];

const MODES: { value: "customer" | "product"; label: string; hint: string }[] = [
  { value: "customer", label: "Target account search", hint: "Describe the companies you want" },
  { value: "product", label: "Product-to-buyer search", hint: "Paste a product URL or describe an offer" },
];

const WORKFLOW = [
  { icon: FileText, label: "Profile", body: "Extract buyer, pain, role, region, and timing clues" },
  { icon: Search, label: "Discover", body: "Search public signals for matching companies" },
  { icon: ShieldCheck, label: "Qualify", body: "Score fit, attach evidence, and challenge weak matches" },
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

function SettingSummary({ flags, activeToggles }: { flags: RunFlags; activeToggles: number }) {
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
    <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-stretch">
      <aside className="grid gap-4">
        <div className="premium-panel rounded-2xl p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-3 py-1.5 text-sm font-medium text-foreground">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Discovery command
          </div>
          <h1 className="mt-5 text-balance font-display text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground">
            Build an account list from a buyer signal.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Describe a market, product, hiring trigger, technology clue, or timing signal. Leadsmith turns it into a ranked list you can inspect before outreach.
          </p>
        </div>

        <div className="premium-panel overflow-hidden rounded-2xl">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Run sequence</p>
            <p className="mt-1 text-xs text-muted-foreground">A compact view of what happens after submit.</p>
          </div>
          <div className="divide-y divide-border">
            {WORKFLOW.map((step, index) => (
              <div key={step.label} className="grid grid-cols-[2.25rem_1fr] gap-3 px-5 py-4">
                <span className="tnum flex size-8 items-center justify-center rounded-lg bg-primary-soft font-mono text-xs font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <step.icon className="size-4 text-primary" aria-hidden />
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="premium-panel grid min-w-0 overflow-hidden rounded-2xl shadow-sm lg:grid-rows-[auto_1fr_auto]">
        <div className="border-b border-border bg-surface/60 px-4 py-3 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">New research run</p>
              <p className="mt-1 text-xs text-muted-foreground">Choose how Leadsmith should interpret your input.</p>
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
                      <Label htmlFor="flag-target">Target qualified leads</Label>
                      <span className="tnum font-mono text-sm text-foreground">{flags.targetLeads}</span>
                    </div>
                    <Slider
                      id="flag-target"
                      value={[flags.targetLeads]}
                      onValueChange={([v]) => setFlags((f) => ({ ...f, targetLeads: v }))}
                      min={1}
                      max={8}
                      step={1}
                      aria-label="Number of qualified leads to find"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="flag-min-score">Minimum score</Label>
                      <span className="tnum font-mono text-sm text-foreground">{flags.minScore}</span>
                    </div>
                    <Slider
                      id="flag-min-score"
                      value={[flags.minScore]}
                      onValueChange={([v]) => setFlags((f) => ({ ...f, minScore: v }))}
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Minimum qualifying score"
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t border-border pt-4">
                    {TOGGLES.map(({ key, label, hint }) => (
                      <div key={key} className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <Label htmlFor={`flag-${key}`} className="cursor-pointer">
                            {label}
                          </Label>
                          <span className="text-xs text-muted-foreground">{hint}</span>
                        </div>
                        <Switch
                          id={`flag-${key}`}
                          checked={flags[key]}
                          onCheckedChange={(checked) => setFlags((f) => ({ ...f, [key]: checked }))}
                          aria-label={label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        <div className="border-b border-border px-4 py-3 sm:px-5">
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
                    "inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
        </div>

        <Label htmlFor="search-request" className="sr-only">
          Describe who you want to find
        </Label>
        <Textarea
          id="search-request"
          ref={textareaRef}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: B2B SaaS companies hiring their first RevOps lead"
          className="min-h-56 resize-none border-0 bg-transparent px-5 py-6 text-lg leading-relaxed shadow-none focus-visible:border-0 focus-visible:outline-none"
          aria-describedby="search-hint"
        />

        <div className="flex flex-col gap-4 border-t border-border bg-surface/45 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <p id="search-hint" className="text-sm text-muted-foreground">
            {effectiveMode === "product"
              ? "Leadsmith reads the offer first, then searches for companies likely to need it."
              : "Leadsmith starts from your target-account description and builds the buyer profile."}
          </p>
          <div className="flex items-center gap-2 sm:ml-auto">
            {running ? (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button type="button" onClick={submit} disabled={!canSubmit} className="min-w-36" aria-busy={running}>
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

        <div className="border-t border-border px-5 py-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
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
                    className="h-auto max-w-full whitespace-normal rounded-full py-2 text-left font-normal text-muted-foreground hover:text-foreground"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/65 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Output packet
              </p>
              <div className="mt-3 grid gap-2">
                {OUTPUTS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
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
