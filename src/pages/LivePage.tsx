import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LiveResult {
  id: string;
  winPlacing: string | null;
  shownBy: string;
  bredBy: string | null;
  createdAt: string;
}

const LivePage = () => {
  const { showId } = useParams<{ showId: string }>();
  const { user } = useAuth();
  const [showName, setShowName] = useState("");
  const [results, setResults] = useState<LiveResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;

    async function load() {
      // Fetch show name
      const { data: show } = await supabase
        .from("shows")
        .select("name")
        .eq("id", showId!)
        .single();
      if (show) setShowName(show.name);

      // Fetch results
      const { data } = await supabase
        .from("winners")
        .select("id, win_placing, shown_by, bred_by, created_at")
        .eq("show_id", showId!)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100);

      setResults(
        (data || []).map((d) => ({
          id: d.id,
          winPlacing: d.win_placing,
          shownBy: d.shown_by,
          bredBy: d.bred_by,
          createdAt: d.created_at,
        }))
      );
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`live-${showId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "winners" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId]);

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

      {/* Feed */}
      <div className="max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="space-y-2 px-4 pt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-muted-foreground text-sm font-medium">Waiting for results…</p>
            <p className="text-xs text-muted-foreground mt-1">Updates will appear here as they happen</p>
          </div>
        ) : (
          <div className="px-3 pt-2 space-y-0.5">
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {r.winPlacing || "Result"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.shownBy}
                    {r.bredBy ? ` • ${r.bredBy}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: false })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LivePage;
