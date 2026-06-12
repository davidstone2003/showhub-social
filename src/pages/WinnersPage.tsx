import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal, Trophy, Plus, List, AlignLeft, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import { WinnerDetailDrawer } from "@/components/post/WinnerDetailDrawer";
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

function detectShowCategory(showName: string): string {
  const n = (showName || "").toLowerCase();
  if (["national","american royal","houston livestock","san antonio","denver","fort worth","arizona national","oklahoma youth expo","oye","naile","world","supreme","major","nugget","exchange","the show reno","wde","louisville","kansas city"].some(k => n.includes(k))) return "National / Major";
  if (["state fair","state show","state livestock","ohio state","indiana state","texas state","colorado state","california state","michigan state","illinois state","kansas state","iowa state","missouri state"].some(k => n.includes(k))) return "State Fair";
  if (["jackpot","classic","invitational","open show","revival","exposure","showcase","brand sale","elite","premier","palooza","showdown","challenge","series","qualifier","bid board","stock show"].some(k => n.includes(k))) return "Jackpot";
  if (["county","district","regional","local","4h","ffa","chapter","club","young farmer","junior livestock"].some(k => n.includes(k))) return "County / Local";
  return "Jackpot";
}

export default function WinnersPage() {
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [breederProfilesMap, setBreederProfilesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [species, setSpecies] = useState<SpeciesPill>("All");

  const [viewMode, setViewMode] = useState<"feed" | "results" | "grid">("results");
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSelectorOpen, setShowSelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Levels");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedBreeder, setSelectedBreeder] = useState<string>("All Breeders");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [breederOpen, setBreederOpen] = useState(false);
  const [drawerPost, setDrawerPost] = useState<Post | null>(null);

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

  const years = useMemo(() => {
    const ys = [...new Set(rows.map(r => new Date(r.date || r.created_at).getFullYear()))];
    return ys.sort((a, b) => b - a);
  }, [rows]);

  const availableStates = useMemo(() => {
    const pattern = /\(([A-Z]{2})\)/;
    const states = rows.map(r => pattern.exec(r.show_name)?.[1]).filter(Boolean) as string[];
    return ["All States", ...Array.from(new Set(states)).sort()];
  }, [rows]);

  const availableBreeders = useMemo(() => {
    const names = rows.map(r => r.bred_by).filter(Boolean) as string[];
    return ["All Breeders", ...Array.from(new Set(names)).sort()];
  }, [rows]);

  const categoryOptions = ["All Levels", "National / Major", "State Fair", "Jackpot", "County / Local"];

  useEffect(() => {
    const handler = () => { setCategoryOpen(false); setStateOpen(false); setBreederOpen(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const allShowNames = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach(r => counts.set(r.show_name, (counts.get(r.show_name) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const showGroups = useMemo(() => {
    let filteredRows = rows.filter((r) =>
      matchesSpecies(species, r.species, r.show_name, r.title, r.caption, (r.tags || []).join(" "))
    );
    if (selectedYear) {
      filteredRows = filteredRows.filter(r => new Date(r.date || r.created_at).getFullYear() === selectedYear);
    }
    if (selectedShow) {
      filteredRows = filteredRows.filter(r => r.show_name === selectedShow);
    }
    if (selectedCategory !== "All Levels") {
      filteredRows = filteredRows.filter(r => detectShowCategory(r.show_name || "") === selectedCategory);
    }
    if (selectedState !== "All States") {
      filteredRows = filteredRows.filter(r => r.show_name?.includes(`(${selectedState})`));
    }
    if (selectedBreeder !== "All Breeders") {
      filteredRows = filteredRows.filter(r => r.bred_by === selectedBreeder);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredRows = filteredRows.filter(r =>
        r.show_name?.toLowerCase().includes(q) ||
        r.shown_by?.toLowerCase().includes(q) ||
        r.bred_by?.toLowerCase().includes(q) ||
        r.sired_by?.toLowerCase().includes(q) ||
        r.win_placing?.toLowerCase().includes(q)
      );
    }
    const grouped = new Map<string, WinnerRow[]>();
    for (const r of filteredRows) {
      const key = r.show_name.trim().toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    }
    const result: { showName: string; year: number; posts: Post[]; rows: WinnerRow[] }[] = [];
    for (const [, winners] of grouped) {
      const ref = winners[0];
      const year = new Date(ref.date || ref.created_at).getFullYear();
      result.push({
        showName: ref.show_name,
        year,
        posts: winners.map((w) => winnerToPost(w, profilesMap, breederProfilesMap)),
        rows: winners,
      });
    }
    result.sort((a, b) => b.year - a.year || a.showName.localeCompare(b.showName));
    return result;
  }, [rows, profilesMap, breederProfilesMap, species, selectedYear, selectedShow, searchQuery]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 flex items-center justify-between"
          style={{ height: 60, backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          {searchOpen ? (
            <div className="flex items-center gap-2 w-full">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search shows, breeders, exhibitors..."
                className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-white/60 text-sm">Cancel</button>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-bold leading-none" style={{ color: "#FFFFFF" }}>Winners</h1>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.06)" }}>
                  {([["feed", List], ["results", AlignLeft], ["grid", LayoutGrid]] as const).map(([mode, Icon]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="p-2 transition-colors"
                      style={{ backgroundColor: viewMode === mode ? "rgba(201,168,76,0.25)" : "transparent" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: viewMode === mode ? "#C9A84C" : "rgba(255,255,255,0.5)" }} />
                    </button>
                  ))}
                </div>
                <button onClick={() => setSearchOpen(true)} className="p-1.5">
                  <Search className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
                <button onClick={() => setShowSelectorOpen(true)} className="p-1.5">
                  <SlidersHorizontal className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Filters — light background, directly above content */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-[60px] z-10">
          {/* Species pills */}
          <div className="px-4 pt-2 pb-1">
            <SpeciesPills value={species} onChange={setSpecies} />
          </div>

          {/* Year pills + Filter button row */}
          <div className="flex items-center gap-2 px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              <button
                onClick={() => setSelectedYear(null)}
                className="shrink-0 rounded-full px-3 py-1 text-[12px] font-bold border transition-colors"
                style={!selectedYear
                  ? { backgroundColor: "#0A1628", color: "#FFFFFF", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                All Years
              </button>
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                  className="shrink-0 rounded-full px-3 py-1 text-[12px] font-bold border transition-colors"
                  style={selectedYear === y
                    ? { backgroundColor: "#0A1628", color: "#FFFFFF", borderColor: "#0A1628" }
                    : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
                  }
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSelectorOpen(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-bold relative transition-colors"
              style={selectedShow
                ? { backgroundColor: "#0A1628", color: "#FFFFFF", borderColor: "#0A1628" }
                : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {selectedShow && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] ml-0.5" />
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {(selectedShow || searchQuery) && (
            <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
              {[
                { val: selectedShow, clear: () => setSelectedShow(null) },
                { val: searchQuery ? `"${searchQuery}"` : null, clear: () => setSearchQuery("") },
              ].filter(f => f.val).map((f, i) => (
                <span
                  key={i}
                  className="shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ backgroundColor: "#FFFBF0", color: "#8B6914", border: "1px solid rgba(201,168,76,0.4)" }}
                >
                  {f.val}
                  <button onClick={f.clear} className="ml-0.5 font-bold">×</button>
                </span>
              ))}
              <button
                onClick={() => { setSelectedShow(null); setSelectedYear(null); setSearchQuery(""); }}
                className="shrink-0 text-[11px] font-bold"
                style={{ color: "#C9A84C" }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <div className="flex flex-col gap-3 px-4 pt-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : showGroups.length === 0 ? (
            <div className="flex flex-col items-center text-center px-4" style={{ paddingTop: 60 }}>
              <Trophy size={40} style={{ color: "#C9A84C" }} />
              <h3 className="font-bold mt-3 text-[18px]" style={{ color: "#0A1628" }}>
                {(selectedShow || selectedYear || searchQuery) ? "No results found" : "No winners yet"}
              </h3>
              <p className="text-[#6B7280] text-[14px] mt-1">
                {selectedShow ? `No winners from ${selectedShow}` : (selectedShow || selectedYear || searchQuery) ? "Try adjusting your filters" : "Post your champions and show results here"}
              </p>
              {(selectedShow || selectedYear || searchQuery) ? (
                <button
                  onClick={() => { setSelectedShow(null); setSelectedYear(null); setSearchQuery(""); }}
                  className="mt-4 rounded-full px-5 py-2 font-bold text-[14px]"
                  style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/submit"
                  className="inline-flex items-center justify-center font-bold active:scale-95 transition-transform mt-5"
                  style={{ padding: "0 22px", height: 48, borderRadius: 24, fontSize: 15, backgroundColor: "#C9A84C", color: "#0A1628", boxShadow: "0 4px 12px rgba(201,168,76,0.35)" }}
                >
                  Post a Win
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* FEED VIEW */}
              {viewMode === "feed" && (
                <div className="px-4 pt-4" style={{ display: "flex", flexDirection: "column" }}>
                  {showGroups.map((group, gi) => (
                    <div key={group.showName} style={{ marginTop: gi === 0 ? 0 : 20 }}>
                      <div className="mb-3" style={{ borderLeft: "3px solid #C9A84C", paddingLeft: 12 }}>
                        <h3 className="font-bold leading-tight" style={{ fontSize: 16, color: "#0A1628" }}>
                          {group.year} {group.showName}
                        </h3>
                      </div>
                      <div className="flex flex-col gap-3">
                        {group.posts.map((post, i) => (
                          <PostCard key={post.id} post={post} index={i} onModerated={handleModerated} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RESULTS VIEW */}
              {viewMode === "results" && (
                <div className="px-4 pt-4 flex flex-col gap-8">
                  {showGroups.map((group) => (
                    <div key={group.showName}>
                      <div className="mb-4 pb-3 border-b-2 border-[#C9A84C]">
                        <h2 className="text-[20px] font-bold" style={{ color: "#0A1628" }}>{group.showName}</h2>
                        <p className="text-[13px] text-[#6B7280] mt-0.5">{group.year}</p>
                      </div>
                      {group.rows.filter(r => r.image_urls?.[0]).length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {group.rows.filter(r => r.image_urls?.[0]).map(r => (
                            <div key={r.id} className="rounded-xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm">
                              <img
                                src={r.image_urls![0]}
                                alt={r.win_placing || r.show_name}
                                className="w-full aspect-[4/3] object-cover"
                              />
                              <div className="p-2.5">
                                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#C9A84C" }}>
                                  {r.win_placing || "Winner"}
                                </p>
                                <p className="text-[13px] font-bold text-[#0A1628] mt-0.5 leading-tight">{r.shown_by}</p>
                                {r.bred_by && (
                                  <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                                    Bred by <span className="font-semibold text-[#0A1628]">{r.bred_by}</span>
                                  </p>
                                )}
                                {r.sired_by && (
                                  <p className="text-[11px] mt-0.5 truncate" style={{ color: "#C9A84C" }}>
                                    Sired by {r.sired_by}
                                  </p>
                                )}
                                {r.placed_by && (
                                  <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                                    Placed by {r.placed_by}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {group.rows.filter(r => !r.image_urls?.[0]).length > 0 && (
                        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                          {group.rows.filter(r => !r.image_urls?.[0]).map((r, i, arr) => (
                            <div
                              key={r.id}
                              className="px-4 py-3"
                              style={{ borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}
                            >
                              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#C9A84C" }}>
                                {r.win_placing || "Winner"}
                              </p>
                              <p className="text-[14px] font-bold text-[#0A1628] mt-0.5">
                                {r.shown_by}
                                {r.bred_by && (
                                  <span className="font-normal text-[#6B7280]"> — Bred by {r.bred_by}</span>
                                )}
                              </p>
                              {r.sired_by && (
                                <p className="text-[12px] mt-0.5" style={{ color: "#C9A84C" }}>Sired by {r.sired_by}</p>
                              )}
                              {r.placed_by && (
                                <p className="text-[12px] text-[#6B7280] mt-0.5">Placed by {r.placed_by}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* GRID VIEW */}
              {viewMode === "grid" && (
                <div className="px-3 pt-4">
                  {showGroups.map((group) => (
                    <div key={group.showName} className="mb-6">
                      <div className="mb-3 px-1" style={{ borderLeft: "3px solid #C9A84C", paddingLeft: 10 }}>
                        <h3 className="font-bold text-[15px]" style={{ color: "#0A1628" }}>{group.year} {group.showName}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.posts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => setDrawerPost(post)}
                            className="relative aspect-square overflow-hidden rounded-lg active:scale-[0.98] transition-transform"
                          >
                            {post.image && post.image !== "/placeholder.svg" ? (
                              <img src={post.image} alt={post.win_placing} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}>
                                <span className="text-2xl font-black text-white/30">{group.showName.charAt(0)}</span>
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#C9A84C" }}>{post.win_placing}</p>
                              <p className="text-[8px] text-white/70 truncate">{post.show_name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Show selector bottom sheet */}
      {showSelectorOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowSelectorOpen(false)}>
          <div className="bg-white rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-[16px] text-[#0A1628]">Filter by Show</h3>
              <button onClick={() => setShowSelectorOpen(false)} className="text-[#6B7280] text-sm">Done</button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 py-2">
              <button
                onClick={() => { setSelectedShow(null); setShowSelectorOpen(false); }}
                className="w-full flex items-center justify-between py-3 border-b border-[#F3F4F6]"
              >
                <span className="text-[14px] font-semibold text-[#0A1628]">All Shows</span>
                {!selectedShow && <span style={{ color: "#C9A84C" }}>✓</span>}
              </button>
              {allShowNames.map(([name, count]) => (
                <button
                  key={name}
                  onClick={() => { setSelectedShow(name); setShowSelectorOpen(false); }}
                  className="w-full flex items-center justify-between py-3 border-b border-[#F3F4F6]"
                >
                  <span className="text-[14px] text-[#0A1628]">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#6B7280]">{count} winners</span>
                    {selectedShow === name && <span style={{ color: "#C9A84C" }}>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {drawerPost && (
        <WinnerDetailDrawer
          post={drawerPost as any}
          open={!!drawerPost}
          onClose={() => setDrawerPost(null)}
        />
      )}

      <Link
        to="/submit"
        aria-label="Post a Win"
        className="fixed z-40 flex items-center justify-center rounded-full active:scale-95 transition-transform"
        style={{
          width: 56, height: 56,
          right: 16, bottom: 80,
          backgroundColor: "#C9A84C",
          color: "#0A1628",
          boxShadow: "0 8px 20px rgba(201,168,76,0.4)"
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </Link>
    </Layout>
  );
}
