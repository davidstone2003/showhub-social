import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  ChevronDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { SpeciesPills, matchesSpecies, type SpeciesPill } from "@/components/SpeciesPills";
import { SCO_RECENT_SALES } from "@/data/scoRecentSales";

/* ── Upcoming sales ── */
interface UpcomingSale {
  id: string;
  name: string;
  date: string;
  location: string;
  host: string;
  link?: string;
  species?: Exclude<SpeciesPill, "All">;
}
const fallbackUpcomingSales: UpcomingSale[] = [
  // Sheep
  { id: "u-s1", name: "The Exposure Summer Lamb Sale", date: "June 14, 2026", location: "Harrisonburg, VA", host: "The Exposure", species: "Sheep" },
  { id: "u-s2", name: "Midwest Elite Lamb Sale", date: "July 9, 2026", location: "Des Moines, IA", host: "Midwest Showstock", species: "Sheep" },
  { id: "u-s3", name: "Stone Show Stock Online Ewe Sale", date: "August 12, 2026", location: "Online", host: "Stone Show Stock", species: "Sheep" },
  // Goats
  { id: "u-g1", name: "SC Online Summer Goat Classic", date: "June 18, 2026", location: "Online", host: "SC Online Sales", species: "Goats" },
  { id: "u-g2", name: "Texas Elite Doe Sale", date: "July 22, 2026", location: "Fort Worth, TX", host: "Lone Star Goats", species: "Goats" },
  { id: "u-g3", name: "Boer Showcase Online", date: "August 5, 2026", location: "Online", host: "Premier Boer", species: "Goats" },
  // Cattle
  { id: "u-c1", name: "Southern Cattle Showcase", date: "August 2, 2026", location: "Athens, GA", host: "Southern Cattle Co.", species: "Cattle" },
  { id: "u-c2", name: "Heifer Heaven Online Sale", date: "September 10, 2026", location: "Online", host: "Hill Country Cattle", species: "Cattle" },
  { id: "u-c3", name: "Steer Power Fall Classic", date: "October 4, 2026", location: "Oklahoma City, OK", host: "Power Genetics", species: "Cattle" },
  // Pigs
  { id: "u-p1", name: "Midwest Barrow & Gilt Sale", date: "June 28, 2026", location: "Springfield, IL", host: "Midwest Swine", species: "Pigs" },
  { id: "u-p2", name: "Showpig Showcase Online", date: "July 30, 2026", location: "Online", host: "Showpig.com", species: "Pigs" },
  { id: "u-p3", name: "Elite Hog Classic", date: "August 19, 2026", location: "Indianapolis, IN", host: "Elite Swine Genetics", species: "Pigs" },
];

/* ── Sale results ── */
interface TopSeller {
  lot: string;
  price: string;
  sire?: string;
  breeder: string;
  photo?: string;
}
interface SireStat {
  sire: string;
  head: number;
  avgPrice: number; // numeric for sorting
}
interface SaleResult {
  id: string;
  saleName: string;
  date: string;
  location: string;
  totalHead: number;
  averagePrice: string;
  topSellers: TopSeller[];
  sireBreakdown: SireStat[];
  species?: Exclude<SpeciesPill, "All">;
  link?: string;
  photo?: string;
}

