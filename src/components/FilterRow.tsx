import { filterCategories } from "@/data/mock";

interface FilterRowProps {
  active: string;
  onSelect: (filter: string) => void;
}

export function FilterRow({ active, onSelect }: FilterRowProps) {
  return (
    <div className="sticky top-[44px] lg:top-0 z-30 bg-background" style={{ paddingTop: '12px' }}>
      <div className="flex px-3 overflow-x-auto scrollbar-hide" style={{ height: '36px', alignItems: 'center', gap: '8px' }}>
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 px-3 text-[12px] font-bold transition-all ${
              active === cat
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground border border-white hover:border-foreground/60"
            }`}
            style={{ borderRadius: '4px', lineHeight: '16px', height: '36px' }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
