import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BackdropLogo } from "@/components/RinglyLogo";
import { toast } from "sonner";
import { MapPin, Camera, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleStep1 = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let logoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("winner-images")
          .upload(path, photoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("winner-images")
          .getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      const updates: Record<string, unknown> = {
        onboarding_completed: true,
      };
      if (location.trim()) updates.location = location.trim();
      if (bio.trim()) updates.bio = bio.trim();
      if (logoUrl) updates.logo_url = logoUrl;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;

      navigate("/pricing?onboarding=true");
    } catch (err: any) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleEnableContact = () => {
    navigate("/pricing");
  };

  const handleCreatePost = () => {
    navigate("/submit");
  };

  const handleSkipToFeed = () => {
    navigate("/");
  };

  const stepIndicator = (
    <div className="flex gap-2 justify-center mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            s === step ? "w-8 bg-gold" : s < step ? "w-8 bg-gold/40" : "w-8 bg-muted"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <div className="flex justify-center mb-4">
        <BackdropLogo size="md" onDark />
      </div>

      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-7 space-y-5">
        {stepIndicator}

        {step === 1 && (
          <>
            <div className="text-center">
              <h1 className="text-lg font-bold text-card-foreground">
                Let's set up your breeder profile
              </h1>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Help buyers find and recognize you
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Photo upload */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-sand-dark flex items-center justify-center overflow-hidden hover:border-gold transition-colors"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <span className="text-[11px] text-muted-foreground">
                  Add profile photo
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location (e.g., Oklahoma)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-2xl h-12 text-sm bg-background border-sand-dark pl-9"
                />
              </div>

              {/* Bio */}
              <Textarea
                placeholder="Short bio (optional)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="rounded-2xl text-sm bg-background border-sand-dark resize-none"
              />

              <Button
                onClick={handleStep1}
                disabled={saving}
                className="w-full h-[52px] rounded-2xl text-base font-bold"
                style={{
                  backgroundColor: "hsl(var(--gold))",
                  color: "hsl(var(--foreground))",
                }}
              >
                {saving ? "Saving..." : "Continue"}
                {!saving && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                <Megaphone className="w-6 h-6 text-gold" />
              </div>
              <h1 className="text-lg font-bold text-card-foreground">
                Let buyers contact you
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Buyers can't reach you unless you enable contact. Add your phone,
                email, and social links so they can find you.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleEnableContact}
                className="w-full h-[52px] rounded-2xl text-base font-bold"
                style={{
                  backgroundColor: "hsl(var(--gold))",
                  color: "hsl(var(--foreground))",
                }}
              >
                Enable Contact – $9.99/month
              </Button>
              <button
                onClick={() => setStep(3)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-gold" />
              </div>
              <h1 className="text-lg font-bold text-card-foreground">
                Add your first post
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Show your animals, wins, or listings to start getting noticed.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCreatePost}
                className="w-full h-[52px] rounded-2xl text-base font-bold"
                style={{
                  backgroundColor: "hsl(var(--gold))",
                  color: "hsl(var(--foreground))",
                }}
              >
                Create Post
              </Button>
              <button
                onClick={handleSkipToFeed}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
