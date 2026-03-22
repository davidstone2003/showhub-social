import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BackdropLogo } from "@/components/RinglyLogo";
import { toast } from "sonner";
import { MapPin, Camera, ArrowRight, ArrowLeft } from "lucide-react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVendor = searchParams.get("type") === "vendor";
  const [breederName, setBreederName] = useState("");
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

  const handleSubmit = async () => {
    if (!user || !breederName.trim()) return;
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

      const slug = slugify(breederName.trim());

      // Create breeder profile
      const { error: bpError } = await supabase
        .from("breeder_profiles")
        .insert({
          owner_user_id: user.id,
          breeder_name: breederName.trim(),
          breeder_slug: slug,
          location: location.trim() || null,
          logo_url: logoUrl,
          short_bio: bio.trim() || null,
        });
      if (bpError) throw bpError;

      // Update user profile
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

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <div className="flex justify-center mb-4">
        <BackdropLogo size="md" onDark />
      </div>

      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl p-7 space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-card-foreground">
            {isVendor ? "Set up your vendor account" : "Set up your breeder profile"}
          </h1>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {isVendor ? "Help customers find your products and services" : "Help buyers find and recognize your program"}
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
              Add logo or photo
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          {/* Breeder / Farm Name */}
          <Input
            placeholder={isVendor ? "Business Name *" : "Breeder / Farm Name *"}
            value={breederName}
            onChange={(e) => setBreederName(e.target.value)}
            className="rounded-2xl h-12 text-sm bg-background border-sand-dark"
          />

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
            onClick={handleSubmit}
            disabled={saving || !breederName.trim()}
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
      </div>
    </div>
  );
}
