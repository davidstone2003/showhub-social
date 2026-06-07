import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

export function DirectoryBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-white/50">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {c.to && !last ? (
              <Link to={c.to} className="hover:text-[#C9A84C] transition-colors">{c.label}</Link>
            ) : (
              <span className={last ? "text-white" : ""}>{c.label}</span>
            )}
            {!last && <ChevronRight className="h-3 w-3 text-white/30" />}
          </span>
        );
      })}
    </nav>
  );
}
