import { useState } from "react";

const sortOptions = ["Recent", "Trending"] as const;
const categoryOptions = ["All", "For Sale", "Private Treaty", "Sale Preview", "Repo"] as const;

type SortOption = typeof sortOptions[number];
type CategoryOption = typeof categoryOptions[number];

interface FilterRowProps {
  activeSort: SortOption;
  activeCategory: CategoryOption;
  onSortChange: (sort: SortOption) => void;
  onCategoryChange: (cat: CategoryOption) => void;
}

export function FilterRow({ activeSort, activeCategory, onSortChange, onCategoryChange }: FilterRowProps) {
  return (
    <div className="sticky top-[44px] lg:top-0 z-30 bg-background" style={{ padding: '12px 12px 0' }}>
      <div className="flex items-center justify-between gap-8">
        {/* Left: Sort segmented control */}
        <div
          className="flex shrink-0 border border-border"
          style={{ borderRadius: '6px', height: '36px', overflow: 'hidden' }}
        >
          {sortOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => onSortChange(opt)}
              className={`font-bold transition-all ${
                activeSort === opt
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-foreground hover:bg-muted"
              }`}
              style={{ fontSize: '12px', lineHeight: '16px', height: '36px', padding: '0 14px' }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Right: Category pills */}
        <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: '6px' }}>
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`shrink-0 font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground border border-border hover:border-foreground/40"
              }`}
              style={{ borderRadius: '20px', fontSize: '11px', lineHeight: '14px', height: '28px', padding: '0 10px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { SortOption, CategoryOption };
export { sortOptions, categoryOptions };
