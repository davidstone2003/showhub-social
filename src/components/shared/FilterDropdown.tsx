import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface FilterDropdownProps {
  label: string;
  value: string;
  defaultValue?: string;
  options: string[];
  onChange: (v: string) => void;
}

/**
 * Shared filter dropdown pill. Inactive = white pill with primary text.
 * Active (non-default) = solid primary, white text. Checkmark = gold.
 */
export function FilterDropdown({ label, value, defaultValue, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = defaultValue ? value !== defaultValue : false;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[12px] font-semibold transition-colors ${
          isActive
            ? "bg-primary text-white border-primary"
            : "bg-white text-[#6B7280] border-[#E5E7EB]"
        }`}
      >
        <span className="truncate">{isActive ? value : label}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xl z-40 overflow-hidden"
          style={{ minWidth: 160, maxHeight: 280, overflowY: "auto" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F8F7F4] transition-colors"
              style={{ borderBottom: "1px solid #F3F4F6" }}
            >
              <span className="text-[13px] font-medium text-primary truncate">{opt}</span>
              {value === opt && (
                <Check className="w-3.5 h-3.5 shrink-0 ml-2" style={{ color: "hsl(var(--gold))" }} strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
