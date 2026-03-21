import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
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

function FilterMenu({ filter }: { filter: FilterDropdown }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const selectedLabel = filter.options.find((option) => option.value === filter.value)?.label ?? filter.label;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-7 rounded-full bg-muted px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className="flex items-center gap-1">
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-0.5 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-sm animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ width: triggerWidth }}
        >
          {filter.options.map((option, index) => {
            const isSelected = option.value === filter.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  filter.onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 text-[11px] transition-colors ${
                  isSelected
                    ? "bg-muted/50 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted/30"
                } ${index > 0 ? "border-t border-border/40" : ""}`}
              >
                <span className="truncate text-left">{option.label}</span>
                {isSelected ? <Check className="ml-1 h-3 w-3 shrink-0 text-primary" /> : null}
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
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {filters.slice(0, 2).map((filter) => (
                <FilterMenu key={filter.label} filter={filter} />
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
