import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ClassResult {
  placing: string;
  exhibitor: string;
  breeder: string | null;
}

export function ClassResults({ results }: { results: ClassResult[] }) {
  const [open, setOpen] = useState(false);

  if (results.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[15px] font-semibold text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Class Results ({results.length})
      </button>

      {open && (
        <div className="mt-3 space-y-1.5 pl-1">
          {results.map((c, i) => (
            <div key={i} className="flex items-baseline gap-2 py-0.5">
              <span className="text-[14px] text-foreground font-medium">{c.placing}</span>
              <span className="text-[13px] text-muted-foreground">
                {c.exhibitor}
                {c.breeder && ` • ${c.breeder}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
