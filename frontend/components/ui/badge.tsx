import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Status chips. Color is never the only signal — always pair with text. */
export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.75rem] font-medium leading-5 [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-line bg-panel-2 text-ink-2",
        ember: "border-transparent bg-ember/12 text-ember-ink",
        ok: "border-transparent bg-ok/12 text-ok",
        warn: "border-transparent bg-warn/14 text-warn",
        bad: "border-transparent bg-bad/12 text-bad",
        outline: "border-line-2 bg-transparent text-ink-2",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
