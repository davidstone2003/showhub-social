import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface EventRow {
  id: string;
  name: string;
  slug: string;
  event_type: string;
  start_date: string | null;
  location: string | null;
  is_live: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("id, name, slug, event_type, start_date, location, is_live")
        .order("is_live", { ascending: false })
        .order("start_date", { ascending: false });

      setEvents(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        <div className="pb-2 pt-4">
          <h1 className="text-lg font-bold text-foreground">Events</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Browse live events, show & sale results</p>
        </div>

        {loading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">No events yet</p>
          </div>
        ) : (
          <div className="space-y-1.5 mt-2">
            {events.map((event) => {
              const dateStr = event.start_date
                ? format(new Date(event.start_date), "MMM yyyy")
                : null;

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/40"
                >
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
                      <span className="capitalize text-muted-foreground/70">{event.event_type}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-primary ml-2">View →</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
