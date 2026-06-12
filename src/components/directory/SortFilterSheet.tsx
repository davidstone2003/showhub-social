import { useState } from "react";
import { X, Check } from "lucide-react";

export const SORT_OPTIONS = [
  { label: "Recently Active", value: "recent" },
  { label: "Most Championships", value: "championships" },
  { label: "Top Sale Price", value: "topsale" },
  { label: "Alphabetical", value: "alpha" },
  { label: "Newest to Platform", value: "newest" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const FILTER_TOGGLES = [
  { key: "myState", label: "My State First" },
  { key: "verified", label: "Verified Only" },
  { key: "available", label: "Lambs Available Now" },
  { key: "semen", label: "Semen Available" },
  { key: "highSales", label: "$10K+ Sales" },
] as const;

export type FilterKey = (typeof FILTER_TOGGLES)[number]["key"];
export type FilterState = Record<FilterKey, boolean>;

interface Props {
  open: boolean;
  onClose: () => void;
  sort: SortValue;
  onSortChange: (v: SortValue) => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}

export function SortFilterSheet({ open, onClose, sort, onSortChange, filters, onFiltersChange }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-3xl border-t border-white/10 bg-[#141E2E] p-5 pb-8 animate-slide-in-right"
        style={{ animation: "fade-in 0.2s ease-out" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Sort & Filter</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Sort By</p>
        <div className="mb-6 space-y-1">
          {SORT_OPTIONS.map((o) => {
            const active = sort === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onSortChange(o.value)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                  active ? "bg-[#C9A84C]/15 text-white" : "text-white/80 hover:bg-white/5"
                }`}
              >
                <span className="font-semibold">{o.label}</span>
                {active && <Check className="h-4 w-4 text-[#C9A84C]" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Filters</p>
        <div className="space-y-1">
          {FILTER_TOGGLES.map((f) => {
            const on = filters[f.key];
            return (
              <label
                key={f.key}
                className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"
              >
                <span className="font-semibold">{f.label}</span>
                <span
                  className={`relative h-6 w-10 rounded-full transition-colors ${on ? "bg-[#C9A84C]" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      on ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={(e) => onFiltersChange({ ...filters, [f.key]: e.target.checked })}
                />
              </label>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#C9A84C] py-3 text-sm font-bold text-black hover:bg-[#d4b558] transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export function useDirectoryFilters() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortValue>("recent");
  const [filters, setFilters] = useState<FilterState>({
    myState: false,
    verified: false,
    available: false,
    semen: false,
    highSales: false,
  });
  const activeCount = Object.values(filters).filter(Boolean).length;
  return { open, setOpen, sort, setSort, filters, setFilters, activeCount };
}
