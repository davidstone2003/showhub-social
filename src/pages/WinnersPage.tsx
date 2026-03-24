import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizePlace, SLOT_ORDER, SLOT_LABELS, SLOT_ICONS, type PlacementSlot } from "@/lib/normalizePlace";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Types ── */
interface WinnerRow {
  id: string;
  show_name: string;
  show_id: string | null;
  win_placing: string | null;
  shown_by: string;
  bred_by: string | null;
  placed_by: string | null;
  sired_by: string | null;
  dam: string | null;
  image_urls: string[] | null;
  date: string;
  created_at: string;
  species: string | null;
}

interface SlotEntry {
  slot: PlacementSlot;
  exhibitor: string | null;
  breeder: string | null;
  image: string | null;
  filled: boolean;
}

interface ShowBlock {
  showName: string;
  latestDate: string;
  location: string | null;
  species: string | null;
  slots: SlotEntry[];
  classResults: { placing: string; exhibitor: string; breeder: string | null }[];
}

/* ── Page ── */
export default function WinnersPage() {
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [eventMeta, setEventMeta] = useState<Map<string, { location: string | null }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [winnersRes, eventsRes] = await Promise.all([
        supabase
          .from("winners")
          .select("id, show_name, show_id, win_placing, shown_by, bred_by, placed_by, sired_by, dam, image_urls, date, created_at, species")
          .eq("status", "active")
          .eq("show_on_winners_archive", true)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("events").select("id, location").limit(200),
      ]);

      setRows(winnersRes.data || []);
      const meta = new Map<string, { location: string | null }>();
      for (const e of eventsRes.data || []) meta.set(e.id, { location: e.location });
      setEventMeta(meta);
      setLoading(false);
    }
    load();
  }, []);

  const shows = useMemo(() => {
    const grouped = new Map<string, WinnerRow[]>();
    for (const r of rows) {
      const key = r.show_name.trim().toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    }

    const blocks: ShowBlock[] = [];
    for (const [, posts] of grouped) {
      const filledSlots = new Map<PlacementSlot, SlotEntry>();
      const classResults: { placing: string; exhibitor: string; breeder: string | null }[] = [];

      for (const p of posts) {
        const slot = normalizePlace(p.win_placing);
        if (!slot) {
          if (p.win_placing) classResults.push({ placing: p.win_placing, exhibitor: p.shown_by, breeder: p.bred_by });
          continue;
        }
        if (filledSlots.has(slot)) {
          const existing = filledSlots.get(slot)!;
          const newImg = p.image_urls?.[0] || null;
          if (!existing.image && newImg) {
            filledSlots.set(slot, { slot, exhibitor: p.shown_by, breeder: p.bred_by, image: newImg, filled: true });
          }
          continue;
        }
        filledSlots.set(slot, { slot, exhibitor: p.shown_by, breeder: p.bred_by, image: p.image_urls?.[0] || null, filled: true });
      }

      const displaySlots: SlotEntry[] = SLOT_ORDER.map((s) =>
        filledSlots.has(s) ? filledSlots.get(s)! : { slot: s, exhibitor: null, breeder: null, image: null, filled: false }
      );

      const ref = posts[0];
      const evMeta = ref.show_id ? eventMeta.get(ref.show_id) : undefined;

      blocks.push({
        showName: ref.show_name,
        latestDate: ref.date || ref.created_at,
        location: evMeta?.location || null,
        species: ref.species,
        slots: displaySlots,
        classResults,
      });
    }

    blocks.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
    return blocks;
  }, [rows, eventMeta]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Winners</h1>
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-5">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : shows.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-base">No results posted yet</p>
            </div>
          ) : (
            <div className="space-y-10">
              {shows.map((block) => (
                <ShowResultBlock key={block.showName} block={block} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ── Show Result Block ── */
function ShowResultBlock({ block }: { block: ShowBlock }) {
  const [classOpen, setClassOpen] = useState(false);
  const year = new Date(block.latestDate).getFullYear();
  const metaParts = [String(year)];
  if (block.location) metaParts.push(block.location);

  return (
    <div className="border-b border-border/50 pb-10 last:border-b-0 last:pb-0">
      {/* Show header */}
      <h3 className="text-[22px] font-semibold text-foreground leading-tight tracking-tight">
        {block.showName}
      </h3>
      <p className="text-[15px] text-muted-foreground mt-2 font-medium">
        {metaParts.join(" • ")}
      </p>

      {/* Placement slots */}
      <div className="mt-6 space-y-6">
        {block.slots.map((entry) => (
          <PlacementRow key={entry.slot} entry={entry} />
        ))}
      </div>

      {/* View Full Results */}
      <Link
        to={`/events/${encodeURIComponent(block.showName)}/results`}
        className="inline-block mt-6 text-[15px] font-semibold text-primary"
      >
        View Full Results →
      </Link>

      {/* Class Results */}
      {block.classResults.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setClassOpen(!classOpen)}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {classOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Class Results ({block.classResults.length})
          </button>

          {classOpen && (
            <div className="mt-3 space-y-1 pl-1">
              {block.classResults.map((c, i) => (
                <div key={i} className="flex items-baseline gap-2 py-1">
                  <span className="text-[14px] text-foreground font-medium">{c.placing}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {c.exhibitor}
                    {c.breeder && ` • ${c.breeder}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Placement Row ── */
function PlacementRow({ entry }: { entry: SlotEntry }) {
  const icon = SLOT_ICONS[entry.slot];
  const label = SLOT_LABELS[entry.slot];

  const isGrand = entry.slot === "grand";
  const isTopThree = entry.slot === "grand" || entry.slot === "reserve" || entry.slot === "third";

  const imgSize = isGrand ? "w-[100px] h-[100px]" : "w-[70px] h-[70px]";

  if (entry.image) {
    return (
      <div className={`flex items-center gap-4 ${isGrand ? "py-2" : ""}`}>
        <img
          src={entry.image}
          alt={label}
          className={`${imgSize} rounded-xl object-cover bg-muted flex-shrink-0`}
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.06em] leading-tight">
            {icon && <span className="mr-1.5">{icon}</span>}
            {label}
          </p>
          {entry.filled ? (
            <>
              <p className={`text-foreground leading-snug mt-1.5 ${isGrand ? "text-[26px] font-bold" : "text-[20px] font-semibold"}`}>
                {entry.exhibitor}
              </p>
              {entry.breeder && <p className="text-[15px] text-muted-foreground mt-2">{entry.breeder}</p>}
            </>
          ) : (
            <p className="text-[14px] text-muted-foreground/50 italic mt-1.5">Pending update</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={isGrand ? "py-2" : ""}>
      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.06em] leading-tight">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </p>
      {entry.filled ? (
        <>
          <p className={`text-foreground leading-snug mt-1.5 ${isGrand ? "text-[26px] font-bold" : "text-[20px] font-semibold"}`}>
            {entry.exhibitor}
          </p>
          {entry.breeder && <p className="text-[15px] text-muted-foreground mt-2">{entry.breeder}</p>}
        </>
      ) : (
        <p className="text-[14px] text-muted-foreground/50 italic mt-1.5">Pending update</p>
      )}
    </div>
  );
}
