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
      to="/events?tab=live"
      className="mx-3 mt-1 mb-1 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 hover:bg-accent/30 transition-colors active:bg-accent/50"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
        <span className="text-xs font-bold text-foreground truncate">{event.name}</span>
        <span className="text-[10px] font-bold text-destructive shrink-0">LIVE</span>
      </div>
      <span className="text-[11px] font-semibold text-primary shrink-0 ml-2">View →</span>
    </Link>
  );
}
