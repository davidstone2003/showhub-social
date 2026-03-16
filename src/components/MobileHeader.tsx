import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function MobileHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-3 py-2.5">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <h1 className="font-display text-lg text-foreground tracking-tight shrink-0">
          Show<span className="text-primary">Hub</span>
        </h1>

        {/* Search bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search breeders, sires, shows..."
            className="h-8 pl-8 text-xs bg-secondary border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Post button */}
        <Link
          to="/submit"
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Post
        </Link>
      </div>
    </header>
  );
}
