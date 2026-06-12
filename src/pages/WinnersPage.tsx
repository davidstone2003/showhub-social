import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Search, Trophy, Plus } from "lucide-react";
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

  const [section, setSection] = useState<"current" | "archive">("current");
  const currentYear = new Date().getFullYear();
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Levels");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedBreeder, setSelectedBreeder] = useState<string>("All Breeders");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
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
    const ys = [...new Set(rows.filter(r => r.date).map(r => new Date(r.date).getFullYear()))];
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

  const closeFilterMenus = () => {
    setCategoryOpen(false);
    setYearOpen(false);
    setStateOpen(false);
    setBreederOpen(false);
  };

  const activeFilterPanel = categoryOpen ? "category" : yearOpen ? "year" : stateOpen ? "state" : breederOpen ? "breeder" : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("[data-filter-row]")) return;
      if (t && t.closest("[data-filter-panel]")) return;
      setCategoryOpen(false); setYearOpen(false); setStateOpen(false); setBreederOpen(false);
    };
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
      filteredRows = filteredRows.filter(r => r.date && new Date(r.date).getFullYear() === selectedYear);
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
  }, [rows, profilesMap, breederProfilesMap, species, selectedYear, selectedShow, searchQuery, selectedCategory, selectedState, selectedBreeder]);

  const currentSeasonGroups = useMemo(() => {
    return showGroups.filter(g => g.year >= currentYear);
  }, [showGroups, currentYear]);

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
                <button onClick={() => setSearchOpen(true)} className="p-1.5">
                  <Search className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Section tabs */}
        <div className="bg-white border-b border-[#E5E7EB] flex sticky top-[60px] z-20">
          <button
            onClick={() => setSection("current")}
            className="flex-1 py-3 text-[14px] font-bold border-b-2 transition-colors"
            style={section === "current"
              ? { borderColor: "#C9A84C", color: "#0A1628" }
              : { borderColor: "transparent", color: "#9CA3AF" }
            }
          >
            🏆 Current Season
          </button>
          <button
            onClick={() => setSection("archive")}
            className="flex-1 py-3 text-[14px] font-bold border-b-2 transition-colors"
            style={section === "archive"
              ? { borderColor: "#C9A84C", color: "#0A1628" }
              : { borderColor: "transparent", color: "#9CA3AF" }
            }
          >
            📋 All Results
          </button>
        </div>

        {/* Filter bar — sticky below dark header */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-[60px] z-10">
          <div className="px-4 pt-2 pb-1">
            <SpeciesPills value={species} onChange={setSpecies} />
          </div>
          <div className="relative">
          <div
            data-filter-row
            className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide"
          >
            {/* Show Level dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setCategoryOpen(v => !v); setYearOpen(false); setStateOpen(false); setBreederOpen(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold"
                style={selectedCategory !== "All Levels"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedCategory}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Year dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setYearOpen(v => !v); setStateOpen(false); setBreederOpen(false); setCategoryOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold"
                style={selectedYear
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedYear || "All Years"}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* State dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setStateOpen(v => !v); setCategoryOpen(false); setYearOpen(false); setBreederOpen(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold"
                style={selectedState !== "All States"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedState}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Breeder dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setBreederOpen(v => !v); setCategoryOpen(false); setYearOpen(false); setStateOpen(false); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold"
                style={selectedBreeder !== "All Breeders"
                  ? { backgroundColor: "#0A1628", color: "white", borderColor: "#0A1628" }
                  : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {selectedBreeder === "All Breeders" ? "Breeder" : selectedBreeder}
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {(selectedCategory !== "All Levels" || selectedState !== "All States" || selectedBreeder !== "All Breeders" || selectedYear || selectedShow || searchQuery) && (
              <button
                onClick={() => { setSelectedCategory("All Levels"); setSelectedState("All States"); setSelectedBreeder("All Breeders"); setSelectedYear(null); setSelectedShow(null); setSearchQuery(""); closeFilterMenus(); }}
                className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
                style={{ backgroundColor: "#FFF8E7", color: "#8B6914", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                Clear ×
              </button>
            )}
          </div>
            {/* right-edge fade to signal more filters */}
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8" style={{ background: "linear-gradient(to right, rgba(255,255,255,0), #FFFFFF)" }} />
          </div>
          {activeFilterPanel && (
            <div data-filter-panel className="px-4 pb-3">
              <div className="rounded-xl bg-white border border-[#E5E7EB] shadow-lg overflow-hidden max-h-[260px] overflow-y-auto">
                {activeFilterPanel === "category" && categoryOptions.map(cat => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat); closeFilterMenus(); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F7F4]"
                    style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <span className="text-[14px] font-medium text-[#0A1628]">{cat}</span>
                    {selectedCategory === cat && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
                {activeFilterPanel === "year" && (
                  <>
                    <button onClick={() => { setSelectedYear(null); closeFilterMenus(); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F7F4]"
                      style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <span className="text-[14px] font-medium text-[#0A1628]">All Years</span>
                      {!selectedYear && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    {years.map(y => (
                      <button key={y} onClick={() => { setSelectedYear(y); closeFilterMenus(); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F7F4]"
                        style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <span className="text-[14px] font-medium text-[#0A1628]">{y}</span>
                        {selectedYear === y && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </>
                )}
                {activeFilterPanel === "state" && availableStates.map(state => (
                  <button key={state} onClick={() => { setSelectedState(state); closeFilterMenus(); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F7F4]"
                    style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <span className="text-[14px] font-medium text-[#0A1628]">{state}</span>
                    {selectedState === state && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
                {activeFilterPanel === "breeder" && availableBreeders.map(name => (
                  <button key={name} onClick={() => { setSelectedBreeder(name); closeFilterMenus(); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F7F4]"
                    style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <span className="text-[14px] font-medium text-[#0A1628] truncate">{name}</span>
                    {selectedBreeder === name && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={2.5} className="shrink-0 ml-2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <div className="flex flex-col gap-3 px-4 pt-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-[#E5E7EB] animate-pulse" />
              ))}
            </div>
          ) : section === "current" ? (
            <div className="px-4 pt-3 pb-24 flex flex-col gap-6">
              {currentSeasonGroups.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Trophy className="w-12 h-12 mb-3" style={{ color: "#C9A84C" }} />
                  <p className="font-bold text-[18px]" style={{ color: "#0A1628" }}>No results yet this season</p>
                  <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>Post your wins to build the record</p>
                  <Link to="/submit"
                    className="mt-4 rounded-full px-5 py-2.5 font-bold text-[14px]"
                    style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
                    Post a Win
                  </Link>
                </div>
              ) : (
                currentSeasonGroups.map(group => (
                  <div key={group.showName + group.year}>
                    <div className="mb-3 pb-2 border-b-2 border-[#C9A84C]">
                      <h2 className="font-bold text-[17px]" style={{ color: "#0A1628" }}>{group.showName}</h2>
                      {!group.showName.includes(String(group.year)) && (
                        <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{group.year}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {group.rows.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setDrawerPost(winnerToPost(r, profilesMap, breederProfilesMap))}
                          className="rounded-xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm text-left active:scale-[0.98] transition-transform w-full"
                        >
                          <div className="w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                            {r.image_urls?.[0] ? (
                              <img
                                src={r.image_urls[0]}
                                alt={r.win_placing || ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}>
                                <span className="text-2xl font-black" style={{ color: "rgba(201,168,76,0.3)" }}>
                                  {group.showName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#C9A84C" }}>
                              {r.win_placing || "Winner"}
                            </p>
                            <p className="text-[13px] font-bold truncate mt-0.5" style={{ color: "#0A1628" }}>
                              {r.shown_by || "—"}
                            </p>
                            {r.bred_by && (
                              <p className="text-[11px] truncate mt-0.5" style={{ color: "#6B7280" }}>
                                {r.bred_by}
                              </p>
                            )}
                            {r.sired_by && (
                              <p className="text-[11px] truncate mt-0.5" style={{ color: "#C9A84C" }}>
                                {r.sired_by}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="px-4 pt-3 pb-24 flex flex-col gap-2">
              {showGroups.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="font-bold text-[17px]" style={{ color: "#0A1628" }}>No results found</p>
                  <button
                    onClick={() => { setSelectedCategory("All Levels"); setSelectedState("All States"); setSelectedBreeder("All Breeders"); setSelectedYear(null); setSearchQuery(""); }}
                    className="mt-4 rounded-full px-5 py-2 font-bold text-[14px]"
                    style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                showGroups.map(group => (
                  <ShowGroupRow
                    key={group.showName + group.year}
                    group={group}
                    profilesMap={profilesMap}
                    breederProfilesMap={breederProfilesMap}
                    onSelectPost={setDrawerPost}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>



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

function ShowGroupRow({ group, onSelectPost, profilesMap, breederProfilesMap }: {
  group: { showName: string; year: number; rows: WinnerRow[] };
  onSelectPost: (post: Post) => void;
  profilesMap: Record<string, any>;
  breederProfilesMap: Record<string, any>;
}) {
  const [expanded, setExpanded] = useState(false);
  const topWinner = group.rows[0];

  return (
    <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#F3F4F6]">
          {topWinner?.image_urls?.[0] ? (
            <img src={topWinner.image_urls[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}>
              <span className="text-[10px] font-black text-white/30">
                {group.showName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] leading-snug text-[#0A1628] truncate">
            {group.showName}
          </p>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">
            {group.rows.length} winner{group.rows.length !== 1 ? "s" : ""}
            {!group.showName.includes(String(group.year)) ? ` · ${group.year}` : ""}
          </p>
          {topWinner?.win_placing && (
            <p className="text-[11px] font-bold mt-0.5 truncate" style={{ color: "#C9A84C" }}>
              {topWinner.win_placing}
              {topWinner.shown_by ? ` · ${topWinner.shown_by}` : ""}
            </p>
          )}
        </div>
        <svg
          width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}
          className="shrink-0 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-[#F3F4F6]">
          {group.rows.map((r, i) => (
            <button
              key={r.id}
              onClick={() => onSelectPost(winnerToPost(r, profilesMap, breederProfilesMap))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F7F4] transition-colors"
              style={{ borderBottom: i < group.rows.length - 1 ? "1px solid #F3F4F6" : "none" }}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#F3F4F6]">
                {r.image_urls?.[0] ? (
                  <img src={r.image_urls[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[11px] uppercase tracking-wider truncate" style={{ color: "#C9A84C" }}>
                  {r.win_placing || "Winner"}
                </p>
                <p className="font-semibold text-[13px] truncate text-[#0A1628] mt-0.5">
                  {r.shown_by || r.bred_by || "—"}
                </p>
                {r.sired_by && (
                  <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>
                    Sired by {r.sired_by}
                  </p>
                )}
              </div>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth={2} className="shrink-0">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
