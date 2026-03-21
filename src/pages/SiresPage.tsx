import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DirectoryLayout, type Species, type FilterDropdown } from "@/components/DirectoryLayout";
import gooseImage from "@/assets/sires/goose.jpeg";

interface Sire {
  id: string;
  name: string;
  breederName: string | null;
  species: Species;
  semenType: string;
}

const semenOptions = [
  { label: "All Semen Types", value: "all" },
  { label: "Frozen", value: "frozen" },
  { label: "Fresh Chilled", value: "fresh_chilled" },
  { label: "Fresh", value: "fresh" },
];

const SiresPage = () => {
  const [sires, setSires] = useState<Sire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<Species>("All");
  const [breederFilter, setBreederFilter] = useState("all");
  const [semenFilter, setSemenFilter] = useState("all");
  const [breederOptions, setBreederOptions] = useState<{ label: string; value: string }[]>([
    { label: "All Breeders", value: "all" },
  ]);

  useEffect(() => {
    async function fetchSires() {
      const [{ data: sireData }, { data: winnerData }] = await Promise.all([
        supabase.from("sires_lookup").select("id, name"),
        supabase.from("winners").select("sire_id, bred_by").eq("status", "active").not("sire_id", "is", null),
      ]);

      if (sireData) {
        const sireIdsWithPosts = new Set((winnerData ?? []).map((w) => w.sire_id).filter(Boolean));
        const breeders = new Set<string>();
        (winnerData ?? []).forEach((w) => { if (w.bred_by) breeders.add(w.bred_by); });
        setBreederOptions([
          { label: "All Breeders", value: "all" },
          ...Array.from(breeders).sort().map((b) => ({ label: b, value: b })),
        ]);

        const sortedSires = [...sireData].sort((a, b) => {
          const aHas = sireIdsWithPosts.has(a.id);
          const bHas = sireIdsWithPosts.has(b.id);
          if (aHas !== bHas) return aHas ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        const breederBySireId = new Map<string, string>();
        (winnerData ?? []).forEach((winner) => {
          if (winner.sire_id && winner.bred_by && !breederBySireId.has(winner.sire_id)) {
            breederBySireId.set(winner.sire_id, winner.bred_by);
          }
        });

        setSires(
          sortedSires.map((sire) => ({
            ...sire,
            breederName: breederBySireId.get(sire.id) ?? null,
            species: "Sheep",
            semenType: "all",
          }))
        );
      }
      setLoading(false);
    }
    fetchSires();
  }, []);

  const filtered = useMemo(() => {
    let list = [...sires];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (species !== "All") {
      list = list.filter((s) => s.species === species);
    }

    if (breederFilter !== "all") {
      list = list.filter((s) => s.breederName === breederFilter);
    }

    if (semenFilter !== "all") {
      list = list.filter((s) => s.semenType === semenFilter);
    }

    return list;
  }, [sires, search, species, breederFilter, semenFilter]);

  const filters: FilterDropdown[] = [
    { label: "Breeder", value: breederFilter, onChange: setBreederFilter, options: breederOptions },
    { label: "Semen Type", value: semenFilter, onChange: setSemenFilter, options: semenOptions },
  ];

  return (
    <DirectoryLayout
      title="Sire Directory"
      description="Browse sires by breeder, breed, and availability"
      searchPlaceholder="Search sire name"
      search={search}
      onSearchChange={setSearch}
      species={species}
      onSpeciesChange={setSpecies}
      filters={filters}
      resultCount={filtered.length}
      resultLabel="Sire"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No sires found.</p>
      ) : (
        <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/sire/${s.id}`}
              className="block bg-card rounded-xl border border-border overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="w-full aspect-square bg-muted">
                {s.name === "Goose" ? (
                  <img src={gooseImage} alt={s.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🐏</div>
                )}
              </div>
              <div className="flex items-center gap-1.5 p-2.5">
                <Dna className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DirectoryLayout>
  );
};

export default SiresPage;
