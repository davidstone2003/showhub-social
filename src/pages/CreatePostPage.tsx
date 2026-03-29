import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { ExhibitorPicker } from "@/components/ExhibitorPicker";
import { IdentitySelector } from "@/components/IdentitySelector";
import { MediaUpload, type MediaFile, type SoundOption } from "@/components/post/MediaUpload";
import { ResultPicker } from "@/components/post/ResultPicker";
import SmartUpload from "@/components/SmartUpload";
import PostSuccessScreen from "@/components/PostSuccessScreen";
import {
  Trophy, ShoppingCart, CalendarDays, FileText,
  ArrowLeft, LogIn, Sparkles, ChevronLeft, Camera, ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PostCategory = null | "winner" | "sale_lot" | "sale_event" | "general";

const ensureLookupEntry = async (
  table: "shows" | "sires_lookup" | "breeders_lookup",
  displayText: string,
  existingId: string | null
): Promise<string | null> => {
  if (!displayText.trim()) return null;
  if (existingId) return existingId;
  const { data: existing } = await supabase.from(table).select("id").ilike("name", displayText.trim()).limit(1);
  if (existing && existing.length > 0) return existing[0].id;
  const { data: inserted, error } = await supabase.from(table).insert({ name: displayText.trim() }).select("id").single();
  if (error || !inserted) return null;
  return inserted.id;
};

export default function CreatePostPage() {
  const { user, profile } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();
  const navigate = useNavigate();

  const [category, setCategory] = useState<PostCategory>(null);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [soundOption, setSoundOption] = useState<SoundOption>("original");
  const [submitting, setSubmitting] = useState(false);
  const [postedAsBreederId, setPostedAsBreederId] = useState<string | null>(null);
  const [showSmartUpload, setShowSmartUpload] = useState(false);
  const [showPasteCaption, setShowPasteCaption] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Winner fields
  const [resultTitle, setResultTitle] = useState("");
  const [showName, setShowName] = useState("");
  const [showId, setShowId] = useState<string | null>(null);
  const [exhibitorName, setExhibitorName] = useState("");
  const [breederName, setBreederName] = useState("");
  const [sireName, setSireName] = useState("");
  const [sireId, setSireId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Sale Lot fields
  const [lotNumber, setLotNumber] = useState("");
  const [lotSire, setLotSire] = useState("");
  const [lotDam, setLotDam] = useState("");
  const [saleName, setSaleName] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [saleLink, setSaleLink] = useState("");
  const [lotCaption, setLotCaption] = useState("");

  // Sale/Event fields
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventCaption, setEventCaption] = useState("");

  // General fields
  const [generalCaption, setGeneralCaption] = useState("");

  const uploadMedia = async (): Promise<{ imageUrls: string[]; videoUrl: string | null }> => {
    const imageUrls: string[] = [];
    let videoUrl: string | null = null;
    for (const m of media) {
      const ext = m.file.name.split(".").pop();
      const bucket = m.type === "video" ? "post-media" : "winner-images";
      const folder = m.type === "video" ? `${user?.id || "anon"}/` : "";
      const path = `${folder}${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, m.file, { contentType: m.file.type, cacheControl: "3600" });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      if (m.type === "video") videoUrl = urlData.publicUrl;
      else imageUrls.push(urlData.publicUrl);
    }
    return { imageUrls, videoUrl };
  };

  const handleSubmitWinner = async () => {
    if (!showName.trim() || !exhibitorName.trim()) { toast.error("Show name and exhibitor are required"); return; }
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      const { imageUrls, videoUrl } = await uploadMedia();
      const resolvedShowId = await ensureLookupEntry("shows", showName, showId);
      const resolvedSireId = sireName.trim() ? await ensureLookupEntry("sires_lookup", sireName, sireId) : null;
      const title = resultTitle.trim() ? `${resultTitle.trim()} — ${showName.trim()}` : showName.trim();

      const { data: post, error: postError } = await (supabase.from("posts") as any).insert({
        user_id: user?.id || null, posted_as_breeder_id: postedAsBreederId,
        caption: notes.trim() || null, image_urls: imageUrls, video_url: videoUrl,
        tags: [], post_type: "winner", show_on_feed: true,
      }).select("id").single();
      if (postError) throw postError;

      const { error: winError } = await (supabase.from("winners") as any).insert({
        source_post_id: post.id, title, show_name: showName.trim(),
        shown_by: exhibitorName.trim(), bred_by: breederName.trim() || null,
        sired_by: sireName.trim() || null, sire_id: resolvedSireId,
        win_placing: resultTitle.trim() || null, caption: notes.trim() || null,
        image_urls: imageUrls, video_url: videoUrl, show_id: resolvedShowId,
        date: format(new Date(), "yyyy-MM-dd"), user_id: user?.id || null,
        posted_as_breeder_id: postedAsBreederId, post_type: "winner",
        show_on_feed: true, show_on_breeder_page: true, show_on_winners_archive: true,
      }).select("id").single();
      if (winError) throw winError;

      toast.success("Winner posted!");
      setSuccessData({
        showName: showName.trim(), winPlacing: resultTitle.trim(),
        shownBy: exhibitorName.trim(), placedBy: "", sireName: sireName.trim(),
        damName: "", caption: notes.trim(), imageUrls, postedAsBreederId, winnerRefs: [],
      });
    } catch (err: any) { toast.error("Failed to post", { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleSubmitSaleLot = async () => {
    if (!saleName.trim()) { toast.error("Sale name is required"); return; }
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      const { imageUrls, videoUrl } = await uploadMedia();
      const title = lotNumber.trim()
        ? `LOT ${lotNumber.trim()} — ${lotSire.trim() || ""} x ${lotDam.trim() || ""}`
        : saleName.trim();
      await (supabase.from("posts") as any).insert({
        user_id: user?.id || null, posted_as_breeder_id: postedAsBreederId,
        caption: `${title}\n${saleName.trim()}\n${saleDate.trim()}\n${lotCaption.trim()}`.trim(),
        image_urls: imageUrls, video_url: videoUrl, tags: [], post_type: "sale", show_on_feed: true,
      });
      toast.success("Sale lot posted!"); navigate("/");
    } catch (err: any) { toast.error("Failed to post", { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleSubmitSaleEvent = async () => {
    if (!eventName.trim()) { toast.error("Event name is required"); return; }
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      const { imageUrls, videoUrl } = await uploadMedia();
      await (supabase.from("posts") as any).insert({
        user_id: user?.id || null, posted_as_breeder_id: postedAsBreederId,
        caption: `${eventName.trim()}\n${eventLocation.trim()}\n${eventDate.trim()}\n${eventCaption.trim()}`.trim(),
        image_urls: imageUrls, video_url: videoUrl, tags: [], post_type: "sale", show_on_feed: true,
      });
      toast.success("Event posted!"); navigate("/");
    } catch (err: any) { toast.error("Failed to post", { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleSubmitGeneral = async () => {
    if (!generalCaption.trim() && media.length === 0) { toast.error("Add a photo, video, or description"); return; }
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      const { imageUrls, videoUrl } = await uploadMedia();
      await (supabase.from("posts") as any).insert({
        user_id: user?.id || null, posted_as_breeder_id: postedAsBreederId,
        caption: generalCaption.trim() || null, image_urls: imageUrls, video_url: videoUrl,
        tags: [], post_type: "general", show_on_feed: true,
      });
      toast.success("Post shared!"); navigate("/");
    } catch (err: any) { toast.error("Failed to post", { description: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleSmartExtracted = (fields: any) => {
    if (fields.imageFile && fields.imagePreview) {
      setMedia([{ file: fields.imageFile, preview: fields.imagePreview, type: "image" }]);
    }
    if (fields.showName) setShowName(fields.showName);
    if (fields.winPlacing) setResultTitle(fields.winPlacing);
    if (fields.shownBy) setExhibitorName(fields.shownBy);
    if (fields.siredBy) setSireName(fields.siredBy);
    if (fields.caption) setNotes(fields.caption);
    if (fields.placedBy) setBreederName(fields.placedBy);
    setShowSmartUpload(false);
  };

  const handlePasteCaption = async () => {
    if (!pasteText.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-winner", { body: { text: pasteText } });
      if (error) throw error;
      const raw = data?.extracted || data?.results?.[0] || {};
      if (raw.show_name) setShowName(raw.show_name);
      if (raw.win_placing) setResultTitle(raw.win_placing);
      if (raw.shown_by) setExhibitorName(raw.shown_by);
      if (raw.placed_by) setBreederName(raw.placed_by);
      if (raw.sired_by) setSireName(raw.sired_by);
      if (raw.caption) {
        if (category === "winner") setNotes(raw.caption);
        else if (category === "sale_lot") setLotCaption(raw.caption);
        else if (category === "sale_event") setEventCaption(raw.caption);
      }
      toast.success("Fields auto-filled from text");
    } catch (err: any) {
      toast.error("Couldn't parse text", { description: err.message });
    } finally {
      setSubmitting(false);
      setShowPasteCaption(false);
      setPasteText("");
    }
  };

  if (successData) {
    return <Layout showDiscovery={false}><PostSuccessScreen data={successData} /></Layout>;
  }

  // ─── Type Picker ───
  if (!category) {
    return (
      <Layout showDiscovery={false}>
        <div className="min-h-screen bg-background">
          <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">Create Post</h1>
            </div>
          </div>
          <div className="max-w-md mx-auto px-4 py-6 space-y-3">
            <p className="text-center text-muted-foreground text-sm mb-4">What are you posting?</p>
            <TypeButton icon={Trophy} label="Winner Post" desc="Share a show result" color="hsl(var(--primary))" onClick={() => setCategory("winner")} />
            <TypeButton icon={ShoppingCart} label="Sale Lot" desc="Consignment or sale animal" color="hsl(45 93% 47%)" onClick={() => setCategory("sale_lot")} />
            <TypeButton icon={CalendarDays} label="Sale / Event" desc="Promote an upcoming sale or event" color="hsl(280 70% 55%)" onClick={() => setCategory("sale_event")} />
            <TypeButton icon={FileText} label="General Post" desc="Update, video, or casual post" color="hsl(var(--muted-foreground))" onClick={() => setCategory("general")} />
          </div>
        </div>
      </Layout>
    );
  }

  const formTitle = { winner: "Winner Post", sale_lot: "Sale Lot", sale_event: "Sale / Event", general: "General Post" }[category];
  const handleSubmit = { winner: handleSubmitWinner, sale_lot: handleSubmitSaleLot, sale_event: handleSubmitSaleEvent, general: handleSubmitGeneral }[category];

  return (
    <Layout showDiscovery={false}>
      <VerifyEmailModal open={showVerifyModal} onOpenChange={setShowVerifyModal} onResend={resendVerification} />

      {/* Smart Upload overlay */}
      {showSmartUpload && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md shadow-lg">
            <SmartUpload onExtracted={handleSmartExtracted} onSkip={() => setShowSmartUpload(false)} />
          </div>
        </div>
      )}

      {/* Paste Caption overlay */}
      {showPasteCaption && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md shadow-lg space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-primary" /> Paste Facebook Text
            </h3>
            <Textarea
              placeholder="Paste your Facebook or Instagram caption here…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="rounded-xl bg-card border-border text-sm min-h-[120px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowPasteCaption(false); setPasteText(""); }} className="flex-1 h-11 rounded-xl">Cancel</Button>
              <Button onClick={handlePasteCaption} disabled={!pasteText.trim() || submitting} className="flex-1 h-11 rounded-xl font-semibold gap-2">
                <Sparkles className="w-4 h-4" /> {submitting ? "Parsing…" : "Auto Fill"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background pb-28">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setCategory(null)} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground flex-1">{formTitle}</h1>
            {category !== "general" && (
              <button onClick={() => setShowPasteCaption(true)} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                <ClipboardPaste className="w-3.5 h-3.5" /> Paste Text
              </button>
            )}
          </div>
        </div>

        {!user && (
          <div className="max-w-lg mx-auto px-4 pt-3">
            <Link to="/auth" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-medium hover:bg-primary/10 transition-colors">
              <LogIn className="w-4 h-4" /> Sign in to save posts to your breeder page
            </Link>
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
          {/* Step 1: Media Upload (always first) */}
          <MediaUpload media={media} onMediaChange={setMedia} soundOption={soundOption} onSoundOptionChange={setSoundOption} />

          {/* AI helper shortcuts (after media) */}
          {category === "winner" && media.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => setShowSmartUpload(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                <Camera className="w-3.5 h-3.5" /> Auto Fill From Photo
              </button>
              <button onClick={() => setShowPasteCaption(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                <ClipboardPaste className="w-3.5 h-3.5" /> Auto Fill From Caption
              </button>
            </div>
          )}

          {/* Identity */}
          {user && <IdentitySelector value={postedAsBreederId} onChange={setPostedAsBreederId} postType="winner" />}

          {/* Step 2: Type-specific fields */}
          {category === "winner" && (
            <div className="space-y-3">
              <ResultPicker value={resultTitle} onChange={setResultTitle} />
              <AutocompleteInput table="shows" placeholder="Show Name *" value={showName} onChange={(n, id) => { setShowName(n); setShowId(id); }} />
              <ExhibitorPicker value={exhibitorName} onChange={setExhibitorName} />
              <Input placeholder="Breeder" value={breederName} onChange={e => setBreederName(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <AutocompleteInput table="sires_lookup" placeholder="Sire" value={sireName} onChange={(n, id) => { setSireName(n); setSireId(id); }} />
              <Textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="rounded-xl bg-card border-border text-sm min-h-[60px] resize-none" />
            </div>
          )}

          {category === "sale_lot" && (
            <div className="space-y-3">
              <Input placeholder="Lot Number" value={lotNumber} onChange={e => setLotNumber(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Sire" value={lotSire} onChange={e => setLotSire(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Dam" value={lotDam} onChange={e => setLotDam(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Sale Name *" value={saleName} onChange={e => setSaleName(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Sale Date" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Sale Link" value={saleLink} onChange={e => setSaleLink(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Textarea placeholder="Notes" value={lotCaption} onChange={e => setLotCaption(e.target.value)} className="rounded-xl bg-card border-border text-sm min-h-[60px] resize-none" />
            </div>
          )}

          {category === "sale_event" && (
            <div className="space-y-3">
              <Input placeholder="Sale or Event Name *" value={eventName} onChange={e => setEventName(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Date" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Location" value={eventLocation} onChange={e => setEventLocation(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Input placeholder="Link" value={eventLink} onChange={e => setEventLink(e.target.value)} className="rounded-xl bg-card border-border h-12 text-sm" />
              <Textarea placeholder="Description" value={eventCaption} onChange={e => setEventCaption(e.target.value)} className="rounded-xl bg-card border-border text-sm min-h-[60px] resize-none" />
            </div>
          )}

          {category === "general" && (
            <Textarea
              placeholder="Description"
              value={generalCaption}
              onChange={(e) => setGeneralCaption(e.target.value)}
              className="rounded-xl bg-card border-border text-sm min-h-[100px] resize-none"
            />
          )}
        </div>

        {/* Sticky Post Button */}
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="max-w-lg mx-auto">
            <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-xl text-base font-bold">
              {submitting ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function TypeButton({ icon: Icon, label, desc, color, onClick }: {
  icon: any; label: string; desc: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-base font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
