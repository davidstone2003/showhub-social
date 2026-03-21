import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className="max-w-5xl mx-auto px-4 lg:px-6 pb-24">
        {/* Header */}
        <div className="pt-5 pb-3">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        {/* Sticky filters */}
        <div className="sticky top-[44px] lg:top-0 z-30 bg-background pb-3 space-y-2.5">
          {/* Species pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {speciesOptions.map((s) => (
              <button
                key={s}
                onClick={() => onSpeciesChange(s)}
                className={`shrink-0 font-semibold transition-all ${
                  species === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground border border-border hover:border-foreground/40"
                }`}
                style={{
                  borderRadius: "20px",
                  fontSize: "11px",
                  lineHeight: "14px",
                  height: "28px",
                  padding: "0 12px",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-card border-border rounded-lg text-sm"
            />
          </div>

          {/* Filter dropdowns (max 2) */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {filters.slice(0, 2).map((f) => (
                <Select key={f.label} value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs bg-card border-border rounded-full px-3 gap-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {f.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs text-muted-foreground mb-3">
          {resultCount} {resultLabel}{resultCount !== 1 ? "s" : ""}
        </p>

        {/* Content */}
        {children}
      </div>
    </Layout>
  );
}
