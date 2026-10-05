import { cva } from "class-variance-authority";
import { clsx } from "clsx";

// Kept apart from button.tsx (which merges classes with tailwind-merge) so
// marketing-page client islands can style links as buttons without it.

/**
 * Pill buttons. Primary = ember fill with INK text (5.9:1 light / 6.8:1 dark;
 * white on ember would fail at ~3:1). Use `buttonVariants()` on <Link>.
 */
export const buttonVariants = cva(
  [
    "group/btn relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium",
    "outline-none transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-ember)]",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ember",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-ember text-on-ember shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_10px_28px_-12px_var(--ember)] hover:bg-[color-mix(in_oklab,var(--ember)_86%,white)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_14px_36px_-12px_var(--ember)]",
        secondary:
          "border border-line-2 bg-panel text-ink shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:border-ink-3 hover:bg-panel-2",
        ink: "bg-ink text-canvas hover:bg-[color-mix(in_oklab,var(--ink)_86%,var(--canvas))]",
        ghost: "text-ink-2 hover:bg-panel-2 hover:text-ink",
      },
      size: {
        sm: "h-9 px-4 text-[0.875rem] pointer-coarse:h-10",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-[3.25rem] px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/** Arrow that nudges on hover — put inside a button/link that has `group/btn`. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={clsx("size-4 transition-transform duration-300 ease-[var(--ease-ember)] group-hover/btn:translate-x-0.5", className)}
    >
      <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
