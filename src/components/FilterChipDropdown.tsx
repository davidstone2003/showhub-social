import { useState, type ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  label: string;                  // e.g. "Year"
  value: string;                  // currently displayed value, e.g. "2026"
  options: string[];              // includes the "All X" sentinel as first item
  defaultOption: string;          // sentinel that means cleared, e.g. "All Years"
  onChange: (v: string) => void;
  align?: "start" | "end" | "center";
  width?: number;
  renderOption?: (opt: string) => ReactNode;
}

export function FilterChipDropdown({
  label,
  value,
  options,
  defaultOption,
  onChange,
  align = "start",
  width = 220,
  renderOption,
}: Props) {
  const [open, setOpen] = useState(false);
  const active = value !== defaultOption;
  const display = active ? value : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 h-8 border text-[12px] font-semibold transition-colors"
          style={
            active
              ? { backgroundColor: "#FFF8E7", color: "#8B6914", borderColor: "#C9A84C" }
              : { backgroundColor: "#FFFFFF", color: "#0A1628", borderColor: "#E5E7EB" }
          }
          aria-label={`Filter by ${label}`}
        >
          <span className="truncate max-w-[140px]">{display}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="p-1 max-h-[60vh] overflow-y-auto"
        style={{ width }}
      >
        {active && (
          <button
            onClick={() => { onChange(defaultOption); setOpen(false); }}
            className="w-full text-left rounded-md px-2.5 py-2 text-[12px] font-bold hover:bg-[#F8F7F4]"
            style={{ color: "#C9A84C" }}
          >
            Clear
          </button>
        )}
        {options.map((opt) => {
          const isActive = opt === value;
          return (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[#F8F7F4] transition-colors"
            >
              <span className="text-[13px] font-medium text-[#0A1628] truncate">
                {renderOption ? renderOption(opt) : opt}
              </span>
              {isActive && <Check className="w-4 h-4 shrink-0" style={{ color: "#C9A84C" }} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
