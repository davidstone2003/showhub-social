import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Calendar, Trophy, DollarSign, Search, X } from "lucide-react";
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

interface EventData {
  id: string;
  name: string;
  slug: string;
  event_type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  is_live: boolean;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const { data } = await supabase
        .from("events")
        .select("id, name, slug, event_type, start_date, end_date, location, is_live")
        .eq("slug", slug)
        .limit(1)
        .single();
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <Layout showDiscovery={false}>
        <div className="mx-auto max-w-2xl px-3 pb-24 pt-4 lg:px-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60 mb-6" />
          <Skeleton className="h-10 w-full rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout showDiscovery={false}>
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Event not found</p>
        </div>
      </Layout>
    );
  }

  const dateStr = event.start_date ? format(new Date(event.start_date), "MMMM yyyy") : null;

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        {/* Header */}
        <div className="pt-3 pb-2">
          <button
            onClick={() => navigate("/events")}
            className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Events
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">{event.name}</h1>
            {event.is_live && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            {dateStr && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateStr}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={event.is_live ? "live" : "shows"} className="mt-1">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="live" className="text-xs font-semibold">Live</TabsTrigger>
            <TabsTrigger value="shows" className="text-xs font-semibold">Show Results</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs font-semibold">Sale Results</TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <LiveTab eventId={event.id} />
          </TabsContent>
          <TabsContent value="shows">
            <ShowResultsTab eventId={event.id} />
          </TabsContent>
          <TabsContent value="sales">
            <SaleResultsTab eventId={event.id} />
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

function LiveTab({ eventId }: { eventId: string }) {
  const [species, setSpecies] = useState<Species>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const speciesValue = species === "All" ? undefined : species.toLowerCase();

      let query = supabase
        .from("live_updates")
        .select("id, update_type, title, line_1, line_2, species, posted_at")
        .eq("event_id", eventId)
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
      .channel(`live-detail-${eventId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_updates" }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, species]);

  return (
    <div>
      {/* Species filter */}
      <div className="flex items-center justify-end py-2">
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

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground font-medium">No results yet — start the feed</p>
          <p className="text-xs text-muted-foreground mt-1">Updates appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-0.5">
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

      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Species</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { setSpecies(opt); setFilterOpen(false); }}
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

/* ─── Show Results Tab ─── */

interface WinnerRow {
  id: string;
  result_title: string;
  exhibitor_name: string;
  breeder_name: string | null;
  sire_name: string | null;
  species: string | null;
  image_url: string | null;
}

function ShowResultsTab({ eventId }: { eventId: string }) {
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("winner_records")
        .select("id, result_title, exhibitor_name, breeder_name, sire_name, species, image_url")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      setWinners(data ?? []);
      setLoading(false);
    }
    load();
  }, [eventId]);

  const filtered = winners.filter((w) =>
    search.trim() === "" ||
    w.result_title.toLowerCase().includes(search.toLowerCase()) ||
    w.exhibitor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mt-2 mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search results…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Trophy className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No results posted yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((w) => (
            <div key={w.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/30 transition-colors">
              {w.image_url ? (
                <img src={w.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{w.result_title}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {w.exhibitor_name}{w.breeder_name ? ` · ${w.breeder_name}` : ""}
                </p>
              </div>
              {w.species && (
                <span className="mt-0.5 shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  {w.species}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sale Results Tab ─── */

interface SaleRow {
  id: string;
  lot_number: string | null;
  title: string;
  breeder_name: string | null;
  buyer_name: string | null;
  price: number | null;
  image_url: string | null;
}

function SaleResultsTab({ eventId }: { eventId: string }) {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("sale_records")
        .select("id, lot_number, title, breeder_name, buyer_name, price, image_url")
        .eq("event_id", eventId)
        .order("lot_number", { ascending: true });
      setSales(data ?? []);
      setLoading(false);
    }
    load();
  }, [eventId]);

  const filtered = sales.filter((s) =>
    search.trim() === "" ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.breeder_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mt-2 mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search sales…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <DollarSign className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No sale results yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/30 transition-colors">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-500/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {s.lot_number ? `Lot ${s.lot_number} — ` : ""}{s.title}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {s.breeder_name || "—"}{s.buyer_name ? ` → ${s.buyer_name}` : ""}
                </p>
              </div>
              {s.price != null && s.price > 0 && (
                <span className="shrink-0 text-[13px] font-bold text-emerald-600">
                  ${s.price.toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
