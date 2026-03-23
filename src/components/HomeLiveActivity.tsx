import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface LiveUpdate {
  id: string;
  update_type: string;
  title: string;
  line_1: string;
  line_2: string | null;
  posted_at: string;
}

export function HomeLiveActivity() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Get live event
      const { data: ev } = await supabase
        .from("events")
        .select("id")
        .eq("is_live", true)
        .limit(1)
        .single();

      if (!ev) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("live_updates")
        .select("id, update_type, title, line_1, line_2, posted_at")
        .eq("event_id", ev.id)
        .order("posted_at", { ascending: false })
        .limit(20);

      if (data) setUpdates(data);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("home-live-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_updates" }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="space-y-1 px-3 pt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-sm text-muted-foreground">No live updates yet</p>
        <p className="text-xs text-muted-foreground mt-0.5">Updates will appear here as they happen</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-3 pt-1">
      {updates.map((u) => (
        <div key={u.id} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors">
          <span className="text-sm shrink-0 mt-0.5">
            {u.update_type === "sale_update" ? "💰" : "🏆"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
              {u.title}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {u.line_1}{u.line_2 ? ` • ${u.line_2}` : ""}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
            {formatDistanceToNow(new Date(u.posted_at), { addSuffix: false })}
          </span>
        </div>
      ))}
    </div>
  );
}
