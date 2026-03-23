import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal, Bookmark, ChevronDown } from "lucide-react";

/* ── mock live sale updates ── */
const liveSaleUpdates = [
  { id: "1", text: "Lot 14 sold for $12,500", time: "1m ago" },
  { id: "2", text: "High seller so far", time: "4m ago" },
  { id: "3", text: "Average updated to $4,850", time: "7m ago" },
  { id: "4", text: "Bidding open on Lot 27", time: "10m ago" },
];

/* ── mock saved views ── */
const savedViews = ["All Sales", "My Views", "High Sellers", "Spring Sales", "Goose Progeny"];

/* ── mock sale results ── */
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
    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
      <h3 className="text-[15px] font-bold text-foreground leading-snug">{block.saleName}</h3>
      <p className="text-[12px] text-muted-foreground mt-0.5">
        {block.date} • {block.location}
      </p>

      <div className="mt-3 space-y-0">
        {block.lots.map((l, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-b-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[12px] font-semibold text-muted-foreground shrink-0">{l.lot}</span>
              <span className="text-[13px] text-foreground truncate">{l.seller}</span>
            </div>
            <span className="text-[13px] font-bold text-foreground shrink-0 ml-3">{l.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [activeView, setActiveView] = useState("All Sales");

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* ─── Header ─── */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Sales</h1>
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Search className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ─── Section 1: LIVE ─── */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              LIVE
            </span>
            <span className="text-[12px] text-muted-foreground">American Royal</span>
          </div>

          <div className="space-y-0">
            {liveSaleUpdates.map((u) => (
              <div
                key={u.id}
                className="flex items-start justify-between py-2 border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-[13px] mt-px">💰</span>
                  <p className="text-[13px] text-foreground leading-snug">{u.text}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 ml-3">{u.time}</span>
              </div>
            ))}
          </div>

          <button className="mt-2 mb-1 text-[12px] font-semibold text-primary">
            View All Live Sale Updates →
          </button>
        </div>

        {/* ─── Divider ─── */}
        <div className="h-2 bg-muted/30 mt-3" />

        {/* ─── Section 2: Sale Results ─── */}
        <div className="px-4 pt-4">
          <h2 className="text-[15px] font-bold text-foreground mb-3">Sale Results</h2>

          {/* Filters row */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <FilterChip label="Sale" />
            <FilterChip label="Year" />
            <FilterChip label="Price" />
            <button className="flex items-center gap-1 shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[12px] font-semibold text-primary">
              <Bookmark className="w-3 h-3" />
              Save View
            </button>
          </div>

          {/* Saved view pills */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {savedViews.map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  activeView === v
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Sale result blocks grouped by sale */}
          <div className="space-y-5">
            {mockSaleResults.map((block) => (
              <SaleBlock key={block.id} block={block} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 shrink-0 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
      {label}
      <ChevronDown className="w-3 h-3" />
    </button>
  );
}
