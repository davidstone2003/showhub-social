import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Layout } from "@/components/Layout";

const speciesOptions = ["All", "Sheep", "Goats", "Cattle", "Pigs"] as const;
export type Species = (typeof speciesOptions)[number];

export interface FilterDropdown {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}

interface DirectoryLayoutProps {
  title: string;
  description: string;
  searchPlaceholder: string;
  search: string;
  onSearchChange: (v: string) => void;
  species: Species;
  onSpeciesChange: (v: Species) => void;
  filters?: FilterDropdown[];
  resultCount: number;
  resultLabel?: string;
  children: ReactNode;
}

function FilterMenu({
  filter,
  open,
  onOpenChange,
  onClose,
}: {
  filter: FilterDropdown;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = filter.options.find((option) => option.value === filter.value)?.label ?? filter.label;

  const stableClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      const target = "touches" in e ? (e as TouchEvent).target : (e as MouseEvent).target;
      if (rootRef.current && !rootRef.current.contains(target as Node)) {
        stableClose();
      }
    };

    const raf = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleDown, true);
      document.addEventListener("touchstart", handleDown, true);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousedown", handleDown, true);
      document.removeEventListener("touchstart", handleDown, true);
    };
  }, [open, stableClose]);

  useEffect(() => {
    if (!open) return;
    const close = () => stableClose();
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open, stableClose]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`h-8 rounded-full px-3 text-[11px] font-medium transition-colors focus:outline-none border ${
          open
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-background text-foreground hover:bg-muted/50"
        }`}
      >
        <span className="flex items-center gap-1">
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[150px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          {filter.options.map((option) => {
            const isSelected = option.value === filter.value;
            return (
              <button
                key={option.value}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  filter.onChange(option.value);
                  stableClose();
                }}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-[12px] transition-colors ${
                  isSelected
                    ? "bg-[#EFF6FF] font-semibold text-primary"
                    : "text-[#111827] hover:bg-[#F3F4F6]"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DirectoryLayout({
  title,
  description,
  searchPlaceholder,
  search,
  onSearchChange,
  species,
  onSpeciesChange,
  filters = [],
  resultCount,
  resultLabel = "result",
  children,
}: DirectoryLayoutProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-5xl px-3 pb-24 lg:px-6">
        <div className="pb-2 pt-4">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="sticky top-[44px] z-30 space-y-2 bg-background pb-2 lg:top-0">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {speciesOptions.map((option) => (
              <button
                key={option}
                onClick={() => onSpeciesChange(option)}
                className={`h-7 shrink-0 rounded-full px-3 text-[11px] font-semibold leading-[14px] transition-colors ${
                  species === option
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-transparent text-muted-foreground hover:border-foreground/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-full border-none bg-muted pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.slice(0, 2).map((filter) => (
                <FilterMenu
                  key={filter.label}
                  filter={filter}
                  open={openFilter === filter.label}
                  onOpenChange={(next) => setOpenFilter(next ? filter.label : null)}
                  onClose={() => setOpenFilter((current) => (current === filter.label ? null : current))}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mb-2 mt-1 text-[11px] text-muted-foreground">
          {resultCount} {resultLabel}
          {resultCount !== 1 ? "s" : ""}
        </p>

        {children}
      </div>
    </Layout>
  );
}
