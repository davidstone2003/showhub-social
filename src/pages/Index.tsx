import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { LiveRingFeed } from "@/components/LiveFeed";
import { WinnersTab } from "@/components/WinnersTab";
import { SalesTab } from "@/components/SalesTab";
import { cn } from "@/lib/utils";
import { ChevronRight, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type TopPill = "shows" | "sales";
type ShowSub = "live" | "winners";

interface Show {
  id: string;
  name: string;
}

const Index = () => {
  const { user } = useAuth();
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
        if (!selectedShow) setSelectedShow(data[0]);
      }
    }
    fetchShows();
  }, []);

  return (
    <Layout showDiscovery={false}>
      {/* Sticky nav bar */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-card border-b border-border">
        {/* Compact segmented control */}
        <div className="flex justify-center px-4 py-2 max-w-2xl mx-auto">
          <div className="inline-flex rounded-lg bg-muted p-0.5">
            {(["shows", "sales"] as TopPill[]).map((pill) => (
              <button
                key={pill}
                onClick={() => setTopPill(pill)}
                className={cn(
                  "rounded-md px-4 text-xs font-semibold capitalize transition-all",
                  topPill === pill
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ height: 30, lineHeight: '30px' }}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

      {/* Show header + sub-pills */}
        {topPill === "shows" && selectedShow && (
          <div className="max-w-2xl mx-auto">
            {/* Show name + meta */}
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 w-full text-left group active:bg-muted/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-foreground font-bold truncate" style={{ fontSize: 16 }}>
                    {selectedShow.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-muted-foreground truncate mt-0.5" style={{ fontSize: 12 }}>
                  March 2026 • Kansas City
                </p>
              </div>
            </button>

            {/* Sub-pills */}
            <div className="flex gap-2 px-4 pt-1 pb-2.5">
              {(["live", "winners"] as ShowSub[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setShowSub(sub)}
                  className={cn(
                    "inline-flex items-center rounded-full font-semibold capitalize transition-all",
                    "px-3.5 text-xs",
                    showSub === sub
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-primary/8 text-primary hover:bg-primary/15"
                  )}
                  style={{ height: 30, lineHeight: '30px' }}
                >
                  {sub === "live" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
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
