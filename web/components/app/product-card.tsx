import { Badge } from "@/components/ui/badge";
import type { ProductProfile } from "@/lib/types";

/**
 * Product/reverse-ICP mode summary: shows what Leadsmith understood from the
 * pasted product or URL before the buyer list is trusted.
 */
export function ProductCard({ product }: { product: ProductProfile }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-sm">
      <div className="border-b border-border/40 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground/90">
            Product read
          </h2>
          <Badge variant="primary">Product mode</Badge>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground/50">
          Leadsmith used this to infer likely buyers.
        </p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[15px] font-medium text-foreground/90">
              {product.product_name || "—"}
            </span>
            {product.category ? (
              <span className="text-[12px] text-muted-foreground/50">
                {product.category}
              </span>
            ) : null}
          </div>
          {product.what_it_does ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground/60">
              {product.what_it_does}
            </p>
          ) : null}
        </div>

        {product.customer_segments.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border/40 pt-4">
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
              Likely buyer segments
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.customer_segments.map((segment) => (
                <Badge key={segment} variant="outline">
                  {segment}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
