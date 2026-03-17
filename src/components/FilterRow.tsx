import { filterCategories } from "@/data/mock";

interface FilterRowProps {
  active: string;
  onSelect: (filter: string) => void;
}

export function FilterRow({ active, onSelect }: FilterRowProps) {
  return (
    <div className="sticky top-[44px] lg:top-0 z-30 bg-background border-b border-border">
      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              active === cat
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
