import { Home, Trophy, Users, Dna, ShoppingBag, Truck, Plus, LogIn, LogOut, User, Shield } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { BackdropLogo } from "@/components/RinglyLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const navItems = [
  { icon: Home, label: "Feed", to: "/" },
  { icon: Trophy, label: "Backdrop", to: "/winners" },
  { icon: Users, label: "Breeders", to: "/breeders" },
  { icon: Dna, label: "Sires", to: "/sires" },
  { icon: ShoppingBag, label: "Market", to: "/market" },
  { icon: Truck, label: "Haulers", to: "/haulers" },
];

export function DesktopSidebar() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  return (
    <aside className="hidden lg:flex flex-col w-[200px] min-h-screen bg-primary text-sidebar-foreground border-r border-sidebar-border sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <BackdropLogo size="md" showTagline={true} onDark={true} />
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

      <div className="p-3 space-y-2 border-t border-sidebar-border">
        {user ? (
          <>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`
                }
              >
                <Shield className="w-4 h-4" />
                Admin
              </NavLink>
            )}
            <Link
              to={profile ? `/breeder/${profile.username}` : "#"}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <User className="w-4 h-4" />
              {profile?.display_name || "Profile"}
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <NavLink
              to="/submit"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-foreground/10 text-primary-foreground text-sm font-semibold hover:bg-primary-foreground/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add to Backdrop
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/auth"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-foreground text-primary text-sm font-semibold hover:bg-primary-foreground/90 transition-colors"
            >
              Join Free
            </NavLink>
            <NavLink
              to="/auth"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
