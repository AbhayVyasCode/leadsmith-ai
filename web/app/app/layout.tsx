import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        <AppSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col lg:pl-[272px]">
          {/* Ambient background — subtle radial glow + soft gradient */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10"
            style={{
              background: [
                "radial-gradient(ellipse 60% 40% at 65% 4%, var(--primary-soft), transparent 50%)",
                "radial-gradient(ellipse 40% 30% at 85% 20%, oklch(0.67 0.12 78 / 0.04), transparent 50%)",
                "linear-gradient(180deg, var(--surface) 0%, var(--background) 480px)",
              ].join(", "),
            }}
          />
          <AppHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
