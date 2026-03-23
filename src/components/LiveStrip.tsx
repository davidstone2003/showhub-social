import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface LiveResult {
  id: string;
  winPlacing: string | null;
  shownBy: string;
}

interface LiveStripProps {
  show: { id: string; name: string } | null;
}

export function LiveStrip({ show }: LiveStripProps) {
  const [results, setResults] = useState<LiveResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from("winners")
        .select("id, win_placing, shown_by, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (show) {
        query = query.eq("show_id", show.id);
      } else {
        const today = new Date().toISOString().split("T")[0];
        query = query.gte("date", today);
      }

      const { data } = await query;
      setResults(
        (data || []).map((d) => ({
          id: d.id,
          winPlacing: d.win_placing,
          shownBy: d.shown_by,
        }))
      );
      setLoading(false);
    }
    fetch();

    const channel = supabase
      .channel("live-strip")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "winners" }, () => {
        fetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [show?.id]);

  if (loading) return null;

  return (
    <div className="mx-3 mt-3 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">
            {show?.name || "Live"}
          </span>
          <span className="text-[10px] font-semibold text-destructive uppercase tracking-wide shrink-0">
            LIVE
          </span>
        </div>
        <Link
          to={show ? `/winners?show=${show.id}` : "/winners"}
          className="text-[11px] font-semibold text-primary hover:underline shrink-0"
        >
          View All
        </Link>
      </div>

      {/* Results or empty */}
      {results.length > 0 ? (
        <div className="divide-y divide-border">
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-2 px-3 py-1.5">
              <span className="text-xs font-semibold text-foreground truncate">
                {r.winPlacing || "Result"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {r.shownBy}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-xs text-muted-foreground">No live results yet</p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="w-3 h-3" />
            Post Result
          </Link>
        </div>
      )}
    </div>
  );
}
