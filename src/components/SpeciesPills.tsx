export const SPECIES_OPTIONS = ["All", "Cattle", "Sheep", "Goats", "Pigs"] as const;
export type SpeciesPill = (typeof SPECIES_OPTIONS)[number];

interface SpeciesPillsProps {
  value: SpeciesPill;
  onChange: (v: SpeciesPill) => void;
  className?: string;
  appMode?: boolean;
}

export function SpeciesPills({ value, onChange, className = "", appMode = false }: SpeciesPillsProps) {
  return (
    <div
      className={`flex gap-1.5 overflow-x-auto scrollbar-hide ${className}`}
      role="tablist"
      aria-label="Filter by species"
    >
      {SPECIES_OPTIONS.map((option) => {
        const active = value === option;
        const style = appMode
          ? active
            ? { backgroundColor: "#C9A84C", color: "#0A1628", border: "1px solid #C9A84C" }
            : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid transparent" }
          : active
            ? { backgroundColor: "#1B3A6B", color: "#FFFFFF", border: "1px solid #1B3A6B" }
            : { backgroundColor: "#FFFFFF", color: "#1B3A6B", border: "1px solid #1B3A6B" };
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className="h-8 shrink-0 rounded-full px-3.5 text-[12px] font-semibold leading-none transition-colors"
            style={style}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

const SPECIES_KEYWORDS: Record<Exclude<SpeciesPill, "All">, string[]> = {
  Sheep: ["sheep", "lamb", "ewe", "ram", "wether"],
  Goats: ["goat", "doe", "buck", "wether goat", "boer"],
  Cattle: ["cattle", "steer", "heifer", "bull", "cow"],
  Pigs: ["pig", "hog", "barrow", "gilt", "swine"],
};

export function matchesSpecies(species: SpeciesPill, ...fields: (string | null | undefined)[]) {
  if (species === "All") return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return SPECIES_KEYWORDS[species].some((k) => haystack.includes(k));
}
