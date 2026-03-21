import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Sire {
  id: string;
  name: string;
}

const SiresPage = () => {
  const [sires, setSires] = useState<Sire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSires() {
      const { data } = await supabase
        .from("sires_lookup")
        .select("*")
        .order("name");
      if (data) setSires(data);
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
                className="p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow"
              >
                <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center text-4xl mb-3">
                  🐏
                </div>
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-primary" />
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
