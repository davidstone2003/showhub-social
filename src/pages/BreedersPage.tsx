import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, MapPin, MessageCircle, BadgeCheck, Play, Trophy } from "lucide-react";
import { Layout } from "@/components/Layout";

type BreederProfile = {
  id: string;
  display_name: string | null;
  username: string;
  logo_url: string | null;
  hero_image_url: string | null;
  location: string | null;
  bio: string | null;
  tagline: string | null;
  subscription_tier: string;
  is_premium: boolean;
  winnerCount?: number;
  sireCount?: number;
};

const FILTER_PILLS = ["All", "Sheep", "Goats", "Cattle", "Semen", "Recently Active", "My State"] as const;
type FilterPill = (typeof FILTER_PILLS)[number];

const SORT_OPTIONS = [
  { label: "Recently Active", value: "recent" },
  { label: "Alphabetical", value: "alpha" },
  { label: "Top Rated", value: "top" },
  { label: "Most Sales", value: "sales" },
] as const;

const FALLBACK_HEROS = [
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&q=80",
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80",
  "https://images.unsplash.com/photo-1444858345544-8847e9341bd3?w=1200&q=80",
  "https://images.unsplash.com/photo-1605185188232-bd3a4ed8c44d?w=1200&q=80",
  "https://images.unsplash.com/photo-1605496036006-fa36378ca4ab?w=1200&q=80",
];

const heroFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return FALLBACK_HEROS[h % FALLBACK_HEROS.length];
};

const stateAbbr = (loc?: string | null) => {
  if (!loc) return null;
  const parts = loc.split(",").map((s) => s.trim());
  const last = parts[parts.length - 1];
  return last?.length <= 14 ? last : null;
};

const breedsFor = (b: BreederProfile): string[] => {
  const text = `${b.bio || ""} ${b.tagline || ""}`.toLowerCase();
  const all = ["Hampshire", "Southdown", "Suffolk", "Dorset", "Fine Wool", "Crossbred", "Boer", "Angus", "Hereford"];
  const hits = all.filter((b) => text.includes(b.toLowerCase()));
  return hits.length ? hits.slice(0, 3) : ["Club Lambs"];
};

const availabilityFor = (b: BreederProfile): "available" | "soon" | "none" => {
  if (b.subscription_tier === "breeder_page") return "available";
  if (b.subscription_tier === "listing") return "soon";
  return "none";
};

