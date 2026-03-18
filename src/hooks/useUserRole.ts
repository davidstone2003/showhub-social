import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    async function checkRoles() {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);

      if (data) {
        setIsAdmin(data.some((r) => r.role === "admin"));
        setIsModerator(data.some((r) => r.role === "moderator"));
      }
      setLoading(false);
    }

    checkRoles();
  }, [user]);

  return { isAdmin, isModerator, loading };
}
