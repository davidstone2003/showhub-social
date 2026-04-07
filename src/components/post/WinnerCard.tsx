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
      className="relative block w-full overflow-hidden text-left focus:outline-none active:scale-[0.99] transition-transform"
      style={{ aspectRatio: "3 / 2" }}
    >
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

      {/* Bottom gradient — 20% height */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "20%",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Text pinned to bottom edge */}
      <div className="absolute inset-x-0 bottom-0 z-[2] px-4 pb-3 flex flex-col gap-0.5">
        {placing && (
          <p
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 18, lineHeight: 1.2, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            {placing}
          </p>
        )}
        {showLine && (
          <p style={{ fontSize: 13, lineHeight: 1.3, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
            {showLine}
          </p>
        )}
        {breederName && (
          <div className="flex items-center gap-2 mt-0.5">
            <div
              className="flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-xs"
              style={{ width: 22, height: 22 }}
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
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{breederName}</span>
          </div>
        )}
      </div>
    </button>
  );
}
