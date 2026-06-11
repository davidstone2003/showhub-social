import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal, Trophy, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import type { Post } from "@/data/mock";

interface WinnerRow {
  id: string;
  title: string;
  show_name: string;
  show_id: string | null;
  win_placing: string | null;
  shown_by: string;
  bred_by: string | null;
  placed_by: string | null;
  sired_by: string | null;
  sire_id: string | null;
  dam: string | null;
  image_urls: string[] | null;
  video_url: string | null;
  date: string;
  created_at: string;
  species: string | null;
  likes: number;
  comments: number;
  caption: string | null;
  tags: string[] | null;
  user_id: string | null;
  status: string;
  posted_as_breeder_id: string | null;
}

function winnerToPost(row: WinnerRow, profilesMap: Record<string, any>, breederProfilesMap: Record<string, any>): Post {
  const profile = row.user_id ? profilesMap[row.user_id] : null;
  const bp = row.posted_as_breeder_id ? breederProfilesMap[row.posted_as_breeder_id] : null;

  let breeder;
  if (bp) {
    breeder = {
      id: bp.id,
      name: bp.breeder_name,
      location: bp.location || profile?.location || "",
      logo: bp.logo_url || profile?.logo_url || "",
      is_pro: true,
      slug: bp.breeder_slug,
    };
  } else {
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    breeder = {
      id: profile?.id || "unknown",
      name: fullName || profile?.display_name || profile?.username || "",
      location: profile?.location || "",
      logo: profile?.logo_url || "",
      is_pro: profile?.subscription_tier === "breeder_page" || profile?.subscription_tier === "listing",
      slug: profile?.username,
    };
  }

  return {
    id: row.id,
    image: row.image_urls?.[0] || "/placeholder.svg",
    breeder,
    win_title: row.win_placing || row.title || undefined,
    show_name: row.show_name,
    shown_by: row.shown_by,
    bred_by: row.bred_by || undefined,
    sired_by: row.sired_by || undefined,
    sire_id: row.sire_id || undefined,
    dam: row.dam || undefined,
    placed_by: row.placed_by || undefined,
    win_placing: row.win_placing || undefined,
    video_url: row.video_url || null,
    caption: row.caption || "",
    tags: (row.tags || []).map((t) => ({ label: t, type: "breed" })),
    post_type: "champion" as const,
    created_at: row.created_at,
    likes: row.likes,
    comments: row.comments,
    saved: false,
    user_id: row.user_id,
    status: row.status,
    winner_id: row.id,
  };
}

export default function WinnersPage() {
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [breederProfilesMap, setBreederProfilesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [species, setSpecies] = useState<SpeciesPill>("All");

  const handleModerated = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("winners")
        .select("id, title, show_name, show_id, win_placing, shown_by, bred_by, placed_by, sired_by, sire_id, dam, image_urls, video_url, date, created_at, species, likes, comments, caption, tags, user_id, status, posted_as_breeder_id")
        .eq("status", "active")
        .eq("show_on_winners_archive", true)
        .order("created_at", { ascending: false })
        .limit(500);

      const winners = (data || []) as WinnerRow[];
      setRows(winners);

      // Fetch profiles
      const userIds = [...new Set(winners.filter((w) => w.user_id).map((w) => w.user_id as string))];
      let pMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name, username, logo_url, location, subscription_tier")
          .in("id", userIds);
        if (profiles) pMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
      }
      setProfilesMap(pMap);

      const breederIds = [...new Set(winners.filter((w) => w.posted_as_breeder_id).map((w) => w.posted_as_breeder_id as string))];
      let bpMap: Record<string, any> = {};
      if (breederIds.length > 0) {
        const { data: bps } = await supabase
          .from("breeder_profiles")
          .select("id, breeder_name, breeder_slug, logo_url, location")
          .in("id", breederIds);
        if (bps) bpMap = Object.fromEntries(bps.map((bp) => [bp.id, bp]));
      }
      setBreederProfilesMap(bpMap);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  // Group by show
  const showGroups = useMemo(() => {
    const filteredRows = rows.filter((r) =>
      matchesSpecies(species, r.species, r.show_name, r.title, r.caption, (r.tags || []).join(" "))
    );
    const grouped = new Map<string, WinnerRow[]>();
    for (const r of filteredRows) {
      const key = r.show_name.trim().toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    }

    const result: { showName: string; year: number; posts: Post[] }[] = [];
    for (const [, winners] of grouped) {
      const ref = winners[0];
      const year = new Date(ref.date || ref.created_at).getFullYear();
      result.push({
        showName: ref.show_name,
        year,
        posts: winners.map((w) => winnerToPost(w, profilesMap, breederProfilesMap)),
      });
    }
    result.sort((a, b) => b.year - a.year || a.showName.localeCompare(b.showName));
    return result;
  }, [rows, profilesMap, breederProfilesMap, species]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Header — white bg, navy title */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-4 flex items-center justify-between" style={{ height: 60 }}>
          <h1 className="text-[22px] font-bold leading-none" style={{ color: "#0A1628" }}>Winners</h1>
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Search className="w-5 h-5" style={{ color: "#0A1628" }} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="w-5 h-5" style={{ color: "#0A1628" }} />
            </button>
          </div>
        </div>

        {/* Species pills */}
        <div className="px-4 pt-3 pb-3">
          <SpeciesPills value={species} onChange={setSpecies} />
        </div>

        <div className="px-4 pt-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : showGroups.length === 0 ? (
            <div className="flex flex-col items-center text-center" style={{ paddingTop: 80, paddingBottom: 40 }}>
              <Trophy size={48} style={{ color: "#C9A84C" }} />
              <h2 className="font-bold mt-4" style={{ fontSize: 22, lineHeight: 1.2, color: "#0A1628" }}>
                No winners yet
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xs" style={{ fontSize: 14, lineHeight: 1.4 }}>
                Post your champions and show results here
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center justify-center font-bold active:scale-95 transition-transform"
                style={{
                  marginTop: 20,
                  padding: "0 22px",
                  height: 48,
                  borderRadius: 24,
                  fontSize: 15,
                  backgroundColor: "#C9A84C",
                  color: "#0A1628",
                  boxShadow: "0 4px 12px rgba(201,168,76,0.35)",
                }}
              >
                Post a Win
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {showGroups.map((group, gi) => (
                <div key={group.showName} style={{ marginTop: gi === 0 ? 0 : 20 }}>
                  {/* Show header */}
                  <div
                    className="mb-3"
                    style={{
                      borderLeft: "3px solid #C9A84C",
                      paddingLeft: 12,
                    }}
                  >
                    <h3 className="font-bold leading-tight" style={{ fontSize: 16, color: "#0A1628" }}>
                      {group.year} {group.showName}
                    </h3>
                  </div>
                  {/* Cards */}
                  <div className="flex flex-col gap-3">
                    {group.posts.map((post, i) => (
                      <PostCard key={post.id} post={post} index={i} onModerated={handleModerated} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link
        to="/submit"
        aria-label="Post a Win"
        className="fixed z-40 flex items-center justify-center rounded-full active:scale-95 transition-transform"
        style={{
          width: 56, height: 56,
          right: 16, bottom: 80,
          backgroundColor: "#C9A84C",
          color: "#0A1628",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)"
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </Link>
    </Layout>
  );
}
