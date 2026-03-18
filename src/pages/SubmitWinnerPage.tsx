import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { Camera, X, ImagePlus, Heart, UserPlus, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type ImageFile = {
  file: File;
  preview: string;
};

export default function SubmitWinnerPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showName, setShowName] = useState("");
  const [showId, setShowId] = useState<string | null>(null);
  const [shownBy, setShownBy] = useState("");
  const [bredBy, setBredBy] = useState("");
  const [placedBy, setPlacedBy] = useState("");
  const [showDate, setShowDate] = useState<Date>(new Date());
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

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

      const resolvedShowId = await ensureLookupEntry("shows", showName, showId);
      const resolvedBreederId = bredBy.trim()
        ? await ensureLookupEntry("breeders_lookup", bredBy, null)
        : null;

      const { error } = await supabase.from("winners").insert({
        title: showName.trim(),
        show_name: showName.trim(),
        shown_by: shownBy.trim(),
        bred_by: bredBy.trim() || null,
        breeder_id: resolvedBreederId,
        placed_by: placedBy.trim() || null,
        date: format(showDate, "yyyy-MM-dd"),
        caption: caption.trim() || null,
        tags: [],
        image_urls: imageUrls,
        show_id: resolvedShowId,
      });

      if (error) throw error;

      toast.success("Added to Backdrop!", {
        description: `${showName} — ${shownBy}`,
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
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">Put your win on the backdrop</p>
        </div>

        <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
          {/* Photo Upload */}
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
                  <p className="text-sm font-semibold text-foreground">Add Photo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Up to 3 images</p>
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

          {/* Fields */}
          <div className="space-y-3">
            <AutocompleteInput
              table="shows"
              placeholder="Show (e.g., Ohio State Fair)"
              value={showName}
              onChange={(display, id) => {
                setShowName(display);
                setShowId(id);
              }}
            />
            <Input
              placeholder="Shown by (e.g., Caleb Stone) *"
              value={shownBy}
              onChange={(e) => setShownBy(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
            <Input
              placeholder="Bred by (optional)"
              value={bredBy}
              onChange={(e) => setBredBy(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
            <Input
              placeholder="Placed by (optional)"
              value={placedBy}
              onChange={(e) => setPlacedBy(e.target.value)}
              className="rounded-xl bg-card border-border h-12 text-sm"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl bg-card border-border h-12 text-sm",
                    !showDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(showDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={showDate}
                  onSelect={(d) => d && setShowDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Caption */}
          <Textarea
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="rounded-xl bg-card border-border text-sm min-h-[80px] resize-none"
          />

          {/* Preview */}
          {isValid && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-3 pb-2">
                Preview
              </p>
              {images[0] && (
                <img src={images[0].preview} alt="Preview" className="w-full aspect-[4/3] object-cover" />
              )}
              <div style={{ padding: "12px 14px 6px" }}>
                <p className="font-bold text-foreground" style={{ fontSize: "15px", lineHeight: "20px" }}>
                  {showName}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px", marginTop: "2px" }}>
                  Shown by: <span className="text-foreground font-medium">{shownBy}</span>
                </p>
                {bredBy.trim() && (
                  <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px", marginTop: "2px" }}>
                    Bred by: <span className="text-foreground font-medium">{bredBy}</span>
                  </p>
                )}
                {placedBy.trim() && (
                  <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px", marginTop: "2px" }}>
                    Placed by: <span className="text-foreground font-medium">{placedBy}</span>
                  </p>
                )}
                {caption && (
                  <p className="text-muted-foreground mt-1.5" style={{ fontSize: "13px", lineHeight: "18px" }}>
                    {caption}
                  </p>
                )}
                <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "16px", marginTop: "8px" }}>
                  0 likes · 0 comments
                </p>
              </div>
              <div className="border-t border-border mx-3.5" />
              <div className="flex items-center px-3" style={{ height: "38px", gap: "4px" }}>
                <span className="text-xs font-bold text-primary">Contact</span>
                <div className="flex-1" />
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Follow
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-30 max-w-lg mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {submitting ? "Adding…" : "Add to Backdrop"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
