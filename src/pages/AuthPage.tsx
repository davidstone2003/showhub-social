import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BackdropLogo } from "@/components/RinglyLogo";
import { Eye, EyeOff, Tractor, Award, Store, Heart, ArrowLeft } from "lucide-react";

const roleOptions = [
  { id: "breeder", label: "Breeder", description: "Promote your program, sires, and winners", icon: Tractor, accountType: "breeder" },
  { id: "exhibitor", label: "Exhibitor", description: "Post wins and build your record", icon: Award, accountType: "exhibitor" },
  { id: "vendor", label: "Vendor", description: "Sell agricultural / livestock products and services", icon: Store, accountType: "vendor" },
  { id: "fan", label: "Fan", description: "Follow shows, breeders, and results", icon: Heart, accountType: "general" },
] as const;

function IntentScreen({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSelect = async (accountType: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ account_type: accountType })
          .eq("id", user.id);
      }

      // Clear saved form data on successful role selection
      sessionStorage.removeItem("signup_first");
      sessionStorage.removeItem("signup_last");
      sessionStorage.removeItem("signup_email");

      if (accountType === "breeder") {
        navigate("/onboarding");
      } else if (accountType === "vendor") {
        navigate("/onboarding?type=vendor");
      } else if (accountType === "exhibitor") {
        navigate("/submit");
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-10">
      <div className="w-full max-w-sm mx-auto space-y-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <BackdropLogo size="md" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            How do you use Backdrop?
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick what fits best. You can change this anytime.
          </p>
        </div>

        <div className="space-y-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                disabled={saving}
                onClick={() => handleSelect(opt.accountType)}
                className="w-full flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-5 py-4 text-left transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const signupReady =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.trim() &&
    agreedTerms;

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
          setShowIntent(true);
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
        if (!firstName.trim() || !lastName.trim()) {
          toast.error("First and last name are required");
          setLoading(false);
          return;
        }
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName.trim(), last_name: lastName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account, then sign in.");
        sessionStorage.removeItem("signup_first");
        sessionStorage.removeItem("signup_last");
        sessionStorage.removeItem("signup_email");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setAgreedTerms(false);
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (showIntent) {
    return <IntentScreen onBack={() => setShowIntent(false)} />;
  }

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
            <div className="flex gap-2">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
              />
            </div>
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
