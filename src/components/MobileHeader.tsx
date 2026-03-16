import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
      <h1 className="font-display text-lg text-foreground tracking-tight">
        Show<span className="text-primary">Hub</span>
      </h1>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Search className="w-4.5 h-4.5 text-muted-foreground" />
        </Button>
        <Link to="/submit">
          <Button size="sm" className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-emerald-light">
            <Plus className="w-3.5 h-3.5" />
            Post
          </Button>
        </Link>
      </div>
    </header>
  );
}
