import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostTypeSelector, getDefaultToggles } from "@/components/PostTypeSelector";
import type { PostType } from "@/components/PostTypeSelector";
import { ImagePlus, X, LogIn, Sparkles, ArrowLeft, Plus, Trophy } from "lucide-react";
import { IdentitySelector } from "@/components/IdentitySelector";
import { cn } from "@/lib/utils";
import PostSuccessScreen from "@/components/PostSuccessScreen";
import type { WinnerRef } from "@/components/PostSuccessScreen";
import SmartUpload from "@/components/SmartUpload";
import type { MultiExtractResult } from "@/components/SmartUpload";
import { ResultBlock, createEmptyResult } from "@/components/ResultBlock";
import type { ResultData } from "@/components/ResultBlock";

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

  const location = useLocation();
  const carryForward = location.state as {
    showName?: string; shownBy?: string; sireId?: string; sireName?: string;
    damName?: string; postedAsBreederId?: string;
  } | null;

  const [images, setImages] = useState<ImageFile[]>([]);
  const [caption, setCaption] = useState("");
  const [results, setResults] = useState<ResultData[]>(() => {
    if (carryForward) {
      const initial = createEmptyResult();
      if (carryForward.showName) initial.showName = carryForward.showName;
      if (carryForward.shownBy) initial.shownBy = carryForward.shownBy;
      if (carryForward.sireName) initial.sireName = carryForward.sireName;
      if (carryForward.sireId) initial.sireId = carryForward.sireId;
      if (carryForward.damName) initial.damName = carryForward.damName;
      return [initial];
    }
    return [createEmptyResult()];
  });
  const [submitting, setSubmitting] = useState(false);

  /* Post type + toggles */
  const [postType, setPostType] = useState<PostType>("winner");
  const [toggles, setToggles] = useState(getDefaultToggles("winner"));
  const [postedAsBreederId, setPostedAsBreederId] = useState<string | null>(carryForward?.postedAsBreederId || null);

  const [successData, setSuccessData] = useState<{
    showName: string; winPlacing: string; shownBy: string;
    placedBy: string; sireName: string; damName: string;
    caption: string; imageUrls: string[]; resultCount?: number;
    postedAsBreederId?: string | null;
  } | null>(null);

  /* Smart Upload */
  const [showSmartUpload, setShowSmartUpload] = useState(false);

  const handleSmartExtractedLegacy = (fields: any) => {
    if (fields.imageFile && fields.imagePreview) {
      setImages([{ file: fields.imageFile, preview: fields.imagePreview }]);
    }
    if (fields.caption) setCaption(fields.caption);
    // Update first result block
    setResults(prev => {
      const updated = { ...prev[0] };
      if (fields.showName) { updated.showName = fields.showName; updated.showId = null; }
      if (fields.winPlacing) updated.winPlacing = fields.winPlacing;
      if (fields.shownBy) updated.shownBy = fields.shownBy;
      if (fields.placedBy) updated.placedBy = fields.placedBy;
      if (fields.siredBy) { updated.sireName = fields.siredBy; updated.sireId = null; }
      if (fields.dam) updated.damName = fields.dam;
      return [updated, ...prev.slice(1)];
    });
    setShowSmartUpload(false);
  };

  const handleMultiExtracted = (data: MultiExtractResult) => {
    if (data.imageFile && data.imagePreview) {
      setImages([{ file: data.imageFile, preview: data.imagePreview }]);
    }
    if (data.caption) setCaption(data.caption);
    if (data.results.length > 0) {
      setResults(data.results);
    }
    setShowSmartUpload(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // At least one result must have show + shown_by
  const hasValidResult = results.some(r => r.showName.trim() && r.shownBy.trim());

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

  const updateResult = (idx: number, updated: ResultData) => {
    setResults(prev => prev.map((r, i) => i === idx ? updated : r));
  };

  const removeResult = (idx: number) => {
    setResults(prev => prev.filter((_, i) => i !== idx));
  };

  const addResult = () => {
    setResults(prev => [...prev, createEmptyResult()]);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!hasValidResult || submitting) return;
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      // Upload images
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

      // 1. Create the social post
      const { data: post, error: postError } = await (supabase.from("posts") as any).insert({
        user_id: user?.id || null,
        posted_as_breeder_id: postedAsBreederId,
        caption: caption.trim() || null,
        image_urls: imageUrls,
        tags: [],
        post_type: postType,
        show_on_feed: toggles.feed,
      }).select("id").single();

      if (postError) throw postError;
      const sourcePostId = post.id;

      // 2. Create winner cards for each valid result
      const validResults = results.filter(r => r.showName.trim() && r.shownBy.trim());
      
      for (const result of validResults) {
        const resolvedShowId = await ensureLookupEntry("shows", result.showName, result.showId);
        const resolvedSireId = result.sireName.trim()
          ? await ensureLookupEntry("sires_lookup", result.sireName, result.sireId)
          : null;

        const title = result.winPlacing.trim()
          ? `${result.winPlacing.trim()} — ${result.showName.trim()}`
          : result.showName.trim();

        const { error: winError } = await (supabase.from("winners") as any).insert({
          source_post_id: sourcePostId,
          title,
          show_name: result.showName.trim(),
          shown_by: result.shownBy.trim(),
          placed_by: result.placedBy.trim() || null,
          sired_by: result.sireName.trim() || null,
          sire_id: resolvedSireId,
          dam: result.damName.trim() || null,
          win_placing: result.winPlacing.trim() || null,
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

        if (winError) throw winError;
      }

      // Save exhibitors for memory
      if (user) {
        const uniqueExhibitors = [...new Set(validResults.map(r => r.shownBy.trim()).filter(Boolean))];
        for (const exName of uniqueExhibitors) {
          // Upsert exhibitor
          const { data: existingEx } = await supabase
            .from("exhibitors")
            .select("id")
            .eq("created_by_user_id", user.id)
            .ilike("name", exName)
            .limit(1);

          let exhibitorId: string;
          if (existingEx && existingEx.length > 0) {
            exhibitorId = existingEx[0].id;
          } else {
            const { data: newEx } = await supabase
              .from("exhibitors")
              .insert({ name: exName, created_by_user_id: user.id })
              .select("id")
              .single();
            if (!newEx) continue;
            exhibitorId = newEx.id;
          }

          // Upsert user_exhibitor
          const firstMatch = validResults.find(r => r.shownBy.trim() === exName);
          const { data: existingUe } = await supabase
            .from("user_exhibitors")
            .select("id, use_count")
            .eq("user_id", user.id)
            .eq("exhibitor_id", exhibitorId)
            .limit(1);

          if (existingUe && existingUe.length > 0) {
            await supabase
              .from("user_exhibitors")
              .update({
                use_count: existingUe[0].use_count + 1,
                last_used_at: new Date().toISOString(),
                last_show_name: firstMatch?.showName.trim() || null,
                last_sire_name: firstMatch?.sireName.trim() || null,
                last_dam_name: firstMatch?.damName.trim() || null,
                last_breeder_id: postedAsBreederId,
              })
              .eq("id", existingUe[0].id);
          } else {
            await supabase.from("user_exhibitors").insert({
              user_id: user.id,
              exhibitor_id: exhibitorId,
              label: exName === (profile?.display_name || profile?.first_name) ? "me" : "other",
              use_count: 1,
              last_used_at: new Date().toISOString(),
              last_show_name: firstMatch?.showName.trim() || null,
              last_sire_name: firstMatch?.sireName.trim() || null,
              last_dam_name: firstMatch?.damName.trim() || null,
              last_breeder_id: postedAsBreederId,
            });
          }
        }
      }

      const firstResult = validResults[0];
      setSuccessData({
        showName: firstResult.showName.trim(),
        winPlacing: firstResult.winPlacing.trim(),
        shownBy: firstResult.shownBy.trim(),
        placedBy: firstResult.placedBy.trim(),
        sireName: firstResult.sireName.trim(),
        damName: firstResult.damName.trim(),
        caption: caption.trim(),
        imageUrls,
        resultCount: validResults.length,
        postedAsBreederId,
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
                  onExtracted={handleSmartExtractedLegacy}
                  onMultiExtracted={handleMultiExtracted}
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

          {/* Caption / Story */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
              Your Story
            </p>
            <Textarea
              placeholder="Write your caption — share the story behind the win…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-xl bg-card border-border text-sm min-h-[80px] resize-none"
            />
          </div>

          {/* Result Blocks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Results ({results.length})
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addResult}
                className="h-7 text-xs gap-1 text-primary hover:text-primary"
              >
                <Plus className="w-3.5 h-3.5" /> Add Result
              </Button>
            </div>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <ResultBlock
                  key={result.id}
                  result={result}
                  index={idx}
                  total={results.length}
                  onChange={(updated) => updateResult(idx, updated)}
                  onRemove={() => removeResult(idx)}
                  defaultExpanded={results.length <= 2}
                />
              ))}
            </div>
          </div>

          {/* Smart Upload Button */}
          <Button
            variant="outline"
            onClick={() => setShowSmartUpload(true)}
            className="w-full h-11 rounded-xl gap-2 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Smart Upload — Auto-fill with AI
          </Button>
        </div>

        {/* Submit */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40 max-w-lg mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!hasValidResult || submitting}
            className="w-full h-12 rounded-xl text-base font-bold"
            style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--foreground))" }}
          >
            {submitting ? "Adding…" : `Add to Backdrop${results.filter(r => r.showName.trim() && r.shownBy.trim()).length > 1 ? ` (${results.filter(r => r.showName.trim() && r.shownBy.trim()).length} results)` : ""}`}
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
                className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
