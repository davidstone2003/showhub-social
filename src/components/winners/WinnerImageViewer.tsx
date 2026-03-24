import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

interface WinnerSlide {
  image: string;
  name: string | null;
  placement: string;
  breeder: string | null;
}

interface WinnerImageViewerProps {
  slides: WinnerSlide[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function WinnerImageViewer({ slides, initialIndex, open, onClose }: WinnerImageViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [showOverlay, setShowOverlay] = useState(true);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setShowOverlay(true);
      setScale(1);
    }
  }, [open, initialIndex]);

  // Auto-hide overlay after 3s
  useEffect(() => {
    if (!open || !showOverlay) return;
    const t = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(t);
  }, [open, showOverlay, index]);

  const current = slides[index];

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (scale > 1) return;
      // Swipe down to close
      if (info.offset.y > 100 && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
        onClose();
        return;
      }
      // Swipe left/right to navigate
      if (Math.abs(info.offset.x) > 60) {
        if (info.offset.x < 0 && index < slides.length - 1) {
          setIndex((i) => i + 1);
          setShowOverlay(true);
        } else if (info.offset.x > 0 && index > 0) {
          setIndex((i) => i - 1);
          setShowOverlay(true);
        }
      }
    },
    [index, slides.length, onClose, scale]
  );

  const handleDoubleTap = useCallback(() => {
    setScale((s) => (s > 1 ? 1 : 2));
  }, []);

  const handleTap = useCallback(() => {
    setShowOverlay((v) => !v);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) { setIndex((i) => i - 1); setShowOverlay(true); }
      if (e.key === "ArrowRight" && index < slides.length - 1) { setIndex((i) => i + 1); setShowOverlay(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, index, slides.length, onClose]);

  if (!current) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Dot indicators */}
          {slides.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] flex gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === index ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image area */}
          <motion.div
            key={index}
            className="w-full h-full flex items-center justify-center touch-none"
            drag={scale <= 1 ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            onDoubleClick={handleDoubleTap}
            onClick={handleTap}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.img
              src={current.image}
              alt={current.name || current.placement}
              className="max-w-full max-h-full object-contain pointer-events-none"
              style={{ scale }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              draggable={false}
            />
          </motion.div>

          {/* Bottom overlay */}
          <AnimatePresence>
            {showOverlay && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 z-[110] pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-8 pt-16 pointer-events-auto">
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/60">
                    {current.placement}
                  </p>
                  <p className="text-[20px] font-bold text-white leading-tight mt-1">
                    {current.name || "Unknown"}
                  </p>
                  {current.breeder && (
                    <div className="flex items-center gap-3 mt-2">
                      <Link
                        to={`/breeders`}
                        className="text-[14px] text-white/80 underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {current.breeder}
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
