import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, LayoutGrid, List as ListIcon, ShoppingBag, Wheat, SprayCan, Wrench, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";

const NAVY = "#0A1628";
const GOLD = "#C9A84C";

type Category = "All" | "Animals" | "Nutrition" | "Show Supplies" | "Services";
const CATEGORIES: Category[] = ["All", "Animals", "Nutrition", "Show Supplies", "Services"];

const categoryMeta: Record<Exclude<Category, "All">, { icon: any; color: string; bg: string; description: string }> = {
  "Animals":       { icon: ShoppingBag, color: GOLD,      bg: "rgba(201,168,76,0.15)", description: "Sheep, goats, cattle, pigs — breeding stock & show animals" },
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
  image_url?: string;
};

const LISTINGS: Listing[] = [
  { id: "1", title: "Hampshire Ram Lamb",   price: "$1,800", meta: "IA · Posted 2d ago", category: "Animals" },
  { id: "2", title: "Show Feed — 50lb",     price: "$42",    meta: "OH · Posted 3d ago", category: "Nutrition" },
  { id: "3", title: "Hauling — Midwest",    price: "Quote",  meta: "KS · Service",       category: "Services" },
  { id: "4", title: "Boer Doe Kid",         price: "$950",   meta: "TX · Posted 5d ago", category: "Animals" },
  { id: "5", title: "Grooming Spray Kit",   price: "$78",    meta: "IN · Posted 1d ago", category: "Show Supplies" },
  { id: "6", title: "Show Day Photography", price: "Quote",  meta: "WI · Service",       category: "Services" },
];

export default function MarketPage() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState<Category>("All");
  const [view, setView] = useState<"list" | "grid">("list");

  const stats = useMemo(() => ({
    listings: LISTINGS.length,
    sellers: 18,
    states: 9,
    categories: 4,
  }), []);

  const filtered = useMemo(() => {
    const byCat = category === "All" ? LISTINGS : LISTINGS.filter((l) => l.category === category);
    if (!search.trim()) return byCat;
    const q = search.toLowerCase();
    return byCat.filter((l) => `${l.title} ${l.meta} ${l.category}`.toLowerCase().includes(q));
  }, [search, category]);

  return (
    <Layout showDiscovery={false}>
      <div className="app-mode mx-auto max-w-2xl pb-24 relative" style={{ backgroundColor: "#0A1628", minHeight: "100vh" }}>
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

        {/* Category pills */}
        <div className="px-4 pt-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Filter by category">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c)}
                  className="h-8 shrink-0 rounded-full px-3.5 text-[12px] font-semibold leading-none whitespace-nowrap transition-colors"
                  style={
                    active
                      ? { backgroundColor: "#C9A84C", color: "#0A1628", border: "1px solid #C9A84C" }
                      : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid transparent" }
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline search */}
        {searchOpen && (
          <div className="px-4 pt-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings, sellers, categories…"
                className="h-11 w-full rounded-full pl-11 pr-4 text-sm focus:outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFFFFF" }}
              />
            </div>
          </div>
        )}

        {/* Compact stat strip */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 rounded-2xl p-3" style={{ backgroundColor: "#141E2E", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <Stat value={stats.listings} label="Listings" />
            <Stat value={stats.sellers} label="Sellers" />
            <Stat value={stats.states} label="States" />
            <Stat value={stats.categories} label="Categories" />
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
            <div className="rounded-2xl border border-border bg-white p-8 text-center">
              <h3 className="text-lg font-bold" style={{ color: NAVY }}>No listings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try a different category or search term.</p>
            </div>
          ) : view === "list" ? (
            <div className="rounded-xl border border-border bg-white overflow-hidden shadow-[var(--shadow-card)]">
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
                  <div key={l.id} className="rounded-xl border border-border bg-white overflow-hidden shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform">
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
      <span className="mt-1 text-[11px] uppercase tracking-[0.1em]" style={{ color: "#4B5563", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
