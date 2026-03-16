import { Layout } from "@/components/Layout";
import { sires, breeders } from "@/data/mock";
import { Dna } from "lucide-react";

const SiresPage = () => (
  <Layout showDiscovery={false}>
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <h1 className="text-2xl font-display text-foreground mb-6">Sire Directory</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sires.map((s) => {
          const breeder = breeders.find((b) => b.id === s.breeder_id);
          return (
            <div key={s.id} className="p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer">
              <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center text-4xl mb-3">
                🐏
              </div>
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-primary" />
                <p className="font-semibold text-sm text-foreground">{s.name}</p>
              </div>
              {breeder && (
                <p className="text-xs text-muted-foreground mt-1">{breeder.name}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </Layout>
);

export default SiresPage;
