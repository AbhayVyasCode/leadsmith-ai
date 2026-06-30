import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Reusable primary/secondary CTA group with a trust line.
 * Defaults to the single primary action repeated across the marketing site.
 */
export function CtaGroup({
  primaryLabel = "Open the app",
  primaryHref = siteConfig.appUrl,
  secondaryLabel,
  secondaryHref,
  trust = "Evidence-backed leads with inspectable reasoning",
  align = "start",
  size = "lg",
  className,
}: {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  trust?: string | null;
  align?: "start" | "center";
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center" : "items-start",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size={size}>
          <Link href={primaryHref}>
            {primaryLabel}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        {secondaryLabel && secondaryHref ? (
          <Button asChild size={size} variant="ghost">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
      {trust ? (
        <p className="text-sm text-muted-foreground">{trust}</p>
      ) : null}
    </div>
  );
}
