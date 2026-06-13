import { useMemo, useState, useEffect } from "react";
import { Search, ChevronRight, LayoutGrid, List as ListIcon, ShoppingBag, Wheat, SprayCan, Wrench } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useSpecies } from "@/contexts/SpeciesContext";
import { FiltersPopover, FilterChip } from "@/components/FiltersPopover";

const NAVY = "#0A1628";
const GOLD = "#C9A84C";

type Category = "All" | "Stock" | "Nutrition" | "Show Supplies" | "Services";
const CATEGORIES: Category[] = ["All", "Stock", "Nutrition", "Show Supplies", "Services"];

const categoryMeta: Record<Exclude<Category, "All">, { icon: any; color: string; bg: string; description: string }> = {
  "Stock":       { icon: ShoppingBag, color: GOLD,      bg: "rgba(201,168,76,0.15)", description: "Sheep, goats, cattle, pigs — breeding stock & show animals" },
  "Nutrition":     { icon: Wheat,       color: "#3F9D5F", bg: "rgba(63,157,95,0.12)",  description: "Feed, supplements, and nutritional products" },
  "Show Supplies": { icon: SprayCan,    color: "#3B82F6", bg: "rgba(59,130,246,0.12)", description: "Equipment, grooming products, and show day essentials" },
  "Services":      { icon: Wrench,      color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", description: "Hauling, photography, fitting, and professional services" },
};

type Listing = {
  id: string;
  title: string;
  price: string;
  meta: string;
  category: Exclude<Category, "All">;
  species?: string;
  image_url?: string;
};

const LISTINGS: Listing[] = [
  { id: "1", title: "Hampshire Ram Lamb",   price: "$1,800", meta: "IA · Posted 2d ago", category: "Stock",         species: "Sheep" },
  { id: "2", title: "Show Feed — 50lb",     price: "$42",    meta: "OH · Posted 3d ago", category: "Nutrition" },
  { id: "3", title: "Hauling — Midwest",    price: "Quote",  meta: "KS · Service",       category: "Services" },
  { id: "4", title: "Boer Doe Kid",         price: "$950",   meta: "TX · Posted 5d ago", category: "Stock",         species: "Goats" },
  { id: "5", title: "Grooming Spray Kit",   price: "$78",    meta: "IN · Posted 1d ago", category: "Show Supplies" },
  { id: "6", title: "Show Day Photography", price: "Quote",  meta: "WI · Service",       category: "Services" },
];

function priceToNumber(p: string): number | null {
  const m = p.match(/\$([0-9,]+)/);
  if (!m) return null;
  return parseInt(m[1].replace(/,/g, ""), 10);
}


export default function MarketPage() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState<Category>("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const { species: selectedSpecies } = useSpecies();
  const [priceRange, setPriceRange] = useState<"All" | "Under $500" | "$500-$2K" | "$2K-$5K" | "$5K+">("All");


  const marketStates = useMemo(() => {
    const states = LISTINGS.map((l) => l.meta.match(/^([A-Z]{2})\s·/)?.[1]).filter(Boolean) as string[];
    return ["All States", ...Array.from(new Set(states)).sort()];
  }, []);

  const speciesOptions = ["All", "Cattle", "Sheep", "Goats", "Pigs"];
  const priceOptions = ["All", "Under $500", "$500-$2K", "$2K-$5K", "$5K+"];

  const filtered = useMemo(() => {
    let result = category === "All" ? LISTINGS : LISTINGS.filter((l) => l.category === category);
    if (selectedState !== "All States") {
      result = result.filter((l) => l.meta.startsWith(selectedState));
    }
    if (selectedSpecies !== "All") {
      result = result.filter((l) => l.species === selectedSpecies);
    }
    if (priceRange !== "All") {
      result = result.filter((l) => {
        const n = priceToNumber(l.price);
        if (n == null) return false;
        if (priceRange === "Under $500") return n < 500;
        if (priceRange === "$500-$2K") return n >= 500 && n < 2000;
        if (priceRange === "$2K-$5K") return n >= 2000 && n < 5000;
        if (priceRange === "$5K+") return n >= 5000;
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) => `${l.title} ${l.meta} ${l.category}`.toLowerCase().includes(q));
    }
    return result;
  }, [search, category, selectedState, selectedSpecies, priceRange]);


  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24 relative" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Compact header */}
        <div
          className="sticky top-0 z-30 px-4 flex items-center justify-between bg-white"
          style={{ height: 48, borderBottom: "1px solid #E5E7EB" }}
        >
          <h1 className="text-[18px] font-bold leading-none" style={{ color: "#0A1628" }}>Market</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-1.5"
              aria-label="Search"
            >
              <Search className="w-5 h-5" style={{ color: "#6B7280" }} />
            </button>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className="p-1.5 transition-colors"
                style={{ color: view === "list" ? "#C9A84C" : "#9CA3AF", backgroundColor: view === "list" ? "#FFFBF0" : "transparent" }}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className="p-1.5 transition-colors"
                style={{ color: view === "grid" ? "#C9A84C" : "#9CA3AF", backgroundColor: view === "grid" ? "#FFFBF0" : "transparent" }}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


        {/* Optional search */}
        {searchOpen && (
          <div className="px-4 py-2 bg-white border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings, sellers, categories…"
                className="flex-1 bg-transparent text-[14px] text-[#0A1628] outline-none placeholder:text-[#9CA3AF]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#9CA3AF] text-[18px] leading-none">×</button>
              )}
            </div>
          </div>
        )}

        {/* Filter bar — light: category pills + single Filters popover */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-[48px] z-10">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="shrink-0 rounded-full px-3 py-1.5 border text-[12px] font-bold transition-colors"
                  style={category === cat
                    ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                    : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <FiltersPopover
              filters={[
                {
                  key: "state",
                  label: "State",
                  value: selectedState,
                  options: marketStates,
                  allValue: "All States",
                  onChange: setSelectedState,
                },
                {
                  key: "price",
                  label: "Price",
                  value: priceRange,
                  options: priceOptions,
                  allValue: "All",
                  onChange: (v) => setPriceRange(v as any),
                },
              ]}
              onClearAll={() => { setSelectedState("All States"); setPriceRange("All"); }}
            />
          </div>
        </div>
        {(selectedState !== "All States" || priceRange !== "All") && (
          <div className="bg-[#F8F7F4] px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {selectedState !== "All States" && (
              <FilterChip label={selectedState} onRemove={() => setSelectedState("All States")} />
            )}
            {priceRange !== "All" && (
              <FilterChip label={priceRange} onRemove={() => setPriceRange("All")} />
            )}
          </div>
        )}





        {/* Listings */}
        <section className="px-4 pt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>
              {search ? "Results" : category === "All" ? "Recently Listed" : category}
              <span className="ml-2 text-muted-foreground font-medium normal-case tracking-normal">{filtered.length}</span>
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h3 className="text-lg font-bold" style={{ color: NAVY }}>No listings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try a different category or search term.</p>
            </div>
          ) : view === "list" ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
              {filtered.map((l, i) => {
                const meta = categoryMeta[l.category];
                const Icon = meta.icon;
                return (
                  <div
                    key={l.id}
                    className={`flex items-center gap-3 px-3 py-2.5 active:bg-muted/50 transition-colors ${
                      i !== filtered.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{l.title}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{l.meta}</p>
                    </div>
                    <p className="text-[13px] font-bold shrink-0" style={{ color: GOLD }}>{l.price}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((l) => {
                const meta = categoryMeta[l.category];
                const Icon = meta.icon;
                return (
                  <div key={l.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform">
                    <div className="w-full aspect-square flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{l.title}</p>
                      <p className="text-[13px] font-bold mt-0.5" style={{ color: GOLD }}>{l.price}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{l.meta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 900, start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold tabular-nums leading-none" style={{ color: GOLD }}>{v.toLocaleString()}</span>
      <span className="mt-1 text-[11px] uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
