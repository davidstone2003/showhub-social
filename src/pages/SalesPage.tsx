import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { DollarSign, Calendar, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface SaleEvent {
  id: string;
  name: string;
  slug: string;
  start_date: string | null;
  location: string | null;
  is_live: boolean;
}

export default function SalesPage() {
  const [events, setEvents] = useState<SaleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("id, name, slug, start_date, location, is_live")
        .eq("event_type", "sale")
        .order("start_date", { ascending: false });
      setEvents(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        <div className="pt-4 pb-2">
          <h1 className="text-lg font-bold text-foreground">Sales</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Live and archived sale results
          </p>
        </div>

        {loading ? (
          <div className="space-y-2 mt-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No sales yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sale events will appear here
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-1.5">
            {events.map((ev) => (
              <Link
                key={ev.id}
                to={`/events/${ev.slug}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {ev.name}
                    </p>
                    {ev.is_live && (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    {ev.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ev.start_date), "MMM yyyy")}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-primary shrink-0 ml-2">
                  View →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
