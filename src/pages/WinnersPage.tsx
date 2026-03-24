import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizePlace, SLOT_ORDER, type PlacementSlot } from "@/lib/normalizePlace";
import { Skeleton } from "@/components/ui/skeleton";
import { ShowResultBlock } from "@/components/winners/ShowResultBlock";
import type { SlotEntry, ShowBlock } from "@/components/winners/types";

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
                  <Skeleton className="h-40 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : shows.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-base">No results posted yet</p>
            </div>
          ) : (
            <div className="space-y-12">
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
