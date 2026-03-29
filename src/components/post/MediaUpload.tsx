import React, { useRef, useState } from "react";
import { ImagePlus, Video, X, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

export type SoundOption = "original" | "mute";

interface MediaUploadProps {
  media: MediaFile[];
  onMediaChange: (media: MediaFile[]) => void;
  soundOption: SoundOption;
  onSoundOptionChange: (opt: SoundOption) => void;
  maxImages?: number;
  maxVideos?: number;
}

export function MediaUpload({
  media,
  onMediaChange,
  soundOption,
  onSoundOptionChange,
  maxImages = 3,
  maxVideos = 1,
}: MediaUploadProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const images = media.filter(m => m.type === "image");
  const videos = media.filter(m => m.type === "video");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMedia = files.slice(0, maxImages - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: "image" as const,
    }));
    onMediaChange([...media, ...newMedia]);
    if (imageRef.current) imageRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Remove existing videos, only 1 allowed
    const withoutVideos = media.filter(m => m.type !== "video");
    onMediaChange([...withoutVideos, { file, preview: URL.createObjectURL(file), type: "video" }]);
    if (videoRef.current) videoRef.current.value = "";
  };

  const removeMedia = (idx: number) => {
    onMediaChange(media.filter((_, i) => i !== idx));
  };

  const hasVideo = videos.length > 0;
  const hasImages = images.length > 0;

  if (media.length === 0) {
    return (
      <div className="space-y-2">
        <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="flex-1 aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 transition-colors hover:border-primary/50 hover:bg-muted"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Photo</p>
            <p className="text-[11px] text-muted-foreground">Up to {maxImages}</p>
          </button>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            className="flex-1 aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 transition-colors hover:border-primary/50 hover:bg-muted"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Video</p>
            <p className="text-[11px] text-muted-foreground">With sound</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

      {/* Primary media preview */}
      <div className="relative w-full rounded-xl overflow-hidden bg-muted" style={{ aspectRatio: "4/3" }}>
        {media[0].type === "video" ? (
          <video
            src={media[0].preview}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <img src={media[0].preview} alt="Cover" className="w-full h-full object-cover" />
        )}
        <button
          type="button"
          onClick={() => removeMedia(0)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Sound options for video */}
      {hasVideo && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSoundOptionChange("original")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition-colors",
              soundOption === "original"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border"
            )}
          >
            <Volume2 className="w-3.5 h-3.5" /> Original Sound
          </button>
          <button
            type="button"
            onClick={() => onSoundOptionChange("mute")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition-colors",
              soundOption === "mute"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border"
            )}
          >
            <VolumeX className="w-3.5 h-3.5" /> Mute
          </button>
        </div>
      )}

      {/* Thumbnails for additional media */}
      <div className="flex gap-2">
        {media.slice(1).map((m, i) => (
          <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
            {m.type === "video" ? (
              <video src={m.preview} className="w-full h-full object-cover" muted />
            ) : (
              <img src={m.preview} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeMedia(i + 1)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {!hasVideo && images.length < maxImages && (
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          >
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        {!hasVideo && (
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          >
            <Video className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
