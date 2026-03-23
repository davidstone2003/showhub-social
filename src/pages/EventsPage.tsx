import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, DollarSign, MapPin, Calendar, Search, X } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type TabValue = "live" | "shows" | "sales";

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get("tab") as TabValue) || "live";

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        <div className="pb-1 pt-4">
          <h1 className="text-lg font-bold text-foreground">Events</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Live updates, show & sale results</p>
        </div>

        <Tabs
          defaultValue={defaultTab}
          onValueChange={(v) => setSearchParams({ tab: v })}
          className="mt-2"
        >
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="live" className="text-xs font-semibold">Live</TabsTrigger>
            <TabsTrigger value="shows" className="text-xs font-semibold">Show Results</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs font-semibold">Sale Results</TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <LiveTab />
          </TabsContent>
          <TabsContent value="shows">
            <ArchiveTab type="show" />
          </TabsContent>
          <TabsContent value="sales">
            <ArchiveTab type="sale" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

/* ─── Live Tab ─── */

const SPECIES_OPTIONS = ["All", "Sheep", "Goats", "Cattle", "Pigs"] as const;
type Species = (typeof SPECIES_OPTIONS)[number];

interface LiveItem {
  id: string;
  type: "result" | "sale";
  headline: string;
  detail: string;
  postedAt: string;
}

function LiveTab() {
  const [species, setSpecies] = useState<Species>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<LiveItem[]>([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase
        .from("events")
        .select("id, name")
        .eq("is_live", true)
        .order("is_featured", { ascending: false })
        .limit(1)
        .single();

      if (!ev) {
        setLoading(false);
        return;
      }
      setEventName(ev.name);

      const speciesValue = species === "All" ? undefined : species.toLowerCase();
      let query = supabase
        .from("live_updates")
        .select("id, update_type, title, line_1, line_2, species, posted_at")
        .eq("event_id", ev.id)
        .order("posted_at", { ascending: false })
        .limit(50);

      if (speciesValue) query = query.ilike("species", speciesValue);

      const { data } = await query;
      setItems(
        (data || []).map((d) => ({
          id: d.id,
          type: d.update_type === "sale_update" ? "sale" as const : "result" as const,
          headline: d.title,
          detail: [d.line_1, d.line_2].filter(Boolean).join(" • "),
          postedAt: d.posted_at,
        }))
      );
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("events-live-tab")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_updates" }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [species]);

  const selectSpecies = (s: Species) => {
    setSpecies(s);
    setFilterOpen(false);
  };

  return (
    <div>
      {/* Live header bar */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="text-sm font-bold text-foreground truncate">
            {eventName || "Live"}
          </span>
          <span className="text-[10px] font-semibold text-destructive shrink-0">LIVE</span>
        </div>

        {species !== "All" ? (
          <button
            onClick={() => setSpecies("All")}
            className="inline-flex items-center gap-1 text-primary text-[11px] font-medium"
          >
            <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
            {species}
            <X className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1 text-muted-foreground text-[11px] font-medium hover:text-foreground transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
            Species
          </button>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-2 pt-1">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground font-medium">No results yet — start the feed</p>
          <p className="text-xs text-muted-foreground mt-1">Updates appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-0.5 pt-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-2.5 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
              <span className="mt-0.5 text-sm shrink-0">
                {item.type === "sale" ? "💰" : "🏆"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{item.headline}</p>
                <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                {formatDistanceToNow(new Date(item.postedAt), { addSuffix: false })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Species bottom sheet */}
      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Species</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => selectSpecies(opt)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  species === opt ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* ─── Archive Tab (Shows or Sales) ─── */

interface EventRow {
  id: string;
  name: string;
  slug: string;
  event_type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  is_live: boolean;
}

interface EventSummary extends EventRow {
  winnerCount: number;
  saleCount: number;
  totalRevenue: number;
}

function ArchiveTab({ type }: { type: "show" | "sale" }) {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: eventsData } = await supabase
        .from("events")
        .select("id, name, slug, event_type, start_date, end_date, location, is_live")
        .eq("event_type", type)
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

      setEvents(
        eventsData.map((e) => ({
          ...e,
          winnerCount: winnerCounts[e.id] || 0,
          saleCount: saleCounts[e.id] || 0,
          totalRevenue: saleRevenue[e.id] || 0,
        }))
      );
      setLoading(false);
    }
    load();
  }, [type]);

  const filtered = events.filter((e) =>
    search.trim() === "" || e.name.toLowerCase().includes(search.toLowerCase())
  );

  const isShow = type === "show";

  return (
    <div>
      {/* Search */}
      <div className="relative mt-2 mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={isShow ? "Search shows…" : "Search sales…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <p className="mb-2 text-[11px] text-muted-foreground">
        {filtered.length} {isShow ? "show" : "sale"}{filtered.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No {isShow ? "shows" : "sales"} found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventSummary }) {
  const isShow = event.event_type === "show";
  const Icon = isShow ? Trophy : DollarSign;

  const summary = isShow
    ? `${event.winnerCount} result${event.winnerCount !== 1 ? "s" : ""}`
    : `${event.saleCount} lot${event.saleCount !== 1 ? "s" : ""}${event.totalRevenue > 0 ? ` · $${(event.totalRevenue / 1000).toFixed(0)}K total` : ""}`;

  const dateStr = event.start_date ? format(new Date(event.start_date), "MMM yyyy") : null;

  return (
    <Link
      to={`/events/${event.slug}`}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/40"
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isShow ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"
        )}
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
