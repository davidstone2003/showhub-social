import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNav } from "./MobileNav";
import { MobileHeader } from "./MobileHeader";
import { DiscoveryPanel } from "./DiscoveryPanel";
import { VerifyEmailBanner } from "./VerifyEmailBanner";

interface LayoutProps {
  children: React.ReactNode;
  showDiscovery?: boolean;
}

export function Layout({ children, showDiscovery = true }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <VerifyEmailBanner />

        <div className="flex-1 flex">
          <main className="flex-1 min-w-0">{children}</main>
          {showDiscovery && <DiscoveryPanel />}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