const saleResults: SaleResult[] = [
  {
    id: "sco-spring",
    saleName: "SC Online Spring Classic",
    date: "April 12, 2026",
    location: "Online",
    totalHead: 64,
    averagePrice: "$3,275",
    topSellers: [
      { lot: "Lot 7", price: "$11,500", sire: "Thank Me Later", breeder: "Stone Show Stock" },
      { lot: "Lot 22", price: "$8,800", sire: "Spectacle", breeder: "Pine Creek" },
      { lot: "Lot 41", price: "$7,400", sire: "Monopoly", breeder: "H&T Showstock" },
    ],
    sireBreakdown: [
      { sire: "Thank Me Later", head: 4, avgPrice: 8750 },
      { sire: "Spectacle", head: 3, avgPrice: 6200 },
      { sire: "Tres Amigos", head: 2, avgPrice: 4500 },
      { sire: "Monopoly", head: 5, avgPrice: 4100 },
      { sire: "Heatwave", head: 3, avgPrice: 3300 },
      { sire: "Solo Cup", head: 1, avgPrice: 2900 }, // excluded (min 2)
      { sire: "No Sire Listed", head: 8, avgPrice: 2100 },
    ],
  },
  {
    id: "exposure-sale",
    saleName: "The Exposure Lamb & Goat Sale",
    date: "March 21, 2026",
    location: "Harrisonburg, VA",
    totalHead: 142,
    averagePrice: "$2,850",
    topSellers: [
      { lot: "Lot 105", price: "$4,750", breeder: "Stone Show Stock" },
      { lot: "Lot 118", price: "$3,100", breeder: "Beatty" },
      { lot: "Lot 140", price: "$2,400", breeder: "H&T Showstock" },
    ],
    sireBreakdown: [
      { sire: "Big League", head: 6, avgPrice: 4200 },
      { sire: "Spectacle", head: 9, avgPrice: 3450 },
      { sire: "Black Ice", head: 4, avgPrice: 3100 },
      { sire: "Lightning", head: 7, avgPrice: 2800 },
      { sire: "Hot Sauce", head: 5, avgPrice: 2400 },
      { sire: "No Sire Listed", head: 18, avgPrice: 1850 },
    ],
  },
  {
    id: "brand-sale",
    saleName: "The Brand Sale",
    date: "Feb. 8, 2026",
    location: "Webster City, IA",
    totalHead: 58,
    averagePrice: "$6,420",
    topSellers: [
      { lot: "Lot 1", price: "$16,000", breeder: "Warnjtes" },
      { lot: "Lot 12", price: "$9,750", breeder: "Hild Bros." },
      { lot: "Lot 24", price: "$5,200", breeder: "Silver Smith" },
    ],
    sireBreakdown: [
      { sire: "Walk The Line", head: 3, avgPrice: 12500 },
      { sire: "Cash Money", head: 5, avgPrice: 9800 },
      { sire: "Heatwave", head: 4, avgPrice: 7400 },
      { sire: "Monopoly", head: 6, avgPrice: 5600 },
      { sire: "No Sire Listed", head: 4, avgPrice: 3200 },
    ],
  },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const formatMoney = (n: number) =>
  `$${n.toLocaleString("en-US")}`;

function getSireTable(sale: SaleResult) {
  const eligible = sale.sireBreakdown.filter((s) => s.head >= 2);
  const noListing = eligible.filter((s) => s.sire.toLowerCase() === "no sire listed");
  const named = eligible
    .filter((s) => s.sire.toLowerCase() !== "no sire listed")
    .sort((a, b) => b.avgPrice - a.avgPrice);
  return [...named, ...noListing];
}

function getTopSire(sale: SaleResult): SireStat | null {
  const named = sale.sireBreakdown
    .filter((s) => s.head >= 2 && s.sire.toLowerCase() !== "no sire listed")
    .sort((a, b) => b.avgPrice - a.avgPrice);
  return named[0] ?? null;
}

type SourceStatus = {
  source: string;
  last_success_at: string | null;
  last_attempt_at: string | null;
  last_error: string | null;
};

function parseDate(s: string | null | undefined): number {
  if (!s) return Number.POSITIVE_INFINITY;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

function freshnessLabel(status: SourceStatus | undefined): string {
  if (!status?.last_success_at) return "Results update daily at 6:00 AM CT";
  const last = new Date(status.last_success_at);
  const now = new Date();
  const sameDay =
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate();
  if (sameDay) return `Updated today at ${last.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} CT`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    last.getFullYear() === yesterday.getFullYear() &&
    last.getMonth() === yesterday.getMonth() &&
    last.getDate() === yesterday.getDate();
  if (isYesterday) return "Last updated yesterday · Daily refresh at 6:00 AM CT";
  return `Last updated ${last.toLocaleDateString()} · Daily refresh at 6:00 AM CT`;
}

export default function SalesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [detail, setDetail] = useState<{ sale: SaleResult; seller: TopSeller } | null>(null);
  const [scrapedResults, setScrapedResults] = useState<SaleResult[]>([]);
  const [scrapedUpcoming, setScrapedUpcoming] = useState<UpcomingSale[]>([]);
  const [sourceStatus, setSourceStatus] = useState<Record<string, SourceStatus>>({});
  const [species, setSpecies] = useState<SpeciesPill>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [resultsRes, upcomingRes, statusRes] = await Promise.all([
        supabase
          .from("scraped_results")
          .select("*")
          .order("scraped_at", { ascending: false })
          .limit(30),
        supabase
          .from("scraped_upcoming")
          .select("*")
          .limit(100),
        supabase.from("scrape_source_status").select("*"),
      ]);
      if (cancelled) return;

      if (resultsRes.data) {
        const mapped: SaleResult[] = resultsRes.data.map((r: any) => ({
          id: `cd-${r.id}`,
          saleName: r.sale_name || "Sale",
          date: r.sale_date || "—",
          location: r.location || (r.managed_by ? `Managed by ${r.managed_by}` : "—"),
          totalHead: 0,
          averagePrice: "—",
          topSellers: (Array.isArray(r.top_lots) ? r.top_lots : []).map((l: any) => ({
            lot: l.lot,
            price: l.price,
            breeder: l.breeder,
            photo: l.photo,
          })),
          sireBreakdown: [],
        }));
        setScrapedResults(mapped);
      }

      if (upcomingRes.data) {
        // Dedupe by normalized name+date across sources
        const seen = new Map<string, UpcomingSale>();
        for (const r of upcomingRes.data as any[]) {
          const key = `${(r.sale_name || "").toLowerCase().trim()}|${(r.sale_date || "").toLowerCase().trim()}`;
          if (seen.has(key)) continue;
          seen.set(key, {
            id: `up-${r.id}`,
            name: r.sale_name || "Sale",
            date: r.sale_date || "TBA",
            location: r.location || (r.source === "sc-online" ? "Online" : "—"),
            host: r.seller || (r.source === "sc-online" ? "SC Online Sales" : "wlivestock"),
            link: r.link || undefined,
          });
        }
        const list = Array.from(seen.values()).sort(
          (a, b) => parseDate(a.date) - parseDate(b.date),
        );
        setScrapedUpcoming(list);
      }

      if (statusRes.data) {
        const map: Record<string, SourceStatus> = {};
        for (const s of statusRes.data as SourceStatus[]) map[s.source] = s;
        setSourceStatus(map);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scoAsResults: SaleResult[] = SCO_RECENT_SALES.map((s) => ({
    id: s.id,
    saleName: s.name,
    date: s.date,
    location: s.location,
    totalHead: 0,
    averagePrice: "—",
    topSellers: [],
    sireBreakdown: [],
    species: s.species,
    link: s.link,
    photo: s.photo,
  }));
  const allResultsRaw = [...scrapedResults, ...scoAsResults, ...saleResults];
  const allResults = allResultsRaw.filter((r) =>
    r.species
      ? species === "All" || r.species === species
      : matchesSpecies(
          species,
          r.saleName,
          r.location,
          ...r.topSellers.flatMap((t) => [t.lot, t.breeder, t.sire ?? null]),
          ...r.sireBreakdown.map((s) => s.sire),
        ),
  );
  const upcomingFiltered = (list: UpcomingSale[]) =>
    list.filter((s) =>
      s.species
        ? species === "All" || s.species === species
        : matchesSpecies(species, s.name, s.location, s.host),
    );

  // Upcoming list: prefer live-scraped, fall back to mock if a scrape never ran
  const scoStatus = sourceStatus["sc-online"];
  const wlStatus = sourceStatus["wlivestock"];
  const upcomingList: UpcomingSale[] = scrapedUpcoming.length > 0 ? scrapedUpcoming : fallbackUpcomingSales;
  const upcomingFreshness =
    !scoStatus?.last_success_at && !wlStatus?.last_success_at
      ? "Results update daily at 6:00 AM CT"
      : [
          scoStatus?.last_success_at ? freshnessLabel(scoStatus).replace("Updated", "SCO updated").replace("Last updated", "SCO last updated") : "SCO refreshes daily 6:00 AM CT",
          wlStatus?.last_success_at ? freshnessLabel(wlStatus).replace("Updated", "wlivestock updated").replace("Last updated", "wlivestock last updated") : "wlivestock refreshes daily 6:00 AM CT",
        ].join(" · ");

  const cdStatus = sourceStatus["champion-drive"];
  const resultsFreshness = freshnessLabel(cdStatus);


  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24" style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 flex items-center justify-between"
          style={{ height: 60, backgroundColor: "#0A1628", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-[22px] font-bold leading-none" style={{ color: "#FFFFFF" }}>Sales</h1>
          <button className="p-1.5 rounded-lg transition-colors">
            <Search className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>

        {/* Species pills */}
        <div className="px-4 pt-3">
          <SpeciesPills value={species} onChange={setSpecies} appMode />
        </div>

        {/* ─── 1. UPCOMING SALES ─── */}
        <div className="px-4 pt-6">
          <h2 className="text-[15px] font-bold text-foreground">Upcoming Sales</h2>
          <p className="text-[11px] text-muted-foreground mb-3">{upcomingFreshness}</p>
          <div className="space-y-2">
            {upcomingFiltered(upcomingList).map((s) => {
              const card = (
                <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-foreground truncate">{s.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.date}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{s.location}</span>
                    </div>
                  </div>
                  <button
                    className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
                    style={
                      s.link
                        ? { backgroundColor: "#0A1628", color: "#FFFFFF" }
                        : { backgroundColor: "#C9A84C", color: "#0A1628" }
                    }
                  >
                    {s.link ? "View" : "Remind"}
                  </button>
                </div>
              );
              return s.link ? (
                <a key={s.id} href={s.link} target="_blank" rel="noopener noreferrer" className="block">
                  {card}
                </a>
              ) : (
                <div key={s.id}>{card}</div>
              );
            })}
          </div>
        </div>

        {/* ─── 2. SALE RESULTS ─── */}
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h2 className="text-[15px] font-bold text-foreground">Sale Results</h2>
            <div className="flex items-center gap-2">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-muted/50 transition-colors">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filter
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl">
                  <SheetTitle>Filter & Sort</SheetTitle>
                  <SheetDescription>Refine sale results by sale, year, or price.</SheetDescription>
                  <div className="mt-4 space-y-4">
                    <FilterSection label="Sale" options={["All Sales", "SC Online", "The Exposure", "The Brand Sale"]} />
                    <FilterSection label="Year" options={["2026", "2025", "2024"]} />
                    <FilterSection label="Sort by" options={["Most Recent", "Highest Avg", "Most Head"]} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">{resultsFreshness}</p>

          <div className="space-y-3">
            {allResults.map((sale) => (
              <SaleResultCard
                key={sale.id}
                sale={sale}
                onSellerClick={(seller) => setDetail({ sale, seller })}
              />
            ))}
          </div>
        </div>



        {/* Top seller detail sheet */}
        <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            {detail && (
              <>
                <SheetTitle>{detail.seller.lot}</SheetTitle>
                <SheetDescription>{detail.sale.saleName} · {detail.sale.date}</SheetDescription>
                <div className="mt-4 space-y-3">
                  {detail.seller.photo ? (
                    <img src={detail.seller.photo} alt={detail.seller.lot} className="w-full aspect-[4/3] object-cover rounded-xl" />
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      No photo
                    </div>
                  )}
                  <DetailRow label="Price" value={detail.seller.price} accent />
                  {detail.seller.sire && <DetailRow label="Sire" value={detail.seller.sire} />}
                  <DetailRow label="Breeder" value={detail.seller.breeder} />
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}

function SaleResultCard({ sale, onSellerClick }: { sale: SaleResult; onSellerClick: (s: TopSeller) => void }) {
  const [sireOpen, setSireOpen] = useState(false);
  const sireTable = getSireTable(sale);
  const topSire = getTopSire(sale);
  const sireCount = sireTable.filter((s) => s.sire.toLowerCase() !== "no sire listed").length;

  const hasResults = sale.topSellers.length > 0 || sale.sireBreakdown.length > 0;

  return (
    <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      {sale.photo && (
        <a
          href={sale.link ?? "#"}
          target={sale.link ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="block bg-muted"
        >
          <img
            src={sale.photo}
            alt={sale.saleName}
            loading="lazy"
            className="w-full aspect-[16/9] object-cover"
          />
        </a>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[16px] font-bold text-foreground leading-snug">{sale.saleName}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{sale.date} · {sale.location}</p>
        </div>
        {sale.link && (
          <a
            href={sale.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
            style={{ backgroundColor: "#0A1628", color: "#FFFFFF" }}
          >
            View
          </a>
        )}
      </div>

      {hasResults && (
        <>
          {/* Stats: Head / Avg / Top Sire */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Head Sold" value={String(sale.totalHead)} />
            <Stat label="Avg Price" value={sale.averagePrice} />
            <Stat label="Top Sire" value={topSire ? topSire.sire : "—"} small />
          </div>

          {/* Top Sellers */}
          {sale.topSellers.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Top Sellers</p>
              <div className="flex gap-3 overflow-x-auto -mx-1 px-1 pb-1 snap-x snap-mandatory">
                {sale.topSellers.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onSellerClick(s)}
                    className="snap-start shrink-0 w-[140px] text-left rounded-lg border border-border bg-background overflow-hidden active:scale-[0.98] transition-transform"
                  >
                    {s.photo ? (
                      <img src={s.photo} alt={s.lot} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center text-[11px] text-muted-foreground">
                        No photo
                      </div>
                    )}
                    <div className="p-2">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-[11px] font-bold text-muted-foreground">{s.lot}</span>
                        <span className="text-[13px] font-bold text-[hsl(var(--gold))] tabular-nums">{s.price}</span>
                      </div>
                      {s.sire && <p className="text-[11px] text-foreground mt-1 truncate">{s.sire}</p>}
                      <p className="text-[10px] text-muted-foreground truncate">{s.breeder}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* By Sire (collapsible) */}
      {sireTable.length > 0 && (
        <div className="mt-4 border-t border-[hsl(var(--divider-soft))] pt-3">
          <button
            onClick={() => setSireOpen((v) => !v)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">By Sire</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${sireOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sireOpen && (
            <div className="mt-3">
              <p className="text-[11px] text-muted-foreground mb-2">{sireCount} sires represented</p>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Sire</span>
                  <span className="text-center w-10">Head</span>
                  <span className="text-right w-16">Avg</span>
                </div>
                {sireTable.map((s, i) => {
                  const isNoListing = s.sire.toLowerCase() === "no sire listed";
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2.5 items-center ${
                        i !== sireTable.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
                      }`}
                    >
                      {isNoListing ? (
                        <span className="text-[13px] font-semibold text-muted-foreground italic">{s.sire}</span>
                      ) : (
                        <Link
                          to={`/sires/${slugify(s.sire)}`}
                          className="text-[13px] font-bold text-foreground hover:text-[hsl(var(--gold))] truncate"
                        >
                          {s.sire}
                        </Link>
                      )}
                      <span className="text-[13px] text-foreground text-center w-10 tabular-nums">{s.head}</span>
                      <span className="text-[13px] font-bold text-[hsl(var(--gold))] text-right w-16 tabular-nums">
                        {formatMoney(s.avgPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p
        className={`font-bold text-[hsl(var(--gold))] mt-0.5 tabular-nums leading-tight truncate ${
          small ? "text-[14px]" : "text-[22px]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--divider-soft))]">
      <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-[14px] font-bold tabular-nums ${accent ? "text-[hsl(var(--gold))]" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function FilterSection({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button
            key={o}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              i === 0
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
