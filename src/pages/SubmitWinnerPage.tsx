import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { PostTypeSelector, getDefaultToggles } from "@/components/PostTypeSelector";
import type { PostType } from "@/components/PostTypeSelector";
import { Camera, X, ImagePlus, Heart, MessageCircle, LogIn, Sparkles, ArrowLeft } from "lucide-react";
import { IdentitySelector } from "@/components/IdentitySelector";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PostSuccessScreen from "@/components/PostSuccessScreen";
import SmartUpload from "@/components/SmartUpload";
import type { ExtractedFields } from "@/components/SmartUpload";

type ImageFile = { file: File; preview: string };

/* ── helpers ── */
const ensureLookupEntry = async (
  table: "shows" | "sires_lookup" | "breeders_lookup",
  displayText: string,
  existingId: string | null
): Promise<string | null> => {
  if (!displayText.trim()) return null;
  if (existingId) return existingId;
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .ilike("name", displayText.trim())
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id;
  const { data: inserted, error } = await supabase
    .from(table)
    .insert({ name: displayText.trim() })
    .select("id")
    .single();
  if (error || !inserted) return null;
  return inserted.id;
};

/* ── page ── */
export default function SubmitWinnerPage() {
  const { user, profile } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();
  const isPremium = profile?.is_premium ?? false;

  const [images, setImages] = useState<ImageFile[]>([]);
  const [showName, setShowName] = useState("");
  const [showId, setShowId] = useState<string | null>(null);
  const [winPlacing, setWinPlacing] = useState("");
  const [shownBy, setShownBy] = useState("");
  const [placedBy, setPlacedBy] = useState("");
  const [sireName, setSireName] = useState("");
  const [sireId, setSireId] = useState<string | null>(null);
  const [damName, setDamName] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Post type + toggles */
  const [postType, setPostType] = useState<PostType>("winner");
  const [toggles, setToggles] = useState(getDefaultToggles("winner"));
  const [postedAsBreederId, setPostedAsBreederId] = useState<string | null>(null);

  const [successData, setSuccessData] = useState<{
    showName: string; winPlacing: string; shownBy: string;
    placedBy: string; sireName: string; damName: string;
    caption: string; imageUrls: string[];
  } | null>(null);

  /* Smart Upload step */
  const [showSmartUpload, setShowSmartUpload] = useState(false);

  const handleSmartExtracted = (fields: ExtractedFields) => {
    if (fields.showName) { setShowName(fields.showName); setShowId(null); }
    if (fields.winPlacing) setWinPlacing(fields.winPlacing);
    if (fields.shownBy) setShownBy(fields.shownBy);
    if (fields.placedBy) setPlacedBy(fields.placedBy);
    if (fields.siredBy) { setSireName(fields.siredBy); setSireId(null); }
    if (fields.dam) setDamName(fields.dam);
    if (fields.caption) setCaption(fields.caption);
    if (fields.imageFile && fields.imagePreview) {
      setImages([{ file: fields.imageFile, preview: fields.imagePreview }]);
    }
    setShowSmartUpload(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isValid = showName.trim() && shownBy.trim();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 3 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const img of images) {
        const ext = img.file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("winner-images")
          .upload(path, img.file, { contentType: img.file.type, cacheControl: "3600" });
        if (uploadErr) throw new Error("Photo upload failed.");
        const { data: urlData } = supabase.storage.from("winner-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const resolvedShowId = await ensureLookupEntry("shows", showName, showId);
      const resolvedSireId = sireName.trim()
        ? await ensureLookupEntry("sires_lookup", sireName, sireId)
        : null;

      const title = winPlacing.trim()
        ? `${winPlacing.trim()} — ${showName.trim()}`
        : showName.trim();

      const { error } = await (supabase.from("winners") as any).insert({
        title,
        show_name: showName.trim(),
        shown_by: shownBy.trim(),
        placed_by: placedBy.trim() || null,
        sired_by: sireName.trim() || null,
        sire_id: resolvedSireId,
        dam: damName.trim() || null,
        win_placing: winPlacing.trim() || null,
        caption: caption.trim() || null,
        tags: [],
        image_urls: imageUrls,
        show_id: resolvedShowId,
        date: format(new Date(), "yyyy-MM-dd"),
        user_id: user?.id || null,
        posted_as_breeder_id: postedAsBreederId,
        post_type: postType,
        show_on_feed: toggles.feed,
        show_on_breeder_page: toggles.breederPage,
        show_on_winners_archive: toggles.winnersArchive,
        is_featured: toggles.featured,
      });

      if (error) throw error;
      setSuccessData({
        showName: showName.trim(),
        winPlacing: winPlacing.trim(),
        shownBy: shownBy.trim(),
        placedBy: placedBy.trim(),
        sireName: sireName.trim(),
        damName: damName.trim(),
        caption: caption.trim(),
        imageUrls,
      });
      
    } catch (err: any) {
      toast.error("Failed to post", { description: err.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <Layout showDiscovery={false}>
        <PostSuccessScreen data={successData} />
      </Layout>
    );
  }

  return (
    <Layout showDiscovery={false}>
      <VerifyEmailModal open={showVerifyModal} onOpenChange={setShowVerifyModal} onResend={resendVerification} />
      <div className="min-h-screen bg-background pb-40">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Backdrop</h1>
              <p className="text-xs text-muted-foreground">Put your win on the backdrop</p>
            </div>
          </div>
        </div>

        {/* Auth prompt */}
        {!user && (
          <div className="max-w-lg mx-auto px-4 pt-4">
            <Link
              to="/auth"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in to save posts to your breeder page
            </Link>
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
          {/* Smart Upload Modal */}
          {showSmartUpload && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md shadow-lg">
                <SmartUpload
                  onExtracted={handleSmartExtracted}
                  onSkip={() => setShowSmartUpload(false)}
                />
              </div>
            </div>
          )}

          {/* Post Type + Toggles */}
          <div className="bg-card border border-border rounded-xl p-3.5">
            <PostTypeSelector
              postType={postType}
              onPostTypeChange={setPostType}
              toggles={toggles}
              onTogglesChange={setToggles}
              isPremium={isPremium}
            />
          </div>

          {/* Post As Identity */}
          {user && (
            <IdentitySelector
              value={postedAsBreederId}
              onChange={setPostedAsBreederId}
              postType={postType}
            />
          )}

          {/* Photo Upload */}
          <PhotoUpload
            images={images}
            fileInputRef={fileInputRef}
            onUpload={handleImageUpload}
            onRemove={removeImage}
          />

          {/* Required */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Required
            </legend>
            <AutocompleteInput
              table="shows"
              placeholder="Show (e.g., Mississippi Youth Expo) *"
              value={showName}
              onChange={(display, id) => { setShowName(display); setShowId(id); }}
            />
            <Input
              placeholder="Placing (e.g., Grand Champion)"
              value={winPlacing}
              onChange={(e) => setWinPlacing(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
            <Input
              placeholder="Shown by *"
              value={shownBy}
              onChange={(e) => setShownBy(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
          </fieldset>

          {/* Optional */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Optional
            </legend>
            <Input
              placeholder="Placed by"
              value={placedBy}
              onChange={(e) => setPlacedBy(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
            <AutocompleteInput
              table="sires_lookup"
              placeholder="Sire"
              value={sireName}
              onChange={(display, id) => { setSireName(display); setSireId(id); }}
            />
            <Input
              placeholder="Dam"
              value={damName}
              onChange={(e) => setDamName(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
            <Textarea
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-xl bg-card border-border text-sm min-h-[80px] resize-none"
            />
          </fieldset>

          {/* Smart Upload Button */}
          <Button
            variant="outline"
            onClick={() => setShowSmartUpload(true)}
            className="w-full h-11 rounded-xl gap-2 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Smart Upload — Auto-fill with AI
          </Button>

          {/* Preview */}
          {isValid && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-3.5 pt-3 pb-1">
                Preview
              </p>
              {images[0] && (
                <img src={images[0].preview} alt="Preview" className="w-full aspect-video object-cover" />
              )}
              <div className="px-3.5 pt-2 pb-1.5">
                {winPlacing.trim() && (
                  <p className="text-xl font-bold text-foreground leading-tight">{winPlacing}</p>
                )}
                <p className={cn(
                  "leading-snug",
                  winPlacing.trim()
                    ? "text-base font-medium text-muted-foreground mt-0.5"
                    : "text-xl font-bold text-foreground"
                )}>
                  {showName}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Shown by: <span className="text-foreground font-medium">{shownBy}</span>
                </p>
                {placedBy.trim() && (
                  <p className="text-sm text-muted-foreground mt-px">
                    Placed by: <span className="text-foreground font-medium">{placedBy}</span>
                  </p>
                )}
                {sireName.trim() && (
                  <p className="text-xs text-muted-foreground mt-px">
                    Sire: <span className="font-medium">{sireName}</span>
                  </p>
                )}
                {damName.trim() && (
                  <p className="text-xs text-muted-foreground mt-px">
                    Dam: <span className="font-medium">{damName}</span>
                  </p>
                )}
                {caption.trim() && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{caption}</p>
                )}
                <div className="flex items-center justify-end gap-3 mt-2 pb-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="w-4 h-4" /> <span className="text-xs font-medium">0</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" /> <span className="text-xs font-medium">0</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40 max-w-lg mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full h-12 rounded-xl text-base font-bold"
            style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--foreground))" }}
          >
            {submitting ? "Adding…" : "Add to Backdrop"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}

/* ── Photo Upload Sub-component ── */
function PhotoUpload({
  images,
  fileInputRef,
  onUpload,
  onRemove,
}: {
  images: ImageFile[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onUpload}
      />
      {images.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-primary/50 hover:bg-muted"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ImagePlus className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Add Photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Up to 3 images</p>
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
            <img src={images[0].preview} alt="Cover" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(0)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex gap-2">
            {images.slice(1).map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => onRemove(i + 1)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50"
              >
                <Camera className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
