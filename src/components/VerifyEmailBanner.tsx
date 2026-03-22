import { Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const { isVerified, resendVerification } = useEmailVerification();

  if (!user || isVerified) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-foreground">
        <Mail className="w-4 h-4 text-primary shrink-0" />
        <span>Verify your email to post and interact</span>
      </div>
      <button
        onClick={resendVerification}
        className="text-primary font-semibold hover:underline whitespace-nowrap"
      >
        Resend
      </button>
    </div>
  );
}
