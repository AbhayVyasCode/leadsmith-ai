"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { clsx } from "clsx";
import { ArrowGlyph, buttonVariants } from "@/components/ui/button-variants";
import { siteNav } from "@/lib/site";
import s from "./mobile-menu.module.css";

/**
 * Full-screen mobile menu built on the native Popover API: top layer,
 * Esc + light-dismiss and focus handling come from the browser — the only
 * JS here closes it after an in-page anchor is followed.
 */
export function MobileMenu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const close = () => menuRef.current?.hidePopover();

  return (
    <>
      <button
        type="button"
        popoverTarget="site-menu"
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-panel-2 lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <div id="site-menu" ref={menuRef} popover="auto" className={s.menu}>
        <div className="flex h-[72px] items-center justify-between">
          <span className="eyebrow text-ink-3">Menu</span>
          <button
            type="button"
            popoverTarget="site-menu"
            popoverTargetAction="hide"
            aria-label="Close menu"
            className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-panel-2"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col">
          {siteNav.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={clsx(s.link, "border-b border-line py-4 font-display text-[2.6rem] leading-none text-ink")}
              style={{ "--i": i } as CSSProperties}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/app" onClick={close} className={clsx(buttonVariants({ size: "lg" }), s.cta, "mt-auto w-full")}>
          Start a search
          <ArrowGlyph />
        </Link>
      </div>
    </>
  );
}
