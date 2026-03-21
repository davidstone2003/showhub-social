import { ReactNode, useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useIsMobile } from "@/hooks/use-mobile";

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

function DesktopDropdown({ filter }: { filter: FilterDropdown }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [btnWidth, setBtnWidth] = useState(0);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (btnRef.current) setBtnWidth(btnRef.current.offsetWidth);
  });

  const selectedLabel = filter.options.find((o) => o.value === filter.value)?.label ?? filter.label;

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="h-7 px-2.5 text-[11px] font-medium bg-muted text-foreground rounded-full flex items-center gap-1 hover:bg-muted/80 transition-colors"
      >
        {selectedLabel}
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 bg-card border border-border rounded-[14px] shadow-sm z-50 py-0.5 animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden"
          style={{ marginTop: "3px", width: Math.max(btnWidth, 120) }}
        >
          {filter.options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => { filter.onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 text-[11px] flex items-center justify-between hover:bg-muted/50 transition-colors ${
                filter.value === opt.value ? "font-bold text-foreground bg-muted/30" : "text-muted-foreground"
              } ${i > 0 ? "border-t border-border/30" : ""}`}
            >
              <span className="truncate">{opt.label}</span>
              {filter.value === opt.value && <Check className="w-3 h-3 text-primary shrink-0 ml-1" />}
            </button>
          ))}
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
  const isMobile = useIsMobile();

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-5xl mx-auto px-3 lg:px-6 pb-24">
        {/* Header */}
        <div className="pt-4 pb-2">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        {/* Sticky filters */}
        <div className="sticky top-[44px] lg:top-0 z-30 bg-background pb-2 space-y-2">
          {/* Species pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {speciesOptions.map((s) => (
              <button
                key={s}
                onClick={() => onSpeciesChange(s)}
                className={`shrink-0 font-semibold transition-colors text-[11px] leading-[14px] h-7 px-3 rounded-full ${
                  species === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground border border-border hover:border-foreground/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-muted border-none rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.slice(0, 2).map((f) =>
                isMobile ? (
                  <select
                    key={f.label}
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="h-7 px-2.5 text-[11px] font-medium bg-muted text-foreground border-none rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                      paddingRight: "22px",
                    }}
                  >
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <DesktopDropdown key={f.label} filter={f} />
                )
              )}
            </div>
          )}
        </div>

        {/* Result count */}
        <p className="text-[11px] text-muted-foreground mb-2 mt-1">
          {resultCount} {resultLabel}{resultCount !== 1 ? "s" : ""}
        </p>

        {/* Content */}
        {children}
      </div>
    </Layout>
  );
}
