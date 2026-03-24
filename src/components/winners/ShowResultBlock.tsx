import { Link } from "react-router-dom";
import type { ShowBlock } from "./types";
import { HeroResult } from "./HeroResult";
import { TopResult } from "./TopResult";
import { ClassResults } from "./ClassResults";

export function ShowResultBlock({ block }: { block: ShowBlock }) {
  const year = new Date(block.latestDate).getFullYear();
  const metaParts = [String(year)];
  if (block.location) metaParts.push(block.location);

  const grandSlot = block.slots.find((s) => s.slot === "grand");
  const topSlots = block.slots.filter((s) => s.slot !== "grand");

  return (
    <div className="border-b border-border/40 pb-8 last:border-b-0 last:pb-0">
      {/* Show header */}
      <h3 className="text-[22px] font-semibold text-foreground leading-tight tracking-tight">
        {block.showName}
      </h3>
      <p className="text-[14px] text-muted-foreground mt-1.5">
        {metaParts.join(" • ")}
      </p>

      {/* Hero — Grand Champion */}
      {grandSlot && <HeroResult entry={grandSlot} />}

      {/* Top Results — Reserve through 5th */}
      <div className="space-y-6 pt-2">
        {topSlots.map((entry) => (
          <TopResult key={entry.slot} entry={entry} />
        ))}
      </div>

      {/* View Full Results */}
      <Link
        to={`/events/${encodeURIComponent(block.showName)}/results`}
        className="inline-block mt-6 text-[15px] font-semibold text-primary"
      >
        View Full Results →
      </Link>

      {/* Class Results — collapsible */}
      <ClassResults results={block.classResults} />
    </div>
  );
}
