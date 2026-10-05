import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { ThemeSwitch } from "@/components/theme/theme-toggle";
import { footerNav } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="wrapper grid grid-cols-2 gap-x-6 gap-y-12 pb-12 pt-20 md:grid-cols-12">
        <div className="col-span-2 md:col-span-6">
          <div className="flex items-center gap-2 text-ink">
            <LogoMark />
            <span className="font-display text-[1.6rem] leading-none">Leadsmith</span>
          </div>
          <p className="mt-5 max-w-sm text-ink-2">
            An open-web research desk for B2B prospecting. One plain-English brief, six agents, and evidence on every
            score.
          </p>
          <ThemeSwitch className="mt-8" />
        </div>
        {footerNav.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-2">
            <p className="eyebrow text-ink-3">{col.title}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-[0.95rem] text-ink-2 transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div aria-hidden className="wrapper pointer-events-none select-none">
        <p className="-mb-[0.18em] bg-linear-to-b from-ink/90 via-ink/40 to-ink/0 bg-clip-text font-display text-[clamp(5.5rem,23vw,21rem)] leading-[0.8] tracking-[-0.045em] text-transparent">
          Leadsmith
        </p>
      </div>

      <div className="relative border-t border-line bg-canvas">
        <div className="wrapper flex flex-col gap-2 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Leadsmith. Research you can check.</p>
          <p className="font-mono text-xs">Runs on NVIDIA NIM · Tavily · Gemini embeddings</p>
        </div>
      </div>
    </footer>
  );
}
