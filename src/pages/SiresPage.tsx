import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, LayoutGrid, List as ListIcon, Flame, Plus } from "lucide-react";
import { CreateButton } from "@/components/shared/CreateButton";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import gooseImage from "@/assets/sires/goose.jpeg";
import { REPRO_SHEEP_SIRES } from "@/data/reproSheepSires";

const RSG_PHOTO_BY_NAME = new Map<string, string>(
  REPRO_SHEEP_SIRES
    .filter((s) => s.photo_url)
    .map((s) => [s.sire_name.toLowerCase().trim(), s.photo_url as string])
);
function rsgPhoto(name: string): string | undefined {
  return RSG_PHOTO_BY_NAME.get(name.toLowerCase().trim());
}

const NAVY = "#0A1628";
const GOLD = "#C9A84C";

interface Sire {
  id: string;
  name: string;
  breederName: string | null;
  breed: string;
  semenAvailable: boolean;
  winCount: number;
  image?: string;
  seeded?: boolean;
}

const SEED_SIRES: Sire[] = [
  { id: "seed-good-life", name: "Good Life", breederName: null, breed: "Sheep", semenAvailable: true, winCount: 0, seeded: true },
  { id: "seed-chick-magnet", name: "Chick Magnet", breederName: null, breed: "Sheep", semenAvailable: true, winCount: 0, seeded: true },
  { id: "seed-pipas", name: "Pipas", breederName: null, breed: "Sheep", semenAvailable: true, winCount: 0, seeded: true },
  { id: "seed-common-ground", name: "Common Ground", breederName: null, breed: "Sheep", semenAvailable: true, winCount: 0, seeded: true },
  { id: "seed-on-the-rocks", name: "On The Rocks", breederName: null, breed: "Sheep", semenAvailable: true, winCount: 0, seeded: true },
  { id: "seed-smoke-bomb", name: "Smoke Bomb", breederName: null, breed: "Sheep", semenAvailable: true, winCount: 0, seeded: true },
];

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

function SemenBadge() {
  return (
    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: "#166534", color: "#FFFFFF" }}>
      SEMEN
    </span>
  );
}

