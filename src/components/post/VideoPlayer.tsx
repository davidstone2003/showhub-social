import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  aspectRatio?: string;
}

/** Autoplay-muted video in feed. Tap opens fullscreen with sound. */
export function FeedVideo({ src, poster, className, aspectRatio = "4/3" }: FeedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const handleTap = () => {
    const video = videoRef.current;
    if (!video) return;
    // Try fullscreen
    if (video.requestFullscreen) {
      video.muted = false;
      video.requestFullscreen().catch(() => {});
    } else if ((video as any).webkitEnterFullscreen) {
      video.muted = false;
      (video as any).webkitEnterFullscreen();
    }
  };

  return (
    <div className={cn("relative overflow-hidden cursor-pointer", className)} style={{ aspectRatio }} onClick={handleTap}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="metadata"
      />
      {/* Play indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
        <div className="bg-black/60 rounded-full px-2 py-1 flex items-center gap-1">
          <VolumeX className="w-3 h-3 text-white" />
          <Maximize2 className="w-3 h-3 text-white" />
        </div>
      </div>
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-foreground ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

interface FullscreenVideoProps {
  src: string;
  open: boolean;
  onClose: () => void;
}

export function FullscreenVideo({ src, open, onClose }: FullscreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={onClose}>
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-full"
        autoPlay
        playsInline
        controls
        muted={muted}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center"
      >
        {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white text-lg font-bold px-3 py-1"
      >
        ✕
      </button>
    </div>
  );
}
