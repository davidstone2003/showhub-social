import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BackdropLogo } from "@/components/RinglyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const hasRecoveryToken = useMemo(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return hash.get("type") === "recovery" || hash.has("access_token");
  }, []);

  useEffect(() => {
    if (!hasRecoveryToken) {
      toast.error("Open this page from the reset email link.");
    }
  }, [hasRecoveryToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasRecoveryToken) {
      toast.error("Reset link is missing or expired");
      return;
    }

    if (!password.trim()) {
      toast.error("Enter a new password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You can sign in now.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message || "Unable to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <div className="flex justify-center mb-4">
        <BackdropLogo size="md" onDark />
      </div>

      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-7 space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-bold text-card-foreground">Set a new password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your account and then sign back in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-2xl text-base font-bold"
            style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--foreground))" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Back to <Link to="/auth" className="font-semibold text-primary underline underline-offset-2">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
