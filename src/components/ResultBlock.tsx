import React from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { ExhibitorPicker } from "@/components/ExhibitorPicker";
import { cn } from "@/lib/utils";

export interface ResultData {
  id: string;
  showName: string;
  showId: string | null;
  showDate: string; // YYYY-MM-DD or "" (optional)
  winPlacing: string;
  shownBy: string;
  placedBy: string;
  bredBy: string;
  sireName: string;
  sireId: string | null;
  damName: string;
}

interface ResultBlockProps {
  result: ResultData;
  index: number;
  total: number;
  onChange: (updated: ResultData) => void;
  onRemove: () => void;
  defaultExpanded?: boolean;
}

export function ResultBlock({ result, index, total, onChange, onRemove, defaultExpanded = true }: ResultBlockProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const summary = result.winPlacing || result.showName || `Result ${index + 1}`;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-foreground truncate">{summary}</span>
        </div>
        <div className="flex items-center gap-1">
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-6 h-6 rounded-full hover:bg-destructive/10 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Fields — sire/dam removed for speed, captured post-submission */}
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-border pt-2.5">
          <AutocompleteInput
            table="shows"
            placeholder="Show name *"
            value={result.showName}
            onChange={(display, id) => onChange({ ...result, showName: display, showId: id })}
          />
          <Input
            placeholder="Placing (e.g., Grand Champion)"
            value={result.winPlacing}
            onChange={(e) => onChange({ ...result, winPlacing: e.target.value })}
            className="rounded-xl bg-card border-border h-11 text-sm"
          />
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
              Show date <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span>
            </label>
            <Input
              type="month"
              value={result.showDate ? result.showDate.slice(0, 7) : ""}
              max={new Date().toISOString().slice(0, 7)}
              onChange={(e) => onChange({ ...result, showDate: e.target.value ? `${e.target.value}-01` : "" })}
              className="rounded-xl bg-card border-border h-11 text-sm"
            />
          </div>
          <ExhibitorPicker
            value={result.shownBy}
            onChange={(name) => onChange({ ...result, shownBy: name })}
          />
          <AutocompleteInput
            table="breeders_lookup"
            placeholder="Placed by"
            value={result.placedBy}
            onChange={(display) => onChange({ ...result, placedBy: display })}
          />
          <AutocompleteInput
            table="breeders_lookup"
            placeholder="Bred by"
            value={result.bredBy}
            onChange={(display) => onChange({ ...result, bredBy: display })}
          />
        </div>
      )}
    </div>
  );
}

export function createEmptyResult(): ResultData {
  return {
    id: crypto.randomUUID(),
    showName: "",
    showId: null,
    winPlacing: "",
    shownBy: "",
    placedBy: "",
    bredBy: "",
    sireName: "",
    sireId: null,
    damName: "",
  };
}
