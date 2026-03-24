import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { ShowBlock } from "./types";
import { HeroResult } from "./HeroResult";
import { TopResult } from "./TopResult";
import { ClassResults } from "./ClassResults";
import { WinnerImageViewer } from "./WinnerImageViewer";
import { SLOT_LABELS } from "@/lib/normalizePlace";

export function ShowResultBlock({ block }: { block: ShowBlock }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const year = new Date(block.latestDate).getFullYear();
  const metaParts = [String(year)];
  if (block.location) metaParts.push(block.location);

  const grandSlot = block.slots.find((s) => s.slot === "grand");
  const topSlots = block.slots.filter((s) => s.slot !== "grand");

  // Build slides for fullscreen viewer (only entries with images)
  const slides = useMemo(() => {
    return block.slots
      .filter((s) => s.filled && s.image)
      .map((s) => ({
        image: s.image!,
        name: s.exhibitor,
        placement: SLOT_LABELS[s.slot],
        breeder: s.breeder,
      }));
  }, [block.slots]);

  const openViewer = (slotImage: string | null) => {
    if (!slotImage) return;
    const idx = slides.findIndex((s) => s.image === slotImage);
    setViewerIndex(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  return (
    <div className="pb-10 last:pb-0">
      {/* Show header */}
      <h3 className="text-[23px] font-semibold text-foreground leading-tight tracking-tight">
        {block.showName}
      </h3>
      <p className="text-[15px] text-muted-foreground mt-2">
        {metaParts.join(" • ")}
      </p>

      {/* Hero — Grand Champion */}
      {grandSlot && (
        <HeroResult
          entry={grandSlot}
          onImageTap={() => openViewer(grandSlot.image)}
        />
      )}

      {/* Top Results */}
      <div className="space-y-6">
        {topSlots.map((entry) => (
          <TopResult key={entry.slot} entry={entry} />
        ))}
      </div>

      {/* View Full Results */}
      <Link
        to={`/events/${encodeURIComponent(block.showName)}/results`}
        className="inline-block mt-6 text-[16px] font-semibold text-primary"
      >
        View Full Results →
      </Link>

      {/* Class Results */}
      <ClassResults results={block.classResults} />

      {/* Section divider */}
      <div className="mt-8 border-b border-border/40" />

      {/* Fullscreen viewer */}
      {slides.length > 0 && (
        <WinnerImageViewer
          slides={slides}
          initialIndex={viewerIndex}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
