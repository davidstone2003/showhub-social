import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BreederIdentity } from "@/components/BreederIdentity";

export default function BreedersPage() {
  const { data: breeders = [], isLoading } = useQuery({
    queryKey: ["breeders-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("subscription_tier", ["listing", "breeder_page"])
        .order("display_name", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Breeders Directory</h1>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : breeders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12 text-sm">
            No breeders listed yet
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {breeders.map((b) => (
              <BreederIdentity
                key={b.id}
                name={b.display_name || b.username}
                slug={b.username}
                logoUrl={b.logo_url}
                location={b.location}
                bio={b.bio}
                tier={b.subscription_tier}
                variant="directory"
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
