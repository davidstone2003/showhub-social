import { Plus } from "lucide-react";
import { Link, useLocation, useMatch } from "react-router-dom";
import { BackdropLogo } from "@/components/RinglyLogo";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { BackButton } from "@/components/BackButton";
import { GlobalSpeciesSwitcher } from "@/components/GlobalSpeciesSwitcher";

// Routes where the species switcher is hidden (submit flows + post detail)
const HIDE_SWITCHER_ROUTES = (path: string) =>
  path.startsWith("/submit") || path.startsWith("/auth") || path.startsWith("/onboarding") || path.startsWith("/account-type");


// Top-level tab roots — these show the logo, not a back button
const ROOT_ROUTES = new Set([
  "/",
  "/index",
  "/winners",
  "/sales",
  "/breeders",
  "/sires",
  "/market",
  "/dashboard",
]);

// Routes that have their own page-level search; suppress the global search icon here
const PAGES_WITH_OWN_SEARCH = new Set(["/winners", "/breeders", "/sires", "/sales", "/market"]);

// Routes where the global species switcher is shown (directory/data pages only)
const SPECIES_SWITCHER_ROUTES = new Set(["/winners", "/breeders", "/sires", "/sales", "/market"]);

// Map of route patterns -> screen titles for the back-button header
const TITLE_RULES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/submit", title: "New Post" },
  { match: (p) => p === "/submit/legacy", title: "Add Result" },
  { match: (p) => p === "/submit-sire", title: "Add Sire" },
  { match: (p) => p === "/auth", title: "Sign In" },
  { match: (p) => p === "/reset-password", title: "Reset Password" },
  { match: (p) => p === "/onboarding", title: "Welcome" },
  { match: (p) => p === "/account-type", title: "Account Type" },
  { match: (p) => p === "/pricing", title: "Pricing" },
  { match: (p) => p === "/saved", title: "Saved" },
  { match: (p) => p === "/repo", title: "Repo" },
  { match: (p) => p === "/admin", title: "Admin" },
  { match: (p) => p === "/events", title: "Events" },
  { match: (p) => p.startsWith("/events/"), title: "Event" },
  { match: (p) => p.startsWith("/breeders/"), title: "Breeders" },
  { match: (p) => p.startsWith("/breeder/"), title: "Breeder" },
  { match: (p) => p.startsWith("/animal/"), title: "Animal" },
  { match: (p) => p.startsWith("/sire/"), title: "Sire" },
  { match: (p) => p.startsWith("/lamb/"), title: "Lamb" },
  { match: (p) => p.startsWith("/live"), title: "Live" },
  { match: (p) => p === "/dashboard/lambs", title: "My Lambs" },
  { match: (p) => p === "/dashboard/lambs/new", title: "Register Lamb" },
  { match: (p) => p === "/haulers", title: "Haulers" },
];

function getTitle(path: string): string {
  const rule = TITLE_RULES.find((r) => r.match(path));
  return rule?.title ?? "";
}

// Context-aware create CTA per route. `to: null` hides the button entirely.
function getCreateCTA(path: string): { label: string; to: string | null } {
  if (path === "/winners") return { label: "Post Win", to: "/submit?type=win" };
  if (path === "/market" || path === "/sales") return { label: "Post Listing", to: "/submit?type=listing" };
  if (path === "/sires") return { label: "Submit Sire", to: "/submit-sire" };
  if (path === "/breeders") return { label: "", to: null };
  return { label: "Post", to: "/submit" };
}

export function MobileHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isRoot = ROOT_ROUTES.has(pathname);
  const cta = getCreateCTA(pathname);

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-border" style={{ padding: '8px 12px' }}>
      <div className="flex items-center justify-between gap-2">
        {isRoot ? (
          <BackdropLogo size="sm" showTagline={false} onDark={false} />
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <BackButton fallback="/" />
            <span className="text-sm font-bold text-foreground truncate">
              {getTitle(pathname)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {!HIDE_SWITCHER_ROUTES(pathname) && <GlobalSpeciesSwitcher variant="header" />}

          {user ? (
            <>
              <NotificationBell />
              {cta.to && (
                <Link
                  to={cta.to}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shrink-0"
                  style={{ borderRadius: '10px', height: '36px', padding: '0 14px', fontSize: '14px' }}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  {cta.label}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/auth?mode=signup"
                className="flex items-center bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shrink-0"
                style={{ borderRadius: '10px', height: '34px', padding: '0 14px', fontSize: '13px' }}
              >
                Join Free
              </Link>
              <Link
                to="/auth"
                className="flex items-center text-muted-foreground font-medium hover:text-foreground transition-colors"
                style={{ fontSize: '13px', padding: '0 4px' }}
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
