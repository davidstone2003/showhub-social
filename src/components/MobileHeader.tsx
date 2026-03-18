import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { BackdropLogo } from "@/components/RinglyLogo";

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border" style={{ padding: '8px 12px' }}>
      <div className="flex items-center justify-between">
        <BackdropLogo size="sm" showTagline={false} onDark={false} />

        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Search className="w-6 h-6 text-muted-foreground" />
        </button>

        <Link
          to="/submit"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shrink-0"
          style={{ borderRadius: '10px', height: '36px', padding: '0 14px', fontSize: '14px' }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Post
        </Link>
      </div>
    </header>
  );
}
