import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Feed } from "@/components/Feed";
import { LiveStrip } from "@/components/LiveStrip";
import { SalesTab } from "@/components/SalesTab";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type TopPill = "shows" | "sales";

interface Show {
  id: string;
  name: string;
}

const Index = () => {
  const [topPill, setTopPill] = useState<TopPill>("shows");
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

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
      {/* Compact segmented toggle */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-card border-b border-border">
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
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full">
        {topPill === "shows" && (
          <>
            {/* Compact live strip */}
            <LiveStrip show={selectedShow} />
            {/* Main social feed */}
            <Feed />
          </>
        )}
        {topPill === "sales" && <SalesTab />}
      </div>
    </Layout>
  );
};

export default Index;
