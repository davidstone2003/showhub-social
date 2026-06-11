export const SPECIES_OPTIONS = ["All", "Sheep", "Goats", "Cattle", "Pigs"] as const;
export type SpeciesPill = (typeof SPECIES_OPTIONS)[number];

interface SpeciesPillsProps {
  value: SpeciesPill;
  onChange: (v: SpeciesPill) => void;
  className?: string;
}

/**
 * Standard species filter row used across directory/feed pages.
 * Pills: All · Sheep · Goats · Cattle · Pigs
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
            className={`h-7 shrink-0 rounded-full px-3 text-[11px] font-semibold leading-[14px] transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-transparent text-muted-foreground hover:border-foreground/40"
            }`}
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
