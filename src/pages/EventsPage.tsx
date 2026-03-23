import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, DollarSign, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type EventFilter = "all" | "show" | "sale";

interface EventRow {
  id: string;
  name: string;
  slug: string;
  event_type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  is_live: boolean;
  description: string | null;
}

interface EventSummary extends EventRow {
  winnerCount: number;
  saleCount: number;
  totalRevenue: number;
}

export default function EventsPage() {
  const [filter, setFilter] = useState<EventFilter>("all");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: eventsData } = await supabase
        .from("events")
        .select("id, name, slug, event_type, start_date, end_date, location, is_live, description")
        .order("start_date", { ascending: false });

      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const eventIds = eventsData.map((e) => e.id);

      const [{ data: winners }, { data: sales }] = await Promise.all([
        supabase.from("winner_records").select("id, event_id").in("event_id", eventIds),
        supabase.from("sale_records").select("id, event_id, price").in("event_id", eventIds),
      ]);

      const winnerCounts: Record<string, number> = {};
      (winners ?? []).forEach((w) => {
        winnerCounts[w.event_id] = (winnerCounts[w.event_id] || 0) + 1;
      });

      const saleCounts: Record<string, number> = {};
      const saleRevenue: Record<string, number> = {};
      (sales ?? []).forEach((s) => {
        saleCounts[s.event_id] = (saleCounts[s.event_id] || 0) + 1;
        saleRevenue[s.event_id] = (saleRevenue[s.event_id] || 0) + (Number(s.price) || 0);
      });

      const enriched: EventSummary[] = eventsData.map((e) => ({
        ...e,
        winnerCount: winnerCounts[e.id] || 0,
        saleCount: saleCounts[e.id] || 0,
        totalRevenue: saleRevenue[e.id] || 0,
      }));

      setEvents(enriched);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    return e.event_type === filter;
  });

  const filters: { label: string; value: EventFilter }[] = [
    { label: "All", value: "all" },
    { label: "Shows", value: "show" },
    { label: "Sales", value: "sale" },
  ];

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        <div className="pb-2 pt-4">
          <h1 className="text-lg font-bold text-foreground">Events</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Browse show and sale results</p>
        </div>

        {/* Filter chips */}
        <div className="sticky top-[44px] z-30 bg-background pb-2 lg:top-0">
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`h-7 shrink-0 rounded-full px-3 text-[11px] font-semibold transition-colors ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-transparent text-muted-foreground hover:border-foreground/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-2 mt-1 text-[11px] text-muted-foreground">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Event list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">No events found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function EventCard({ event }: { event: EventSummary }) {
  const isShow = event.event_type === "show";
  const icon = isShow ? Trophy : DollarSign;
  const Icon = icon;

  const summary = isShow
    ? `${event.winnerCount} result${event.winnerCount !== 1 ? "s" : ""}`
    : `${event.saleCount} lot${event.saleCount !== 1 ? "s" : ""}${event.totalRevenue > 0 ? ` · $${(event.totalRevenue / 1000).toFixed(0)}K total` : ""}`;

  const dateStr = event.start_date
    ? format(new Date(event.start_date), "MMM yyyy")
    : null;

  return (
    <Link
      to={`/events/${event.slug}`}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/40"
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isShow ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
          {event.is_live && (
            <span className="shrink-0 flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {dateStr && (
            <span className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {dateStr}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">{summary}</p>
      </div>

      <span className="mt-1 shrink-0 text-[11px] font-medium text-primary">View →</span>
    </Link>
  );
}
