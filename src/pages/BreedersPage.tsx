import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, BadgeCheck, MapPin, Play, ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { SPECIES } from "@/data/breederTaxonomy";
import { useBreederDirectory, stateAbbr, type DirectoryBreeder } from "@/hooks/useBreederDirectory";

function CountUp({ end, label }: { end: number; label: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1100, start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setVal(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return (
    <div className="flex flex-col items-center md:items-start">
      <span className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums" style={{ color: "#C9A84C" }}>{val.toLocaleString()}</span>
      <span className="text-[12px] uppercase tracking-[0.12em] mt-1" style={{ color: "#4B5563", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function speciesStats(breeders: DirectoryBreeder[], keywords: string[]) {
  const matched = breeders.filter((b) =>
    keywords.some((k) => b.searchText.includes(k.toLowerCase()))
  );
  const states = new Set<string>();
  matched.forEach((b) => { const s = stateAbbr(b.location); if (s) states.add(s); });
  const topState = (() => {
    const counts: Record<string, number> = {};
    matched.forEach((b) => { const s = stateAbbr(b.location); if (s) counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  })();
  return { count: matched.length, topState };
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

export default function BreedersPage() {
  const [search, setSearch] = useState("");
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

  const speciesCounts = useMemo(
    () => SPECIES.map((s) => ({ ...s, ...speciesStats(breeders, s.keywords) })),
    [breeders]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return breeders.filter((b) => b.searchText.includes(q)).slice(0, 8);
  }, [breeders, search]);

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen" style={{ backgroundColor: "#F8F7F4", color: "#0A1628" }}>
        {/* HERO — light */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "#F8F7F4" }}>
          <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-6 md:pt-12 md:pb-10">
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#C9A84C" }}>The Backdrop Directory</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: "#0A1628" }}>
              Find Your Next<br /><span style={{ color: "#C9A84C" }}>Champion</span>
            </h1>
            <p className="mt-3 max-w-md text-sm md:text-base" style={{ color: "#4B5563" }}>
              The serious breeders. The bloodlines that matter. The wins that count.
            </p>

            <div className="relative mt-3 md:mt-4 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search breeders, sires, states, breeds…"
                className="h-12 w-full rounded-full bg-white pl-11 pr-4 text-sm focus:outline-none transition-colors"
                style={{ border: "1px solid #E5E7EB", color: "#0A1628" }}
              />
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                  {searchResults.map((b) => (
                    <Link
                      key={b.id}
                      to={`/breeder/${b.username}`}
                      className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/50"
                      onClick={() => setSearch("")}
                    >
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-black" style={{ backgroundColor: "#0A1628", color: "#C9A84C" }}>
                        {(b.display_name || b.username).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ color: "#0A1628" }}>{b.display_name || b.username}</p>
                        {b.location && <p className="truncate text-[11px]" style={{ color: "#6B7280" }}>{b.location}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-4 gap-3 md:gap-8 rounded-2xl bg-white p-4 md:p-5" style={{ border: "1px solid #E5E7EB" }}>
              <CountUp end={stats.total} label="Breeders" />
              <CountUp end={stats.active} label="Active This Week" />
              <CountUp end={stats.states} label="States" />
              <CountUp end={stats.breeds} label="Breeds Covered" />
            </div>
          </div>
        </section>

        {/* SPECIES TILES — light */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-foreground">Browse by Species</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {speciesCounts.map((s) => (
                <Link
                  key={s.key}
                  to={`/breeders/${s.key}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-white p-4 md:p-5 transition-all hover:border-[hsl(var(--gold))]/40 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <span className="absolute right-3 top-3 text-3xl md:text-4xl opacity-20 group-hover:opacity-40 transition-opacity">{s.silhouette}</span>
                  <h3 className="text-lg md:text-2xl font-bold tracking-tight text-foreground">{s.name}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.blurb}</p>
                  <p className="mt-3 text-[12px] font-bold text-[hsl(var(--gold))]">{s.count} operation{s.count !== 1 ? "s" : ""}</p>
                  {s.topState && (
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Most active: {s.topState}</p>
                  )}
                  <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--gold))]" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* SPOTLIGHT — dark cards on light bg */}
        {spotlights.length > 0 && (
          <section className="border-t border-border py-6 pb-24">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-foreground">Spotlight</h2>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Featured Breeders</span>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                {spotlights.map((b) => <SpotlightCard key={b.id} b={b} />)}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
