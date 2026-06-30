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
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_8%,var(--primary-soft),transparent_34%),linear-gradient(180deg,var(--surface),var(--background)_38%)]"
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
