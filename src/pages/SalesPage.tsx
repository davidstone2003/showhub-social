import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal, Calendar, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

/* ── Live ticker ── */
type LiveStatus = "sold" | "bidding" | "avg";
const liveSaleUpdates: { id: string; lot: string; price: string; time: string; note: string; status: LiveStatus }[] = [
  { id: "1", lot: "Lot 14", price: "$12,500", time: "1m ago", note: "Sold", status: "sold" },
  { id: "2", lot: "Lot 27", price: "—", time: "4m ago", note: "Bidding open", status: "bidding" },
  { id: "3", lot: "Avg", price: "$4,850", time: "7m ago", note: "Running avg updated", status: "avg" },
  { id: "4", lot: "Lot 9", price: "$8,200", time: "12m ago", note: "Sold", status: "sold" },
];

const statusDot: Record<LiveStatus, string> = {
  sold: "bg-[hsl(var(--gold))]",
  bidding: "bg-blue-500",
  avg: "bg-muted-foreground",
};

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
interface SaleResult {
  id: string;
  saleName: string;
  date: string;
  location: string;
  totalHead: number;
  averagePrice: string;
  topSellers: TopSeller[];
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
  },
];

export default function SalesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [detail, setDetail] = useState<{ sale: SaleResult; seller: TopSeller } | null>(null);

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

        {/* ─── 1. LIVE ─── */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/20 px-2.5 py-1 text-[11px] font-bold text-destructive">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
              </span>
              LIVE
            </span>
            <span className="text-[12px] font-semibold text-foreground">American Royal</span>
          </div>

          <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
            {liveSaleUpdates.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-3.5 py-3 ${
                  i !== liveSaleUpdates.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
                }`}
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${statusDot[u.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-bold text-foreground">{u.lot}</span>
                    {u.price !== "—" && (
                      <span className="text-[13px] font-bold text-[hsl(var(--gold))] tabular-nums">{u.price}</span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">{u.note}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{u.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 2. UPCOMING SALES ─── */}
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

        {/* ─── 3. SALE RESULTS ─── */}
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-foreground">Sale Results</h2>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-muted/50 transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filter & Sort
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

          <div className="space-y-3">
            {saleResults.map((sale) => (
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
  return (
    <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[16px] font-bold text-foreground leading-snug">{sale.saleName}</h3>
      <p className="text-[12px] text-muted-foreground mt-0.5">{sale.date} · {sale.location}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Total Head Sold" value={String(sale.totalHead)} />
        <Stat label="Average Price" value={sale.averagePrice} />
      </div>

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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-[22px] font-bold text-[hsl(var(--gold))] mt-0.5 tabular-nums leading-none">{value}</p>
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
