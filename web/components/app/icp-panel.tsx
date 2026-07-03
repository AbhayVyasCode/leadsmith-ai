import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ICP } from "@/lib/types";

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

function Field({ label, value }: { label: string; value: string }) {
  const empty = value.trim().length === 0;
  return (
    <div className="rounded-xl border border-border/40 bg-surface/30 p-3">
      <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 block text-[13px]",
          empty ? "text-muted-foreground/40" : "font-medium text-foreground/80",
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
    <div className="flex flex-col gap-2">
      <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
        {label}
      </span>
      {items.length === 0 ? (
        <span className="text-sm text-muted-foreground">-</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} variant={variant}>
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Read-only summary of the inferred ideal customer profile.
 */
export function IcpPanel({ icp }: { icp: ICP }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-sm">
      <div className="border-b border-border/40 px-5 py-4">
        <h2 className="text-[13px] font-semibold text-foreground/90">Buyer profile</h2>
        <p className="mt-1 text-[12px] text-muted-foreground/50">
          The structured target Leadsmith inferred from your request.
        </p>
      </div>
      <div className="flex flex-col gap-5 p-5">
        <div className="grid grid-cols-1 gap-3">
          <Field label="Industry" value={icp.industry} />
          <Field label="Company size" value={icp.company_size} />
          <Field label="Geography" value={icp.geography} />
        </div>

        <div className="flex flex-col gap-5 border-t border-border pt-5">
          <ChipGroup
            label="Pain points"
            items={icp.pain_points}
            variant="warning"
          />
          <ChipGroup
            label="Buying signals"
            items={icp.buying_signals}
            variant="primary"
          />
          <ChipGroup
            label="Decision-maker roles"
            items={icp.decision_maker_roles}
            variant="outline"
          />
          <ChipGroup label="Keywords" items={icp.keywords} variant="default" />
        </div>
      </div>
    </section>
  );
}
