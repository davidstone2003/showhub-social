import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { LiveRingFeed } from "@/components/LiveFeed";
import { WinnersTab } from "@/components/WinnersTab";
import { SalesTab } from "@/components/SalesTab";
import { cn } from "@/lib/utils";
import { ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TopPill = "shows" | "sales";
type ShowSub = "live" | "winners";

interface Show {
  id: string;
  name: string;
}

const Index = () => {
  const [topPill, setTopPill] = useState<TopPill>("shows");
  const [showSub, setShowSub] = useState<ShowSub>("live");
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    async function fetchShows() {
      const { data } = await supabase
        .from("shows")
        .select("id, name")
        .order("name", { ascending: true });
      if (data && data.length > 0) {
        setShows(data);
        // Auto-select first show
        if (!selectedShow) setSelectedShow(data[0]);
      }
    }
    fetchShows();
  }, []);

  return (
    <Layout showDiscovery={false}>
      {/* Top pills */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-background border-b border-border">
        <div className="flex gap-2 px-4 py-2 max-w-2xl mx-auto">
          {(["shows", "sales"] as TopPill[]).map((pill) => (
            <button
              key={pill}
              onClick={() => setTopPill(pill)}
              className={cn(
                "flex-1 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors text-center",
                topPill === pill
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Show header + sub-pills (only in Shows view) */}
        {topPill === "shows" && selectedShow && (
          <div className="max-w-2xl mx-auto">
            {/* Show name — tappable */}
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1 px-4 py-1.5 w-full text-left"
            >
              <span className="text-foreground font-bold truncate" style={{ fontSize: 16 }}>
                {selectedShow.name}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            {/* Sub-pills */}
            <div className="flex gap-1.5 px-4 pb-2">
              {(["live", "winners"] as ShowSub[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setShowSub(sub)}
                  className={cn(
                    "px-4 py-1 rounded-lg text-xs font-semibold capitalize transition-colors",
                    showSub === sub
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {sub === "live" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
                  )}
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full">
        {topPill === "shows" && selectedShow && (
          <>
            {showSub === "live" && <LiveRingFeed showId={selectedShow.id} />}
            {showSub === "winners" && <WinnersTab showId={selectedShow.id} />}
          </>
        )}
        {topPill === "shows" && !selectedShow && (
          <div className="text-center py-16 px-4">
            <p className="text-muted-foreground text-sm">No shows available</p>
          </div>
        )}
        {topPill === "sales" && <SalesTab />}
      </div>

      {/* Full-screen show picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-foreground font-bold" style={{ fontSize: 18 }}>Select Show</h2>
            <button onClick={() => setShowPicker(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {shows.map((show) => (
              <button
                key={show.id}
                onClick={() => { setSelectedShow(show); setShowPicker(false); }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border transition-colors",
                  selectedShow?.id === show.id
                    ? "bg-primary/5 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/50"
                )}
                style={{ fontSize: 15 }}
              >
                {show.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
