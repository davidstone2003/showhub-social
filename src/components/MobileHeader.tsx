import { Plus, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { BackdropLogo } from "@/components/RinglyLogo";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";

export function MobileHeader() {
  const { user, profile } = useAuth();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border" style={{ padding: '8px 12px' }}>
      <div className="flex items-center justify-between">
        <BackdropLogo size="sm" showTagline={false} onDark={false} />

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {user ? (
            <>
              <NotificationBell />
              <Link
                to={profile ? `/breeder/${profile.username}` : "#"}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </Link>
              <Link
                to="/submit"
                className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shrink-0"
                style={{ borderRadius: '10px', height: '36px', padding: '0 14px', fontSize: '14px' }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Post
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/pricing"
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