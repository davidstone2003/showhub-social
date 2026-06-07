import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Construction, ShoppingBag, Wrench, Wheat, SprayCan, Plus, ChevronRight } from "lucide-react";

const categories = [
  {
    title: "Animals",
    description: "Sheep, goats, cattle, pigs — breeding stock & show animals",
    icon: ShoppingBag,
    color: "hsl(var(--gold))",
    bg: "rgba(201,168,76,0.15)",
  },
  {
    title: "Nutrition",
    description: "Feed, supplements, and nutritional products",
    icon: Wheat,
    color: "#3F9D5F",
    bg: "rgba(63,157,95,0.12)",
  },
  {
    title: "Show Supplies",
    description: "Equipment, grooming products, and show day essentials",
    icon: SprayCan,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
  },
  {
    title: "Services",
    description: "Hauling, photography, fitting, and professional services",
    icon: Wrench,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
  },
];

const recentListings = [
  { id: "1", title: "Hampshire Ram Lamb", price: "$1,800", meta: "IA · Posted 2d ago" },
  { id: "2", title: "Show Feed — 50lb", price: "$42", meta: "OH · Posted 3d ago" },
  { id: "3", title: "Hauling — Midwest", price: "Quote", meta: "KS · Service" },
  { id: "4", title: "Boer Doe Kid", price: "$950", meta: "TX · Posted 5d ago" },
];

export const MarketPage = () => (
  <Layout showDiscovery={false}>
    <div className="mx-auto max-w-2xl pb-24 relative">
      {/* Hero */}
      <div
        className="px-5 pt-8 pb-7 mx-3 mt-3 rounded-2xl shadow-[var(--shadow-card)]"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark)) 60%, #0A1628 100%)",
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--gold))] font-bold">The Market</p>
        <h1 className="mt-1.5 text-2xl font-bold text-white leading-tight">
          Buy. Sell. <span className="text-[hsl(var(--gold))]">Connect.</span>
        </h1>
        <p className="mt-1.5 text-[13px] text-white/70 max-w-xs">
          Animals, supplies, and services from breeders you trust.
        </p>
      </div>

      {/* Categories */}
      <div className="px-3 pt-5">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-foreground mb-2.5 px-1">
          Browse Categories
        </h2>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.title}
              className="w-full flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] text-left active:bg-muted/40 transition-colors"
            >
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: cat.bg, color: cat.color }}
              >
                <cat.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{cat.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{cat.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 mt-1 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Recently Listed */}
      <div className="pt-6 px-3">
        <div className="flex items-baseline justify-between mb-2.5 px-1">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-foreground">Recently Listed</h2>
          <button className="text-[11px] font-semibold text-primary">See all →</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1">
          {recentListings.map((l) => (
            <div
              key={l.id}
              className="shrink-0 w-[160px] rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
            >
              <div className="w-full aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-[13px] font-semibold text-foreground truncate">{l.title}</p>
              <p className="text-[13px] font-bold text-[hsl(var(--gold))] mt-0.5">{l.price}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{l.meta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/submit"
        aria-label="Post a Listing"
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg font-bold text-[13px] active:scale-95 transition-transform"
        style={{
          background: "hsl(var(--gold))",
          color: "#0A1628",
          boxShadow: "0 8px 24px rgba(201,168,76,0.4)",
        }}
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        Post a Listing
      </Link>
    </div>
  </Layout>
);

export const HaulersPage = () => (
  <Layout showDiscovery={false}>
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <Construction className="w-12 h-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-display text-foreground mb-2">Haulers</h1>
      <p className="text-muted-foreground max-w-md">Connect with livestock haulers in your area.</p>
    </div>
  </Layout>
);
