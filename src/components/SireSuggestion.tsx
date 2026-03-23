import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { Button } from "@/components/ui/button";
import { Check, Pencil, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface WinnerRef {
  winnerId: string;
  showName: string;
  shownBy: string;
  showId: string | null;
}

interface SireSuggestionProps {
  winners: WinnerRef[];
  postedAsBreederId: string | null;
  onComplete: () => void;
}

export function SireSuggestion({ winners, postedAsBreederId, onComplete }: SireSuggestionProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sireName, setSireName] = useState("");
  const [sireId, setSireId] = useState<string | null>(null);
  const [damName, setDamName] = useState("");
  const [editing, setEditing] = useState(false);
  const [suggestion, setSuggestion] = useState<{ sireName: string; sireId: string | null; damName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const current = winners[currentIndex];

  // Look up context for suggestion
  useEffect(() => {
    if (!user || !current) { setLoading(false); return; }
    
    const lookup = async () => {
      setLoading(true);
      // Check exhibitor_animal_context for matching exhibitor + show
      const { data } = await supabase
        .from("exhibitor_animal_context")
        .select("sire_name, sire_id, dam_name, use_count")
        .eq("user_id", user.id)
        .ilike("exhibitor_name", current.shownBy)
        .order("use_count", { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].sire_name) {
        const ctx = data[0];
        setSuggestion({ sireName: ctx.sire_name, sireId: ctx.sire_id, damName: ctx.dam_name || "" });
        setSireName(ctx.sire_name);
        setSireId(ctx.sire_id);
        setDamName(ctx.dam_name || "");
      } else {
        setSuggestion(null);
        setSireName("");
        setSireId(null);
        setDamName("");
      }
      setEditing(false);
      setLoading(false);
    };
    lookup();
  }, [user, currentIndex]);

  const handleConfirm = async () => {
    if (!current || !sireName.trim()) return;

    // Resolve sire ID
    let resolvedSireId = sireId;
    if (sireName.trim() && !resolvedSireId) {
      const { data: existing } = await supabase
        .from("sires_lookup")
        .select("id")
        .ilike("name", sireName.trim())
        .limit(1);
      if (existing && existing.length > 0) {
        resolvedSireId = existing[0].id;
      } else {
        const { data: inserted } = await supabase
          .from("sires_lookup")
          .insert({ name: sireName.trim() })
          .select("id")
          .single();
        resolvedSireId = inserted?.id || null;
      }
    }

    // Update the winner card
    await (supabase.from("winners") as any)
      .update({
        sired_by: sireName.trim() || null,
        sire_id: resolvedSireId,
        dam: damName.trim() || null,
      })
      .eq("id", current.winnerId);

    // Save to context memory
    if (user) {
      const { data: existingCtx } = await supabase
        .from("exhibitor_animal_context")
        .select("id, use_count")
        .eq("user_id", user.id)
        .ilike("exhibitor_name", current.shownBy)
        .limit(1);

      if (existingCtx && existingCtx.length > 0) {
        await supabase
          .from("exhibitor_animal_context")
          .update({
            sire_name: sireName.trim(),
            sire_id: resolvedSireId,
            dam_name: damName.trim() || null,
            show_name: current.showName,
            show_id: current.showId,
            breeder_id: postedAsBreederId,
            use_count: existingCtx[0].use_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", existingCtx[0].id);
      } else {
        await supabase.from("exhibitor_animal_context").insert({
          user_id: user.id,
          exhibitor_name: current.shownBy,
          sire_name: sireName.trim(),
          sire_id: resolvedSireId,
          dam_name: damName.trim() || null,
          show_name: current.showName,
          show_id: current.showId,
          breeder_id: postedAsBreederId,
        });
      }
    }

    toast.success("Sire saved");
    moveNext();
  };

  const handleSkip = () => {
    moveNext();
  };

  const moveNext = () => {
    if (currentIndex < winners.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!current) { onComplete(); return null; }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Add Sire Info {winners.length > 1 ? `(${currentIndex + 1}/${winners.length})` : ""}
        </p>
        <p className="text-sm text-foreground">
          <span className="font-semibold">{current.shownBy}</span> at {current.showName}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suggestion && !editing ? (
        /* Show suggestion with confirm/edit/skip */
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Suggested sire</p>
            <p className="text-base font-bold text-foreground">{suggestion.sireName}</p>
            {suggestion.damName && (
              <p className="text-xs text-muted-foreground mt-0.5">Dam: {suggestion.damName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1 h-10 rounded-xl gap-1.5 text-sm font-semibold">
              <Check className="w-4 h-4" /> Confirm
            </Button>
            <Button variant="outline" onClick={() => setEditing(true)} className="h-10 rounded-xl gap-1.5 text-sm">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button variant="ghost" onClick={handleSkip} className="h-10 rounded-xl gap-1.5 text-sm text-muted-foreground">
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </Button>
          </div>
        </div>
      ) : (
        /* Manual entry */
        <div className="space-y-2.5">
          <AutocompleteInput
            table="sires_lookup"
            placeholder="Sire name"
            value={sireName}
            onChange={(display, id) => { setSireName(display); setSireId(id); }}
          />
          <input
            type="text"
            placeholder="Dam (optional)"
            value={damName}
            onChange={(e) => setDamName(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={!sireName.trim()}
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm font-semibold"
            >
              <Check className="w-4 h-4" /> Save
            </Button>
            <Button variant="ghost" onClick={handleSkip} className="h-10 rounded-xl gap-1.5 text-sm text-muted-foreground">
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
