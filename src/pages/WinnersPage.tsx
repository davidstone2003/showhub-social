import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizePlace, SLOT_ORDER, SLOT_LABELS, SLOT_ICONS, type PlacementSlot } from "@/lib/normalizePlace";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Types ── */
interface WinnerRow {
  id: string;
  show_name: string;
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
  exhibitor: string;
  breeder: string | null;
  image: string | null;
  rawPlacing: string | null;
}

interface ShowBlock {
  showName: string;
  latestDate: string;
  species: string | null;
  slots: SlotEntry[];
  classCount: number;
}

/* ── Page ── */
export default function WinnersPage() {
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("winners")
        .select("id, show_name, win_placing, shown_by, bred_by, placed_by, sired_by, dam, image_urls, date, created_at, species")
        .eq("status", "active")
        .eq("show_on_winners_archive", true)
        .order("created_at", { ascending: false })
        .limit(500);
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, []);

  /* Compile into show blocks */
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
      let classCount = 0;

      for (const p of posts) {
        const slot = normalizePlace(p.win_placing);
        if (!slot) {
          classCount++;
          continue;
        }
        if (filledSlots.has(slot)) {
          // Upgrade: replace if this post has an image and existing doesn't
          const existing = filledSlots.get(slot)!;
          const newImg = p.image_urls?.[0] || null;
          if (!existing.image && newImg) {
            filledSlots.set(slot, {
              slot,
              exhibitor: p.shown_by,
              breeder: p.bred_by,
              image: newImg,
              rawPlacing: p.win_placing,
            });
          }
          continue;
        }
        filledSlots.set(slot, {
          slot,
          exhibitor: p.shown_by,
          breeder: p.bred_by,
          image: p.image_urls?.[0] || null,
          rawPlacing: p.win_placing,
        });
      }

      const orderedSlots = SLOT_ORDER
        .filter((s) => filledSlots.has(s))
        .map((s) => filledSlots.get(s)!);

      // Also add empty slots for grand/reserve if not filled
      const displaySlots: SlotEntry[] = [];
      for (const s of SLOT_ORDER.slice(0, 2)) {
        if (filledSlots.has(s)) {
          displaySlots.push(filledSlots.get(s)!);
        } else {
          displaySlots.push({ slot: s, exhibitor: "—", breeder: null, image: null, rawPlacing: null });
        }
      }
      // Add 3rd-5th only if they exist
      for (const s of SLOT_ORDER.slice(2)) {
        if (filledSlots.has(s)) displaySlots.push(filledSlots.get(s)!);
      }

      const ref = posts[0];
      blocks.push({
        showName: ref.show_name,
        latestDate: ref.date || ref.created_at,
        species: ref.species,
        slots: displaySlots,
        classCount,
      });
    }

    // Sort by most recent activity
    blocks.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
    return blocks;
  }, [rows]);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Winners</h1>
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Search className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <SlidersHorizontal className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : shows.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">No results posted yet</p>
            </div>
          ) : (
            <div className="space-y-6">
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
  const year = new Date(block.latestDate).getFullYear();

  return (
    <div className="border-b border-border pb-5 last:border-b-0">
      {/* Show header */}
      <div className="mb-3">
        <h3 className="text-[15px] font-bold text-foreground leading-snug">
          {block.showName}
          {block.species && (
            <span className="text-muted-foreground font-normal"> • {block.species}</span>
          )}
        </h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">{year}</p>
      </div>

      {/* Placement slots */}
      <div className="space-y-3">
        {block.slots.map((entry, i) => (
          <PlacementRow key={entry.slot} entry={entry} showImage={i === 0} />
        ))}
      </div>

      {/* Class results hint */}
      {block.classCount > 0 && (
        <p className="text-[12px] text-muted-foreground mt-3">
          + {block.classCount} class result{block.classCount > 1 ? "s" : ""}
        </p>
      )}

      {/* View All */}
      <Link
        to={`/events/${encodeURIComponent(block.showName)}/results`}
        className="inline-block mt-2 text-[12px] font-semibold text-primary"
      >
        View All Results →
      </Link>
    </div>
  );
}

/* ── Placement Row ── */
function PlacementRow({ entry, showImage }: { entry: SlotEntry; showImage: boolean }) {
  const icon = SLOT_ICONS[entry.slot];
  const label = SLOT_LABELS[entry.slot];
  const isEmpty = entry.exhibitor === "—";

  return (
    <div className="flex gap-3">
      {/* Image for Grand only */}
      {showImage && entry.image && (
        <img
          src={entry.image}
          alt={label}
          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-muted"
          loading="lazy"
        />
      )}

      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground font-medium leading-tight">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </p>
        <p className={`text-[14px] leading-snug mt-0.5 ${isEmpty ? "text-muted-foreground/50" : "text-foreground font-semibold"}`}>
          {entry.exhibitor}
        </p>
        {entry.breeder && !isEmpty && (
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Bred by {entry.breeder}
          </p>
        )}
      </div>
    </div>
  );
}
