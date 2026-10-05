import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ArrowGlyph, buttonVariants } from "@/components/ui/button";
import { siteNav } from "@/lib/site";
import { cn } from "@/lib/cn";
import s from "./site-header.module.css";

export function SiteHeader() {
  return (
    <header className={cn(s.header, "fixed inset-x-0 top-0 z-50")}>
      <div className="wrapper flex h-[72px] items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {siteNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[0.9rem] text-ink-2 transition-colors duration-200 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/app" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
            Start a search
            <ArrowGlyph />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
