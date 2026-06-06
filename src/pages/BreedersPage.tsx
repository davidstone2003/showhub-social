import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { MapPin, Trophy } from "lucide-react";
import { DirectoryLayout, type Species, type FilterDropdown } from "@/components/DirectoryLayout";

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

type BreederProfile = {
  id: string;
  display_name: string | null;
  username: string;
  logo_url: string | null;
  location: string | null;
  bio: string | null;
  subscription_tier: string;
  is_premium: boolean;
  winnerCount?: number;
  sireCount?: number;
};

const stateOptions = [
  { label: "All States", value: "all" },
  { label: "Texas", value: "Texas" },
  { label: "Oklahoma", value: "Oklahoma" },
  { label: "Ohio", value: "Ohio" },
  { label: "Indiana", value: "Indiana" },
  { label: "California", value: "California" },
  { label: "Iowa", value: "Iowa" },
];

const FOLLOW_KEY = "backdrop_followed_breeders";
function loadFollowed(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(FOLLOW_KEY) || "[]"); } catch { return []; }
}

export default function BreedersPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<Species>("All");
  const [stateFilter, setStateFilter] = useState("all");
  const [followed, setFollowed] = useState<string[]>(() => loadFollowed());

  const toggleFollow = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowed((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(next));
      return next;
    });
  };


  const { data: breeders = [], isLoading } = useQuery({
    queryKey: ["breeders-directory-full"],
    queryFn: async () => {
      const [profilesRes, winnersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("display_name", { ascending: true }),
        supabase.from("winners").select("bred_by, sired_by").eq("status", "active"),
      ]);
      if (profilesRes.error) throw profilesRes.error;

      const winnerCounts: Record<string, number> = {};
      const sireCounts: Record<string, Set<string>> = {};
      (winnersRes.data || []).forEach((w) => {
        if (w.bred_by) {
          const key = w.bred_by.toLowerCase();
          winnerCounts[key] = (winnerCounts[key] || 0) + 1;
          if (w.sired_by) {
            if (!sireCounts[key]) sireCounts[key] = new Set();
            sireCounts[key].add(w.sired_by);
          }
        }
      });

      return (profilesRes.data || []).map((p) => {
        const key = (p.display_name || p.username || "").toLowerCase();
        return { ...p, winnerCount: winnerCounts[key] || 0, sireCount: sireCounts[key]?.size || 0 } as BreederProfile;
      });
    },
  });

  const filtered = useMemo(() => {
    let list = [...breeders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        (b.display_name || "").toLowerCase().includes(q) ||
        b.username.toLowerCase().includes(q) ||
        (b.location || "").toLowerCase().includes(q)
      );
    }

    if (stateFilter !== "all") {
      list = list.filter((b) => (b.location || "").toLowerCase().includes(stateFilter.toLowerCase()));
    }

    if (species !== "All") {
      const q = species.toLowerCase();
      list = list.filter((b) => {
        const haystack = `${b.display_name || ""} ${b.username} ${b.bio || ""}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    const tierRank = (t: string) => (t === "breeder_page" ? 0 : t === "listing" ? 1 : 2);
    list.sort((a, b) => tierRank(a.subscription_tier) - tierRank(b.subscription_tier) || b.winnerCount! - a.winnerCount!);
    return list;
  }, [breeders, search, species, stateFilter]);

  const isPaid = (tier: string) => tier === "breeder_page" || tier === "listing";

  const filters: FilterDropdown[] = [
    { label: "State", value: stateFilter, onChange: setStateFilter, options: stateOptions },
  ];

  return (
    <DirectoryLayout
      title="Breeder Directory"
      description="Find breeders, winners, and listings"
      searchPlaceholder="Search breeder, sire, or location"
      search={search}
      onSearchChange={setSearch}
      species={species}
      onSpeciesChange={setSpecies}
      filters={filters}
      resultCount={filtered.length}
      resultLabel="Breeder"
    >
      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No breeders found</p>
          {search && (
            <button onClick={() => setSearch("")} className="text-primary text-sm mt-2 hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => {
            const name = b.display_name || b.username;
            const link = b.username && isPaid(b.subscription_tier) ? `/breeder/${b.username}` : "/breeders";

            return (
              <Link
                key={b.id}
                to={link}
                className="block bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 border border-border shrink-0">
                    {b.logo_url ? <AvatarImage src={b.logo_url} alt={name} className="object-cover" /> : null}
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground truncate">{name}</span>
                      {isPaid(b.subscription_tier) && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0">PRO</Badge>
                      )}
                    </div>
                    {b.location && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3" />{b.location}
                      </span>
                    )}
                  </div>
                </div>
                {b.bio && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-2">{b.bio}</p>}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />{b.winnerCount} winner{b.winnerCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">🐏 {b.sireCount} sire{b.sireCount !== 1 ? "s" : ""}</span>
                  <button
                    onClick={(e) => toggleFollow(e, b.id)}
                    className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      followed.includes(b.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {followed.includes(b.id) ? "Following" : "Follow"}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </DirectoryLayout>
  );
}
