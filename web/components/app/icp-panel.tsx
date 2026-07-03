import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ICP } from "@/lib/types";

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

function Field({ label, value }: { label: string; value: string }) {
  const empty = value.trim().length === 0;
  return (
    <div className="min-w-[140px] rounded-lg border border-border bg-surface shadow-sm p-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/30">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 block text-[13px]",
          empty ? "text-muted-foreground/40" : "font-medium text-foreground",
        )}
      >
        {empty ? "—" : value}
      </span>
    </div>
  );
}

function ChipGroup({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: BadgeVariant;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-[200px] flex-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/30">
        {label}
      </span>
      {items.length === 0 ? (
        <span className="text-[12px] text-muted-foreground/40">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((item) => (
            <Badge key={item} variant={variant} className="text-[10px]">
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function IcpPanel({ icp }: { icp: ICP }) {
  return (
    <section className="overflow-hidden rounded-xl premium-panel border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-[13px] font-medium text-foreground">Buyer profile</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">
          Inferred from your request
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 p-5">
        <div className="flex flex-wrap lg:flex-col gap-3 shrink-0 lg:w-48">
          <Field label="Industry" value={icp.industry} />
          <Field label="Size" value={icp.company_size} />
          <Field label="Geography" value={icp.geography} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 lg:border-l lg:border-t-0 border-t border-border lg:pl-6 pt-5 lg:pt-0 w-full items-start">
          <ChipGroup label="Pain points" items={icp.pain_points} variant="warning" />
          <ChipGroup label="Buying signals" items={icp.buying_signals} variant="primary" />
          <ChipGroup label="Roles" items={icp.decision_maker_roles} variant="outline" />
          <div className="lg:col-span-2">
            <ChipGroup label="Keywords" items={icp.keywords} variant="default" />
          </div>
        </div>
      </div>
    </section>
  );
}
