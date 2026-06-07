import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SemenBookingSection } from "@/components/sire/SemenBookingSection";
import { SirePhoto } from "./SirePhoto";
import { GenotypeBadges } from "./GenotypeBadges";
import { ExternalLink } from "lucide-react";
import type { CatalogSire } from "@/pages/SireCatalogPage";

interface Props {
  sire: CatalogSire | null;
  open: boolean;
  onClose: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-sm text-foreground leading-relaxed">
      <span className="font-semibold">{label}:</span>{" "}
      <span className="text-foreground/85">{children}</span>
    </p>
  );
}

export function SireDetailModal({ sire, open, onClose }: Props) {
  if (!sire) return null;
  const accent = sire.breeder.accent_color;
  const priceStr = sire.price ? `$${sire.price.toFixed(0)}` : null;
  const stockLabel =
    typeof sire.stock === "number"
      ? `${sire.stock} in stock`
      : sire.semen_available
      ? "In stock"
      : "Out of stock";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <div className="grid md:grid-cols-2">
          {/* Photo column */}
          <div className="relative bg-muted aspect-square md:aspect-auto md:min-h-[420px]">
            <SirePhoto photoUrl={sire.photo_url} sireName={sire.sire_name} accentColor={accent} />
            {sire.semen_available && (
              <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                Semen Available
              </span>
            )}
          </div>

          {/* Info column */}
          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground leading-tight">
                {sire.sire_name}
              </h2>
              {priceStr && (
                <p className="mt-2 text-2xl font-bold text-foreground">{priceStr}</p>
              )}
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
                {stockLabel}
              </p>
            </div>

            {sire.pedigree && (
              <Row label="Pedigree Information">{sire.pedigree}</Row>
            )}

            <GenotypeBadges raw={sire.genotype} size="md" />

            {sire.sku && (
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold uppercase">SKU:</span> {sire.sku}
                <span className="mx-1.5">·</span>
                <span className="font-semibold uppercase">Category:</span> Sire Catalog
              </p>
            )}

            <div className="border-t border-border pt-4 space-y-2">
              <h3 className="font-serif text-lg font-bold text-foreground">Description</h3>
              <Row label="Sire Name">{sire.sire_name}</Row>
              {sire.breed && <Row label="Breed">{sire.breed}</Row>}
              <Row label="Breeder">
                {sire.breeder.website ? (
                  <a
                    href={sire.breeder.website.startsWith("http") ? sire.breeder.website : `https://${sire.breeder.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                    style={{ color: accent }}
                  >
                    {sire.breeder.name} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  sire.breeder.name
                )}
              </Row>
              {sire.pedigree && <Row label="Pedigree Information">{sire.pedigree}</Row>}
              {sire.genotype && <Row label="DNA">{sire.genotype}</Row>}
              {sire.registered && <Row label="Registered">{sire.registered}</Row>}
              {priceStr && <Row label="Price">{priceStr}</Row>}
              {sire.ownership && <Row label="Ownership">{sire.ownership}</Row>}

              {(sire.description || sire.notes) && (
                <p className="pt-2 text-sm text-foreground/85 leading-relaxed">
                  {sire.description || sire.notes}
                </p>
              )}
            </div>

            {sire.semen_available && (
              <SemenBookingSection
                sireName={sire.sire_name}
                price={sire.price}
                breederName={sire.breeder.name}
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
