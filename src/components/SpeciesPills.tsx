export const SPECIES_OPTIONS = ["All", "Sheep", "Goats", "Cattle", "Pigs"] as const;
export type SpeciesPill = (typeof SPECIES_OPTIONS)[number];

interface SpeciesPillsProps {
  value: SpeciesPill;
  onChange: (v: SpeciesPill) => void;
  className?: string;
}

/**
 * Standard species filter row used across every directory/feed page.
 * Order is locked: All · Sheep · Goats · Cattle · Pigs.
 *
 * Visual contract (do NOT diverge per-page):
 * - Active   → solid navy #1B3A6B fill, white text, no border
 * - Inactive → white fill, navy text, 1px navy border
 */
export function SpeciesPills({ value, onChange, className = "" }: SpeciesPillsProps) {
  return (
    <div
      className={`flex gap-1.5 overflow-x-auto scrollbar-hide ${className}`}
      role="tablist"
      aria-label="Filter by species"
    >
      {SPECIES_OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className="h-8 shrink-0 rounded-full px-3.5 text-[12px] font-semibold leading-none transition-colors"
            style={
              active
                ? { backgroundColor: "#1B3A6B", color: "#FFFFFF", border: "1px solid #1B3A6B" }
                : { backgroundColor: "#FFFFFF", color: "#1B3A6B", border: "1px solid #1B3A6B" }
            }
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
