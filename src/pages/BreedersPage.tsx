import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, User, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : breeders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12 text-sm">
            No breeders listed yet
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {breeders.map((b) => (
              <Link
                key={b.id}
                to={`/breeder/${b.username}`}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow"
              >
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.display_name || b.username}
                    className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {b.display_name || b.username}
                    </p>
                    {b.subscription_tier === "breeder_page" && (
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {b.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {b.location}
                    </p>
                  )}
                  {b.bio && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{b.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
