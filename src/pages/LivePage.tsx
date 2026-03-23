import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveItem {
  id: string;
  type: "result" | "sale";
  headline: string;
  detail: string;
  postedAt: string;
}

const LivePage = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [items, setItems] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolve event
  useEffect(() => {
    async function resolveEvent() {
      let query = supabase.from("events").select("id, name, slug, location");
      if (showId) {
        query = query.eq("slug", showId);
      } else {
        query = query.eq("is_live", true).order("is_featured", { ascending: false });
      }
      const { data } = await query.limit(1).single();
      if (data) {
        setEventId(data.id);
        setEventName(data.name);
        setEventLocation(data.location);
      }
      setLoading(false);
    }
    resolveEvent();
  }, [showId]);

  // Load live updates
  const loadUpdates = useCallback(async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from("live_updates")
      .select("id, update_type, title, line_1, line_2, posted_at")
      .eq("event_id", eventId)
      .order("posted_at", { ascending: false })
      .limit(100);

    setItems(
      (data || []).map((d) => ({
        id: d.id,
        type: d.update_type === "sale_update" ? "sale" : "result",
        headline: d.title,
        detail: [d.line_1, d.line_2].filter(Boolean).join(" • "),
        postedAt: d.posted_at,
      }))
    );
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    loadUpdates();

    const channel = supabase
      .channel(`live-feed-${eventId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_updates" }, () => {
        loadUpdates();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, loadUpdates]);

  return (
    <Layout showDiscovery={false}>
      {/* Header */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-card border-b border-border">
        <div className="px-3 py-2.5 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                {eventName || "Live"} <span className="text-destructive">LIVE</span>
              </h1>
              {eventLocation && (
                <p className="text-[11px] text-muted-foreground truncate">{eventLocation}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE NOW status bar */}
      <div className="bg-destructive/5 border-b border-destructive/10">
        <div className="max-w-2xl mx-auto px-4 py-1.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-destructive tracking-wide">LIVE NOW</span>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="space-y-0 divide-y divide-border/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-3">
                <div className="h-3.5 w-3/4 bg-muted/50 rounded animate-pulse" />
                <div className="h-2.5 w-1/3 bg-muted/30 rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-sm font-medium text-muted-foreground">No live updates yet</p>
            <p className="text-xs text-muted-foreground mt-1">Check back when classes begin</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {items.map((item) => (
              <div key={item.id} className="px-4 py-2.5 hover:bg-muted/20 transition-colors">
                <p className="text-[13px] font-semibold text-foreground leading-snug">
                  {item.type === "sale" ? "💰 " : "🏆 "}
                  {item.headline}
                </p>
                {item.detail && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(item.postedAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LivePage;
