import { Section } from "@/components/marketing/section";
import { CtaGroup } from "@/components/marketing/cta";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Reusable closing CTA panel — a focal surface with a cyan wash/glow.
 * Defaults to the canonical site-wide call to action.
 */
export function FinalCta({
  title = "Describe your next customer. Meet your pipeline.",
  sub = "Describe the companies you want to reach. Leadsmith AI researches, scores, reviews, enriches, and drafts the first message.",
  primaryLabel = "Open the app",
  primaryHref = "/app",
  secondaryLabel = "See how it works",
  secondaryHref = "/how-it-works",
  className,
}: {
  title?: string;
  sub?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}) {
  return (
    <Section py="lg" className={className}>
      <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface px-6 py-16 sm:px-12 sm:py-20">
        {/* cyan wash + dot grid, masked, motion-free */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-50"
          style={{
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, var(--foreground) 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, var(--foreground) 0%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{
            background: "radial-gradient(circle, var(--primary-soft) 0%, transparent 65%)",
          }}
        />
        <span aria-hidden className="grain-overlay -z-10" />

        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="font-display text-balance text-[clamp(1.875rem,3.5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">{sub}</p>
          <CtaGroup
            className="mt-8"
            align="center"
            primaryLabel={primaryLabel}
            primaryHref={primaryHref}
            secondaryLabel={secondaryLabel}
            secondaryHref={secondaryHref}
          />
        </Reveal>
      </div>
    </Section>
  );
}
