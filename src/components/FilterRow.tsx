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
            className={`shrink-0 font-bold transition-all ${
              active === cat
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-foreground border border-border hover:border-foreground/40"
            }`}
            style={{ borderRadius: '4px', fontSize: '12px', lineHeight: '16px', height: '36px', padding: '0 12px' }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
