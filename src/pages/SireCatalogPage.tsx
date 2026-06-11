import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, ChevronRight, Filter } from "lucide-react";
import { CatalogFilters, type Filters } from "@/components/sire-catalog/CatalogFilters";
import { SireCardCatalog } from "@/components/sire-catalog/SireCard";
import { SireListRow } from "@/components/sire-catalog/SireListRow";
import { SireDetailModal } from "@/components/sire-catalog/SireDetailModal";
import { parseGenotype } from "@/lib/genotype";
import { REPRO_SHEEP_SIRES } from "@/data/reproSheepSires";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface CatalogSire {
  id: string;
  sire_name: string;
  pedigree: string | null;
  notes: string | null;
  genotype: string | null;
  semen_available: boolean;
  price: number | null;
  ownership: string | null;
  photo_url: string | null;
  breed?: string | null;
  registered?: string | null;
  sku?: string | null;
  stock?: number | null;
  description?: string | null;
  breeder: { id: string; name: string; accent_color: string; website: string | null };
}

type SortKey = "name" | "breeder" | "price";

export default function SireCatalogPage() {
  const [sires, setSires] = useState<CatalogSire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<CatalogSire | null>(null);
  const [filters, setFilters] = useState<Filters>({
    availability: "all",
    scrapie: "all",
    spider: "all",
    dwarf: "all",
    breederId: "all",
  });

  useEffect(() => {
    setSires(CHAMPION_DRIVE_SIRES);
    setLoading(false);
  }, []);


  const breederCounts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; accent_color: string; count: number }>();
    for (const s of sires) {
      const cur = map.get(s.breeder.id);
      if (cur) cur.count += 1;
      else map.set(s.breeder.id, { id: s.breeder.id, name: s.breeder.name, accent_color: s.breeder.accent_color, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [sires]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sires.filter((s) => {
      if (filters.availability === "available" && !s.semen_available) return false;
      if (filters.availability === "reference" && s.semen_available) return false;
      if (filters.breederId !== "all" && s.breeder.id !== filters.breederId) return false;
      const p = parseGenotype(s.genotype);
      if (filters.scrapie !== "all" && p.scrapie !== filters.scrapie) return false;
      if (filters.spider !== "all" && p.spider !== filters.spider) return false;
      if (filters.dwarf !== "all" && p.dwarf !== filters.dwarf) return false;
      if (q) {
        const hay = `${s.sire_name} ${s.breeder.name} ${s.pedigree ?? ""} ${s.notes ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sires, filters, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sort === "breeder") return a.breeder.name.localeCompare(b.breeder.name) || a.sire_name.localeCompare(b.sire_name);
      if (sort === "price") {
        const ap = a.price ?? Number.MAX_SAFE_INTEGER;
        const bp = b.price ?? Number.MAX_SAFE_INTEGER;
        return ap - bp;
      }
      return a.sire_name.localeCompare(b.sire_name);
    });
    return arr;
  }, [filtered, sort]);

  const stats = useMemo(() => {
    const total = sires.length;
    const breeders = new Set(sires.map((s) => s.breeder.id)).size;
    const semen = sires.filter((s) => s.semen_available).length;
    const rr = sires.filter((s) => parseGenotype(s.genotype).scrapie === "RR").length;
    const ff = sires.filter((s) => parseGenotype(s.genotype).dwarf === "FF").length;
    return { total, breeders, semen, rr, ff };
  }, [sires]);

  return (
    <Layout showDiscovery={false}>
      <TooltipProvider>
        <div className="mx-auto max-w-7xl px-3 lg:px-6 pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-muted-foreground pt-3">
            <span>Repo</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Sire Catalog</span>
            <ChevronRight className="w-3 h-3" />
            <span>Sheep</span>
          </nav>

          {/* Header */}
          <header className="pt-3 pb-4 border-b border-border">
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
              Sheep Sire Catalog
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.total} sires across {stats.breeders} breeders · {stats.semen} with semen available
            </p>
          </header>

          {/* Search + sort + view */}
          <div className="flex flex-wrap items-center gap-2 py-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sires, breeders, pedigrees…"
                className="pl-9 h-9 bg-card"
              />
            </div>

            {/* Mobile filters trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden h-9">
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] overflow-y-auto">
                <SheetTitle className="font-serif text-lg mb-3">Filters</SheetTitle>
                <CatalogFilters filters={filters} setFilters={setFilters} breederCounts={breederCounts} />
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[140px] h-9 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort: Name</SelectItem>
                <SelectItem value="breeder">Sort: Breeder</SelectItem>
                <SelectItem value="price">Sort: Price</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-md border border-border overflow-hidden bg-card">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`p-2 ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className={`p-2 ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-6">
            <aside className="hidden lg:block w-[210px] shrink-0">
              <div className="sticky top-3">
                <CatalogFilters filters={filters} setFilters={setFilters} breederCounts={breederCounts} />
              </div>
            </aside>

            <section className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-2">
                {sorted.length} {sorted.length === 1 ? "Sire" : "Sires"}
              </p>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading catalog…</p>
              ) : sorted.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  No sires match these filters.
                </p>
              ) : view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {sorted.map((s) => (
                    <SireCardCatalog key={s.id} sire={s} onDetails={setSelected} />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sorted.map((s, i) => (
                    <SireListRow key={s.id} sire={s} index={i} onDetails={setSelected} />
                  ))}
                </div>
              )}

              {/* Stats footer */}
              <footer className="mt-8 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {[
                  { label: "Total Sires", value: stats.total },
                  { label: "Breeders", value: stats.breeders },
                  { label: "Semen Available", value: stats.semen },
                  { label: "RR Scrapie", value: stats.rr },
                  { label: "FF Dwarf", value: stats.ff },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/40 px-3 py-2">
                    <p className="font-serif text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </footer>
            </section>
          </div>

          <SireDetailModal sire={selected} open={!!selected} onClose={() => setSelected(null)} />
        </div>
      </TooltipProvider>
    </Layout>
  );
}
