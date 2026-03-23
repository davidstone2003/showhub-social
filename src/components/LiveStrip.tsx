import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface LiveUpdate {
  id: string;
  title: string;
  line_1: string;
  update_type: string;
}

interface LiveEvent {
  id: string;
  name: string;
  slug: string;
}

export function LiveStrip() {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Get first live event (default to American Royal)
      const { data: ev } = await supabase
        .from("events")
        .select("id, name, slug")
        .eq("is_live", true)
        .order("is_featured", { ascending: false })
        .limit(1)
        .single();

      if (!ev) {
        setLoading(false);
        return;
      }
      setEvent(ev);

      const { data: lu } = await supabase
        .from("live_updates")
        .select("id, title, line_1, update_type")
        .eq("event_id", ev.id)
        .order("posted_at", { ascending: false })
        .limit(2);

      setUpdates(lu || []);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("live-strip-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_updates" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading || !event) return null;

  return (
    <Link
      to={`/live/${event.slug}`}
      className="mx-3 mt-1.5 mb-0.5 block rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors active:bg-accent/50"
    >
      <div className="flex items-center justify-between px-2.5 py-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-foreground truncate">
            {event.name}
          </span>
          <span className="text-[9px] font-semibold text-destructive shrink-0">LIVE</span>
        </div>
        <span className="text-[10px] font-semibold text-primary shrink-0">Open Live</span>
      </div>

      {updates.length > 0 ? (
        <div className="px-2.5 pb-1 flex flex-col">
          {updates.map((u) => (
            <div key={u.id} className="flex items-center gap-1.5 text-[11px] leading-snug">
              <span className="shrink-0">{u.update_type === "sale_update" ? "💰" : "🏆"}</span>
              <span className="font-semibold text-foreground truncate">{u.title}</span>
              <span className="text-muted-foreground truncate">— {u.line_1}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-2.5 pb-1">
          <span className="text-[11px] text-muted-foreground">Live now — post the first result</span>
        </div>
      )}
    </Link>
  );
}
