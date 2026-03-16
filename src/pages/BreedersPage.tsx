import { Layout } from "@/components/Layout";
import { breeders } from "@/data/mock";
import { MapPin, CheckCircle } from "lucide-react";

const BreedersPage = () => (
  <Layout showDiscovery={false}>
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <h1 className="text-2xl font-display text-foreground mb-6">Breeders Directory</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {breeders.map((b) => (
          <div key={b.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer">
            <span className="w-12 h-12 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-xl">
              {b.logo}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm text-foreground truncate">{b.name}</p>
                {b.is_pro && <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {b.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Layout>
);

export default BreedersPage;
