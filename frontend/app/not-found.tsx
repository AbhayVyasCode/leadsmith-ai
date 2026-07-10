import type { Metadata } from "next";
import Link from "next/link";
import { Brand, BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for may be broken or moved.",
};

const POPULAR_LINKS = [
  { label: "Product", href: "/product" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Blog", href: "/blog" },
] as const;

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-[1280px] items-center px-5 py-5 sm:px-8">
        <Brand href="/" />
      </header>

      <div className="grid min-h-[70vh] place-items-center px-5 text-center">
        <div className="mx-auto max-w-md">
          <BrandMark glow className="mx-auto size-12" />

          <p className="mt-7 font-mono text-sm uppercase tracking-widest text-primary">
            404
          </p>

          <h1 className="mt-3 text-balance text-[clamp(2.25rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground">
            This page got away.
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            The link may be broken, or the page may have moved.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/app">Open the app</Link>
            </Button>
          </div>

          <nav
            aria-label="Popular pages"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
          >
            {POPULAR_LINKS.map((link, i) => (
              <span key={link.href} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="text-border">
                    &middot;
                  </span>
                )}
                <Link
                  href={link.href}
                  className="rounded-sm underline-offset-4 outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
