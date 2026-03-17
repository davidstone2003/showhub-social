import { Home, Trophy, Users, Dna, ShoppingBag, Truck, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { RinglyLogo } from "@/components/RinglyLogo";

const navItems = [
  { icon: Home, label: "Feed", to: "/" },
  { icon: Trophy, label: "Winners", to: "/winners" },
  { icon: Users, label: "Breeders", to: "/breeders" },
  { icon: Dna, label: "Sires", to: "/sires" },
  { icon: ShoppingBag, label: "Market", to: "/market" },
  { icon: Truck, label: "Haulers", to: "/haulers" },
];

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[200px] min-h-screen bg-primary text-sidebar-foreground border-r border-sidebar-border sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <RinglyLogo size="md" showTagline={true} onDark={true} />
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <NavLink
          to="/submit"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-foreground/10 text-primary-foreground text-sm font-semibold hover:bg-primary-foreground/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </NavLink>
      </div>
    </aside>
  );
}
