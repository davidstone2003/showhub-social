import { useState, ReactNode } from "react";
import { ChevronDown, Check, SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface FilterSpec {
  key: string;
  label: string;
  value: string;
  options: string[];
  /** value that means "no filter". Defaults to options[0] */
  allValue?: string;
  onChange: (v: string) => void;
}

interface Props {
  filters: FilterSpec[];
  onClearAll: () => void;
  triggerClassName?: string;
  /** Optional trailing content rendered above the Clear All row (e.g. a custom toggle). */
  extra?: ReactNode;
}

export function FiltersPopover({ filters, onClearAll, triggerClassName, extra }: Props) {
  const [open, setOpen] = useState(false);
  const activeCount = filters.reduce((n, f) => {
    const allV = f.allValue ?? f.options[0];
    return n + (f.value !== allV ? 1 : 0);
  }, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 rounded-full px-3 h-8 border text-[12px] font-semibold transition-colors shrink-0 ${triggerClassName ?? ""}`}
          style={{
            backgroundColor: "#FFFFFF",
            color: "#0A1628",
            borderColor: activeCount > 0 ? "#C9A84C" : "#E5E7EB",
          }}
          aria-label="Open filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <span
              className="ml-0.5 inline-flex items-center justify-center text-[10px] font-black rounded-full px-1.5 h-4"
              style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
            >
              {activeCount}
            </span>
          )}
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-72 p-3">
        <div className="space-y-3">
          {filters.map(f => (
            <FilterSelect key={f.key} spec={f} />
          ))}
          {extra}
          <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => { onClearAll(); }}
              className="text-[12px] font-bold"
              style={{ color: "#C9A84C" }}
              disabled={activeCount === 0}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[12px] font-bold rounded-full px-3 h-7"
              style={{ backgroundColor: "#0A1628", color: "#FFFFFF" }}
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterSelect({ spec }: { spec: FilterSpec }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6B7280" }}>
        {spec.label}
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between rounded-lg border px-3 h-9 text-[13px] font-medium"
            style={{ borderColor: "#E5E7EB", color: "#0A1628", backgroundColor: "#FFFFFF" }}
          >
            <span className="truncate">{spec.value}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={4} className="w-64 p-1 max-h-64 overflow-y-auto">
          {spec.options.map(opt => {
            const active = opt === spec.value;
            return (
              <button
                key={opt}
                onClick={() => { spec.onChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[#F8F7F4]"
              >
                <span className="text-[13px] text-[#0A1628] truncate">{opt}</span>
                {active && <Check className="w-4 h-4 shrink-0" style={{ color: "#C9A84C" }} />}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1 rounded-full pl-3 pr-1 h-7 text-[12px] font-semibold"
      style={{ backgroundColor: "#FFF8E7", color: "#8B6914", border: "1px solid rgba(201,168,76,0.35)" }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[rgba(201,168,76,0.18)]"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
