import { Button } from "@/components/ui/button";
import { GenotypeBadges } from "./GenotypeBadges";
import { SirePhoto } from "./SirePhoto";
import type { CatalogSire } from "@/pages/SireCatalogPage";

interface Props {
  sire: CatalogSire;
  index: number;
  onDetails: (sire: CatalogSire) => void;
}

export function SireListRow({ sire, index, onDetails }: Props) {
  const accent = sire.breeder.accent_color;
  const stripe = index % 2 === 0 ? "bg-card" : "bg-muted/30";

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 border border-border rounded-lg ${stripe}`}
    >
      <div className="w-14 h-14 rounded-md overflow-hidden shrink-0">
        <SirePhoto photoUrl={sire.photo_url} sireName={sire.sire_name} accentColor={accent} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-sm font-bold text-foreground truncate">{sire.sire_name}</h3>
          <span className="text-[11px] font-medium" style={{ color: accent }}>
            {sire.breeder.name}
          </span>
        </div>
        <div className="mt-1">
          <GenotypeBadges raw={sire.genotype} />
        </div>
      </div>
      <div className="shrink-0 text-right space-y-1">
        {sire.price ? (
          <p className="text-sm font-bold text-emerald-700">${sire.price.toFixed(0)}</p>
        ) : (
          <p className="text-[10px] text-muted-foreground">Contact</p>
        )}
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onDetails(sire)}>
          Details
        </Button>
      </div>
    </div>
  );
}
