import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  caption?: string;
  placement?: string;
}

export default function PhotoViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  caption,
  placement,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, initialIndex]);

  const goToPrev = useCallback(
    () => setCurrentIndex((p) => (p - 1 + images.length) % images.length),
    [images.length]
  );
  const goToNext = useCallback(
    () => setCurrentIndex((p) => (p + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goToPrev();
      else if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, goToPrev, goToNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center px-4">
        <img
          src={images[currentIndex]}
          alt={caption || placement || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Caption */}
      {(caption || placement) && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pt-6 pb-8 bg-gradient-to-t from-black/80 to-transparent text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {placement && (
            <p className="text-base font-bold" style={{ color: "#D4AF37" }}>
              {placement}
            </p>
          )}
          {caption && (
            <p className="text-sm mt-1 opacity-90 whitespace-pre-wrap">{caption}</p>
          )}
        </div>
      )}
    </div>
  );
}
