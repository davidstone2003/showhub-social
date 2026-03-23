import { Layout } from "@/components/Layout";
import { Construction, ShoppingBag, Truck, Camera, Wrench, Wheat, Pill } from "lucide-react";

/* ── Market Page ── */

const categories = [
  {
    title: "Animals",
    description: "Sheep, goats, cattle, pigs — breeding stock & show animals",
    icon: ShoppingBag,
  },
  {
    title: "Services",
    description: "Haulers, photographers, fitters, equipment",
    icon: Truck,
  },
  {
    title: "Nutrition",
    description: "Feed, supplements, and animal health",
    icon: Wheat,
  },
];

export const MarketPage = () => (
  <Layout showDiscovery={false}>
    <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
      <div className="pb-2 pt-4">
        <h1 className="text-lg font-bold text-foreground">Market</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Buy, sell, and find services</p>
      </div>

      <div className="mt-2 space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <cat.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{cat.title}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{cat.description}</p>
            </div>
            <span className="mt-1 shrink-0 text-[11px] font-medium text-primary">Coming soon</span>
          </div>
        ))}
      </div>
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
