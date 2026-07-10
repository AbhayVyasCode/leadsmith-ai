import { LenisProvider } from "@/components/providers/lenis-provider";
import { SiteNav, MobileCtaBar } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

/**
 * Shared chrome for every marketing route: smooth-scroll, sticky nav, footer,
 * and the mobile thumb-zone CTA. The /app dashboard lives outside this group.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <MobileCtaBar />
    </LenisProvider>
  );
}
