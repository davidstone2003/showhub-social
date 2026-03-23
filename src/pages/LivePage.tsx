import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const SPECIES_OPTIONS = ["All", "Sheep", "Goats", "Cattle", "Pigs"] as const;
type Species = (typeof SPECIES_OPTIONS)[number];

interface LiveItem {
  id: string;
  type: "result" | "sale";
  headline: string;
  detail: string;
  createdAt: string;
}

const LivePage = () => {
  const { showId } = useParams<{ showId: string }>();
  const { user } = useAuth();
  const [showName, setShowName] = useState("");
  const [species, setSpecies] = useState<Species>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    supabase.from("shows").select("name").eq("id", showId).single().then(({ data }) => {
      if (data) setShowName(data.name);
    });
  }, [showId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const speciesValue = species === "All" ? undefined : species.toLowerCase();

      let query = supabase
        .from("winners")
        .select("id, win_placing, show_name, shown_by, bred_by, created_at, posted_as_breeder_id, species")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (showId) query = query.eq("show_id", showId);
      else {
        const today = new Date().toISOString().split("T")[0];
        query = query.gte("date", today);
      }
      if (speciesValue) query = query.ilike("species", speciesValue);

      const { data } = await query;

      if (data) {
        const breederIds = [...new Set(data.filter(d => d.posted_as_breeder_id).map(d => d.posted_as_breeder_id!))];
        let breederMap: Record<string, string> = {};
        if (breederIds.length > 0) {
          const { data: bps } = await supabase.from("breeder_profiles").select("id, breeder_name").in("id", breederIds);
          if (bps) breederMap = Object.fromEntries(bps.map(b => [b.id, b.breeder_name]));
        }

        setItems(data.map(d => {
          const breederName = d.posted_as_breeder_id ? breederMap[d.posted_as_breeder_id] || d.bred_by : d.bred_by;
          return {
            id: d.id,
            type: "result" as const,
            headline: d.win_placing || "Result",
            detail: [d.shown_by, breederName].filter(Boolean).join(" • "),
            createdAt: d.created_at,
          };
        }));
      }
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("live-unified")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "winners" }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showId, species]);

  const selectSpecies = (s: Species) => {
    setSpecies(s);
    setFilterOpen(false);
  };

  return (
    <Layout showDiscovery={false}>
      {/* Header */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between px-3 py-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
              <span className="text-sm font-bold text-foreground truncate">{showName || "Live"}</span>
              <span className="text-[10px] font-semibold text-destructive shrink-0">LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {species !== "All" ? (
              <button
                onClick={() => setSpecies("All")}
                className="inline-flex items-center gap-1 text-primary text-[11px] font-medium transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                {species}
                <X className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => setFilterOpen(true)}
                className="inline-flex items-center gap-1 text-muted-foreground text-[11px] font-medium hover:text-foreground transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                Species
              </button>
            )}

            {user && (
              <Link
                to={`/submit${showId ? `?show=${showId}` : ""}`}
                className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-semibold rounded-lg px-3 py-1.5 text-xs hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Post
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Unified feed */}
      <div className="max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="space-y-2 px-4 pt-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground text-sm font-medium">No results yet — start the feed</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to post</p>
          </div>
        ) : (
          <div className="space-y-0.5 px-3 pt-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                <span className="mt-1 text-sm shrink-0">
                  {item.type === "sale" ? "💰" : "🏆"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.headline}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: false })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Species bottom sheet */}
      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Species</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => selectSpecies(opt)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  species === opt ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </Layout>
  );
};

export default LivePage;
