"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Mail,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, productMenu } from "@/lib/site";
import { cn } from "@/lib/utils";

const CAP_ICONS: Record<string, React.ReactNode> = {
  "/product#discovery": <Search aria-hidden />,
  "/product#qualify": <Target aria-hidden />,
  "/product#evidence": <ShieldCheck aria-hidden />,
  "/product#enrich": <Sparkles aria-hidden />,
  "/product#outreach": <Mail aria-hidden />,
  "/product#trace": <Network aria-hidden />,
};

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function SiteNav() {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/product" ? pathname.startsWith("/product") : pathname === href;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1020] border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8"
        aria-label="Primary"
      >
        <Brand href="/" />

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {/* Product mega-menu (CSS-driven: opens on hover or keyboard focus) */}
          <div className="group relative">
            <Link
              href="/product"
              aria-haspopup="true"
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive("/product") ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Product
              <ChevronDown
                aria-hidden
                className="size-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
              />
            </Link>

            <div
              className={cn(
                "invisible absolute left-1/2 top-full z-[1060] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 pt-3 opacity-0 transition-[opacity,transform] duration-200",
                "translate-y-1 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none",
              )}
            >
              <div className="grid grid-cols-[1.4fr_1fr] gap-1 rounded-xl border border-border bg-surface-2 p-2 shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/5">
                <div className="grid grid-cols-2 gap-0.5">
                  {productMenu.capabilities.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="group/item flex items-start gap-3 rounded-lg p-3 outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary [&_svg]:size-4">
                        {CAP_ICONS[c.href]}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{c.label}</span>
                        <span className="text-xs leading-snug text-muted-foreground">
                          {c.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2">
                  <span className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Learn
                  </span>
                  {productMenu.resources.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      className="rounded-md px-2 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {mainNav
            .filter((l) => l.href !== "/product")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive(l.href) ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/contact"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:inline-flex"
          >
            Contact
          </Link>
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/app">Open the app</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-sm">
              <SheetTitle>
                <Brand />
              </SheetTitle>
              <div className="mt-2 flex flex-col gap-1 overflow-y-auto">
                <span className="px-3 pt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Product
                </span>
                {productMenu.capabilities.map((c) => (
                  <MobileLink key={c.href} href={c.href} onNavigate={() => setOpen(false)}>
                    {c.label}
                  </MobileLink>
                ))}
                <div className="my-2 h-px bg-border" />
                {mainNav
                  .filter((l) => l.href !== "/product")
                  .concat([
                    { label: "About", href: "/about" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact", href: "/contact" },
                  ])
                  .map((l) => (
                    <MobileLink key={l.href} href={l.href} onNavigate={() => setOpen(false)}>
                      {l.label}
                    </MobileLink>
                  ))}
                <Button asChild className="mt-3">
                  <Link href="/app" onClick={() => setOpen(false)}>
                    Open the app
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function MobileLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </Link>
  );
}

/**
 * Thumb-zone sticky CTA bar — appears on mobile after the hero scrolls out.
 * Rendered once by the marketing layout.
 */
export function MobileCtaBar() {
  const scrolled = useScrolled(560);
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[1020] border-t border-border bg-background/90 p-3 backdrop-blur-md transition-[transform,opacity] duration-300 sm:hidden",
        scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <Button asChild className="w-full" size="lg">
        <Link href="/app">
          Open the app
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
