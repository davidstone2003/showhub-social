import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  ChevronDown,
  Download,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/* ── Upcoming sales ── */
interface UpcomingSale {
  id: string;
  name: string;
  date: string;
  location: string;
  host: string;
}
const upcomingSales: UpcomingSale[] = [
  { id: "u1", name: "SC Online Summer Classic", date: "June 18, 2026", location: "Online", host: "SC Online Sales" },
  { id: "u2", name: "Midwest Elite Sale", date: "July 9, 2026", location: "Des Moines, IA", host: "Midwest Showstock" },
  { id: "u3", name: "Southern Showcase", date: "August 2, 2026", location: "Athens, GA", host: "Southern Cattle Co." },
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

export default function SalesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [detail, setDetail] = useState<{ sale: SaleResult; seller: TopSeller } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<SaleResult[]>([]);

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-sale-results", {
        body: { url: importUrl.trim() },
      });
      if (error) throw error;
      if (!data || !Array.isArray(data.topSellers)) {
        throw new Error("No data extracted from that URL");
      }
      const newSale: SaleResult = {
        id: `imported-${Date.now()}`,
        saleName: data.saleName || "Imported Sale",
        date: data.date || "—",
        location: data.location || "—",
        totalHead: typeof data.totalHead === "number" ? data.totalHead : 0,
        averagePrice: data.averagePrice || "—",
        topSellers: data.topSellers,
        sireBreakdown: [],
      };
      setImported((prev) => [newSale, ...prev]);
      toast({ title: "Sale imported", description: `${newSale.topSellers.length} top sellers loaded` });
      setImportOpen(false);
      setImportUrl("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      toast({ title: "Import failed", description: msg, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const allResults = [...imported, ...saleResults];


  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Sales</h1>
          <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* ─── 1. UPCOMING SALES ─── */}
        <div className="px-4 pt-6">
          <h2 className="text-[15px] font-bold text-foreground mb-3">Upcoming Sales</h2>
          <div className="space-y-2">
            {upcomingSales.map((s) => (
              <div
                key={s.id}
                className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-3.5 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-foreground truncate">{s.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                  </div>
                </div>
                <button className="shrink-0 rounded-full bg-foreground text-background px-3 py-1.5 text-[12px] font-semibold">
                  Remind
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 2. SALE RESULTS ─── */}
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-[15px] font-bold text-foreground">Sale Results</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1.5 text-[12px] font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                Import URL
              </button>
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

        {/* Import from URL dialog */}
        <Dialog open={importOpen} onOpenChange={(o) => !importing && setImportOpen(o)}>
          <DialogContent className="max-w-md">
            <DialogTitle>Import Sale Results</DialogTitle>
            <DialogDescription>
              Paste a sale results page URL (e.g. SC Online Sales). We'll pull the top sellers with photos automatically.
            </DialogDescription>
            <div className="mt-4 space-y-3">
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://www.sconlinesales.com/..."
                disabled={importing}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setImportOpen(false)} disabled={importing}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleImport} disabled={importing || !importUrl.trim()}>
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scraping…
                    </>
                  ) : (
                    "Import"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


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

  return (
    <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[16px] font-bold text-foreground leading-snug">{sale.saleName}</h3>
      <p className="text-[12px] text-muted-foreground mt-0.5">{sale.date} · {sale.location}</p>

      {/* Stats: Head / Avg / Top Sire */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Head Sold" value={String(sale.totalHead)} />
        <Stat label="Avg Price" value={sale.averagePrice} />
        <Stat label="Top Sire" value={topSire ? topSire.sire : "—"} small />
      </div>

      {/* Top Sellers */}
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
