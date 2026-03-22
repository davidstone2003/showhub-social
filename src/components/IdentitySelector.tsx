import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Check, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Identity {
  type: "personal" | "breeder";
  id: string;
  name: string;
}

interface IdentitySelectorProps {
  value: string | null; // breeder_profile id or null for personal
  onChange: (breederProfileId: string | null) => void;
  postType?: string;
}

export function IdentitySelector({ value, onChange, postType }: IdentitySelectorProps) {
  const { user, profile } = useAuth();
  const [breederProfile, setBreederProfile] = useState<{
    id: string;
    breeder_name: string;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("breeder_profiles")
      .select("id, breeder_name")
      .eq("owner_user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBreederProfile(data[0]);
          // Default to breeder for winner/sire posts
          if (!loaded && (postType === "winner" || postType === "sire" || postType === "sale")) {
            onChange(data[0].id);
          }
        }
        setLoaded(true);
      });
  }, [user]);

  if (!breederProfile || !user) return null;

  const personalName = [
    (profile as any)?.first_name,
    (profile as any)?.last_name,
  ]
    .filter(Boolean)
    .join(" ") || profile?.display_name || profile?.username || "Me";

  const identities: Identity[] = [
    { type: "breeder", id: breederProfile.id, name: breederProfile.breeder_name },
    { type: "personal", id: "personal", name: personalName },
  ];

  const selected = value
    ? identities.find((i) => i.id === value) || identities[0]
    : identities.find((i) => i.type === "personal") || identities[1];

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
        Post as
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 h-12 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        {selected.type === "breeder" ? (
          <Building2 className="w-4 h-4 text-primary shrink-0" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="flex-1 text-left truncate">{selected.name}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 mt-1 z-50 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
            style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}
          >
            {identities.map((identity) => {
              const isSelected = identity.id === selected.id;
              return (
                <button
                  key={identity.id}
                  type="button"
                  onClick={() => {
                    onChange(identity.type === "breeder" ? identity.id : null);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-3 text-sm transition-colors",
                    isSelected ? "bg-[#EFF6FF] text-primary font-semibold" : "text-[#111827] hover:bg-[#F9FAFB]"
                  )}
                >
                  {identity.type === "breeder" ? (
                    <Building2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 shrink-0" />
                  )}
                  <span className="flex-1 text-left truncate">{identity.name}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
