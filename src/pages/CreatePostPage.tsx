import React, { useState, useRef, useEffect } from "react";
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
import { type MediaFile, type SoundOption } from "@/components/post/MediaUpload";
import SmartUpload from "@/components/SmartUpload";
import PostSuccessScreen from "@/components/PostSuccessScreen";
import {
  Trophy, ChevronDown, X, Camera, Video as VideoIcon, Smile,
  Leaf, MoreHorizontal, Play, Plus, Sparkles, ClipboardPaste, Users,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { PeopleTagger, type TaggedPerson } from "@/components/post/PeopleTagger";

type PostCategory = null | "winner" | "sale_lot" | "sale_event" | "general";

const WINNER_RESULTS = [
  "Grand Champion",
  "Reserve Grand Champion",
  "Class Winner",
  "Division Champion",
  "Reserve Division",
  "5th Overall",
  "Other",
];

const SPECIES_OPTIONS = ["Sheep", "Goats", "Cattle", "Pigs"];

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

// TODO: PostCard to support multi-photo grid layout — 1 photo full width, 2 side by side, 3+ grid with overlay count

export default function CreatePostPage() {
  const { user, profile } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();
  const navigate = useNavigate();

  const [category] = useState<PostCategory>(null); // unused but kept for compat
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [soundOption, setSoundOption] = useState<SoundOption>("original");
  const [submitting, setSubmitting] = useState(false);
  const [postedAsBreederId, setPostedAsBreederId] = useState<string | null>(null);
  const [showSmartUpload, setShowSmartUpload] = useState(false);
  const [showPasteCaption, setShowPasteCaption] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Sheets
  const [showWinnerPanel, setShowWinnerPanel] = useState(false);
  const [showSpeciesSheet, setShowSpeciesSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showIdentitySheet, setShowIdentitySheet] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState<TaggedPerson[]>([]);

  // Winner fields
  const [resultTitle, setResultTitle] = useState("");
  const [customResult, setCustomResult] = useState("");
  const [showName, setShowName] = useState("");
  const [showId, setShowId] = useState<string | null>(null);
  const [exhibitorName, setExhibitorName] = useState("");
  const [breederName, setBreederName] = useState("");
  const [placedBy, setPlacedBy] = useState("");
  const [sireName, setSireName] = useState("");
  const [sireId, setSireId] = useState<string | null>(null);
  const [damName, setDamName] = useState("");
  const [notes, setNotes] = useState("");
  const [species, setSpecies] = useState("Sheep");

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
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [eventLocation, setEventLocation] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventCaption, setEventCaption] = useState("");

  // General fields
  const [generalCaption, setGeneralCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [savedDefaults, setSavedDefaults] = useState<{ farmName: string; bredBy: string }>({ farmName: "", bredBy: "" });

  useEffect(() => {
    const saved = localStorage.getItem("backdrop_post_defaults");
    if (saved) {
      try {
        const defaults = JSON.parse(saved);
        setSavedDefaults(defaults);
        setBreederName((prev) => (!prev && defaults.bredBy ? defaults.bredBy : prev));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull the user's breeder/profile name and use as Bred By default
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("breeder_profiles")
        .select("id, breeder_name")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      const farmName = ((data as any)?.breeder_name ||
        (profile?.account_type === "breeder" ? profile?.display_name : null) ||
        user.user_metadata?.display_name) as string | undefined;
      if (farmName) {
        setSavedDefaults((prev) => {
          const next = { ...prev, farmName, bredBy: prev.bredBy || farmName };
          try { localStorage.setItem("backdrop_post_defaults", JSON.stringify(next)); } catch {}
          return next;
        });
        setBreederName((prev) => prev || farmName);
      }
    })();

  }, [user, profile]);

  const handleOpenWinnerPanel = () => {
    if (!breederName && (savedDefaults.bredBy || savedDefaults.farmName)) {
      setBreederName(savedDefaults.bredBy || savedDefaults.farmName);
    }
    setShowWinnerPanel(true);
  };

  const handleGenerateCaption = async () => {
    if (!effectiveResult) return;
    setGeneratingCaption(true);
    try {
      const fields = {
        Placement: effectiveResult,
        Show: showName,
        "Shown by": exhibitorName,
        "Bred by": breederName,
        "Sired by": sireName,
        "Placed by": placedBy,
        Species: species,
      };
      const { data, error } = await supabase.functions.invoke("generate-caption", { body: { fields } });
      if (error) throw error;
      const caption = (data as any)?.caption || "";
      if (caption) {
        setNotes(caption);
        setGeneralCaption(caption);
        toast.success("Caption generated!");
      } else {
        toast.error("Couldn't generate caption");
      }
    } catch (err: any) {
      toast.error("Couldn't generate caption", { description: err?.message });
    } finally {
      setGeneratingCaption(false);
    }
  };

  const captionRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = captionRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [generalCaption]);

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

  const effectiveResult = resultTitle === "Other" ? customResult : resultTitle;

  const handleSubmitWinner = async () => {
    if (!showName.trim() || !exhibitorName.trim()) { toast.error("Show name and exhibitor are required"); return; }
    if (requireVerification()) return;
    setSubmitting(true);
    try {
      const { imageUrls, videoUrl } = await uploadMedia();
      const resolvedShowId = await ensureLookupEntry("shows", showName, showId);
      const resolvedSireId = sireName.trim() ? await ensureLookupEntry("sires_lookup", sireName, sireId) : null;
      const title = effectiveResult.trim() ? `${effectiveResult.trim()} — ${showName.trim()}` : showName.trim();

      const { data: post, error: postError } = await (supabase.from("posts") as any).insert({
        user_id: user?.id || null, posted_as_breeder_id: postedAsBreederId,
        caption: (notes.trim() || generalCaption.trim()) || null, image_urls: imageUrls, video_url: videoUrl,
        tags: species ? [species] : [], post_type: "winner", show_on_feed: true,
        tagged_user_ids: taggedPeople.map(p => p.id),
      }).select("id").single();
      if (postError) throw postError;

      const { error: winError } = await (supabase.from("winners") as any).insert({
        source_post_id: post.id, title, show_name: showName.trim(),
        shown_by: exhibitorName.trim(), placed_by: placedBy.trim() || null,
        bred_by: breederName.trim() || null,
        sired_by: sireName.trim() || null, sire_id: resolvedSireId,
        dam: damName.trim() || null,
        win_placing: effectiveResult.trim() || null, caption: (notes.trim() || generalCaption.trim()) || null,
        image_urls: imageUrls, video_url: videoUrl, show_id: resolvedShowId,
        date: format(new Date(), "yyyy-MM-dd"), user_id: user?.id || null,
        posted_as_breeder_id: postedAsBreederId, post_type: "winner",
        show_on_feed: true, show_on_breeder_page: true, show_on_winners_archive: true,
        species: species || null,
      }).select("id").single();
      if (winError) throw winError;

      toast.success("Winner posted!");
      setSuccessData({
        showName: showName.trim(), winPlacing: effectiveResult.trim(),
        shownBy: exhibitorName.trim(), placedBy: placedBy.trim(), sireName: sireName.trim(),
        damName: "", caption: (notes.trim() || generalCaption.trim()), imageUrls, postedAsBreederId, winnerRefs: [],
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
        tags: species ? [species] : [], post_type: "general", show_on_feed: true,
        tagged_user_ids: taggedPeople.map(p => p.id),
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
    if (fields.caption) { setNotes(fields.caption); setGeneralCaption(fields.caption); }
    if (fields.placedBy) setPlacedBy(fields.placedBy);
    setShowSmartUpload(false);
    setShowMoreSheet(false);
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
      if (raw.placed_by) setPlacedBy(raw.placed_by);
      if (raw.sired_by) setSireName(raw.sired_by);
      if (raw.caption) { setNotes(raw.caption); setGeneralCaption(raw.caption); }
      toast.success("Fields auto-filled from text");
    } catch (err: any) {
      toast.error("Couldn't parse text", { description: err.message });
    } finally {
      setSubmitting(false);
      setShowPasteCaption(false);
      setPasteText("");
    }
  };

  // Determine which submit handler to use
  const winnerDraftHasEntry = !!(
    resultTitle || customResult || showName.trim() || exhibitorName.trim() ||
    placedBy.trim() || sireName.trim() || damName.trim() || notes.trim()
  );
  const winnerReady = !!showName.trim() && !!exhibitorName.trim();
  const saleLotReady = !!saleName.trim();
  const saleEventReady = !!eventName.trim();
  const canPost = winnerDraftHasEntry || saleLotReady || saleEventReady || generalCaption.trim().length > 0 || media.length > 0;

  const handlePost = async () => {
    setShowEmojiPicker(false);
    // Verify we have a live Supabase session before posting (refresh if expired)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (!refreshed.session) {
        toast.error("Your session expired", { description: "Please sign in again to post." });
        navigate("/auth");
        return;
      }
    }
    if (winnerDraftHasEntry) return handleSubmitWinner();
    if (saleLotReady) return handleSubmitSaleLot();
    if (saleEventReady) return handleSubmitSaleEvent();
    return handleSubmitGeneral();
  };


  // Auto-extract winner details from a photo using AI
  const autoExtractFromPhoto = async (file: File) => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const toastId = toast.loading("Reading photo with AI…");
      const { data, error } = await supabase.functions.invoke("extract-winner", {
        body: { imageBase64: base64, mimeType: file.type },
      });
      toast.dismiss(toastId);
      if (error) throw error;
      const raw = (data as any)?.extracted || (data as any)?.results?.[0] || {};
      let filled = 0;
      if (raw.show_name) { setShowName(raw.show_name); filled++; }
      if (raw.win_placing) { setResultTitle(raw.win_placing); filled++; }
      if (raw.shown_by) { setExhibitorName(raw.shown_by); filled++; }
      if (raw.placed_by) { setPlacedBy(raw.placed_by); filled++; }
      if (raw.sired_by) { setSireName(raw.sired_by); filled++; }
      if (raw.dam) { setDamName(raw.dam); filled++; }
      if (raw.caption) { setNotes(raw.caption); filled++; }
      if (filled > 0) toast.success(`Auto-filled ${filled} field${filled > 1 ? "s" : ""} from photo`);
    } catch (err: any) {
      toast.error("Couldn't auto-read photo", { description: err?.message });
    }
  };

  // Media handlers
  const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const next = files.slice(0, 10 - media.length).map(file => ({
      file, preview: URL.createObjectURL(file), type: "image" as const,
    }));
    setMedia(prev => [...prev, ...next].slice(0, 10));
    if (photoInputRef.current) photoInputRef.current.value = "";
    // Auto-extract from the first new photo if no show name yet
    if (next.length > 0 && !showName) {
      void autoExtractFromPhoto(next[0].file);
    }
  };
  const onPickVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMedia(prev => [...prev.filter(m => m.type !== "video"), { file, preview: URL.createObjectURL(file), type: "video" }]);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };
  const removeMedia = (i: number) => setMedia(prev => prev.filter((_, idx) => idx !== i));

  if (successData) {
    return <Layout showDiscovery={false}><PostSuccessScreen data={successData} /></Layout>;
  }

  const displayName = profile?.display_name || profile?.first_name || "You";
  const initials = (displayName || "U").slice(0, 2).toUpperCase();
  const avatarUrl = (profile as any)?.logo_url || (profile as any)?.avatar_url;
  const winnerHasData = winnerDraftHasEntry;

  return (
    <Layout showDiscovery={false}>
      <VerifyEmailModal open={showVerifyModal} onOpenChange={setShowVerifyModal} onResend={resendVerification} />

      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickPhotos} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={onPickVideo} />

      <div className="min-h-screen bg-white pb-[120px]">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] h-14 flex items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[15px] font-medium"
            style={{ color: "#0A1628" }}
          >
            Cancel
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold" style={{ color: "#0A1628" }}>
            Backdrop
          </h1>
          <button
            onClick={handlePost}
            disabled={!canPost || submitting}
            className={cn(
              "px-5 h-9 rounded-full text-[14px] font-bold transition-opacity",
              (!canPost || submitting) && "opacity-40"
            )}
            style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>

        {/* Identity row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: avatarUrl ? "transparent" : "linear-gradient(135deg, #0A1628, #1a2a44)" }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#C9A84C] font-bold text-xl">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[16px] truncate" style={{ color: "#0A1628" }}>{displayName}</div>
            {user && (
              <button
                onClick={() => setShowIdentitySheet(true)}
                className="inline-flex items-center gap-1 mt-0.5 text-[13px] text-[#5C6470]"
              >
                <span>Posting as {displayName}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
            {!user && (
              <Link to="/auth" className="text-[13px] text-[#C9A84C] font-medium">Sign in to post</Link>
            )}
          </div>
        </div>

        {/* Winner summary chip (when filled) */}
        {winnerHasData && (
          <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "#C9A84C15", border: "1px solid #C9A84C40" }}>
            <Trophy className="w-4 h-4" style={{ color: "#C9A84C" }} />
            <div className="flex-1 min-w-0 text-[13px] truncate" style={{ color: "#0A1628" }}>
              <span className="font-semibold">{effectiveResult || "Result"}</span>
              {showName && <span className="text-[#5C6470]"> · {showName}</span>}
              {placedBy && <span className="text-[#5C6470]"> · Placed by {placedBy}</span>}
            </div>

            <button onClick={() => setShowWinnerPanel(true)} className="text-[12px] font-semibold" style={{ color: "#8B6914" }}>Edit</button>
          </div>
        )}

        {/* Species chip (when selected) */}
        {species && (
          <div className="mx-4 mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium" style={{ backgroundColor: "#C9A84C15", color: "#8B6914", border: "1px solid #C9A84C40" }}>
            <Leaf className="w-3.5 h-3.5" />
            {species}
            <button onClick={() => setSpecies("")}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Tagged people chip */}
        {taggedPeople.length > 0 && (
          <div className="mx-4 mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-semibold text-[#5C6470]">With:</span>
            {taggedPeople.map(person => (
              <div
                key={person.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
                style={{ backgroundColor: "#C9A84C15", color: "#8B6914", border: "1px solid #C9A84C40" }}
              >
                {person.name}
                <button onClick={() => setTaggedPeople(prev => prev.filter(p => p.id !== person.id))}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowTagSheet(true)}
              className="text-[12px] font-semibold"
              style={{ color: "#C9A84C" }}
            >
              + Add more
            </button>
          </div>
        )}

        {/* Caption area */}
        <div className="px-4 pt-2">
          <textarea
            ref={captionRef}
            value={generalCaption}
            onChange={(e) => setGeneralCaption(e.target.value)}
            placeholder="What's happening in your program? Share a win, sale, update, or anything on your mind…"
            className="w-full resize-none border-0 outline-none bg-transparent placeholder:text-[#9CA3AF]"
            style={{ fontSize: "17px", lineHeight: 1.5, color: "#0A1628", minHeight: "120px", whiteSpace: "pre-wrap" }}
          />
        </div>



        {/* Media preview strip */}
        {media.length > 0 && (
          <div className="px-4 pb-3 mt-1">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#F3F4F6] flex-shrink-0">
                  {m.type === "video" ? (
                    <>
                      <video src={m.preview} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                    </>
                  ) : (
                    <img src={m.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {media.length < 10 && (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-[#E5E7EB] flex items-center justify-center flex-shrink-0"
                >
                  <Plus className="w-6 h-6 text-[#9CA3AF]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Inline Post button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={handlePost}
            disabled={!canPost || submitting}
            className={cn(
              "w-full h-12 rounded-xl text-[16px] font-bold transition-opacity",
              (!canPost || submitting) && "opacity-40"
            )}
            style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>


      {/* Emoji picker panel */}
      {showEmojiPicker && (
        <div className="fixed left-0 right-0 bottom-[120px] z-40 px-2">
          <div className="mx-auto max-w-md rounded-xl overflow-hidden shadow-2xl border border-[#E5E7EB] bg-white">
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) => {
                const ta = captionRef.current;
                const cursor = ta?.selectionStart ?? generalCaption.length;
                const end = ta?.selectionEnd ?? cursor;
                const newCaption = generalCaption.slice(0, cursor) + emojiData.emoji + generalCaption.slice(end);
                setGeneralCaption(newCaption);
                setShowEmojiPicker(false);
                setTimeout(() => ta?.focus(), 0);
              }}
              width="100%"
              height={350}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* Quick-tap livestock emoji row */}
      {showEmojiPicker && (
        <div className="fixed left-0 right-0 bottom-[478px] z-40 flex items-center gap-1 px-4 py-2 bg-white border-t border-[#E5E7EB] overflow-x-auto">
          {["🏆", "🐑", "🐄", "🐖", "🐐", "⭐", "🔥", "👏", "💪", "❤️"].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                const ta = captionRef.current;
                const cursor = ta?.selectionStart ?? generalCaption.length;
                const end = ta?.selectionEnd ?? cursor;
                const newCaption = generalCaption.slice(0, cursor) + emoji + generalCaption.slice(end);
                setGeneralCaption(newCaption);
                setTimeout(() => ta?.focus(), 0);
              }}
              className="text-[22px] w-10 h-10 flex items-center justify-center shrink-0 hover:bg-[#F8F7F4] rounded-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="fixed left-0 right-0 bottom-16 z-30 bg-white border-t border-[#E5E7EB] h-[52px] flex items-center justify-around px-2">
        <ToolbarIcon icon={Camera} onClick={() => photoInputRef.current?.click()} />
        <ToolbarIcon icon={Smile} active={showEmojiPicker} onClick={() => setShowEmojiPicker(v => !v)} />
        <ToolbarIcon icon={Sparkles} gold onClick={() => setShowSmartUpload(true)} />
        <ToolbarIcon icon={Trophy} active={winnerHasData} onClick={handleOpenWinnerPanel} />
        <ToolbarIcon
          icon={MoreHorizontal}
          onClick={() => setShowMoreSheet(true)}
          badge={taggedPeople.length > 0}
        />
      </div>

      {/* Identity bottom sheet */}
      {showIdentitySheet && (
        <BottomSheet onClose={() => setShowIdentitySheet(false)} title="Post as">
          <IdentitySelector value={postedAsBreederId} onChange={(v) => { setPostedAsBreederId(v); setShowIdentitySheet(false); }} postType="general" />
        </BottomSheet>
      )}

      {/* Species bottom sheet */}
      {showSpeciesSheet && (
        <BottomSheet onClose={() => setShowSpeciesSheet(false)} title="Species">
          <div className="grid grid-cols-2 gap-3 pb-2">
            {SPECIES_OPTIONS.map(s => {
              const selected = species === s;
              return (
                <button
                  key={s}
                  onClick={() => setSpecies(selected ? "" : s)}
                  className="h-14 rounded-full font-semibold text-[15px] transition-all"
                  style={{
                    backgroundColor: selected ? "#C9A84C" : "#F3F4F6",
                    color: selected ? "#0A1628" : "#0A1628",
                    border: selected ? "1px solid #C9A84C" : "1px solid #E5E7EB",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <Button onClick={() => setShowSpeciesSheet(false)} className="w-full h-12 rounded-xl font-bold" style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>Done</Button>
        </BottomSheet>
      )}

      {/* More bottom sheet */}
      {showMoreSheet && (
        <BottomSheet onClose={() => setShowMoreSheet(false)} title="More options">
          <div className="space-y-2">
            <button
              onClick={() => { setShowMoreSheet(false); setShowSmartUpload(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#F8F7F4] hover:bg-[#EFEDE8] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C9A84C20" }}>
                <Sparkles className="w-5 h-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px]" style={{ color: "#0A1628" }}>Smart Upload</div>
                <div className="text-[13px] text-[#5C6470]">AI reads your photo or text and fills details</div>
              </div>
            </button>
            <button
              onClick={() => { setShowMoreSheet(false); videoInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#F8F7F4] hover:bg-[#EFEDE8] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C9A84C20" }}>
                <VideoIcon className="w-5 h-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px]" style={{ color: "#0A1628" }}>Add Video</div>
                <div className="text-[13px] text-[#5C6470]">Upload a video to your post</div>
              </div>
            </button>
            <button
              onClick={() => { setShowMoreSheet(false); setShowTagSheet(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#F8F7F4] hover:bg-[#EFEDE8] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C9A84C20" }}>
                <Users className="w-5 h-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] flex items-center gap-2" style={{ color: "#0A1628" }}>
                  Tag People
                  {taggedPeople.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
                      {taggedPeople.length} tagged
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-[#5C6470]">Tag exhibitors, breeders, fitters</div>
              </div>
            </button>
            <button
              onClick={() => { setShowMoreSheet(false); setShowSpeciesSheet(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#F8F7F4] hover:bg-[#EFEDE8] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C9A84C20" }}>
                <Leaf className="w-5 h-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] flex items-center gap-2" style={{ color: "#0A1628" }}>
                  Species
                  {species && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#C9A84C20", color: "#8B6914" }}>
                      {species}
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-[#5C6470]">Tag the species in this post</div>
              </div>
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Tag People bottom sheet */}
      {showTagSheet && (
        <BottomSheet onClose={() => setShowTagSheet(false)} title="Tag People" tall>
          <p className="text-[13px] text-[#5C6470] mb-3">
            Tag exhibitors, breeders, fitters, or anyone with a Backdrop account
          </p>
          <PeopleTagger tagged={taggedPeople} onChange={setTaggedPeople} />
          <Button
            onClick={() => setShowTagSheet(false)}
            className="w-full h-12 rounded-xl font-bold mt-4"
            style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
          >
            Done {taggedPeople.length > 0 ? `(${taggedPeople.length} tagged)` : ""}
          </Button>
        </BottomSheet>
      )}

      {/* Winner details bottom sheet */}
      {showWinnerPanel && (
        <BottomSheet onClose={() => setShowWinnerPanel(false)} title="Winner Details" tall>
          <div className="space-y-4 pb-2">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wide text-[#5C6470] mb-2 block">Placement</label>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {WINNER_RESULTS.map(r => {
                  const sel = resultTitle === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setResultTitle(sel ? "" : r)}
                      className="shrink-0 rounded-full px-3 py-2 text-[13px] font-semibold transition-all border"
                      style={{
                        backgroundColor: sel ? "#C9A84C" : "white",
                        color: "#0A1628",
                        borderColor: sel ? "#C9A84C" : "#E5E7EB",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {resultTitle === "Other" && (
                <Input
                  placeholder="Custom placement…"
                  value={customResult}
                  onChange={(e) => setCustomResult(e.target.value)}
                  className="mt-2 h-11 rounded-lg"
                />
              )}
            </div>

            <FieldLabel>Show Name</FieldLabel>
            <AutocompleteInput
              table="shows" value={showName}
              onChange={(v, id) => { setShowName(v); setShowId(id); }}
              placeholder="Search or type show name"
            />

            <FieldLabel>Shown By</FieldLabel>
            <ExhibitorPicker value={exhibitorName} onChange={setExhibitorName} />

            <FieldLabel>Bred By</FieldLabel>
            <Input value={breederName} onChange={(e) => setBreederName(e.target.value)} placeholder="Breeder name" className="h-11 rounded-lg" />
            <div className="flex items-center justify-between -mt-2">
              <span className="text-[11px] text-[#9CA3AF]">
                {savedDefaults.bredBy === breederName && breederName ? "✓ This is your default" : ""}
              </span>
              {breederName && savedDefaults.bredBy !== breederName && (
                <button
                  type="button"
                  onClick={() => {
                    const newDefaults = { ...savedDefaults, bredBy: breederName };
                    setSavedDefaults(newDefaults);
                    localStorage.setItem("backdrop_post_defaults", JSON.stringify(newDefaults));
                    toast.success("Saved as default breeder name");
                  }}
                  className="text-[11px] font-semibold"
                  style={{ color: "#C9A84C" }}
                >
                  Save as my default
                </button>
              )}
            </div>

            <FieldLabel>Placed By</FieldLabel>
            <Input value={placedBy} onChange={(e) => setPlacedBy(e.target.value)} placeholder="Placed by" className="h-11 rounded-lg" />



            <FieldLabel>Sired By</FieldLabel>
            <AutocompleteInput
              table="sires_lookup" value={sireName}
              onChange={(v, id) => { setSireName(v); setSireId(id); }}
              placeholder="Search or type sire name"
            />

            <FieldLabel>Dam</FieldLabel>
            <Input value={damName} onChange={(e) => setDamName(e.target.value)} placeholder="Dam name" className="h-11 rounded-lg" />

            <FieldLabel>Species</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map(s => {
                const sel = species === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSpecies(sel ? "" : s)}
                    className="px-4 h-10 rounded-full text-[13px] font-semibold"
                    style={{
                      backgroundColor: sel ? "#C9A84C" : "#F3F4F6",
                      color: "#0A1628",
                      border: sel ? "1px solid #C9A84C" : "1px solid #E5E7EB",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-bold uppercase tracking-wide text-[#5C6470]">Notes / Caption</label>
                <button
                  type="button"
                  onClick={handleGenerateCaption}
                  disabled={generatingCaption || !effectiveResult}
                  className="flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 disabled:opacity-40"
                  style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#8B6914" }}
                >
                  <Sparkles className="w-3 h-3" />
                  {generatingCaption ? "Generating…" : "AI Write Caption"}
                </button>
              </div>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any extra notes or let AI write your caption above…" className="rounded-lg min-h-[80px]" />
            </div>

            <Button onClick={() => setShowWinnerPanel(false)} className="w-full h-12 rounded-xl font-bold mt-2" style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
              Done
            </Button>
          </div>
        </BottomSheet>
      )}

      {/* Smart upload modal */}
      {showSmartUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 w-full max-w-md shadow-lg">
            <SmartUpload onExtracted={handleSmartExtracted} onSkip={() => setShowSmartUpload(false)} />
          </div>
        </div>
      )}

      {/* Paste caption modal */}
      {showPasteCaption && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 w-full max-w-md shadow-lg space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "#0A1628" }}>
              <ClipboardPaste className="w-4 h-4" style={{ color: "#C9A84C" }} /> Paste Text
            </h3>
            <Textarea placeholder="Paste your Facebook or Instagram caption here…" value={pasteText} onChange={(e) => setPasteText(e.target.value)} className="rounded-xl text-sm min-h-[120px] resize-none" autoFocus />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowPasteCaption(false); setPasteText(""); }} className="flex-1 h-11 rounded-xl">Cancel</Button>
              <Button onClick={handlePasteCaption} disabled={!pasteText.trim() || submitting} className="flex-1 h-11 rounded-xl font-semibold gap-2" style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
                <Sparkles className="w-4 h-4" /> {submitting ? "Parsing…" : "Auto Fill"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function ToolbarIcon({ icon: Icon, onClick, active }: { icon: any; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
      style={{
        backgroundColor: active ? "#C9A84C" : "transparent",
      }}
    >
      <Icon className="w-[22px] h-[22px]" style={{ color: active ? "#0A1628" : "#0A1628" }} />
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[12px] font-bold uppercase tracking-wide text-[#5C6470] block">{children}</label>;
}



function BottomSheet({ children, onClose, title, tall }: { children: React.ReactNode; onClose: () => void; title?: string; tall?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-t-2xl px-4 pt-2 pb-6 max-h-[88vh] overflow-y-auto"
        style={{ minHeight: tall ? "70vh" : undefined }}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-[#E5E7EB] mb-3" />
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[17px] font-bold" style={{ color: "#0A1628" }}>{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F3F4F6]">
              <X className="w-5 h-5" style={{ color: "#0A1628" }} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
