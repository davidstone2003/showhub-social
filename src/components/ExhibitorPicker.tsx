import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { User, Users, Plus } from "lucide-react";

interface SavedExhibitor {
  exhibitorId: string;
  name: string;
  label: string;
  useCount: number;
}

interface ExhibitorPickerProps {
  value: string;
  onChange: (name: string) => void;
}

const labelConfig: Record<string, { icon: typeof User; color: string }> = {
  me: { icon: User, color: "bg-primary/10 text-primary border-primary/30" },
  kid: { icon: Users, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  family: { icon: Users, color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  other: { icon: User, color: "bg-muted text-muted-foreground border-border" },
};

export function ExhibitorPicker({ value, onChange }: ExhibitorPickerProps) {
  const { user, profile } = useAuth();
  const [saved, setSaved] = useState<SavedExhibitor[]>([]);
  const [mode, setMode] = useState<"chips" | "input">("chips");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("user_exhibitors")
        .select("exhibitor_id, label, use_count, exhibitors(name)")
        .eq("user_id", user.id)
        .order("use_count", { ascending: false })
        .limit(10);

      if (data) {
        setSaved(
          data.map((d: any) => ({
            exhibitorId: d.exhibitor_id,
            name: d.exhibitors?.name || "",
            label: d.label,
            useCount: d.use_count,
          }))
        );
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  if (!user || !loaded) {
    return (
      <input
        type="text"
        placeholder="Shown by *"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    );
  }

  const meDisplayName = profile?.display_name || profile?.first_name || "";

  // Check if "Me" is already saved
  const hasMeSaved = saved.some((s) => s.label === "me");
  const kidsAndFamily = saved.filter((s) => s.label === "kid" || s.label === "family");
  const others = saved.filter((s) => s.label === "other");

  if (mode === "input") {
    return (
      <div className="space-y-1.5">
        <input
          type="text"
          placeholder="Shown by *"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {(saved.length > 0 || meDisplayName) && (
          <button
            type="button"
            onClick={() => setMode("chips")}
            className="text-xs text-primary hover:underline"
          >
            ← Show saved exhibitors
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Who showed? *</p>
      <div className="flex flex-wrap gap-1.5">
        {/* Me chip */}
        {meDisplayName && (
          <button
            type="button"
            onClick={() => onChange(meDisplayName)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
              value === meDisplayName
                ? "bg-primary text-primary-foreground border-primary"
                : labelConfig.me.color
            )}
          >
            <User className="w-3 h-3" />
            Me
          </button>
        )}

        {/* Saved kids/family */}
        {kidsAndFamily.map((s) => {
          const cfg = labelConfig[s.label] || labelConfig.other;
          return (
            <button
              key={s.exhibitorId}
              type="button"
              onClick={() => onChange(s.name)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
                value === s.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : cfg.color
              )}
            >
              <cfg.icon className="w-3 h-3" />
              {s.name}
            </button>
          );
        })}

        {/* Recent others (show top 3) */}
        {others.slice(0, 3).map((s) => (
          <button
            key={s.exhibitorId}
            type="button"
            onClick={() => onChange(s.name)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
              value === s.name
                ? "bg-primary text-primary-foreground border-primary"
                : labelConfig.other.color
            )}
          >
            {s.name}
          </button>
        ))}

        {/* Someone else */}
        <button
          type="button"
          onClick={() => setMode("input")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          <Plus className="w-3 h-3" />
          Other
        </button>
      </div>

      {/* Show current selection */}
      {value && (
        <p className="text-xs text-foreground mt-1">
          Shown by: <span className="font-semibold">{value}</span>
        </p>
      )}
    </div>
  );
}
