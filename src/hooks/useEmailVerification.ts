import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export function useEmailVerification() {
  const { user } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const isVerified = !!user?.email_confirmed_at;

  const requireVerification = (): boolean => {
    if (!user) return false;
    if (isVerified) return false;
    setShowVerifyModal(true);
    return true; // blocked
  };

  const resendVerification = async () => {
    if (!user?.email) return;
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
