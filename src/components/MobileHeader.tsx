import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ShowThreadLogo } from "@/components/ShowThreadLogo";

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-3 py-2">
      <div className="flex items-center gap-2">
        <ShowThreadLogo size="sm" showTagline={false} onDark={false} />

        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search breeders, sires, shows..."
            className="h-8 pl-8 text-xs bg-muted border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Link
          to="/submit"
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Post
        </Link>
      </div>
    </header>
  );
}
