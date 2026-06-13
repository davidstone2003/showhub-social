import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Search, Trophy, CalendarClock } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import { useSpecies } from "@/contexts/SpeciesContext";
import { WinnerDetailDrawer } from "@/components/post/WinnerDetailDrawer";
import { FilterChipDropdown } from "@/components/FilterChipDropdown";
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
  date_assumed: boolean | null;
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

const SPECIES_OPTIONS: SpeciesPill[] = ["All", "Cattle", "Sheep", "Goats", "Pigs"];
const speciesLabel = (s: SpeciesPill) => (s === "All" ? "All Species" : s);


export default function WinnersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [breederProfilesMap, setBreederProfilesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { species } = useSpecies();

  const currentYear = new Date().getFullYear();
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Levels");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedBreeder, setSelectedBreeder] = useState<string>("All Breeders");
  const [selectedExhibitor, setSelectedExhibitor] = useState<string>("All Exhibitors");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [drawerPost, setDrawerPost] = useState<Post | null>(null);
  const [confirmingRow, setConfirmingRow] = useState<WinnerRow | null>(null);
  const [confirmDate, setConfirmDate] = useState("");

  const handleModerated = () => setRefreshKey((k) => k + 1);

  const handleConfirmDate = async () => {
    if (!confirmingRow || !confirmDate) return;
    const { error } = await (supabase.from("winners") as any)
      .update({ date: confirmDate, date_assumed: false })
      .eq("id", confirmingRow.id);
    if (error) { toast.error("Couldn't update date", { description: error.message }); return; }
    toast.success("Show date saved");
    setRows((prev) => prev.map((r) => r.id === confirmingRow.id ? { ...r, date: confirmDate, date_assumed: false } : r));
    setConfirmingRow(null);
    setConfirmDate("");
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("winners")
        .select("id, title, show_name, show_id, win_placing, shown_by, bred_by, placed_by, sired_by, sire_id, dam, image_urls, video_url, date, date_assumed, created_at, species, likes, comments, caption, tags, user_id, status, posted_as_breeder_id")
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
    const ys = [...new Set(rows.filter(r => r.date && !r.date_assumed).map(r => new Date(r.date).getFullYear()))];
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

  const availableExhibitors = useMemo(() => {
    const names = rows.map(r => r.shown_by).filter(Boolean) as string[];
    return ["All Exhibitors", ...Array.from(new Set(names)).sort()];
  }, [rows]);

  const categoryOptions = ["All Levels", "National / Major", "State Fair", "Jackpot", "County / Local"];

  const clearAllFilters = () => {
    setSelectedCategory("All Levels");
    setSelectedState("All States");
    setSelectedBreeder("All Breeders");
    setSelectedExhibitor("All Exhibitors");
    setSelectedYear(null);
    setSelectedShow(null);
    setSearchQuery("");
  };

  const activeFilterCount =
    (selectedCategory !== "All Levels" ? 1 : 0) +
    (selectedState !== "All States" ? 1 : 0) +
    (selectedBreeder !== "All Breeders" ? 1 : 0) +
    (selectedExhibitor !== "All Exhibitors" ? 1 : 0) +
    (selectedShow ? 1 : 0);



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
      filteredRows = filteredRows.filter(r => r.date && !r.date_assumed && new Date(r.date).getFullYear() === selectedYear);
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
    if (selectedExhibitor !== "All Exhibitors") {
      filteredRows = filteredRows.filter(r => r.shown_by === selectedExhibitor);
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
    const result: { showName: string; year: number | null; posts: Post[]; rows: WinnerRow[] }[] = [];
    for (const [, winners] of grouped) {
      const ref = winners[0];
      const datedRef = winners.find(w => w.date && !w.date_assumed);
      const year = datedRef?.date ? new Date(datedRef.date).getFullYear() : null;
      result.push({
        showName: ref.show_name,
        year,
        posts: winners.map((w) => winnerToPost(w, profilesMap, breederProfilesMap)),
        rows: winners,
      });
    }
    result.sort((a, b) => (b.year ?? -1) - (a.year ?? -1) || a.showName.localeCompare(b.showName));
    return result;
  }, [rows, profilesMap, breederProfilesMap, species, selectedYear, selectedShow, searchQuery, selectedCategory, selectedState, selectedBreeder, selectedExhibitor]);


  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Compact header */}
        <div
          className="sticky top-0 z-30 px-4 flex items-center justify-between bg-white"
          style={{ height: 48, borderBottom: "1px solid #E5E7EB" }}
        >
          {searchOpen ? (
            <div className="flex items-center gap-2 w-full">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search shows, breeders, exhibitors..."
                className="flex-1 bg-[#F3F4F6] rounded-lg px-3 py-1.5 text-sm text-[#0A1628] placeholder:text-[#9CA3AF] outline-none"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-[#6B7280] text-sm">Cancel</button>
            </div>
          ) : (
            <>
              <h1 className="text-[18px] font-bold leading-none" style={{ color: "#0A1628" }}>Winners</h1>
              <button onClick={() => setSearchOpen(true)} className="p-1.5" aria-label="Search">
                <Search className="w-5 h-5" style={{ color: "#6B7280" }} />
              </button>
            </>
          )}
        </div>


        {/* Filter chips — Row 1: Species + Year (always visible) */}
        <div className="bg-white border-b border-[#E5E7EB] sticky top-[48px] z-20 px-4 py-2 flex items-center gap-2">
          <FilterChipDropdown
            label="All Species"
            value={speciesLabel(species)}
            options={SPECIES_OPTIONS.map(speciesLabel)}
            defaultOption="All Species"
            onChange={(v) => {
              const found = SPECIES_OPTIONS.find((s) => speciesLabel(s) === v) ?? "All";
              setSpecies(found);
            }}
            align="start"
            width={200}
          />
          <FilterChipDropdown
            label="All Years"
            value={selectedYear === null ? "All Years" : String(selectedYear)}
            options={["All Years", ...years.map(String)]}
            defaultOption="All Years"
            onChange={(v) => setSelectedYear(v === "All Years" ? null : Number(v))}
            align="start"
            width={160}
          />
        </div>

        {/* Filter chips — Row 2: horizontal scroll on mobile */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <FilterChipDropdown
            label="Level"
            value={selectedCategory}
            options={categoryOptions}
            defaultOption="All Levels"
            onChange={setSelectedCategory}
            width={220}
          />
          <FilterChipDropdown
            label="State"
            value={selectedState}
            options={availableStates}
            defaultOption="All States"
            onChange={setSelectedState}
            width={180}
          />
          <FilterChipDropdown
            label="Breeder"
            value={selectedBreeder}
            options={availableBreeders}
            defaultOption="All Breeders"
            onChange={setSelectedBreeder}
            width={260}
          />
          <FilterChipDropdown
            label="Exhibitor"
            value={selectedExhibitor}
            options={availableExhibitors}
            defaultOption="All Exhibitors"
            onChange={setSelectedExhibitor}
            width={260}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="shrink-0 ml-1 text-[12px] font-bold whitespace-nowrap"
              style={{ color: "#C9A84C" }}
            >
              Clear all
            </button>
          )}
        </div>


        <div>
          {loading ? (
            <div className="flex flex-col gap-3 px-4 pt-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-[#E5E7EB] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="px-4 pt-3 pb-24 flex flex-col gap-2">
              {showGroups.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Trophy className="w-12 h-12 mb-3" style={{ color: "#C9A84C" }} />
                  <p className="font-bold text-[18px]" style={{ color: "#0A1628" }}>
                    {selectedYear ? `No results for ${selectedYear} yet` : "No results found"}
                  </p>
                  {user ? (
                    <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>
                      {activeFilterCount > 0 || selectedYear
                        ? "Try clearing filters or switching year"
                        : "Use Post Win above to add the first one"}
                    </p>
                  ) : (
                    <>
                      <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>Join free to post your wins and build the record</p>
                      <Link to="/auth?mode=signup"
                        className="mt-4 rounded-full px-5 py-2.5 font-bold text-[14px]"
                        style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
                        Post a Win
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                showGroups.map(group => (
                  <ShowGroupRow
                    key={group.showName + group.year}
                    group={group}
                    profilesMap={profilesMap}
                    breederProfilesMap={breederProfilesMap}
                    onSelectPost={setDrawerPost}
                    currentUserId={user?.id || null}
                    onConfirmDate={(r) => { setConfirmingRow(r); setConfirmDate(r.date || new Date().toISOString().slice(0,10)); }}
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

      <Sheet open={!!confirmingRow} onOpenChange={(o) => { if (!o) { setConfirmingRow(null); setConfirmDate(""); } }}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetTitle>Confirm show date</SheetTitle>
          <SheetDescription>
            We assumed a date for this result. Set the correct show date so it appears in the right season.
          </SheetDescription>
          <div className="mt-4 space-y-3 pb-4">
            <input
              type="date"
              value={confirmDate}
              onChange={(e) => setConfirmDate(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 text-[14px] text-[#0A1628]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmingRow(null); setConfirmDate(""); }}
                className="flex-1 h-11 rounded-xl border border-[#E5E7EB] text-[14px] font-bold text-[#0A1628]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDate}
                disabled={!confirmDate}
                className="flex-1 h-11 rounded-xl text-[14px] font-bold disabled:opacity-40"
                style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
              >
                Save date
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>


    </Layout>
  );
}

function ShowGroupRow({ group, onSelectPost, profilesMap, breederProfilesMap, currentUserId, onConfirmDate }: {
  group: { showName: string; year: number | null; rows: WinnerRow[] };
  onSelectPost: (post: Post) => void;
  profilesMap: Record<string, any>;
  breederProfilesMap: Record<string, any>;
  currentUserId: string | null;
  onConfirmDate: (r: WinnerRow) => void;
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
            {group.year !== null && !group.showName.includes(String(group.year)) ? ` · ${group.year}` : ""}
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
          {group.rows.map((r, i) => {
            const isOwner = !!currentUserId && r.user_id === currentUserId;
            return (
            <div
              key={r.id}
              style={{ borderBottom: i < group.rows.length - 1 ? "1px solid #F3F4F6" : "none" }}
            >
              <button
                onClick={() => onSelectPost(winnerToPost(r, profilesMap, breederProfilesMap))}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F7F4] transition-colors"
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
              {r.date_assumed && isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); onConfirmDate(r); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[12px] font-semibold border-t border-dashed border-[#E5E7EB]"
                  style={{ color: "#8B6914", backgroundColor: "#FFF8E7" }}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Confirm show date
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1 rounded-full pl-3 pr-1 h-7 text-[12px] font-semibold"
      style={{ backgroundColor: "#FFF8E7", color: "#8B6914", border: "1px solid rgba(201,168,76,0.35)" }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[rgba(201,168,76,0.18)]"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
