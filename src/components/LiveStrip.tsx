import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface LiveEvent {
  id: string;
  name: string;
  slug: string;
}

export function LiveStrip() {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase
        .from("events")
        .select("id, name, slug")
        .eq("is_live", true)
        .order("is_featured", { ascending: false })
        .limit(1)
        .single();

      setEvent(ev);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("live-strip-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading || !event) return null;

  return (
    <Link
      to={`/events/${event.slug}`}
      className="mx-0 mt-2 mb-1 flex items-center justify-between rounded-full border border-[hsl(var(--gold))]/60 bg-card px-3.5 py-2 shadow-[var(--shadow-card)] hover:bg-accent/30 transition-colors active:bg-accent/50"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
        </span>
        <span className="text-[10px] font-black tracking-wider text-destructive shrink-0">LIVE</span>
        <span className="text-xs font-bold text-foreground truncate">{event.name}</span>
      </div>
      <span className="text-[11px] font-semibold text-primary shrink-0 ml-2">View →</span>
    </Link>
  );
}
