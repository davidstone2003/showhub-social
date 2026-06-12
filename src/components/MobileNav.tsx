import { Home, Trophy, Users, Dna, ShoppingBag, Coins } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Trophy, label: "Winners", to: "/winners" },
  { icon: Coins, label: "Sales", to: "/sales" },
  { icon: Users, label: "Breeders", to: "/breeders" },
  { icon: Dna, label: "Sires", to: "/sires" },
  { icon: ShoppingBag, label: "Market", to: "/market" },
];

const ACTIVE = "#C9A84C";

export function MobileNav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/index";
  const navBg = isHome ? "#FFFFFF" : "#0A1628";
  const navBorder = isHome ? "1px solid hsl(var(--border))" : "1px solid rgba(255,255,255,0.08)";
  const inactive = isHome ? "#9CA3AF" : "rgba(255,255,255,0.35)";

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: navBg,
        borderTop: navBorder,
        transition: "background-color 200ms ease, border-color 200ms ease",
      }}
    >
      <div className="flex items-center justify-around py-1.5 px-1 safe-area-pb">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg text-[10px] transition-all active:scale-90"
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? ACTIVE : inactive }}
                />
                <span
                  style={{
                    color: isActive ? ACTIVE : inactive,
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
