import { Badge } from "@/components/ui/badge";
import type { ProductProfile } from "@/lib/types";

export function ProductCard({ product }: { product: ProductProfile }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
      <div className="border-b border-white/[0.04] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[13px] font-medium text-foreground/60">
            Product read
          </h2>
          <Badge variant="primary" className="text-[10px]">Product mode</Badge>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground/30">
          Used to infer likely buyers
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[14px] font-medium text-foreground/80">
              {product.product_name || "—"}
            </span>
            {product.category && (
              <span className="text-[11px] text-muted-foreground/30">
                {product.category}
              </span>
            )}
          </div>
          {product.what_it_does && (
            <p className="text-[12px] leading-relaxed text-muted-foreground/40">
              {product.what_it_does}
            </p>
          )}
        </div>

        {product.customer_segments.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/30">
              Buyer segments
            </span>
            <div className="flex flex-wrap gap-1">
              {product.customer_segments.map((segment) => (
                <Badge key={segment} variant="outline" className="text-[10px]">
                  {segment}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
