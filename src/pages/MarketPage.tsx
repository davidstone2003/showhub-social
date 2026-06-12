import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, LayoutGrid, List as ListIcon, ShoppingBag, Wheat, SprayCan, Wrench, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";

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
  const [selectedSpecies, setSelectedSpecies] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<"All" | "Under $500" | "$500-$2K" | "$2K-$5K" | "$5K+">("All");
  const [stateOpen, setStateOpen] = useState(false);
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  useEffect(() => {
    const handler = () => { setStateOpen(false); setSpeciesOpen(false); setPriceOpen(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 flex items-center justify-between"
          style={{ height: 60, backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-[22px] font-bold leading-none" style={{ color: "#FFFFFF" }}>Market</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-1.5 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
            </button>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)" }}>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className="p-2 transition-colors"
                style={{ color: view === "list" ? "#C9A84C" : "rgba(255,255,255,0.5)", backgroundColor: view === "list" ? "rgba(255,255,255,0.08)" : "transparent" }}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className="p-2 transition-colors"
                style={{ color: view === "grid" ? "#C9A84C" : "rgba(255,255,255,0.5)", backgroundColor: view === "grid" ? "rgba(255,255,255,0.08)" : "transparent" }}
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

        {/* Filter bar — light */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-[60px] z-10">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto px-4 pt-2 pb-1 scrollbar-hide">
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

          {/* Dropdown filters row */}
          <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            {/* Species dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setSpeciesOpen((v) => !v); setStateOpen(false); setPriceOpen(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold transition-colors"
                style={selectedSpecies !== "All"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedSpecies === "All" ? "Species" : selectedSpecies}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {speciesOpen && (
                <div className="absolute left-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xl z-30 overflow-hidden" style={{ minWidth: 140 }}>
                  {speciesOptions.map((opt) => (
                    <button key={opt} onClick={() => { setSelectedSpecies(opt); setSpeciesOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F8F7F4]"
                      style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <span className="text-[13px] font-medium text-[#0A1628]">{opt}</span>
                      {selectedSpecies === opt && (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}>
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* State dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setStateOpen((v) => !v); setSpeciesOpen(false); setPriceOpen(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold transition-colors"
                style={selectedState !== "All States"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedState}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {stateOpen && (
                <div className="absolute left-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xl z-30 overflow-hidden" style={{ minWidth: 140, maxHeight: 240, overflowY: "auto" }}>
                  {marketStates.map((state) => (
                    <button key={state} onClick={() => { setSelectedState(state); setStateOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F8F7F4]"
                      style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <span className="text-[13px] font-medium text-[#0A1628]">{state}</span>
                      {selectedState === state && (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}>
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setPriceOpen((v) => !v); setStateOpen(false); setSpeciesOpen(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold transition-colors"
                style={priceRange !== "All"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {priceRange === "All" ? "Price" : priceRange}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {priceOpen && (
                <div className="absolute left-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xl z-30 overflow-hidden" style={{ minWidth: 140 }}>
                  {priceOptions.map((opt) => (
                    <button key={opt} onClick={() => { setPriceRange(opt as any); setPriceOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F8F7F4]"
                      style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <span className="text-[13px] font-medium text-[#0A1628]">{opt}</span>
                      {priceRange === opt && (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}>
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(selectedState !== "All States" || selectedSpecies !== "All" || priceRange !== "All" || category !== "All") && (
              <button
                onClick={() => { setSelectedState("All States"); setSelectedSpecies("All"); setPriceRange("All"); setCategory("All"); }}
                className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
                style={{ backgroundColor: "#FFF8E7", color: "#8B6914", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                Clear ×
              </button>
            )}
          </div>
        </div>





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

        {/* FAB */}
        <Link
          to="/submit"
          aria-label="Post a Listing"
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg font-bold text-[13px] active:scale-95 transition-transform"
          style={{ background: GOLD, color: NAVY, boxShadow: "0 8px 24px rgba(201,168,76,0.4)" }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Post a Listing
        </Link>
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
