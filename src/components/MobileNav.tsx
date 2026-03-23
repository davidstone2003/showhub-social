import { Home, Trophy, Users, FolderHeart, ShoppingBag, Coins } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Trophy, label: "Winners", to: "/winners" },
  { icon: Coins, label: "Sales", to: "/sales" },
  { icon: Users, label: "Breeders", to: "/breeders" },
  { icon: FolderHeart, label: "Repo", to: "/repo" },
  { icon: ShoppingBag, label: "Market", to: "/market" },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around py-1.5 px-1 safe-area-pb">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
