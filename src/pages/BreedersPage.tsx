import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, BadgeCheck, MapPin, Play, ChevronRight, SlidersHorizontal, LayoutGrid, List as ListIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import { useBreederDirectory, stateAbbr, type DirectoryBreeder } from "@/hooks/useBreederDirectory";

const NAVY = "#0A1628";
const GOLD = "#C9A84C";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Monogram({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0 font-bold text-white tracking-wide"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${NAVY} 0%, #1B3A6B 100%)`,
        fontSize: size > 60 ? 20 : 14,
      }}
    >
      {initials(name) || "?"}
    </div>
  );
}

function SpotlightCard({ b }: { b: DirectoryBreeder }) {
  return (
    <Link
      to={`/breeder/${b.username}`}
      className="group relative block w-[280px] md:w-[340px] shrink-0 overflow-hidden rounded-2xl border border-[#C9A84C]/30 bg-[#141E2E]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {b.hero_image_url ? (
          <img src={b.hero_image_url} alt={b.display_name || b.username} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a44] via-[#0A1628] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-sm bg-[#C9A84C] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-black">Featured</span>
        <div className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 backdrop-blur-md ring-1 ring-white/20">
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-white">{b.display_name || b.username}</h3>
            <BadgeCheck className="h-4 w-4 fill-[#C9A84C] text-black" strokeWidth={2.5} />
          </div>
          {b.location && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
              <MapPin className="h-3 w-3" />{b.location}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function breederSpecies(b: DirectoryBreeder): string {
  return b.searchText || "";
}

export default function BreedersPage() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [species, setSpecies] = useState<SpeciesPill>("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const { data: breeders = [], isLoading } = useBreederDirectory();

  const stats = useMemo(() => {
    const states = new Set<string>();
    breeders.forEach((b) => { const s = stateAbbr(b.location); if (s) states.add(s); });
    return {
      total: breeders.length,
      active: Math.max(1, Math.floor(breeders.length * 0.42)),
      states: states.size,
      breeds: 12,
    };
  }, [breeders]);

  const spotlights = useMemo(
    () => breeders.filter((b) => b.subscription_tier === "breeder_page").slice(0, 6),
    [breeders]
  );

  const filtered = useMemo(() => {
    const bySpecies = breeders.filter((b) => matchesSpecies(species, breederSpecies(b)));
    if (!search.trim()) return bySpecies;
    const q = search.toLowerCase();
    return bySpecies.filter((b) => b.searchText.includes(q));
  }, [breeders, search, species]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 flex items-center justify-between"
          style={{ height: 60, backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-[22px] font-bold leading-none" style={{ color: "#FFFFFF" }}>Breeders</h1>
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

        {/* Species pills */}
        <div className="px-4 pt-3">
          <SpeciesPills value={species} onChange={setSpecies} appMode />
        </div>

        {/* Inline search (toggled) */}
        {searchOpen && (
          <div className="px-4 pt-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search breeders, sires, states, breeds…"
                className="h-11 w-full rounded-full pl-11 pr-4 text-sm focus:outline-none"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#FFFFFF" }}
              />
            </div>
          </div>
        )}

        {/* Compact stat strip */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 rounded-2xl p-3" style={{ backgroundColor: "#141E2E", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <Stat value={stats.total} label="Breeders" />
            <Stat value={stats.active} label="Active" />
            <Stat value={stats.states} label="States" />
            <Stat value={stats.breeds} label="Breeds" />
          </div>
        </div>

        {/* Spotlight */}
        {spotlights.length > 0 && (
          <section className="pt-5">
            <div className="px-4">
              <div className="mb-2.5 flex items-baseline justify-between">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: "#FFFFFF" }}>Spotlight</h2>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#6B7280" }}>Featured Breeders</span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
              {spotlights.map((b) => <SpotlightCard key={b.id} b={b} />)}
            </div>
          </section>
        )}

        {/* Breeder catalog (Sires-style) */}
        <section className="px-4 pt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#FFFFFF" }}>
              {search ? "Results" : "All Breeders"}
              <span className="ml-2 text-muted-foreground font-medium normal-case tracking-normal">{filtered.length}</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h3 className="text-lg font-bold" style={{ color: "#FFFFFF" }}>No breeders found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try a different species or search term.</p>
            </div>
          ) : view === "list" ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
              {filtered.map((b, i) => (
                <Link
                  key={b.id}
                  to={`/breeder/${b.username}`}
                  className={`flex items-center gap-3 px-3 py-2.5 active:bg-muted/50 transition-colors ${
                    i !== filtered.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
                  }`}
                >
                  {b.hero_image_url ? (
                    <img src={b.hero_image_url} alt={b.display_name || b.username} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  ) : (
                    <Monogram name={b.display_name || b.username} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold truncate" style={{ color: "#FFFFFF" }}>{b.display_name || b.username}</p>
                      {b.subscription_tier === "breeder_page" && (
                        <BadgeCheck className="h-3.5 w-3.5 fill-[#C9A84C] text-black shrink-0" strokeWidth={2.5} />
                      )}
                    </div>
                    {b.location && (
                      <p className="text-[12px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{b.location}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((b) => (
                <Link
                  key={b.id}
                  to={`/breeder/${b.username}`}
                  className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform"
                >
                  <div className="w-full aspect-square overflow-hidden">
                    {b.hero_image_url ? (
                      <img src={b.hero_image_url} alt={b.display_name || b.username} className="w-full h-full object-cover" />
                    ) : (
                      <Monogram name={b.display_name || b.username} size={180} />
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold truncate" style={{ color: "#FFFFFF" }}>{b.display_name || b.username}</p>
                      {b.subscription_tier === "breeder_page" && (
                        <BadgeCheck className="h-3.5 w-3.5 fill-[#C9A84C] text-black shrink-0" strokeWidth={2.5} />
                      )}
                    </div>
                    {b.location && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{b.location}</p>
                    )}
                  </div>
                </Link>
              ))}
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
      <span className="mt-1 text-[11px] uppercase tracking-[0.1em]" style={{ color: "#4B5563", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