const SiresPage = () => {
  const [sires, setSires] = useState<Sire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("grid");
  const [species, setSpecies] = useState<SpeciesPill>("All");
  const [selectedOwner, setSelectedOwner] = useState<string>("All Owners");
  const [semenFilter, setSemenFilter] = useState<"All" | "Available">("All");
  const [ownerOpen, setOwnerOpen] = useState(false);

  useEffect(() => {
    async function fetchSires() {
      const [{ data: sireData }, { data: winnerData }] = await Promise.all([
        supabase.from("sires_lookup").select("id, name"),
        supabase.from("winners").select("sire_id, bred_by").eq("status", "active").not("sire_id", "is", null),
      ]);

      const winsBySire = new Map<string, number>();
      const breederBySire = new Map<string, string>();
      (winnerData ?? []).forEach((w) => {
        if (!w.sire_id) return;
        winsBySire.set(w.sire_id, (winsBySire.get(w.sire_id) ?? 0) + 1);
        if (w.bred_by && !breederBySire.has(w.sire_id)) breederBySire.set(w.sire_id, w.bred_by);
      });

      const mapped: Sire[] = (sireData ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        breederName: breederBySire.get(s.id) ?? null,
        breed: "Sheep",
        semenAvailable: winsBySire.has(s.id),
        winCount: winsBySire.get(s.id) ?? 0,
        image: s.name === "Goose" ? gooseImage : rsgPhoto(s.name),
      }));

      mapped.sort((a, b) => b.winCount - a.winCount || a.name.localeCompare(b.name));

      const existingNames = new Set(mapped.map((m) => m.name.toLowerCase()));
      const seedsToAdd = SEED_SIRES
        .filter((s) => !existingNames.has(s.name.toLowerCase()))
        .map((s) => ({ ...s, image: s.image ?? rsgPhoto(s.name) }));
      setSires([...mapped, ...seedsToAdd]);
      setLoading(false);
    }
    fetchSires();
  }, []);

  useEffect(() => {
    const handler = () => setOwnerOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const availableOwners = useMemo(() => {
    const owners = sires.map((s) => s.breederName).filter(Boolean) as string[];
    return ["All Owners", ...Array.from(new Set(owners)).sort()];
  }, [sires]);

  const filtered = useMemo(() => {
    let result = sires.filter((s) => matchesSpecies(species, s.breed, s.name));
    if (selectedOwner !== "All Owners") {
      result = result.filter((s) => s.breederName === selectedOwner);
    }
    if (semenFilter === "Available") {
      result = result.filter((s) => s.semenAvailable);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) || (s.breederName ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [sires, search, species, selectedOwner, semenFilter]);

  const trending = useMemo(() => sires.filter((s) => s.winCount > 0).slice(0, 8), [sires]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Header */}
        <div
          className="sticky top-0 z-20 px-4 flex items-center justify-between"
          style={{ height: 60, backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-[22px] font-bold leading-none" style={{ color: "#FFFFFF" }}>Sires</h1>
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

        {/* Filter bar — light */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-[60px] z-10">
          <div className="px-4 pt-2 pb-1">
            <SpeciesPills value={species} onChange={setSpecies} />
          </div>
          <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSemenFilter((v) => (v === "All" ? "Available" : "All"))}
              className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold transition-colors"
              style={semenFilter === "Available"
                ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
            >
              {semenFilter === "Available" ? "✓ Semen Available" : "Semen Available"}
            </button>

            <div className="relative shrink-0">
              <button
                onClick={() => setOwnerOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold transition-colors"
                style={selectedOwner !== "All Owners"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedOwner === "All Owners" ? "Owner" : selectedOwner}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {ownerOpen && (
                <div className="absolute left-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xl z-30 overflow-hidden" style={{ minWidth: 180, maxHeight: 240, overflowY: "auto" }}>
                  {availableOwners.map((name) => (
                    <button key={name} onClick={() => { setSelectedOwner(name); setOwnerOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F8F7F4]"
                      style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <span className="text-[13px] font-medium text-[#0A1628] truncate">{name}</span>
                      {selectedOwner === name && (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5} className="shrink-0 ml-2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(selectedOwner !== "All Owners" || semenFilter !== "All" || search) && (
              <button
                onClick={() => { setSelectedOwner("All Owners"); setSemenFilter("All"); setSearch(""); }}
                className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
                style={{ backgroundColor: "#FFF8E7", color: "#8B6914", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                Clear ×
              </button>
            )}
          </div>
        </div>

        <div className="px-4 pt-3">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sires or breeders…"
              className="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none"
              style={{ color: NAVY }}
            />
          </div>


          {/* Trending */}
          {!search && trending.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Flame className="w-4 h-4" style={{ color: GOLD }} />
                <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>Trending Sires</h2>
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
                    <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{s.name}</p>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: GOLD }}>
                      {s.winCount} win{s.winCount !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Catalog header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>
              {search ? "Results" : "All Sires"}
              <span className="ml-2 text-muted-foreground font-medium normal-case tracking-normal">
                {filtered.length}
              </span>
            </h2>
            <Link
              to="/submit-sire"
              className="inline-flex items-center gap-1 rounded-full px-3 h-7 text-[11px] font-bold"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              <Plus className="w-3 h-3" strokeWidth={3} />
              Submit
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : view === "list" ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
              {filtered.map((s, i) => {
                const inner = (
                  <>
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                    ) : (
                      <Monogram name={s.name} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{s.name}</p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {s.breed}
                        {s.breederName ? ` · ${s.breederName}` : ""}
                      </p>
                    </div>
                    {s.semenAvailable && <SemenBadge />}
                    {!s.seeded && <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />}
                  </>
                );
                const cls = `flex items-center gap-3 px-3 py-2.5 ${
                  i !== filtered.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
                } ${s.seeded ? "opacity-95" : "active:bg-muted/50 transition-colors"}`;
                return s.seeded ? (
                  <div key={s.id} className={cls}>{inner}</div>
                ) : (
                  <Link key={s.id} to={`/sire/${s.id}`} className={cls}>{inner}</Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((s) => {
                const inner = (
                  <>
                    <div className="w-full aspect-square overflow-hidden">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <Monogram name={s.name} size={180} />
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{s.name}</p>
                        {s.semenAvailable && <SemenBadge />}
                      </div>
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: GOLD }}>
                        {s.winCount > 0 ? `${s.winCount} win${s.winCount !== 1 ? "s" : ""}` : s.breed}
                      </p>
                    </div>
                  </>
                );
                const cls = "rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]";
                return s.seeded ? (
                  <div key={s.id} className={cls}>{inner}</div>
                ) : (
                  <Link key={s.id} to={`/sire/${s.id}`} className={`${cls} hover:-translate-y-0.5 transition-transform`}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <h3 className="text-xl font-bold" style={{ color: NAVY }}>Sires Coming Soon</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        We're building the most complete sire database in the industry. Check back daily as we add records.
      </p>
      <Link
        to="/submit-sire"
        className="inline-flex items-center gap-1.5 mt-5 rounded-full px-5 h-11 text-sm font-bold"
        style={{ backgroundColor: GOLD, color: NAVY }}
      >
        <Plus className="w-4 h-4" strokeWidth={3} /> Submit a Sire
      </Link>
    </div>
  );
}

export default SiresPage;
