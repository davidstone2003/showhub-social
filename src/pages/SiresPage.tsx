import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import gooseImage from "@/assets/sires/goose.jpeg";

interface Sire {
  id: string;
  name: string;
}

interface WinnerSire {
  sire_id: string | null;
}

const SiresPage = () => {
  const [sires, setSires] = useState<Sire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSires() {
      const [{ data: sireData }, { data: winnerData }] = await Promise.all([
        supabase.from("sires_lookup").select("id, name"),
        supabase
          .from("winners")
          .select("sire_id")
          .eq("status", "active")
          .not("sire_id", "is", null),
      ]);

      if (sireData) {
        const sireIdsWithPosts = new Set(
          (winnerData as WinnerSire[] | null)?.map((winner) => winner.sire_id).filter(Boolean) ?? []
        );

        const sortedSires = [...sireData].sort((a, b) => {
          const aHasPosts = sireIdsWithPosts.has(a.id);
          const bHasPosts = sireIdsWithPosts.has(b.id);

          if (aHasPosts !== bHasPosts) {
            return aHasPosts ? -1 : 1;
          }

          return a.name.localeCompare(b.name);
        });

        setSires(sortedSires);
      }

      setLoading(false);
    }

    fetchSires();
  }, []);

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl font-display text-foreground mb-6">Sire Directory</h1>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : sires.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sires found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sires.map((s) => (
              <Link
                key={s.id}
                to={`/sire/${s.id}`}
                className="block p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow"
              >
                <div className="w-full aspect-square rounded-md bg-muted overflow-hidden mb-3">
                  {s.name === "Goose" ? (
                    <img
                      src={gooseImage}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🐏</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-primary shrink-0" />
                  <p className="font-semibold text-sm text-foreground">{s.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SiresPage;
