import React from "react";
import type { Post } from "@/data/mock";

/** Color accent bar based on placing */
function accentColor(placing?: string | null): string {
  if (!placing) return "#C4A882";
  const p = placing.toLowerCase();
  if (/grand\s*champ/i.test(p) && !/reserve/i.test(p)) return "#C9A84C";
  if (/reserve/i.test(p)) return "#A8A9AD";
  if (/class\s*winner/i.test(p)) return "#4A7C59";
  return "#C4A882";
}

interface WinnerCardProps {
  post: Post & { status?: string; user_id?: string | null };
  onTap?: () => void;
}

export function WinnerCard({ post, onTap }: WinnerCardProps) {
  const placing = post.win_placing || post.win_title || "";
  const showName = post.show_name || "";
  const dateStr = (post as any).date || post.created_at;
  const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
  const showLine = showName ? `${year} ${showName}` : "";
  const breederName = post.breeder?.name || "";
  const breederLogo = post.breeder?.logo || "";
  const accent = accentColor(placing);
  const imageSrc = post.image || "/placeholder.svg";

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative block w-full overflow-hidden bg-card text-left focus:outline-none active:scale-[0.99] transition-transform"
      style={{ aspectRatio: "4 / 5", borderRadius: 12 }}
    >
      {/* Hero image */}
      <img
        src={imageSrc}
        alt={placing || "Winner"}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />

      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: 4, backgroundColor: accent, zIndex: 2 }}
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "40%",
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Text over gradient */}
      <div className="absolute inset-x-0 bottom-0 z-[2] px-4 pb-4 flex flex-col gap-1">
        {/* Placing */}
        {placing && (
          <p
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 20, lineHeight: 1.2, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
          >
            {placing}
          </p>
        )}
        {/* Show + year */}
        {showLine && (
          <p
            style={{ fontSize: 14, lineHeight: 1.3, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
          >
            {showLine}
          </p>
        )}
        {/* Breeder avatar + name */}
        {breederName && (
          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-xs"
              style={{ width: 24, height: 24 }}
            >
              {breederLogo ? (
                typeof breederLogo === "string" && breederLogo.startsWith("http") ? (
                  <img src={breederLogo} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{breederLogo}</span>
                )
              ) : (
                <span style={{ color: "#fff" }}>🐑</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{breederName}</span>
          </div>
        )}
      </div>
    </button>
  );
}
