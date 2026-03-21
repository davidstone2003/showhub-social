import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BackdropLogo } from "@/components/RinglyLogo";
import { Eye, EyeOff } from "lucide-react";

const accountTypes = [
  { id: "general", label: "General User" },
  { id: "exhibitor", label: "Exhibitor" },
  { id: "breeder", label: "Breeder" },
  { id: "vendor", label: "Vendor" },
] as const;

type AccountTypeId = (typeof accountTypes)[number]["id"];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [accountType, setAccountType] = useState<AccountTypeId | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signupReady =
    displayName.trim() &&
    email.trim() &&
    password.trim() &&
    agreedTerms &&
    accountType !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: prof } = await supabase
          .from("profiles")
          .select("onboarding_completed, account_type")
          .eq("id", data.user.id)
          .single();
        if (prof && (!prof.account_type || prof.account_type === "user")) {
          navigate("/account-type");
        } else if (prof && !prof.onboarding_completed) {
          if (prof.account_type === "breeder" || prof.account_type === "vendor") {
            navigate("/onboarding");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } else {
        if (!displayName.trim()) {
          toast.error("Display name is required");
          setLoading(false);
          return;
        }
        if (!accountType) {
          toast.error("Please select an account type");
          setLoading(false);
          return;
        }
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim(), account_type: accountType },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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
        <div className="text-center">
          <h1 className="text-lg font-bold text-card-foreground">
            {isLogin ? "Welcome back" : "Join the Show Stock Network"}
          </h1>
          {!isLogin && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create your profile. Start free. Upgrade anytime.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <Input
              placeholder="Display Name (e.g., Stone Show Stock)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
          />
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl h-12 text-sm bg-background border-sand-dark pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {!isLogin && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-card-foreground">I am a:</p>
              <div className="flex flex-wrap gap-2">
                {accountTypes.map((t) => {
                  const selected = accountType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAccountType(t.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-primary/10 border-primary text-primary font-semibold"
                          : "bg-background border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="terms"
                checked={agreedTerms}
                onCheckedChange={(v) => setAgreedTerms(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground/70 leading-snug cursor-pointer select-none">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="underline underline-offset-2 text-primary">Terms of Use</a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="underline underline-offset-2 text-primary">Privacy Policy</a>
              </label>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (!isLogin && !signupReady)}
            className="w-full h-[52px] rounded-2xl text-base font-bold"
            style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--foreground))" }}
          >
            {loading ? "..." : isLogin ? "Sign In" : "Create Free Profile"}
          </Button>
          {!isLogin && (
            <p className="text-[11px] text-muted-foreground/60 text-center">
              No credit card required
            </p>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground pt-1">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-primary underline underline-offset-2"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}