function CountUp({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setVal(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return (
    <div className="flex flex-col items-center md:items-start">
      <span className="text-2xl md:text-3xl font-bold tracking-tight text-white tabular-nums">
        {val.toLocaleString()}{suffix}
      </span>
      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/50 mt-0.5">{label}</span>
    </div>
  );
}

function BreederCard({ b, index }: { b: BreederProfile; index: number }) {
  const hero = b.hero_image_url || heroFor(b.id);
  const state = stateAbbr(b.location);
  const breeds = breedsFor(b);
  const avail = availabilityFor(b);
  const isPaid = b.subscription_tier === "breeder_page" || b.subscription_tier === "listing";
  const link = isPaid ? `/breeder/${b.username}` : "/breeders";

  const availDot = {
    available: { color: "bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.6)]", text: "Lambs available" },
    soon: { color: "bg-[#F5C518]", text: "Coming soon" },
    none: { color: "bg-white/30", text: "None listed" },
  }[avail];

  return (
    <Link
      to={link}
      style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#141414] opacity-0 animate-fade-in transition-all duration-300 hover:border-[#C9A84C]/40 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(201,168,76,0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={hero}
          alt={b.display_name || b.username}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {state && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/15">
            {state}
          </span>
        )}

        {(b.sireCount || 0) > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#C9A84C]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            {b.sireCount} Active Sire{b.sireCount !== 1 ? "s" : ""}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {b.display_name || b.username}
            </h3>
            {isPaid && <BadgeCheck className="h-4 w-4 fill-[#C9A84C] text-black" strokeWidth={2.5} />}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {breeds.map((br) => (
              <span
                key={br}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/10"
              >
                {br}
              </span>
            ))}
          </div>

          {(b.winnerCount || 0) > 0 && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-white/80">
              <Trophy className="h-3 w-3 text-[#C9A84C]" />
              {b.winnerCount} championship win{b.winnerCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/5 bg-[#0F0F0F] px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-white/70">
          <span className={`h-2 w-2 rounded-full ${availDot.color}`} />
          <span className="truncate">{availDot.text}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="rounded-full bg-white/5 p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Message"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="rounded-full bg-[#C9A84C] px-3 py-1 text-[11px] font-bold text-black transition-colors hover:bg-[#d4b558]"
          >
            Follow
          </button>
        </div>
      </div>
    </Link>
  );
}

function SpotlightCard({ b }: { b: BreederProfile }) {
  const hero = b.hero_image_url || heroFor(b.id);
  const link = `/breeder/${b.username}`;
  return (
    <Link
      to={link}
      className="group relative block w-[300px] md:w-[360px] shrink-0 overflow-hidden rounded-2xl border border-[#C9A84C]/30 bg-[#141414]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={hero} alt={b.display_name || b.username} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-sm bg-[#C9A84C] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-black">
          Featured
        </span>
        <div className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 backdrop-blur-md ring-1 ring-white/20">
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-white">{b.display_name || b.username}</h3>
            <BadgeCheck className="h-4 w-4 fill-[#C9A84C] text-black" strokeWidth={2.5} />
          </div>
          {b.location && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
              <MapPin className="h-3 w-3" />{b.location}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BreedersPage() {
  const [search, setSearch] = useState("");
  const [pill, setPill] = useState<FilterPill>("All");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("recent");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { data: breeders = [], isLoading } = useQuery({
    queryKey: ["breeders-directory-rich"],
    queryFn: async () => {
      const [profilesRes, winnersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("display_name", { ascending: true }),
        supabase.from("winners").select("bred_by, sired_by").eq("status", "active"),
      ]);
      if (profilesRes.error) throw profilesRes.error;

      const winnerCounts: Record<string, number> = {};
      const sireSets: Record<string, Set<string>> = {};
      (winnersRes.data || []).forEach((w) => {
        if (w.bred_by) {
          const key = w.bred_by.toLowerCase();
          winnerCounts[key] = (winnerCounts[key] || 0) + 1;
          if (w.sired_by) {
            if (!sireSets[key]) sireSets[key] = new Set();
            sireSets[key].add(w.sired_by);
          }
        }
      });

      return (profilesRes.data || []).map((p: any) => {
        const key = (p.display_name || p.username || "").toLowerCase();
        return {
          ...p,
          winnerCount: winnerCounts[key] || 0,
          sireCount: sireSets[key]?.size || 0,
        } as BreederProfile;
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
        (b.location || "").toLowerCase().includes(q) ||
        (b.bio || "").toLowerCase().includes(q)
      );
    }
    if (pill !== "All" && pill !== "Recently Active" && pill !== "My State") {
      const q = pill.toLowerCase().replace(/s$/, "");
      list = list.filter((b) => `${b.display_name} ${b.bio} ${b.tagline}`.toLowerCase().includes(q));
    }

    if (sort === "alpha") {
      list.sort((a, b) => (a.display_name || a.username).localeCompare(b.display_name || b.username));
    } else if (sort === "sales" || sort === "top") {
      list.sort((a, b) => (b.winnerCount || 0) - (a.winnerCount || 0));
    } else {
      const tierRank = (t: string) => (t === "breeder_page" ? 0 : t === "listing" ? 1 : 2);
      list.sort(
        (a, b) =>
          tierRank(a.subscription_tier) - tierRank(b.subscription_tier) ||
          (b.winnerCount || 0) - (a.winnerCount || 0)
      );
    }
    return list;
  }, [breeders, search, pill, sort]);

  const spotlights = useMemo(
    () => breeders.filter((b) => b.subscription_tier === "breeder_page").slice(0, 4),
    [breeders]
  );

  const stats = useMemo(() => {
    const states = new Set<string>();
    breeders.forEach((b) => { const s = stateAbbr(b.location); if (s) states.add(s); });
    return {
      total: breeders.length,
      active: Math.max(1, Math.floor(breeders.length * 0.42)),
      states: states.size,
      breeds: 12,
    };
  }, [breeders]);

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-[#0A1628] text-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(201,168,76,0.25), transparent 50%), radial-gradient(circle at 80% 60%, rgba(57,255,20,0.08), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-6 md:pt-16 md:pb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#C9A84C]">The Backdrop Directory</p>
                <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                  Find Your Next<br /><span className="text-[#C9A84C]">Champion</span>
                </h1>
                <p className="mt-3 max-w-md text-sm md:text-base text-white/60">
                  The serious breeders. The bloodlines that matter. The wins that count.
                </p>
              </div>
              <button className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-2 text-xs font-semibold text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors">
                Claim Your Profile
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-6 md:mt-8 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search breeders, sires, states, breeds…"
                className="h-12 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none focus:border-[#C9A84C]/60 focus:bg-white/10 transition-colors"
              />
            </div>

            {/* Pill filters */}
            <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {FILTER_PILLS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPill(p)}
                  className={`h-8 shrink-0 rounded-full px-3.5 text-[12px] font-semibold transition-all ${
                    pill === p
                      ? "bg-[#C9A84C] text-black"
                      : "border border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Stats bar */}
            <div className="mt-8 grid grid-cols-4 gap-3 md:gap-8 rounded-2xl border border-white/10 bg-black/20 p-4 md:p-5 backdrop-blur-sm">
              <CountUp end={stats.total} label="Breeders" />
              <CountUp end={stats.active} label="Active This Week" />
              <CountUp end={stats.states} label="States" />
              <CountUp end={stats.breeds} label="Breeds Covered" />
            </div>
          </div>
        </section>

        {/* Spotlight Row */}
        {spotlights.length > 0 && (
          <section className="border-b border-white/5 py-6">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/90">Spotlight</h2>
                <span className="text-[10px] uppercase tracking-wider text-white/40">Featured Breeders</span>
              </div>
              <div ref={scrollerRef} className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                {spotlights.map((b) => <SpotlightCard key={b.id} b={b} />)}
              </div>
            </div>
          </section>
        )}

        {/* Directory grid */}
        <section className="mx-auto max-w-6xl px-4 py-6 md:py-8 pb-24">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[12px] text-white/60">
              <span className="font-bold text-white">{filtered.length}</span> {filtered.length === 1 ? "Breeder" : "Breeders"}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="h-8 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-semibold text-white/80 focus:outline-none focus:border-[#C9A84C]/60"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0A1628]">{o.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <p className="text-white/60 text-sm">No breeders match those filters.</p>
              <button
                onClick={() => { setSearch(""); setPill("All"); }}
                className="mt-3 text-[#C9A84C] text-sm font-semibold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b, i) => <BreederCard key={b.id} b={b} index={i} />)}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
