import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ICP, ProductProfile, RunMetrics } from "@/lib/types";
import { formatCompact, formatDuration } from "@/lib/utils";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <h2 className="eyebrow border-b border-line px-5 py-3.5 text-ink-3">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Chips({ label, items, tone }: { label: string; items: string[]; tone: "warn" | "ember" | "neutral" | "outline" }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-[0.78rem] text-ink-3">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} tone={tone} className="whitespace-normal text-left leading-snug">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function BuyerProfile({ icp }: { icp: ICP }) {
  return (
    <Card title="Buyer profile">
      <dl className="grid grid-cols-1 gap-3">
        {[
          ["Industry", icp.industry],
          ["Size", icp.company_size],
          ["Region", icp.geography],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[5rem_1fr] gap-3 text-[0.9rem]">
            <dt className="text-ink-3">{k}</dt>
            <dd className="text-ink">{v || "—"}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-line pt-5">
        <Chips label="Pains it solves" items={icp.pain_points} tone="warn" />
        <Chips label="Buying signals" items={icp.buying_signals} tone="ember" />
        <Chips label="Decision makers" items={icp.decision_maker_roles} tone="outline" />
      </div>
    </Card>
  );
}

export function ProductRead({ product }: { product: ProductProfile }) {
  return (
    <Card title="Your product, as read">
      <p className="font-display text-[1.6rem] leading-tight text-ink">{product.product_name || "Your product"}</p>
      {product.category ? <p className="mt-1 text-[0.85rem] text-ink-3">{product.category}</p> : null}
      {product.what_it_does ? <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-2">{product.what_it_does}</p> : null}
      {product.customer_segments.length ? (
        <div className="mt-4 border-t border-line pt-4">
          <Chips label="Likely buyers" items={product.customer_segments} tone="ember" />
        </div>
      ) : null}
    </Card>
  );
}

export function Warnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <section role="status" className="rounded-2xl border border-warn/30 bg-warn/[0.07] p-5">
      <p className="flex items-center gap-2 text-[0.9rem] font-medium text-ink">
        <AlertTriangle className="size-4 text-warn" aria-hidden />
        {warnings.length === 1 ? "1 step didn’t finish" : `${warnings.length} steps didn’t finish`}
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-2">
        {warnings.map((w, i) => (
          <li key={i} className="text-[0.84rem] leading-snug text-ink-2">
            {w}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.78rem] text-ink-3">The affected leads were kept and flagged.</p>
    </section>
  );
}

export function RunStats({ metrics, duration }: { metrics: RunMetrics; duration: number }) {
  const tiles = [
    { k: "Duration", v: formatDuration(duration) },
    { k: "Scanned", v: String(metrics.total_scanned ?? "—") },
    { k: "Model calls", v: String(metrics.llm_calls) },
    { k: "Tokens", v: formatCompact(metrics.total_tokens) },
    { k: "Cache hits", v: String(metrics.cache_hits) },
    { k: "Est. cost", v: metrics.estimated_cost_usd ? `$${metrics.estimated_cost_usd.toFixed(3)}` : "$0" },
  ];
  return (
    <Card title="Run metrics">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
        {tiles.map((t) => (
          <div key={t.k} className="bg-panel px-3.5 py-3">
            <dt className="text-[0.74rem] text-ink-3">{t.k}</dt>
            <dd className="mt-0.5 font-mono text-[1.05rem] text-ink tnum">{t.v}</dd>
          </div>
        ))}
      </dl>
      {metrics.errors ? (
        <p className="mt-3 text-[0.8rem] text-warn">
          {metrics.errors} {metrics.errors === 1 ? "company" : "companies"} failed to process.
        </p>
      ) : null}
    </Card>
  );
}
