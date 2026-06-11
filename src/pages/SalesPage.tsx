import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { SCOnlineSalesSection } from "@/components/sales/SCOnlineSalesSection";

/* ── mock live sale updates ── */
const liveSaleUpdates = [
  { id: "1", lot: "Lot 14", price: "$12,500", time: "1m ago", note: "Sold" },
  { id: "2", lot: "Lot 27", price: "—", time: "4m ago", note: "Bidding open" },
  { id: "3", lot: "Avg", price: "$4,850", time: "7m ago", note: "Running avg updated" },
  { id: "4", lot: "Lot 9", price: "$8,200", time: "12m ago", note: "Sold" },
];

interface LotEntry {
  lot: string;
  seller: string;
  price: string;
}
interface SaleResultBlock {
  id: string;
  saleName: string;
  date: string;
  location: string;
  lots: LotEntry[];
}

const mockSaleResults: SaleResultBlock[] = [
  {
    id: "exposure-sale",
    saleName: "The Exposure Lamb & Goat Sale",
    date: "March 21, 2026",
    location: "Harrisonburg, VA",
    lots: [
      { lot: "Lot 140", seller: "H&T Showstock", price: "$2,400" },
      { lot: "Lot 123", seller: "Pine Creek", price: "$2,300" },
      { lot: "Lot 118", seller: "Beatty", price: "$3,100" },
      { lot: "Lot 105", seller: "Stone Show Stock", price: "$4,750" },
      { lot: "Lot 99", seller: "Camp Creek", price: "$1,800" },
    ],
  },
  {
    id: "brand-sale",
    saleName: "The Brand Sale",
    date: "Feb. 8, 2026",
    location: "Webster City, IA",
    lots: [
      { lot: "Lot 1", seller: "Warnjtes", price: "$16,000" },
      { lot: "Lot 12", seller: "Hild Bros.", price: "$9,750" },
      { lot: "Lot 24", seller: "Silver Smith", price: "$5,200" },
      { lot: "Lot 30", seller: "Triple D", price: "$3,400" },
    ],
  },
];

function SaleBlock({ block }: { block: SaleResultBlock }) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[15px] font-bold text-foreground leading-snug">{block.saleName}</h3>
      <p className="text-[12px] text-muted-foreground mt-0.5">
        {block.date} · {block.location}
      </p>

      <div className="mt-3">
        {block.lots.map((l, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-2 ${
              i !== block.lots.length - 1 ? "border-b border-[hsl(var(--divider-soft))]" : ""
            }`}
          >
            <div className="flex items-baseline gap-2.5 min-w-0">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground shrink-0 w-12">{l.lot}</span>
              <span className="text-[13px] text-foreground truncate">{l.seller}</span>
            </div>
            <span className="text-[13px] font-bold text-[hsl(var(--gold))] shrink-0 ml-3 tabular-nums">{l.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Sales</h1>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ─── Section 1: LIVE ─── */}
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
                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--gold))]/15 flex items-center justify-center shrink-0">
                  <span className="text-[15px]">💰</span>
                </div>
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

          <button className="mt-3 text-[12px] font-semibold text-primary">
            View All Live Sale Updates →
          </button>
        </div>

        {/* ─── Section 2: Sale Results ─── */}
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
                  <FilterSection label="Sale" options={["All Sales", "The Exposure", "The Brand Sale"]} />
                  <FilterSection label="Year" options={["2026", "2025", "2024"]} />
                  <FilterSection label="Sort by" options={["Most Recent", "Highest Price", "Lot Number"]} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="space-y-3">
            {mockSaleResults.map((block) => (
              <SaleBlock key={block.id} block={block} />
            ))}
          </div>
        </div>

        <SCOnlineSalesSection />
      </div>
    </Layout>
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
