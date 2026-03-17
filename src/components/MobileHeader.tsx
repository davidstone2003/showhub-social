import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ShowThreadLogo } from "@/components/ShowThreadLogo";

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border" style={{ padding: '8px 12px' }}>
      <div className="flex items-center" style={{ gap: '24px' }}>
        <ShowThreadLogo size="sm" showTagline={false} onDark={false} />

        <div className="flex-1 flex justify-center">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <Link
          to="/submit"
          className="flex items-center gap-1.5 h-9 px-4 bg-foreground text-background text-sm font-bold hover:opacity-90 shadow-sm transition-all shrink-0"
          style={{ borderRadius: '4px' }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Post
        </Link>
      </div>
    </header>
  );
}
