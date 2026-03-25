import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useEmailVerification() {
  const { user, profile } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const isVerified = profile ? (profile.email_verified ?? true) : true;

  const requireVerification = useCallback((): boolean => {
    if (!user) return false;
    if (isVerified) return false;
    setShowVerifyModal(true);
    return true; // blocked
  }, [user, isVerified]);

  const resendVerification = async () => {
    if (!user?.email) return;
    // Send a magic link as a verification mechanism
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
    if (error) {
      toast.error("Could not resend verification email");
    } else {
      toast.success("Verification email sent!");
    }
  };

  return {
    isVerified,
    showVerifyModal,
    setShowVerifyModal,
    requireVerification,
    resendVerification,
  };
}
