"use client";

import Link from "next/link";
import { ExternalLink, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowGlyph, Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/controls";
import { ConfirmDialog } from "@/components/ui/overlays";
import { ScoreRing } from "@/components/ui/score-ring";
import { leadsmith, type MemoryItem } from "@/lib/leadsmith-client";
import { hostOf, hrefOf } from "@/lib/utils";

/** Stored summaries look like "… — score N. Matched pains: …. Signals: …. Angle: …" */
function parseSummary(text: string) {
  const pick = (label: string, next?: string) => {
    const re = new RegExp(`${label}:\\s*(.*?)${next ? `\\.\\s*${next}:` : "$"}`, "s");
    const value = text.match(re)?.[1]?.trim().replace(/\.$/, "");
    return value && value !== "n/a" ? value : null;
  };
  return { pains: pick("Matched pains", "Signals"), signals: pick("Signals", "Angle"), angle: pick("Angle") };
}

export default function MemoryPage() {
  const [items, setItems] = useState<MemoryItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    leadsmith
      .getMemory(200)
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .catch(() => {
        setError("Couldn’t load memory. Is the research engine running?");
        setItems([]);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((m) => !q || m.meta.company.toLowerCase().includes(q) || m.text.toLowerCase().includes(q));
  }, [items, query]);

  const remove = async (item: MemoryItem) => {
    const before = items;
    setItems((list) => (list ?? []).filter((m) => m.id !== item.id));
    setTotal((t) => Math.max(0, t - 1));
    try {
      await leadsmith.deleteMemory(item.id);
      toast.success(`${item.meta.company} forgotten — it can be researched again`);
    } catch {
      setItems(before);
      toast.error("Couldn’t remove that memory");
    }
  };

  const clearAll = async () => {
    try {
      await leadsmith.clearMemory();
      setItems([]);
      setTotal(0);
      toast.success("Memory cleared");
    } catch {
      toast.error("Couldn’t clear memory");
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <header>
        <div>
          <p className="eyebrow text-ink-3">Workspace</p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,5.5vw,4.25rem)] leading-none tracking-[-0.02em] text-ink">
            Memory <span className="font-mono text-xl text-ink-3 tnum">{items ? total : ""}</span>
          </h1>
          <p className="mt-4 max-w-[60ch] text-ink-2">
            Every qualified company is remembered here. Future runs skip these companies and use them to calibrate new
            scores. Remove one to let Leadsmith research it again.
          </p>
        </div>
      </header>

      {/* Fixed-height toolbar: the list never jumps when the data (and these controls) arrive. */}
      <div className="mt-8 flex h-11 items-center gap-3">
        {items && items.length > 6 ? (
          <label className="flex h-full min-w-0 max-w-xl flex-1 items-center gap-3 rounded-full border border-line bg-panel px-5 focus-within:border-ember/50">
            <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
            <span className="sr-only">Filter memory</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by company or signal…"
              className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        ) : (
          <p className="flex-1 text-[0.9rem] text-ink-3">
            {items?.length ? `${total} ${total === 1 ? "company" : "companies"} remembered` : null}
          </p>
        )}
        {items?.length ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            aria-label="Clear memory"
            className="ml-auto shrink-0 text-bad hover:text-bad"
          >
            <Trash2 aria-hidden />
            <span className="hidden sm:inline">Clear memory</span>
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        {items === null ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-60 rounded-[1.25rem]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card grid place-items-center px-6 py-16 text-center">
            <p className="font-display text-[2rem] leading-tight text-ink">{error ? "Memory unavailable" : "Nothing remembered yet"}</p>
            <p className="mt-3 max-w-[46ch] text-ink-2">
              {error ?? "Qualified companies are saved here automatically after each run."}
            </p>
            <Link href="/app" className={`${buttonVariants()} mt-7`}>
              Start a search
              <ArrowGlyph />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const parsed = parseSummary(item.text);
              return (
                <li key={item.id} className="card flex flex-col p-5 transition-[border-color] hover:border-line-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-display text-[1.6rem] leading-tight text-ink">{item.meta.company}</p>
                      <a
                        href={hrefOf(item.meta.website)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-1 inline-flex items-center gap-1 font-mono text-[0.75rem] text-ink-3 hover:text-ember-ink"
                      >
                        {hostOf(item.meta.website)}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    </div>
                    <ScoreRing score={item.meta.score} size={50} />
                  </div>
                  <dl className="mt-5 grid grid-cols-1 flex-1 content-start gap-3 text-[0.86rem]">
                    {parsed.angle ? (
                      <div>
                        <dt className="text-[0.74rem] text-ink-3">Angle</dt>
                        <dd className="mt-0.5 leading-snug text-ink">{parsed.angle}</dd>
                      </div>
                    ) : null}
                    {parsed.pains ? (
                      <div>
                        <dt className="text-[0.74rem] text-ink-3">Matched pains</dt>
                        <dd className="mt-0.5 leading-snug text-ink-2">{parsed.pains}</dd>
                      </div>
                    ) : null}
                    {parsed.signals ? (
                      <div>
                        <dt className="text-[0.74rem] text-ink-3">Signals</dt>
                        <dd className="mt-0.5 leading-snug text-ink-2">{parsed.signals}</dd>
                      </div>
                    ) : null}
                    {!parsed.angle && !parsed.pains && !parsed.signals ? <dd className="leading-snug text-ink-2">{item.text}</dd> : null}
                  </dl>
                  <div className="mt-5 flex justify-end border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8rem] text-ink-3 transition-colors hover:bg-bad/10 hover:text-bad"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Forget
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear all memory?"
        body="Leadsmith will forget every company it has qualified, so future runs may research them again. Saved runs are kept."
        confirmLabel="Clear memory"
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}
