import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LiveRingFeed, LiveSalesFeed } from "@/components/LiveFeed";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type LiveTab = "shows" | "sales";

const SPECIES_OPTIONS = ["All", "Sheep", "Goats", "Cattle", "Pigs"] as const;
type Species = (typeof SPECIES_OPTIONS)[number];

const LivePage = () => {
  const { showId } = useParams<{ showId: string }>();
  const { user } = useAuth();
  const [showName, setShowName] = useState("");
  const [activeTab, setActiveTab] = useState<LiveTab>("shows");
  const [species, setSpecies] = useState<Species>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!showId) return;
    async function load() {
      const { data: show } = await supabase
        .from("shows")
        .select("name")
        .eq("id", showId!)
        .single();
      if (show) setShowName(show.name);
    }
    load();
  }, [showId]);

  const selectSpecies = (s: Species) => {
    setSpecies(s);
    setFilterOpen(false);
  };

  const speciesValue = species === "All" ? undefined : species.toLowerCase();

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
            {/* Species label / active chip */}
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
                Post Result
              </Link>
            )}
          </div>
        </div>

        {/* Shows / Sales pills */}
        <div className="flex justify-center px-4 py-1 max-w-2xl mx-auto">
          <div className="inline-flex rounded-md bg-muted/60 p-0.5">
            {(["shows", "sales"] as LiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded px-3.5 text-[11px] font-semibold capitalize transition-all",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ height: 26, lineHeight: "26px" }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full">
        {activeTab === "shows" ? (
          <LiveRingFeed showId={showId} species={speciesValue} />
        ) : (
          <LiveSalesFeed />
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
                  species === opt
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50"
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
