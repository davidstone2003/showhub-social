import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

const COMMON_RESULTS = [
  "Grand Champion",
  "Reserve Grand Champion",
  "Champion",
  "Reserve Champion",
  "3rd Overall",
  "Top 5",
  "Top 10",
];

interface ResultPickerProps {
  value: string;
  onChange: (val: string) => void;
}

export function ResultPicker({ value, onChange }: ResultPickerProps) {
  const [showList, setShowList] = useState(false);
  const [custom, setCustom] = useState(false);

  const isCommon = COMMON_RESULTS.includes(value);

  if (custom || (value && !isCommon && value !== "")) {
    return (
      <div className="space-y-1.5">
        <Input
          placeholder="Result (e.g. Grand Champion Market Lamb)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl bg-card border-border h-12 text-sm"
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setCustom(false); setShowList(true); }}
          className="text-xs text-primary hover:underline"
        >
          ← Pick from common results
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setShowList(!showList)}
        className={cn(
          "flex items-center justify-between w-full h-12 rounded-xl border border-input bg-card px-4 text-sm transition-colors",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{value || "Result"}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showList && "rotate-180")} />
      </button>

      {showList && (
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {COMMON_RESULTS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { onChange(r); setShowList(false); }}
              className={cn(
                "w-full text-left px-4 py-3 text-sm transition-colors border-b border-border/50 last:border-0",
                value === r ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setCustom(true); setShowList(false); onChange(""); }}
            className="w-full text-left px-4 py-3 text-sm text-primary font-medium hover:bg-muted border-t border-border"
          >
            Other…
          </button>
        </div>
      )}
    </div>
  );
}
