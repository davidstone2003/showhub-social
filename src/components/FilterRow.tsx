import { filterCategories } from "@/data/mock";

interface FilterRowProps {
  active: string;
  onSelect: (filter: string) => void;
}

export function FilterRow({ active, onSelect }: FilterRowProps) {
  return (
    <div className="sticky top-[44px] lg:top-0 z-30 bg-background border-b border-border">
      <div className="flex gap-2 px-3 py-1.5 overflow-x-auto scrollbar-hide" style={{ height: '32px', alignItems: 'center' }}>
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 px-3 py-0.5 text-[12px] font-bold transition-all ${
              active === cat
                ? "bg-foreground text-background shadow-sm"
                : "bg-transparent text-foreground border border-foreground/30 hover:border-foreground/60"
            }`}
            style={{ borderRadius: '4px', lineHeight: '16px' }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
