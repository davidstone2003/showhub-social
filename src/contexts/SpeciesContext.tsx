import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { SpeciesPill } from "@/components/SpeciesPills";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LS_KEY = "backdrop_species";

interface SpeciesContextValue {
  species: SpeciesPill;
  setSpecies: (s: SpeciesPill) => void;
}

const SpeciesContext = createContext<SpeciesContextValue>({
  species: "All",
  setSpecies: () => {},
});

export function useSpecies() {
  return useContext(SpeciesContext);
}

function readInitial(): SpeciesPill {
  if (typeof window === "undefined") return "All";
  const v = localStorage.getItem(LS_KEY);
  const allowed: SpeciesPill[] = ["All", "Cattle", "Sheep", "Goats", "Pigs"];
  return (allowed.includes(v as SpeciesPill) ? (v as SpeciesPill) : "All");
}

export function SpeciesProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [species, setSpeciesState] = useState<SpeciesPill>(readInitial);

  // Hydrate from profile when it loads
  useEffect(() => {
    const pref = (profile as any)?.preferred_species as SpeciesPill | null | undefined;
    if (pref && pref !== species) {
      const allowed: SpeciesPill[] = ["All", "Cattle", "Sheep", "Goats", "Pigs"];
      if (allowed.includes(pref)) {
        setSpeciesState(pref);
        localStorage.setItem(LS_KEY, pref);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const setSpecies = (s: SpeciesPill) => {
    setSpeciesState(s);
    try { localStorage.setItem(LS_KEY, s); } catch {}
    if (user) {
      (supabase.from("profiles") as any)
        .update({ preferred_species: s })
        .eq("id", user.id)
        .then(() => {});
    }
  };

  return (
    <SpeciesContext.Provider value={{ species, setSpecies }}>
      {children}
    </SpeciesContext.Provider>
  );
}
