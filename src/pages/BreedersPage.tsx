import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ChevronRight, LayoutGrid, List as ListIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterDropdown } from "@/components/shared/FilterDropdown";

import { Layout } from "@/components/Layout";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import { useBreederDirectory, stateAbbr } from "@/hooks/useBreederDirectory";

const NAVY = "hsl(var(--primary))";

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
        fontSize: size > 60 ? 20 : 16,
      }}
    >
      {initials(name) || "?"}
    </div>
  );
}

function breederSpecies(b: any): string {
  return b.searchText || "";
}

export default function BreedersPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<SpeciesPill>("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [selectedState, setSelectedState] = useState<string>("All States");

  const { data: breeders = [], isLoading } = useBreederDirectory();

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    breeders.forEach((b) => {
      const s = stateAbbr(b.location);
      if (s) states.add(s);
    });
    return ["All States", ...Array.from(states).sort()];
  }, [breeders]);

  const filtered = useMemo(() => {
    let result = breeders.filter((b) => matchesSpecies(species, breederSpecies(b)));
    if (selectedState !== "All States") {
      result = result.filter((b) => stateAbbr(b.location) === selectedState);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.searchText.includes(q));
    }
    return result;
  }, [breeders, search, species, selectedState]);

  return (
    <Layout showDiscovery={false}>
      <div style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        <PageHeader
          title="Breeders"
          searchPlaceholder="Search by name, farm, or location..."
          searchValue={search}
          onSearchChange={setSearch}
          viewToggle={{ view, onViewChange: setView }}
        />

        {/* Filters row */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 py-2 flex items-center gap-2">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <SpeciesPills value={species} onChange={setSpecies} />
          </div>
          <FilterDropdown
            label="State"
            value={selectedState}
            defaultValue="All States"
            options={availableStates}
            onChange={setSelectedState}
          />
        </div>


        {/* Results count */}
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-[12px] font-semibold" style={{ color: "#9CA3AF" }}>
            {filtered.length} breeder{filtered.length !== 1 ? "s" : ""}
            {selectedState !== "All States" ? ` in ${selectedState}` : ""}
            {species !== "All" ? ` · ${species}` : ""}
          </p>
          {(search || selectedState !== "All States" || species !== "All") && (
            <button
              onClick={() => { setSearch(""); setSelectedState("All States"); setSpecies("All"); }}
              className="text-[12px] font-bold"
              style={{ color: "hsl(var(--gold))" }}
            >
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 px-4 pt-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-[#E5E7EB] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <span className="text-4xl mb-3">🐑</span>
            <p className="font-bold text-[17px]" style={{ color: "hsl(var(--primary))" }}>No breeders found</p>
            <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>Try adjusting your filters</p>
            <button
              onClick={() => { setSearch(""); setSelectedState("All States"); setSpecies("All"); }}
              className="mt-4 rounded-full px-5 py-2 font-bold text-[14px]"
              style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
            >
              Clear Filters
            </button>
          </div>
        ) : view === "list" ? (
          <div className="flex flex-col gap-0 px-0 pb-24">
            {filtered.map((b: any, idx: number) => {
              const firstLetter = (b.display_name || b.username || "?").charAt(0).toUpperCase();
              const prevLetter = idx > 0
                ? ((filtered[idx - 1] as any).display_name || (filtered[idx - 1] as any).username || "?").charAt(0).toUpperCase()
                : null;
              const showDivider = search === "" && selectedState === "All States" && species === "All" && firstLetter !== prevLetter;

              return (
                <div key={b.username}>
                  {showDivider && (
                    <div className="px-4 py-1.5 border-b border-[#F3F4F6]" style={{ backgroundColor: "#F8F7F4" }}>
                      <span className="text-[12px] font-black" style={{ color: "hsl(var(--gold))" }}>{firstLetter}</span>
                    </div>
                  )}
                  <Link
                    to={`/breeder/${b.username}`}
                    className="flex items-start gap-3 px-4 py-4 bg-white border-b border-[#F3F4F6] active:bg-[#F8F7F4] transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-[18px]"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #1B3A6B 100%)" }}
                        >
                          {(b.display_name || b.username || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      {(b.is_verified || b.subscription_tier === "breeder_page") && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <BadgeCheck className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-[15px] leading-tight truncate" style={{ color: "hsl(var(--primary))" }}>
                            {b.display_name || b.username}
                          </p>
                          {b.farm_name && b.farm_name !== (b.display_name || b.username) && (
                            <p className="text-[12px] font-medium truncate mt-0.5" style={{ color: "#6B7280" }}>
                              {b.farm_name}
                            </p>
                          )}
                        </div>
                        {b.location && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                            {stateAbbr(b.location) || b.location}
                          </span>
                        )}
                      </div>

                      {b.species_tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {b.species_tags.map((s: string) => (
                            <span
                              key={s}
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                              style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#8B6914", border: "1px solid rgba(201,168,76,0.25)" }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {b.bio && (
                        <p className="text-[12px] mt-1.5 line-clamp-1 leading-snug" style={{ color: "#9CA3AF" }}>
                          {b.bio}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        {b.win_count > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "hsl(var(--gold))" }}>
                            🏆 {b.win_count} win{b.win_count !== 1 ? "s" : ""}
                          </span>
                        )}
                        {b.sire_count > 0 && (
                          <span className="text-[11px] font-semibold" style={{ color: "#6B7280" }}>
                            {b.sire_count} sire{b.sire_count !== 1 ? "s" : ""}
                          </span>
                        )}
                        {b.lambs_available && (
                          <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#16A34A" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Available
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 shrink-0 mt-2" style={{ color: "#D1D5DB" }} />
                  </Link>
                </div>
              );
            })}

            {/* Claim profile CTA */}
            <div className="mx-4 mt-4 mb-8 p-4 rounded-2xl text-center"
              style={{ backgroundColor: "#FFFBF0", border: "1px solid rgba(201,168,76,0.3)" }}>
              <p className="font-bold text-[14px]" style={{ color: "hsl(var(--primary))" }}>
                Don't see your operation?
              </p>
              <p className="text-[12px] mt-0.5 mb-3" style={{ color: "#6B7280" }}>
                Create your breeder profile and join the directory
              </p>
              <Link
                to="/onboarding"
                className="inline-block rounded-full px-5 py-2 text-[13px] font-bold"
                style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
              >
                Claim Your Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pt-2 pb-24">
            {filtered.map((b: any) => (
              <Link
                key={b.username}
                to={`/breeder/${b.username}`}
                className="rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="relative">
                  {b.hero_image_url || b.logo_url ? (
                    <img
                      src={b.hero_image_url || b.logo_url || ""}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #1B3A6B 100%)" }}>
                      <span className="text-3xl font-black" style={{ color: "rgba(201,168,76,0.4)" }}>
                        {(b.display_name || b.username || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {(b.is_verified || b.subscription_tier === "breeder_page") && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                      <BadgeCheck className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
                    </div>
                  )}
                  {b.lambs_available && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5"
                      style={{ backgroundColor: "rgba(22,163,74,0.9)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      <span className="text-[9px] font-bold text-white">Available</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <p className="font-bold text-[13px] truncate leading-tight" style={{ color: "hsl(var(--primary))" }}>
                    {b.display_name || b.username}
                  </p>
                  {b.location && (
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "#9CA3AF" }}>{b.location}</p>
                  )}
                  {b.species_tags?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {b.species_tags.slice(0, 2).map((s: string) => (
                        <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#8B6914" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {b.win_count > 0 && (
                    <p className="text-[11px] font-semibold mt-1.5" style={{ color: "hsl(var(--gold))" }}>
                      🏆 {b.win_count} win{b.win_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            {/* Claim profile CTA */}
            <Link
              to="/onboarding"
              className="rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center p-4 text-center aspect-square"
              style={{ borderColor: "rgba(201,168,76,0.4)", backgroundColor: "#FFFBF0" }}
            >
              <span className="text-2xl mb-1">+</span>
              <p className="text-[11px] font-bold" style={{ color: "#8B6914" }}>Add Your Operation</p>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
