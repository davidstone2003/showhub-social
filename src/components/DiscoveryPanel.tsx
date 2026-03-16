import { breeders, sires } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star } from "lucide-react";

const trendingTags = [
  "Fort Worth Stock Show", "Hampshire", "Iron Throne", "Southdown",
  "National Western", "Club Lambs", "Suffolk", "Ridge Runner"
];

export function DiscoveryPanel() {
  return (
    <aside className="hidden xl:block w-[260px] min-h-screen sticky top-0 overflow-y-auto py-6 px-4 space-y-6">
      {/* Trending */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          Trending
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {trendingTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[11px] cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Top Breeders */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Star className="w-4 h-4 text-primary" />
          Pro Breeders
        </h3>
        <div className="space-y-2">
          {breeders.filter((b) => b.is_pro).map((b) => (
            <div key={b.id} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-secondary transition-colors cursor-pointer">
              <span className="w-8 h-8 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-sm">
                {b.logo}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{b.name}</p>
                <p className="text-[10px] text-muted-foreground">{b.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Sires */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">🏆 Popular Sires</h3>
        <div className="space-y-1.5">
          {sires.slice(0, 4).map((s) => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors cursor-pointer">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">🐏</span>
              <span className="text-xs font-medium text-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
