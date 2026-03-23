import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Calendar, Trophy, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

interface WinnerRow {
  id: string;
  result_title: string;
  exhibitor_name: string;
  breeder_name: string | null;
  sire_name: string | null;
  species: string | null;
  image_url: string | null;
}

interface SaleRow {
  id: string;
  lot_number: string | null;
  title: string;
  breeder_name: string | null;
  buyer_name: string | null;
  price: number | null;
  status: string;
  image_url: string | null;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);

      const { data: ev } = await supabase
        .from("events")
        .select("id, name, slug, event_type, start_date, end_date, location, is_live")
        .eq("slug", slug)
        .limit(1)
        .single();

      if (!ev) {
        setLoading(false);
        return;
      }
      setEvent(ev);

      const [{ data: w }, { data: s }] = await Promise.all([
        supabase
          .from("winner_records")
          .select("id, result_title, exhibitor_name, breeder_name, sire_name, species, image_url")
          .eq("event_id", ev.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("sale_records")
          .select("id, lot_number, title, breeder_name, buyer_name, price, status, image_url")
          .eq("event_id", ev.id)
          .order("lot_number", { ascending: true }),
      ]);

      setWinners(w ?? []);
      setSales(s ?? []);
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
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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

  const isShow = event.event_type === "show";
  const dateStr = event.start_date ? format(new Date(event.start_date), "MMMM yyyy") : null;

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        {/* Back + Header */}
        <div className="pt-3 pb-3">
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

        {/* Show Results */}
        {isShow ? (
          <ShowResults winners={winners} />
        ) : (
          <SaleResults sales={sales} />
        )}

        {/* If show has sale lots too */}
        {isShow && sales.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground mb-2">Sale Results</h2>
            <SaleResults sales={sales} />
          </div>
        )}
      </div>
    </Layout>
  );
}

function ShowResults({ winners }: { winners: WinnerRow[] }) {
  if (winners.length === 0) {
    return (
      <div className="py-12 text-center">
        <Trophy className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No results posted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {winners.map((w) => (
        <div
          key={w.id}
          className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/30 transition-colors"
        >
          {w.image_url ? (
            <img
              src={w.image_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary/40" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{w.result_title}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {w.exhibitor_name}
              {w.breeder_name ? ` · ${w.breeder_name}` : ""}
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
  );
}

function SaleResults({ sales }: { sales: SaleRow[] }) {
  if (sales.length === 0) {
    return (
      <div className="py-12 text-center">
        <DollarSign className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No sale results yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sales.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/30 transition-colors"
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/5 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-emerald-500/40" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">
              {s.lot_number ? `Lot ${s.lot_number} — ` : ""}{s.title}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {s.breeder_name || "—"}
              {s.buyer_name ? ` → ${s.buyer_name}` : ""}
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
  );
}
