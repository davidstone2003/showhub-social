import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ShowThreadLogo } from "@/components/ShowThreadLogo";

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-primary px-3 py-2">
      <div className="flex items-center gap-2">
        <ShowThreadLogo size="sm" showTagline={true} onDark={true} />

        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-foreground/50" />
          <Input
            placeholder="Search breeders, sires, shows..."
            className="h-8 pl-8 text-xs bg-primary-foreground/10 border-0 rounded-lg text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-1 focus-visible:ring-primary-foreground/30"
          />
        </div>

        <Link
          to="/submit"
          className="flex items-center gap-1.5 h-10 px-5 rounded-[12px] bg-post-btn text-white text-sm font-bold hover:bg-post-btn-hover shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Post
        </Link>
      </div>
    </header>
  );
}
