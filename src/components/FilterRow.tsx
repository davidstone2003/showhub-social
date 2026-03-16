import { filterCategories } from "@/data/mock";

interface FilterRowProps {
  active: string;
  onSelect: (filter: string) => void;
}

export function FilterRow({ active, onSelect }: FilterRowProps) {
  return (
    <div className="sticky top-[52px] lg:top-0 z-30 bg-card border-b border-border">
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
              active === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-pill text-pill-text hover:bg-pill/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
