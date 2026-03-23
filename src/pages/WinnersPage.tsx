import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Search, SlidersHorizontal, Bookmark, ChevronDown, ChevronRight } from "lucide-react";

/* ── mock live updates ── */
const liveUpdates = [
  { id: "1", text: "Grand Champion Blackface selected", time: "2m ago" },
  { id: "2", text: "Class 7 posted", time: "5m ago" },
  { id: "3", text: "Reserve just slapped", time: "8m ago" },
  { id: "4", text: "Commercial ewe results rolling in", time: "12m ago" },
];

/* ── mock saved views ── */
const savedViews = ["All Results", "My Views", "Grand Only", "Beatty Bred", "Goose Offspring"];

/* ── mock official results ── */
interface ResultEntry {
  placing: string;
  exhibitor: string;
  bredBy: string;
}
interface ClassEntry {
  className: string;
  placing: string;
  exhibitor: string;
  bredBy: string;
}
interface ShowResultBlock {
  id: string;
  showName: string;
  date: string;
  location: string;
  judge: string;
  overallWinners: ResultEntry[];
  classResults: ClassEntry[];
}

const mockResults: ShowResultBlock[] = [
  {
    id: "naile-commercial",
    showName: "NAILE Commercial Ewe Show",
    date: "Nov. 14, 2025",
    location: "Louisville, KY",
    judge: "Mike Stitzlein",
    overallWinners: [
      { placing: "Grand Champion Commercial Ewe", exhibitor: "Kaden Derrer", bredBy: "Camp Creek" },
      { placing: "Reserve Champion Commercial Ewe", exhibitor: "Landrie Sutton", bredBy: "Beatty" },
      { placing: "3rd Overall Commercial Ewe", exhibitor: "Kayla Pittman", bredBy: "Chapman" },
      { placing: "4th Overall Commercial Ewe", exhibitor: "Carson Nahrup", bredBy: "TKM" },
    ],
    classResults: [
      { className: "Class 1", placing: "1st", exhibitor: "Wyatt Nixon", bredBy: "JFSS" },
      { className: "Class 1", placing: "2nd", exhibitor: "Kylie Jones", bredBy: "Triple D" },
      { className: "Class 2", placing: "1st", exhibitor: "Emery Yoho", bredBy: "Silver Smith" },
      { className: "Class 2", placing: "2nd", exhibitor: "Mason Cole", bredBy: "Stone" },
      { className: "Class 3", placing: "1st", exhibitor: "Hailey Fox", bredBy: "Beatty" },
      { className: "Class 3", placing: "2nd", exhibitor: "Tanner Lee", bredBy: "Pine Creek" },
    ],
  },
  {
    id: "arizona-nationals",
    showName: "Arizona Nationals Market Lamb Show",
    date: "Dec. 3, 2025",
    location: "Phoenix, AZ",
    judge: "Scott Greiner",
    overallWinners: [
      { placing: "Grand Champion Market Lamb", exhibitor: "Maci Zerbach", bredBy: "Stone Show Stock" },
      { placing: "Reserve Champion Market Lamb", exhibitor: "Karson Neuse", bredBy: "Beatty" },
    ],
    classResults: [
      { className: "Class 1", placing: "1st", exhibitor: "Braden Wells", bredBy: "Camp Creek" },
      { className: "Class 1", placing: "2nd", exhibitor: "Addison Yates", bredBy: "JFSS" },
    ],
  },
];

const INITIAL_CLASSES = 4;

function ShowBlock({ block }: { block: ShowResultBlock }) {
  const [expanded, setExpanded] = useState(false);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const visibleClasses = showAllClasses ? block.classResults : block.classResults.slice(0, INITIAL_CLASSES);

  return (
    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
      {/* Show header */}
      <h3 className="text-[15px] font-bold text-foreground leading-snug">{block.showName}</h3>
      <p className="text-[12px] text-muted-foreground mt-0.5">
        {block.date} • {block.location} • Judge: {block.judge}
      </p>

      {/* Overall winners */}
      <div className="mt-3 space-y-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Overall Winners</p>
        {block.overallWinners.map((w, i) => (
          <div key={i} className="py-1">
            <p className="text-[13px] font-semibold text-foreground leading-tight">{w.placing}</p>
            <p className="text-[12px] text-muted-foreground">{w.exhibitor} • Bred by {w.bredBy}</p>
          </div>
        ))}
      </div>

      {/* Collapsible class results */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[12px] font-semibold text-primary"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          Class Results ({block.classResults.length})
        </button>

        {expanded && (
          <div className="mt-2 space-y-0.5">
            {visibleClasses.map((c, i) => (
              <div key={i} className="flex items-baseline gap-2 py-0.5">
                <span className="text-[11px] text-muted-foreground font-medium shrink-0 w-14">{c.className}</span>
                <span className="text-[12px] text-muted-foreground shrink-0 w-6">{c.placing}</span>
                <span className="text-[12px] text-foreground">{c.exhibitor}</span>
                <span className="text-[11px] text-muted-foreground">• {c.bredBy}</span>
              </div>
            ))}
            {!showAllClasses && block.classResults.length > INITIAL_CLASSES && (
              <button
                onClick={() => setShowAllClasses(true)}
                className="text-[12px] font-semibold text-primary mt-1"
              >
                Show More Classes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WinnersPage() {
  const [activeView, setActiveView] = useState("All Results");

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl pb-24">
        {/* ─── Header ─── */}
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

        {/* ─── Section 1: LIVE ─── */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              LIVE
            </span>
            <span className="text-[12px] text-muted-foreground">American Royal</span>
          </div>

          <div className="space-y-0">
            {liveUpdates.map((u) => (
              <div
                key={u.id}
                className="flex items-start justify-between py-2 border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-[13px] mt-px">🏆</span>
                  <p className="text-[13px] text-foreground leading-snug">{u.text}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 ml-3">{u.time}</span>
              </div>
            ))}
          </div>

          <button className="mt-2 mb-1 text-[12px] font-semibold text-primary">
            View All Live Updates →
          </button>
        </div>

        {/* ─── Divider ─── */}
        <div className="h-2 bg-muted/30 mt-3" />

        {/* ─── Section 2: Official Results ─── */}
        <div className="px-4 pt-4">
          <h2 className="text-[15px] font-bold text-foreground mb-3">Official Results</h2>

          {/* Filters row */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <FilterChip label="Show" />
            <FilterChip label="Year" />
            <FilterChip label="Breed" />
            <button className="flex items-center gap-1 shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[12px] font-semibold text-primary">
              <Bookmark className="w-3 h-3" />
              Save View
            </button>
          </div>

          {/* Saved view pills */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {savedViews.map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  activeView === v
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Result blocks grouped by show */}
          <div className="space-y-5">
            {mockResults.map((block) => (
              <ShowBlock key={block.id} block={block} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 shrink-0 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
      {label}
      <ChevronDown className="w-3 h-3" />
    </button>
  );
}
