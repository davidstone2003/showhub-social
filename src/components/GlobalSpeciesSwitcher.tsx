import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSpecies } from "@/contexts/SpeciesContext";
import type { SpeciesPill } from "@/components/SpeciesPills";

const OPTIONS: { value: SpeciesPill; label: string; emoji: string }[] = [
  { value: "All",    label: "All Species", emoji: "🌐" },
  { value: "Cattle", label: "Cattle",      emoji: "🐄" },
  { value: "Sheep",  label: "Sheep",       emoji: "🐑" },
  { value: "Goats",  label: "Goats",       emoji: "🐐" },
  { value: "Pigs",   label: "Pigs",        emoji: "🐖" },
];

interface Props {
  variant?: "header" | "sidebar";
}

export function GlobalSpeciesSwitcher({ variant = "header" }: Props) {
  const { species, setSpecies } = useSpecies();
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find(o => o.value === species) ?? OPTIONS[0];

  const isSidebar = variant === "sidebar";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 font-semibold transition-colors shrink-0"
          style={
            isSidebar
              ? {
                  height: 36,
                  padding: "0 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  width: "100%",
                  justifyContent: "space-between",
                }
              : {
                  height: 32,
                  padding: "0 8px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  background: "#FFFFFF",
                  color: "#0A1628",
                  fontSize: 12,
                }
          }
          aria-label="Change species"
        >
          <span className="flex items-center gap-1">
            <span aria-hidden>{current.emoji}</span>
            <span className="truncate max-w-[90px]">
              {current.value === "All" ? "All" : current.label}
            </span>
          </span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={isSidebar ? "start" : "end"} sideOffset={6} className="w-48 p-1">
        {OPTIONS.map(opt => {
          const active = opt.value === species;
          return (
            <button
              key={opt.value}
              onClick={() => { setSpecies(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[#F8F7F4] transition-colors"
            >
              <span className="flex items-center gap-2 text-[13px] font-medium text-[#0A1628]">
                <span aria-hidden>{opt.emoji}</span>
                {opt.label}
              </span>
              {active && <Check className="w-4 h-4" style={{ color: "#C9A84C" }} />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
