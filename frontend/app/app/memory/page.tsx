"use client";

import * as React from "react";
import { Brain, Trash2, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { leadsmith, MemoryItem } from "@/lib/leadsmith-client";
import { Button } from "@/components/ui/button";

function ScoreRing({ score }: { score: number }) {
  const isHigh = score >= 75;
  const isMed = score >= 50 && score < 75;
  
  const ringColor = isHigh ? "text-success" : isMed ? "text-warning" : "text-muted-foreground";
  const bgRingColor = isHigh ? "text-success-soft" : isMed ? "text-warning-soft" : "text-border";
  
  const offset = 100 - score;

  return (
    <div className="relative flex size-10 items-center justify-center shrink-0">
      <svg className="absolute inset-0 size-10 -rotate-90" viewBox="0 0 36 36">
        <circle
          className={bgRingColor}
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
        <circle
          className={ringColor}
          strokeWidth="3"
          strokeDasharray="100"
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
      </svg>
      <span className="text-[12px] font-bold tnum">{score}</span>
    </div>
  );
}

export default function MemoryPage() {
  const [items, setItems] = React.useState<MemoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [clearing, setClearing] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchMemory = async () => {
    try {
      const res = await leadsmith.getMemory();
      setItems(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMemory();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all memory? This cannot be undone.")) return;
    setClearing(true);
    try {
      await leadsmith.clearMemory();
      setItems([]);
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const ok = await leadsmith.deleteMemory(id);
      if (ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Brain className="size-5" />
              <h1 className="text-display-md font-bold tracking-tight text-foreground">
                Research Memory
              </h1>
            </div>
            <p className="text-[14px] text-muted-foreground/80 max-w-xl">
              This is the RAG (Retrieval-Augmented Generation) memory. Past research is stored here and recalled during future runs to calibrate the AI's scoring to your preferences.
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={loading || clearing || items.length === 0}
            className="shrink-0 text-danger hover:text-danger hover:bg-danger-soft border-danger-soft transition-colors"
          >
            {clearing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
            Clear Memory
          </Button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl shimmer-premium animate-pulse border border-border" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 py-20">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 border border-border">
              <Sparkles className="size-8 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Memory is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Run a Discovery search to start building your research memory. Leads that pass the qualifier will automatically appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => {
              const domain = item.meta.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
              const isDeleting = deletingId === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`premium-panel overflow-hidden rounded-2xl flex flex-col transition-opacity ${isDeleting ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                >
                  <div className="flex items-start justify-between gap-4 p-5 border-b border-border/50">
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {item.meta.company}
                      </h3>
                      <a
                        href={item.meta.website.startsWith('http') ? item.meta.website : `https://${item.meta.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors truncate"
                      >
                        {domain}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                    <ScoreRing score={item.meta.score} />
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <p className="text-[13px] leading-relaxed text-muted-foreground flex-1 line-clamp-4">
                      {item.text}
                    </p>
                    
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="h-8 text-xs text-muted-foreground/60 hover:text-danger hover:bg-danger/10"
                      >
                        {isDeleting ? <Loader2 className="size-3 mr-2 animate-spin" /> : <Trash2 className="size-3 mr-2" />}
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
