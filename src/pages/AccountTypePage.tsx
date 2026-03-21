import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BackdropLogo } from "@/components/RinglyLogo";
import { toast } from "sonner";
import { Trophy, Eye, Store } from "lucide-react";

const accountTypes = [
  {
    id: "breeder",
    icon: Trophy,
    title: "Breeder",
    bullets: ["Post winners, sires, listings", "Build your program profile"],
  },
  {
    id: "exhibitor",
    icon: Eye,
    title: "User / Exhibitor",
    bullets: ["Follow breeders", "Like, comment, stay updated"],
  },
  {
    id: "vendor",
    icon: Store,
    title: "Vendor",
    bullets: ["Promote products and services"],
  },
] as const;

type AccountType = (typeof accountTypes)[number]["id"];

export default function AccountTypePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AccountType | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_type: selected })
        .eq("id", user.id);
      if (error) throw error;

      if (selected === "breeder") {
        navigate("/onboarding");
      } else {
        // Mark onboarding complete for non-breeders
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id);
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <div className="flex justify-center mb-4">
        <BackdropLogo size="md" onDark />
      </div>

      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-7 space-y-5">
        <div className="text-center">
          <h1 className="text-lg font-bold text-card-foreground">
            How will you use the platform?
          </h1>
          <p className="text-xs text-muted-foreground/70 mt-1">
            You can change this anytime
          </p>
        </div>

        <div className="space-y-3">
          {accountTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selected === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? "border-gold bg-gold/5 shadow-sm"
                    : "border-border hover:border-gold/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-card-foreground">
                      {type.title}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {type.bullets.map((b) => (
                        <li
                          key={b}
                          className="text-xs text-muted-foreground/70 leading-snug"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full h-[52px] rounded-2xl text-base font-bold transition-colors disabled:opacity-40"
          style={{
            backgroundColor: "hsl(var(--gold))",
            color: "hsl(var(--foreground))",
          }}
        >
          {saving ? "..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
