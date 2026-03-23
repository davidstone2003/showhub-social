import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { LiveRingFeed } from "@/components/LiveFeed";
import { WinnersTab } from "@/components/WinnersTab";
import { SalesTab } from "@/components/SalesTab";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Pill = "live" | "winners" | "sales";

interface Show {
  id: string;
  name: string;
}

const Index = () => {
  const [activePill, setActivePill] = useState<Pill>("winners");
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>("all");

  useEffect(() => {
    async function fetchShows() {
      const { data } = await supabase
        .from("shows")
        .select("id, name")
        .order("name", { ascending: true });
      if (data) setShows(data);
    }
    fetchShows();
  }, []);

  const selectedShowName = selectedShowId === "all"
    ? "All Shows"
    : shows.find(s => s.id === selectedShowId)?.name || "All Shows";

  return (
    <Layout showDiscovery={false}>
      {/* Show Selector */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <Select value={selectedShowId} onValueChange={setSelectedShowId}>
            <SelectTrigger className="w-full h-9 bg-muted/50 border-none font-semibold text-sm">
              <SelectValue placeholder="All Shows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shows</SelectItem>
              {shows.map(show => (
                <SelectItem key={show.id} value={show.id}>{show.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pills */}
        <div className="flex gap-2 px-4 pb-2 max-w-2xl mx-auto">
          {(["live", "winners", "sales"] as Pill[]).map((pill) => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={cn(
                "flex-1 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors text-center",
                activePill === pill
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {pill === "live" && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              )}
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto w-full">
        {activePill === "live" && <LiveRingFeed showId={selectedShowId === "all" ? undefined : selectedShowId} />}
        {activePill === "winners" && <WinnersTab showId={selectedShowId === "all" ? undefined : selectedShowId} />}
        {activePill === "sales" && <SalesTab showId={selectedShowId === "all" ? undefined : selectedShowId} />}
      </div>
    </Layout>
  );
};

export default Index;
