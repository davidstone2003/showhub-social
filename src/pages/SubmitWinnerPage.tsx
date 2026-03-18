import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Camera,
  Plus,
  X,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Trophy,
  ImagePlus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const POPULAR_SHOWS = [
  "Houston Livestock Show",
  "OYE (Oklahoma Youth Expo)",
  "Fort Worth Stock Show",
  "Arizona Nationals",
  "San Antonio Stock Show",
  "Denver National Western",
  "Indiana State Fair",
  "Ohio State Fair",
  "Louisville North American",
  "American Royal",
];

const POPULAR_SHOWN_BY = [
  "Staci Show Mac",
  "Kade Mills",
  "Hadley Hodges",
  "Colton Barber",
];

type ImageFile = {
  file: File;
  preview: string;
};

export default function SubmitWinnerPage() {
  // Required fields
  const [images, setImages] = useState<ImageFile[]>([]);
  const [title, setTitle] = useState("");
  const [showName, setShowName] = useState("");
  const [shownBy, setShownBy] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  // Optional fields
  const [bredBy, setBredBy] = useState("");
  const [siredBy, setSiredBy] = useState("");
  const [dam, setDam] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // UI state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shownBySuggestions, setShownBySuggestions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Only auto-extract on paste (when value jumps significantly)
      if (value.length > 40 && !caption) {
        // Try to detect show names
        for (const show of POPULAR_SHOWS) {
          if (value.toLowerCase().includes(show.toLowerCase()) && !showName) {
            setShowName(show);
            break;
          }
        }
        // Try to detect title patterns
        const titleMatch = value.match(
          /(Grand Champion|Reserve Grand Champion|Champion|Reserve Champion|Class Winner|Breed Champion)[\s]*(Market Lamb|Market Goat|Breeding Ewe|Market Steer|Market Barrow|Market Hog)?/i
        );
        if (titleMatch && !title) {
          setTitle(titleMatch[0]);
        }
        // Try to detect "Shown By" or "Exhibited By"
        const shownByMatch = value.match(/(?:shown by|exhibited by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
        if (shownByMatch && !shownBy) {
          setShownBy(shownByMatch[1].trim());
        }
        // Try to detect "Bred By"
        const bredByMatch = value.match(/(?:bred by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
        if (bredByMatch && !bredBy) {
          setBredBy(bredByMatch[1].trim());
          setDetailsOpen(true);
        }
        // Try to detect "Sired By"
        const siredByMatch = value.match(/(?:sired by|sire)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
        if (siredByMatch && !siredBy) {
          setSiredBy(siredByMatch[1].trim());
          setDetailsOpen(true);
        }
      }
    },
    [caption, showName, title, shownBy, bredBy, siredBy]
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

  const addTag = () => {
    const tag = tagInput.trim().startsWith("#") ? tagInput.trim() : `#${tagInput.trim()}`;
    if (tag.length > 1 && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const filteredShows = POPULAR_SHOWS.filter((s) =>
    s.toLowerCase().includes(showName.toLowerCase())
  );

  const filteredShownBy = POPULAR_SHOWN_BY.filter((s) =>
    s.toLowerCase().includes(shownBy.toLowerCase())
  );

  const handleSubmit = () => {
    if (!isValid) return;
    setShowPreview(true);
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
                {/* Main cover image */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={images[0].preview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
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

                {/* Thumbnails row */}
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

            {/* Title */}
            <Input
              placeholder="Title / Win (e.g., Grand Champion Market Lamb)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl bg-card border-border h-11 text-sm"
            />

            {/* Show Name with auto-suggest */}
            <div className="relative">
              <Input
                placeholder="Show Name (e.g., Arizona Nationals)"
                value={showName}
                onChange={(e) => {
                  setShowName(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(showName.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="rounded-xl bg-card border-border h-11 text-sm"
              />
              {showSuggestions && filteredShows.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                  {filteredShows.map((show) => (
                    <button
                      key={show}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onMouseDown={() => {
                        setShowName(show);
                        setShowSuggestions(false);
                      }}
                    >
                      {show}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shown By with auto-suggest */}
            <div className="relative">
              <Input
                placeholder="Shown By (e.g., Staci Show Mac)"
                value={shownBy}
                onChange={(e) => {
                  setShownBy(e.target.value);
                  setShownBySuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShownBySuggestions(shownBy.length > 0)}
                onBlur={() => setTimeout(() => setShownBySuggestions(false), 150)}
                className="rounded-xl bg-card border-border h-11 text-sm"
              />
              {shownBySuggestions && filteredShownBy.length > 0 && (
                <button
                  className="absolute top-full left-0 right-0 z-30 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {filteredShownBy.map((name) => (
                    <div
                      key={name}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer"
                      onMouseDown={() => {
                        setShownBy(name);
                        setShownBySuggestions(false);
                      }}
                    >
                      {name}
                    </div>
                  ))}
                </button>
              )}
            </div>

            {/* Date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl h-11 bg-card border-border text-sm",
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

          {/* ====== OPTIONAL DETAILS (collapsible) ====== */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-sm font-medium text-primary w-full py-2">
                {detailsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                People & Pedigree
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-1">
              <Input
                placeholder="Bred By (e.g., Time Ranch)"
                value={bredBy}
                onChange={(e) => setBredBy(e.target.value)}
                className="rounded-xl bg-card border-border h-11 text-sm"
              />
              <Input
                placeholder="Sired By (e.g., Double T)"
                value={siredBy}
                onChange={(e) => setSiredBy(e.target.value)}
                className="rounded-xl bg-card border-border h-11 text-sm"
              />
              <Input
                placeholder="Dam (e.g., Zerbach)"
                value={dam}
                onChange={(e) => setDam(e.target.value)}
                className="rounded-xl bg-card border-border h-11 text-sm"
              />
            </CollapsibleContent>
          </Collapsible>

          {/* ====== CAPTION ====== */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Caption
            </label>
            <Textarea
              placeholder={`Huge congrats to Staci & family on this Grand Champion Market Lamb at Arizona Nationals! Incredible hard work paying off 🐑🏆 #AZNats`}
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              className="rounded-xl bg-card border-border text-sm min-h-[180px] resize-none"
            />
          </div>

          {/* ====== TAGS ====== */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full text-xs px-2.5 py-1 bg-primary/10 text-primary border-0 cursor-pointer hover:bg-primary/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag (e.g., MarketLamb)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="rounded-xl bg-card border-border h-9 text-sm flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="rounded-xl h-9 px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ====== POST PREVIEW ====== */}
          {showPreview && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
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
            disabled={!isValid}
            className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-40"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Post Winner
          </Button>
        </div>
      </div>
    </Layout>
  );
}
