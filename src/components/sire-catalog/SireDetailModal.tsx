import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SemenBookingSection } from "@/components/sire/SemenBookingSection";
import { SirePhoto } from "./SirePhoto";

import { GenotypeBadges } from "./GenotypeBadges";
import { parseGenotype } from "@/lib/genotype";
import { ExternalLink } from "lucide-react";
import type { CatalogSire } from "@/pages/SireCatalogPage";

interface Props {
  sire: CatalogSire | null;
  open: boolean;
  onClose: () => void;
}

export function SireDetailModal({ sire, open, onClose }: Props) {
  if (!sire) return null;
  const accent = sire.breeder.accent_color;
  const parsed = parseGenotype(sire.genotype);

  const fields: { label: string; value: string }[] = [
    { label: "DNA (RSG)", value: parsed.rsg || "—" },
    { label: "Scrapie", value: parsed.scrapie ?? "—" },
    { label: "Spider", value: parsed.spider ?? "—" },
    { label: "Dwarf", value: parsed.dwarf ?? "—" },
    { label: "Semen Status", value: sire.semen_available ? "Available" : "Not currently available" },
    { label: "Ownership", value: sire.ownership || "Sole" },
    { label: "Notes", value: sire.notes || "—" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <div className="relative aspect-[16/10] bg-muted">
          <SirePhoto photoUrl={sire.photo_url} sireName={sire.sire_name} accentColor={accent} />
          {sire.semen_available && (
            <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              Semen Available
            </span>
          )}
          <div
            className="absolute inset-x-0 bottom-0 px-4 py-2 flex items-center justify-between text-white text-sm"
            style={{ background: accent }}
          >
            <span className="font-semibold">{sire.breeder.name}</span>
            {sire.breeder.website && (
              <a
                href={sire.breeder.website.startsWith("http") ? sire.breeder.website : `https://${sire.breeder.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
              >
                {sire.breeder.website} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold text-foreground">{sire.sire_name}</h2>
            {sire.price ? (
              <p className="text-lg font-bold text-emerald-700">${sire.price.toFixed(2)}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Contact for pricing</p>
            )}
          </div>

          {sire.pedigree && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Pedigree Information
              </p>
              <p className="text-sm text-foreground">{sire.pedigree}</p>
            </div>
          )}

          <div>
            <GenotypeBadges raw={sire.genotype} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.label} className="rounded-md bg-muted/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{f.label}</p>
                <p className="text-sm text-foreground mt-0.5 break-words">{f.value}</p>
              </div>
            ))}
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
      </DialogContent>
    </Dialog>
  );
}
