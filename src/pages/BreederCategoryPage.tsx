import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getSpecies } from "@/data/breederTaxonomy";
import { useBreederDirectory, stateAbbr } from "@/hooks/useBreederDirectory";
import { DirectoryBreadcrumb } from "@/components/directory/DirectoryBreadcrumb";
import { HorizontalBreederCard } from "@/components/directory/HorizontalBreederCard";
import { SortFilterSheet, useDirectoryFilters, SORT_OPTIONS } from "@/components/directory/SortFilterSheet";

export default function BreederCategoryPage() {
  const { species: speciesKey = "", category = "" } = useParams();
  const species = getSpecies(speciesKey);
  const sub = species?.subcategories.find((s) => s.slug === category);
  const { data: breeders = [], isLoading } = useBreederDirectory();
  const filters = useDirectoryFilters();

  if (!species || !sub) return <Navigate to="/breeders" replace />;

  const filtered = useMemo(() => {
    let list = breeders.filter((b) =>
      species.keywords.some((k) => b.searchText.includes(k.toLowerCase())) &&
      sub.keywords.some((k) => b.searchText.includes(k.toLowerCase()))
    );

    if (filters.filters.verified) list = list.filter((b) => b.subscription_tier === "breeder_page" || b.is_premium);
    if (filters.filters.available) list = list.filter((b) => b.subscription_tier === "breeder_page");
    if (filters.filters.highSales) list = list.filter((b) => b.winnerCount >= 3);
    if (filters.filters.semen) list = list.filter((b) => b.sireCount > 0);

    if (filters.sort === "alpha") {
      list.sort((a, b) => (a.display_name || a.username).localeCompare(b.display_name || b.username));
    } else if (filters.sort === "championships" || filters.sort === "topsale") {
      list.sort((a, b) => b.winnerCount - a.winnerCount);
    } else if (filters.sort === "newest") {
      list.reverse();
    } else {
      const tier = (t: string) => (t === "breeder_page" ? 0 : t === "listing" ? 1 : 2);
      list.sort((a, b) => tier(a.subscription_tier) - tier(b.subscription_tier) || b.winnerCount - a.winnerCount);
    }
    return list;
  }, [breeders, species, sub, filters.sort, filters.filters]);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.filters.verified) labels.push("Verified");
    if (filters.filters.available) labels.push("Available Now");
    if (filters.filters.semen) labels.push("Semen Available");
    if (filters.filters.highSales) labels.push("$10K+ Sales");
    if (filters.filters.myState) labels.push("My State");
    return labels;
  }, [filters.filters]);

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-[hsl(var(--primary))] text-white">
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-4 pt-6 pb-5">
            <DirectoryBreadcrumb
              items={[
                { label: "Directory", to: "/breeders" },
                { label: species.name, to: `/breeders/${species.key}` },
                { label: sub.name },
              ]}
            />
            <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">{sub.name}</h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/50">
              {species.name} · {SORT_OPTIONS.find((s) => s.value === filters.sort)?.label}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[13px] text-white/70">
                <span className="font-bold text-white">{filtered.length}</span> Breeder{filtered.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => filters.setOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Sort & Filter
                {filters.activeCount > 0 && (
                  <span className="rounded-full bg-[hsl(var(--gold))] px-1.5 text-[9px] font-bold text-black">
                    {filters.activeCount}
                  </span>
                )}
              </button>
            </div>

            {activeFilterLabels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeFilterLabels.map((l) => (
                  <span key={l} className="rounded-full bg-[hsl(var(--gold))]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--gold))]">
                    {l}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-5 pb-24">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-white/60 text-sm">No breeders match your filters.</p>
              <button
                onClick={() =>
                  filters.setFilters({ myState: false, verified: false, available: false, semen: false, highSales: false })
                }
                className="mt-3 text-[hsl(var(--gold))] text-sm font-semibold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filters.sort === "alpha" ? (
                groupByLetter(filtered).map(([letter, items]) => (
                  <div key={letter}>
                    <p className="sticky top-12 z-10 -mx-1 mb-2 px-1 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--gold))] bg-[hsl(var(--primary))]/90 backdrop-blur-sm">
                      {letter}
                    </p>
                    <div className="space-y-2">
                      {items.map((b, i) => <HorizontalBreederCard key={b.id} b={b} index={i} />)}
                    </div>
                  </div>
                ))
              ) : (
                filtered.map((b, i) => <HorizontalBreederCard key={b.id} b={b} index={i} />)
              )}
            </div>
          )}
        </section>

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

function groupByLetter<T extends { display_name: string | null; username: string }>(items: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  items.forEach((b) => {
    const letter = (b.display_name || b.username || "?")[0]?.toUpperCase() || "?";
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(b);
  });
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}
