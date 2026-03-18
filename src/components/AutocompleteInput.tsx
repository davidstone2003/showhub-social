import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type TableName = "shows" | "sires_lookup" | "breeders_lookup";

interface AutocompleteResult {
  id: string;
  name: string;
}

interface AutocompleteInputProps {
  table: TableName;
  placeholder: string;
  value: string;
  onChange: (display: string, id: string | null) => void;
  className?: string;
}

export function AutocompleteInput({
  table,
  placeholder,
  value,
  onChange,
  className,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value || value.length < 1) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from(table)
        .select("id, name")
        .ilike("name", `%${value}%`)
        .limit(8);
      setSuggestions((data as AutocompleteResult[]) || []);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [value, table]);

  const handleSelect = (item: AutocompleteResult) => {
    onChange(item.name, item.id);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value, null);
          setOpen(true);
        }}
        onFocus={() => value.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
