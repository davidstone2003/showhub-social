import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
        .limit(2);

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

  const livePath = show ? `/live/${show.id}` : "/winners";

  return (
    <Link
      to={livePath}
      className="mx-3 mt-1.5 mb-0.5 block rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors active:bg-accent/50"
    >
      <div className="flex items-center justify-between px-2.5 py-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-foreground truncate">
            {show?.name || "Live"}
          </span>
          <span className="text-[9px] font-semibold text-destructive shrink-0">LIVE</span>
        </div>
        <span className="text-[10px] font-semibold text-primary shrink-0">Open Live</span>
      </div>

      {results.length > 0 ? (
        <div className="px-2.5 pb-1 flex flex-col">
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-1.5 text-[11px] leading-snug">
              <span className="font-semibold text-foreground truncate">{r.winPlacing || "Result"}</span>
              <span className="text-muted-foreground truncate">— {r.shownBy}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-2.5 pb-1">
          <span className="text-[11px] text-muted-foreground">No results yet — start the feed</span>
        </div>
      )}
    </Link>
  );
}
