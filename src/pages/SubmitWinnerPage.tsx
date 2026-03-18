import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import {
  Camera,
  X,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Trophy,
  ImagePlus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ImageFile = {
  file: File;
  preview: string;
};

export default function SubmitWinnerPage() {
  // Required fields
  const [images, setImages] = useState<ImageFile[]>([]);
  const [title, setTitle] = useState("");
  const [showName, setShowName] = useState("");
  const [showId, setShowId] = useState<string | null>(null);
  const [shownBy, setShownBy] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  // Optional fields
  const [bredBy, setBredBy] = useState("");
  const [breederId, setBreederId] = useState<string | null>(null);
  const [siredBy, setSiredBy] = useState("");
  const [sireId, setSireId] = useState<string | null>(null);
  const [dam, setDam] = useState("");
  const [placedBy, setPlacedBy] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // UI state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isValid = title.trim() && showName.trim() && shownBy.trim();

  // Auto-generate tags from fields
  useEffect(() => {
    const autoTags: string[] = [];
    if (showName.trim()) autoTags.push(`#${showName.replace(/\s+/g, "")}`);
    if (shownBy.trim()) autoTags.push(`#${shownBy.replace(/\s+/g, "")}`);
    if (bredBy.trim()) autoTags.push(`#${bredBy.replace(/\s+/g, "")}`);
    if (siredBy.trim()) autoTags.push(`#${siredBy.replace(/\s+/g, "")}`);
    if (title.toLowerCase().includes("market lamb")) autoTags.push("#MarketLamb");
    if (title.toLowerCase().includes("grand champion")) autoTags.push("#GrandChampion");
    setTags(autoTags);
  }, [showName, shownBy, bredBy, siredBy, title]);

  // Auto-extraction from caption paste
  const handleCaptionChange = useCallback(
    (value: string) => {
      setCaption(value);
      if (value.length > 40 && !caption) {
        const titleMatch = value.match(
          /(Grand Champion|Reserve Grand Champion|Champion|Reserve Champion|Class Winner|Breed Champion)[\s]*(Market Lamb|Market Goat|Breeding Ewe|Market Steer|Market Barrow|Market Hog)?/i
        );
        if (titleMatch && !title) setTitle(titleMatch[0]);
        const shownByMatch = value.match(/(?:shown by|exhibited by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
        if (shownByMatch && !shownBy) setShownBy(shownByMatch[1].trim());
        const bredByMatch = value.match(/(?:bred by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
        if (bredByMatch && !bredBy) {
          setBredBy(bredByMatch[1].trim());
          setDetailsOpen(true);
        }
        const siredByMatch = value.match(/(?:sired by|sire)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
        if (siredByMatch && !siredBy) {
          setSiredBy(siredByMatch[1].trim());
          setDetailsOpen(true);
        }
      }
    },
    [caption, title, shownBy, bredBy, siredBy]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 3 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upsert into lookup table if free text (no id matched)
  const ensureLookupEntry = async (
    table: "shows" | "sires_lookup" | "breeders_lookup",
    displayText: string,
    existingId: string | null
  ): Promise<string | null> => {
    if (!displayText.trim()) return null;
    if (existingId) return existingId;

    // Try to find existing
    const { data: existing } = await supabase
      .from(table)
      .select("id")
      .ilike("name", displayText.trim())
      .limit(1);

    if (existing && existing.length > 0) return existing[0].id;

    // Insert new
    const { data: inserted, error } = await supabase
      .from(table)
      .insert({ name: displayText.trim() })
      .select("id")
      .single();

    if (error || !inserted) return null;
    return inserted.id;
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    try {
      const imageUrls: string[] = [];

      for (const img of images) {
        const fileExt = img.file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("winner-images")
          .upload(filePath, img.file, {
            contentType: img.file.type,
            cacheControl: "3600",
          });

        if (uploadError) throw new Error("Photo upload failed. Please try again.");

        const { data: urlData } = supabase.storage
          .from("winner-images")
          .getPublicUrl(filePath);
        imageUrls.push(urlData.publicUrl);
      }

      // Resolve IDs for lookup fields
      const resolvedShowId = await ensureLookupEntry("shows", showName, showId);
      const resolvedSireId = siredBy.trim()
        ? await ensureLookupEntry("sires_lookup", siredBy, sireId)
        : null;
      const resolvedBreederId = bredBy.trim()
        ? await ensureLookupEntry("breeders_lookup", bredBy, breederId)
        : null;

      const { error } = await supabase.from("winners").insert({
        title: title.trim(),
        show_name: showName.trim(),
        shown_by: shownBy.trim(),
        date: date.toISOString().split("T")[0],
        bred_by: bredBy.trim() || null,
        sired_by: siredBy.trim() || null,
        dam: dam.trim() || null,
        placed_by: placedBy.trim() || null,
        caption: caption.trim() || null,
        tags,
        image_urls: imageUrls,
        show_id: resolvedShowId,
        sire_id: resolvedSireId,
        breeder_id: resolvedBreederId,
      });

      if (error) throw error;

      toast.success("Winner posted! 🏆", {
        description: `${title} at ${showName}`,
      });
      navigate("/");
    } catch (err: any) {
      toast.error("Failed to post", {
        description: err.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            Post a Winner
          </h1>
        </div>

        <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
          {/* ====== PHOTO UPLOAD ====== */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            {images.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-primary/50 hover:bg-muted"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImagePlus className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Add Photos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Up to 3 images • First is cover</p>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                  <img src={images[0].preview} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(0)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <Badge className="absolute bottom-2 left-2 bg-black/60 text-white border-0 text-[10px]">
                    Cover
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {images.slice(1).map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i + 1)}
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

          {/* ====== REQUIRED WIN DETAILS ====== */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Win Details
            </label>

            <Input
              placeholder="Title / Win (e.g., Grand Champion Market Lamb)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />

            <AutocompleteInput
              table="shows"
              placeholder="Show Name (e.g., Arizona Nationals)"
              value={showName}
              onChange={(display, id) => {
                setShowName(display);
                setShowId(id);
              }}
            />

            <Input
              placeholder="Shown By (e.g., Staci Show Mac)"
              value={shownBy}
              onChange={(e) => setShownBy(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl h-12 bg-card border-border text-sm",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {date ? format(date, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* ====== OPTIONAL DETAILS ====== */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-sm font-medium text-primary w-full py-2">
                {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                People & Pedigree
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-1">
              <AutocompleteInput
                table="breeders_lookup"
                placeholder="Bred By (e.g., Time Ranch)"
                value={bredBy}
                onChange={(display, id) => {
                  setBredBy(display);
                  setBreederId(id);
                }}
              />
              <AutocompleteInput
                table="sires_lookup"
                placeholder="Sired By (e.g., Double T)"
                value={siredBy}
                onChange={(display, id) => {
                  setSiredBy(display);
                  setSireId(id);
                }}
              />
              <Input
                placeholder="Dam (e.g., Zerbach)"
                value={dam}
                onChange={(e) => setDam(e.target.value)}
                className="rounded-xl bg-card border-border h-12 text-sm"
              />
              <Input
                placeholder="Placed By (e.g., John Smith)"
                value={placedBy}
                onChange={(e) => setPlacedBy(e.target.value)}
                className="rounded-xl bg-card border-border h-12 text-sm"
              />
            </CollapsibleContent>
          </Collapsible>

          {/* ====== CAPTION ====== */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Caption
            </label>
            <Textarea
              placeholder="Huge congrats to Staci & family on this Grand Champion Market Lamb at Arizona Nationals! 🐑🏆"
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              className="rounded-xl bg-card border-border text-sm min-h-[200px] resize-none"
            />
          </div>

          {/* ====== AUTO TAGS ====== */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full text-xs px-2.5 py-1 bg-primary/10 text-primary border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* ====== POST PREVIEW ====== */}
          {isValid && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Preview
              </p>
              {images[0] && (
                <img
                  src={images[0].preview}
                  alt="Preview"
                  className="w-full rounded-lg aspect-[4/3] object-cover mb-3"
                />
              )}
              <p className="text-sm font-bold text-foreground">{showName}</p>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">Shown By: {shownBy}</p>
              {bredBy && <p className="text-sm text-muted-foreground">Bred By: {bredBy}</p>}
              {siredBy && <p className="text-sm text-muted-foreground">Sired By: {siredBy}</p>}
              {dam && <p className="text-sm text-muted-foreground">Dam: {dam}</p>}
              {caption && <p className="text-sm text-foreground mt-2">{caption}</p>}
              {tags.length > 0 && (
                <p className="text-sm text-primary mt-1">{tags.join(" ")}</p>
              )}
            </div>
          )}
        </div>

        {/* ====== FIXED BOTTOM POST BUTTON ====== */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-30 max-w-lg mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            <Trophy className="w-5 h-5 mr-2" />
            {submitting ? "Posting…" : "Post Winner"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
