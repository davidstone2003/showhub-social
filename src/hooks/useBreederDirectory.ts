import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DirectoryBreeder = {
  id: string;
  display_name: string | null;
  username: string;
  logo_url: string | null;
  hero_image_url: string | null;
  location: string | null;
  bio: string | null;
  tagline: string | null;
  subscription_tier: string;
  is_premium: boolean;
  winnerCount: number;
  sireCount: number;
  topSale?: { price: number; animal: string } | null;
  searchText: string;
};

export function stateAbbr(loc?: string | null): string | null {
  if (!loc) return null;
  const parts = loc.split(",").map((s) => s.trim());
  const last = parts[parts.length - 1];
  return last && last.length <= 14 ? last : null;
}

export function useBreederDirectory() {
  return useQuery({
    queryKey: ["breeder-directory"],
    queryFn: async (): Promise<DirectoryBreeder[]> => {
      const [profilesRes, winnersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("display_name", { ascending: true }),
        supabase.from("winners").select("bred_by, sired_by").eq("status", "active"),
      ]);
      if (profilesRes.error) throw profilesRes.error;

      const winnerCounts: Record<string, number> = {};
      const sireSets: Record<string, Set<string>> = {};
      (winnersRes.data || []).forEach((w: any) => {
        if (!w.bred_by) return;
        const key = w.bred_by.toLowerCase();
        winnerCounts[key] = (winnerCounts[key] || 0) + 1;
        if (w.sired_by) {
          if (!sireSets[key]) sireSets[key] = new Set();
          sireSets[key].add(w.sired_by);
        }
      });

      return (profilesRes.data || []).map((p: any) => {
        const key = (p.display_name || p.username || "").toLowerCase();
        return {
          ...p,
          winnerCount: winnerCounts[key] || 0,
          sireCount: sireSets[key]?.size || 0,
          topSale: null,
          searchText: `${p.display_name || ""} ${p.username} ${p.bio || ""} ${p.tagline || ""} ${p.location || ""}`.toLowerCase(),
        } as DirectoryBreeder;
      });
    },
  });
}
