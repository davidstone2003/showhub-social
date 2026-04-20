import { Button } from "@/components/ui/button";
import { GenotypeBadges } from "./GenotypeBadges";
import { SirePhoto } from "./SirePhoto";
import type { CatalogSire } from "@/pages/SireCatalogPage";

interface Props {
  sire: CatalogSire;
  onDetails: (sire: CatalogSire) => void;
}

export function SireCardCatalog({ sire, onDetails }: Props) {
  const accent = sire.breeder.accent_color;

  return (
    <article
      className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ ["--accent" as any]: accent }}
    >
      {/* Photo */}
      <div className="relative aspect-square overflow-hidden">
        <SirePhoto photoUrl={sire.photo_url} sireName={sire.sire_name} accentColor={accent} />
        {sire.semen_available && (
          <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
            Semen Available
          </span>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-1 transition-[height] group-hover:h-1.5"
          style={{ background: accent }}
        />
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="font-serif text-[15px] font-bold leading-tight text-foreground">
            {sire.sire_name}
          </h3>
          <p className="text-xs font-medium" style={{ color: accent }}>
            {sire.breeder.name}
          </p>
        </div>

        {sire.price ? (
          <p className="text-sm font-bold text-emerald-700">${sire.price.toFixed(2)}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Contact for pricing</p>
        )}

        {sire.pedigree && (
          <div className="text-xs">
            <p className="font-bold text-foreground">Pedigree Information:</p>
            <p className="text-muted-foreground leading-snug line-clamp-2">{sire.pedigree}</p>
          </div>
        )}

        <GenotypeBadges raw={sire.genotype} />

        {sire.ownership && (
          <p className="text-[11px] italic text-muted-foreground">{sire.ownership}</p>
        )}

        {sire.notes && (
          <p className="text-[11px] text-foreground/70 line-clamp-1">{sire.notes}</p>
        )}

        <div className="flex gap-1.5 pt-1">
          <Button
            size="sm"
            disabled={!sire.semen_available}
            className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-muted disabled:text-muted-foreground"
          >
            Order Semen
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={() => onDetails(sire)}
          >
            Details
          </Button>
        </div>
      </div>
    </article>
  );
}
