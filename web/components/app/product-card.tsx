import { Badge } from "@/components/ui/badge";
import type { ProductProfile } from "@/lib/types";

/**
 * Product/reverse-ICP mode summary: shows what Leadsmith understood from the
 * pasted product or URL before the buyer list is trusted.
 */
export function ProductCard({ product }: { product: ProductProfile }) {
  return (
    <section className="premium-panel overflow-hidden rounded-2xl">
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Product read</h2>
          <Badge variant="primary">Product mode</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Leadsmith used this to infer likely buyers.
        </p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-medium text-foreground">
              {product.product_name || "-"}
            </span>
            {product.category ? (
              <span className="text-xs text-muted-foreground">{product.category}</span>
            ) : null}
          </div>
          {product.what_it_does ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.what_it_does}
            </p>
          ) : null}
        </div>

        {product.customer_segments.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
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
