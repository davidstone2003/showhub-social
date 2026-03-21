import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Search, MapPin, Trophy, Heart, Eye } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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

const stateOptions = ["All States", "Texas", "Oklahoma", "Ohio", "Indiana", "California", "Iowa"] as const;
const speciesOptions = ["All Species", "Sheep", "Goats", "Cattle", "Swine"] as const;

export default function BreedersPage() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All States");
  const [speciesFilter, setSpeciesFilter] = useState("All Species");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [sort, setSort] = useState("relevant");

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
        return {
          ...p,
          winnerCount: winnerCounts[key] || 0,
          sireCount: sireCounts[key]?.size || 0,
        } as BreederProfile;
      });
    },
  });

  const filtered = useMemo(() => {
    let list = [...breeders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          (b.display_name || "").toLowerCase().includes(q) ||
          b.username.toLowerCase().includes(q) ||
          (b.location || "").toLowerCase().includes(q) ||
          (b.bio || "").toLowerCase().includes(q)
      );
    }

    if (stateFilter !== "All States") {
      list = list.filter((b) => (b.location || "").toLowerCase().includes(stateFilter.toLowerCase()));
    }

    if (premiumOnly) {
      list = list.filter((b) => b.subscription_tier === "breeder_page" || b.subscription_tier === "listing");
    }

    // Sort
    const tierRank = (t: string) => (t === "breeder_page" ? 0 : t === "listing" ? 1 : 2);

    switch (sort) {
      case "relevant":
        list.sort((a, b) => tierRank(a.subscription_tier) - tierRank(b.subscription_tier) || b.winnerCount! - a.winnerCount!);
        break;
      case "winners":
        list.sort((a, b) => b.winnerCount! - a.winnerCount!);
        break;
      case "az":
        list.sort((a, b) => (a.display_name || a.username).localeCompare(b.display_name || b.username));
        break;
      default:
        break;
    }

    return list;
  }, [breeders, search, stateFilter, speciesFilter, premiumOnly, sort]);

  const isPaid = (tier: string) => tier === "breeder_page" || tier === "listing";

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 pb-24">
        {/* Header */}
        <div className="pt-5 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Breeder Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find breeders, winners, sires, and listings
          </p>
        </div>

        {/* Sticky search + filters */}
        <div className="sticky top-[44px] lg:top-0 z-30 bg-background pb-3 space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search breeder, sire, location, or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card border-border rounded-lg text-sm"
            />
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs bg-card border-border rounded-full px-3 gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs bg-card border-border rounded-full px-3 gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {speciesOptions.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setPremiumOnly(!premiumOnly)}
              className={`shrink-0 h-8 px-3 text-xs font-medium rounded-full border transition-colors ${
                premiumOnly
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/40"
              }`}
            >
              Premium
            </button>

            {/* Sort */}
            <div className="ml-auto shrink-0">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs bg-card border-border rounded-full px-3 gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant" className="text-xs">Most Relevant</SelectItem>
                  <SelectItem value="winners" className="text-xs">Most Winners</SelectItem>
                  <SelectItem value="az" className="text-xs">A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} breeder{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => {
              const name = b.display_name || b.username;
              const link = b.username && isPaid(b.subscription_tier) ? `/breeder/${b.username}` : "/breeders";

              return (
                <div
                  key={b.id}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  {/* Top: avatar + name + location */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border border-border shrink-0">
                      {b.logo_url ? (
                        <AvatarImage src={b.logo_url} alt={name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground truncate">{name}</span>
                        {isPaid(b.subscription_tier) && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
                            PRO
                          </Badge>
                        )}
                      </div>
                      {b.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {b.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {b.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{b.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {b.winnerCount} winner{b.winnerCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      🐏 {b.sireCount} sire{b.sireCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <Button asChild size="sm" className="flex-1 h-8 text-xs rounded-lg">
                      <Link to={link}>View Breeder</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3">
                      <Heart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
