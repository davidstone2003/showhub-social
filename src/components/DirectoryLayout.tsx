import { ReactNode } from "react";
import { Search } from "lucide-react";
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

          {/* Native select filters (max 2) */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.slice(0, 2).map((f) => (
                <select
                  key={f.label}
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  className="h-8 px-3 text-xs font-medium bg-muted text-foreground border-none rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "28px",
                  }}
                >
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
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
