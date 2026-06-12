import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Search, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getSpecies } from "@/data/breederTaxonomy";
import { useBreederDirectory } from "@/hooks/useBreederDirectory";
import { DirectoryBreadcrumb } from "@/components/directory/DirectoryBreadcrumb";
import { HorizontalBreederCard } from "@/components/directory/HorizontalBreederCard";
import { SortFilterSheet, useDirectoryFilters } from "@/components/directory/SortFilterSheet";

export default function SpeciesHubPage() {
  const { species: speciesKey = "" } = useParams();
  const species = getSpecies(speciesKey);
  const { data: breeders = [], isLoading } = useBreederDirectory();
  const [search, setSearch] = useState("");
  const filters = useDirectoryFilters();

  if (!species) return <Navigate to="/breeders" replace />;

  const inSpecies = useMemo(
    () => breeders.filter((b) => species.keywords.some((k) => b.searchText.includes(k.toLowerCase()))),
    [breeders, species]
  );

  const subCounts = useMemo(
    () =>
      species.subcategories.map((sub) => ({
        ...sub,
        count: inSpecies.filter((b) => sub.keywords.some((k) => b.searchText.includes(k.toLowerCase()))).length,
      })),
    [inSpecies, species]
  );

  const recentlyActive = useMemo(() => {
    const sorted = [...inSpecies].sort((a, b) => {
      const tier = (t: string) => (t === "breeder_page" ? 0 : t === "listing" ? 1 : 2);
      return tier(a.subscription_tier) - tier(b.subscription_tier) || b.winnerCount - a.winnerCount;
    });
    return sorted.slice(0, 8);
  }, [inSpecies]);

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-[hsl(var(--primary))] text-white">
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-4 pt-6 pb-6">
            <DirectoryBreadcrumb items={[{ label: "Directory", to: "/breeders" }, { label: species.name }]} />
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{species.name}</h1>
                <p className="mt-1 text-[12px] text-white/50">
                  <span className="font-bold text-white">{inSpecies.length}</span> {inSpecies.length === 1 ? "breeder" : "breeders"} · {species.blurb}
                </p>
              </div>
              <span className="text-5xl opacity-20">{species.silhouette}</span>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${species.name.toLowerCase()} breeders…`}
                className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[hsl(var(--gold))]/60"
              />
            </div>

            {filters.activeCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-[hsl(var(--gold))]/15 px-3 py-1 font-semibold text-[hsl(var(--gold))]">
                  {filters.activeCount} filter{filters.activeCount !== 1 ? "s" : ""} active
                </span>
              </div>
            )}
          </div>
        </section>

        {/* SUB-CATEGORY TILES */}
        <section className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-white/90">Categories</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subCounts.map((sub) => (
                <Link
                  key={sub.slug}
                  to={`/breeders/${species.key}/${sub.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141E2E] p-4 transition-all hover:border-[hsl(var(--gold))]/40 hover:-translate-y-0.5"
                >
                  <span className="absolute right-3 top-3 text-2xl opacity-20 group-hover:opacity-40">{sub.silhouette}</span>
                  <h3 className="text-sm md:text-base font-bold text-white pr-8 leading-tight">{sub.name}</h3>
                  <p className="mt-2 text-[11px] font-semibold text-[hsl(var(--gold))]">{sub.count} breeder{sub.count !== 1 ? "s" : ""}</p>
                  <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-white/30 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--gold))] transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* RECENTLY ACTIVE */}
        {recentlyActive.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-4 pb-24">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/90">Active This Week</h2>
              <button
                onClick={() => filters.setOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Sort & Filter
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {recentlyActive.map((b, i) => (
                <div key={b.id} className="w-[280px] shrink-0">
                  <HorizontalBreederCard b={b} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}

        <SortFilterSheet
          open={filters.open}
          onClose={() => filters.setOpen(false)}
          sort={filters.sort}
          onSortChange={filters.setSort}
          filters={filters.filters}
          onFiltersChange={filters.setFilters}
        />
      </div>
    </Layout>
  );
}
