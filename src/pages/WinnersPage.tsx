import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { DirectoryLayout, type Species, type FilterDropdown } from "@/components/DirectoryLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/data/mock";

const levelOptions = [
  { label: "All Levels", value: "all" },
  { label: "Majors", value: "majors" },
  { label: "State", value: "state" },
  { label: "County", value: "county" },
  { label: "Jackpot", value: "jackpot" },
];

const currentYear = new Date().getFullYear();
const yearOptions = [
  { label: "All Years", value: "all" },
  ...Array.from({ length: 5 }, (_, i) => {
    const y = String(currentYear - i);
    return { label: y, value: y };
  }),
];

export default function WinnersPage() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<Species>("All");
  const [level, setLevel] = useState("all");
  const [year, setYear] = useState("all");

  useEffect(() => {
    async function fetchWinners() {
      const { data } = await supabase
        .from("winners")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data) {
        setWinners(
          data.map((w) => ({
            id: w.id,
            image: w.image_urls?.[0] || "/placeholder.svg",
            breeder: {
              id: `winner-${w.id}`,
              name: w.shown_by,
              location: w.show_name,
              logo: "🏆",
              is_pro: false,
            },
            win_title: w.title,
            show_name: w.show_name,
            shown_by: w.shown_by,
            bred_by: w.bred_by || undefined,
            sired_by: w.sired_by || undefined,
            dam: w.dam || undefined,
            placed_by: w.placed_by || undefined,
            win_placing: w.win_placing || undefined,
            caption: w.caption || "",
            tags: (w.tags || []).map((tag: string) => ({ label: tag, type: "winner" })),
            post_type: "champion" as const,
            created_at: new Date(w.created_at).toLocaleDateString(),
            likes: w.likes || 0,
            comments: w.comments || 0,
            saved: false,
          }))
        );
      }
      setLoading(false);
    }
    fetchWinners();
  }, []);

  const filtered = useMemo(() => {
    let list = [...winners];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.win_title?.toLowerCase().includes(q) ||
          p.show_name?.toLowerCase().includes(q) ||
          p.shown_by?.toLowerCase().includes(q) ||
          p.sired_by?.toLowerCase().includes(q) ||
          p.bred_by?.toLowerCase().includes(q)
      );
    }

    if (species !== "All") {
      const s = species.toLowerCase();
      list = list.filter(
        (p) =>
          p.tags?.some((t) => t.label.toLowerCase().includes(s)) ||
          p.caption?.toLowerCase().includes(s)
      );
    }

    if (year !== "all") {
      list = list.filter(
        (p) => p.show_name?.includes(year) || p.created_at?.includes(year)
      );
    }

    return list;
  }, [winners, search, species, level, year]);

  const filters: FilterDropdown[] = [
    { label: "Level", value: level, onChange: setLevel, options: levelOptions },
    { label: "Year", value: year, onChange: setYear, options: yearOptions },
  ];

  return (
    <DirectoryLayout
      title="Champion Gallery"
      description="Browse winners from shows across the country"
      searchPlaceholder="Search winner, show, sire, or breeder"
      search={search}
      onSearchChange={setSearch}
      species={species}
      onSpeciesChange={setSpecies}
      filters={filters}
      resultCount={filtered.length}
      resultLabel="Winner"
    >
      {loading ? (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : filtered.length > 0 ? (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {filtered.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="px-6 py-20 text-center">
          <p className="text-muted-foreground">No winners found.</p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 mt-4 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Backdrop
          </Link>
        </div>
      )}
    </DirectoryLayout>
  );
}
