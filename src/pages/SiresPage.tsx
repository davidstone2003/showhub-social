import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, LayoutGrid, List as ListIcon, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import gooseImage from "@/assets/sires/goose.jpeg";

interface Sire {
  id: string;
  name: string;
  breederName: string | null;
  breed: string;
  semenAvailable: boolean;
  winCount: number;
  image?: string;
}

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
        background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark)) 100%)",
        fontSize: size > 60 ? 20 : 14,
      }}
    >
      {initials(name) || "?"}
    </div>
  );
}

const SiresPage = () => {
  const [sires, setSires] = useState<Sire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [species, setSpecies] = useState<SpeciesPill>("All");

  useEffect(() => {
    async function fetchSires() {
      const [{ data: sireData }, { data: winnerData }] = await Promise.all([
        supabase.from("sires_lookup").select("id, name"),
        supabase.from("winners").select("sire_id, bred_by").eq("status", "active").not("sire_id", "is", null),
      ]);

      if (sireData) {
        const winsBySire = new Map<string, number>();
        const breederBySire = new Map<string, string>();
        (winnerData ?? []).forEach((w) => {
          if (!w.sire_id) return;
          winsBySire.set(w.sire_id, (winsBySire.get(w.sire_id) ?? 0) + 1);
          if (w.bred_by && !breederBySire.has(w.sire_id)) breederBySire.set(w.sire_id, w.bred_by);
        });

        const mapped: Sire[] = sireData.map((s) => ({
          id: s.id,
          name: s.name,
          breederName: breederBySire.get(s.id) ?? null,
          breed: "Sheep",
          semenAvailable: winsBySire.has(s.id),
          winCount: winsBySire.get(s.id) ?? 0,
          image: s.name === "Goose" ? gooseImage : undefined,
        }));

        mapped.sort((a, b) => b.winCount - a.winCount || a.name.localeCompare(b.name));
        setSires(mapped);
      }
      setLoading(false);
    }
    fetchSires();
  }, []);

  const filtered = useMemo(() => {
    const bySpecies = sires.filter((s) => matchesSpecies(species, s.breed, s.name));
    if (!search.trim()) return bySpecies;
    const q = search.toLowerCase();
    return bySpecies.filter((s) =>
      s.name.toLowerCase().includes(q) || (s.breederName ?? "").toLowerCase().includes(q)
    );
  }, [sires, search, species]);

  const trending = useMemo(() => sires.filter((s) => s.winCount > 0).slice(0, 8), [sires]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Sires</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">{sires.length} active across the network</p>
          </div>
          <div className="flex rounded-lg border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-2 transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-2 transition-colors ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Species pills */}
        <div className="px-4 pt-3">
          <SpeciesPills value={species} onChange={setSpecies} />
        </div>

        <div className="px-4 pt-3">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sires or breeders…"
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
          </div>

          {/* Trending */}
          {!search && trending.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Flame className="w-4 h-4 text-[hsl(var(--gold))]" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-foreground">Trending Sires</h2>
              </div>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                {trending.map((s) => (
                  <Link
                    key={s.id}
                    to={`/sire/${s.id}`}
                    className="shrink-0 w-[140px] rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform"
                  >
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-full aspect-square rounded-lg object-cover mb-2" />
                    ) : (
                      <div className="w-full aspect-square rounded-lg mb-2 overflow-hidden">
                        <Monogram name={s.name} size={120} />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-[hsl(var(--gold))] font-semibold mt-0.5">
                      {s.winCount} win{s.winCount !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Catalog header */}
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-foreground mb-2">
            {search ? "Results" : "All Sires"}
            <span className="ml-2 text-muted-foreground font-medium normal-case tracking-normal">
              {filtered.length}
            </span>
          </h2>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No sires found.</p>
          ) : view === "list" ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
              {filtered.map((s, i) => (
                <Link
                  key={s.id}
                  to={`/sire/${s.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 active:bg-muted/50 transition-colors ${
                    i !== filtered.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
                  }`}
                >
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  ) : (
                    <Monogram name={s.name} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[12px] text-muted-foreground truncate">
                      {s.breed}
                      {s.breederName ? ` · ${s.breederName}` : ""}
                    </p>
                  </div>
                  {s.semenAvailable && (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SEMEN
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((s) => (
                <Link
                  key={s.id}
                  to={`/sire/${s.id}`}
                  className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform"
                >
                  <div className="w-full aspect-square overflow-hidden">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <Monogram name={s.name} size={180} />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-[hsl(var(--gold))] font-semibold mt-0.5">
                      {s.winCount > 0 ? `${s.winCount} win${s.winCount !== 1 ? "s" : ""}` : s.breed}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SiresPage;
