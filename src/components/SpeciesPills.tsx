export const SPECIES_OPTIONS = ["All", "Cattle", "Sheep", "Goats", "Pigs"] as const;
export type SpeciesPill = (typeof SPECIES_OPTIONS)[number];

interface SpeciesPillsProps {
  value: SpeciesPill;
  onChange: (v: SpeciesPill) => void;
  className?: string;
}

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
            className={`h-8 shrink-0 rounded-full px-3.5 text-[12px] font-semibold leading-none transition-colors border ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-primary border-primary"
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
