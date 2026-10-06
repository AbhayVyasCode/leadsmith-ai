import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ArrowGlyph, buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-dvh grid-rows-[auto_1fr] overflow-hidden">
      <div aria-hidden className="ledger pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,#000_20%,transparent_75%)]" />
      <header className="wrapper relative flex h-[72px] items-center">
        <Logo />
      </header>
      <div className="wrapper relative grid place-items-center pb-24 text-center">
        <div>
          <LogoMark className="mx-auto size-16" />
          <p className="eyebrow mt-8 text-ember-ink">Error 404</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.92] tracking-[-0.025em] text-ink">
            Nothing forged <em className="text-ember-ink">here.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[40ch] text-lg text-ink-2">
            The page you’re after doesn’t exist, or it moved. Let’s get you somewhere useful.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Back to home
            </Link>
            <Link href="/app" className={buttonVariants({ size: "lg" })}>
              Start a search
              <ArrowGlyph />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
