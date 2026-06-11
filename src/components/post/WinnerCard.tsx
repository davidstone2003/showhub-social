import React from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/data/mock";

function accentColor(placing?: string | null): string {
  if (!placing) return "#C4A882";
  const p = placing.toLowerCase();
  if (/grand\s*champ/i.test(p) && !/reserve/i.test(p)) return "#C9A84C";
  if (/reserve/i.test(p)) return "#A8A9AD";
  if (/class\s*winner/i.test(p)) return "#4A7C59";
  return "#C4A882";
}

/** Small ribbon SVG icon */
function RibbonIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.9 7.9L21.5 8.9L16.75 13.5L17.8 20.1L12 17L6.2 20.1L7.25 13.5L2.5 8.9L9.1 7.9L12 2Z" fill={color} />
      <path d="M8 18L6 23L9.5 20.5" fill={color} opacity="0.7" />
      <path d="M16 18L18 23L14.5 20.5" fill={color} opacity="0.7" />
    </svg>
  );
}

interface WinnerCardProps {
  post: Post & { status?: string; user_id?: string | null };
  onTap?: () => void;
}

export function WinnerCard({ post, onTap }: WinnerCardProps) {
  const navigate = useNavigate();
  const placing = post.win_placing || post.win_title || "";
  const showName = post.show_name || "";
  const dateStr = (post as any).date || post.created_at;
  const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
  const showLine = showName ? `${year} ${showName}` : "";
  const breederName = post.breeder?.name || "";
  const breederSlug = post.breeder?.slug || "";
  const breederLogo = post.breeder?.logo || "";
  const accent = accentColor(placing);
  const imageSrc = post.image || "/placeholder.svg";

  return (
    <button
      type="button"
      onClick={onTap}
      className="block w-full text-left focus:outline-none active:scale-[0.99] transition-transform"
    >
      {/* Clean photo — no overlay */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <img
          src={imageSrc}
          alt={placing || "Winner"}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Breeder avatar bottom-right */}
        {(breederLogo || breederName) && (
          <div
            className="absolute flex items-center justify-center rounded-full overflow-hidden"
            style={{
              width: 32,
              height: 32,
              bottom: 8,
              right: 8,
              zIndex: 2,
              border: "2px solid rgba(255,255,255,0.85)",
              backgroundColor: "#1A1A1A",
            }}
          >
            {breederLogo && typeof breederLogo === "string" && breederLogo.startsWith("http") ? (
              <img src={breederLogo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span style={{ fontSize: 14, color: "#fff" }}>
                {breederLogo || breederName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Champion footer */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0" style={{ height: 3, backgroundColor: accent }} />
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0" style={{ width: 6, backgroundColor: accent }} />

        <div style={{ padding: "14px 16px 14px 22px" }} className="flex flex-col gap-1">
          {/* Row 1: Ribbon + Placing */}
          <div className="flex items-center gap-2">
            <RibbonIcon color={accent} size={28} />
            <p
              className="font-bold uppercase tracking-wide"
              style={{ fontSize: 18, lineHeight: 1.2, color: "#FFFFFF" }}
            >
              {placing || "Winner"}
            </p>
          </div>

          {/* Row 2: Show + Breeder */}
          <div className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: 36 }}>
            {showLine && (
              <span style={{ fontSize: 13, lineHeight: 1.3, color: "#C4A882" }}>
                {showLine}
              </span>
            )}
            {showLine && breederName && (
              <span style={{ fontSize: 13, color: "#555" }}>·</span>
            )}
            {breederName && (
              breederSlug ? (
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); navigate(`/breeder/${breederSlug}`); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); navigate(`/breeder/${breederSlug}`); } }}
                  className="hover:underline cursor-pointer"
                  style={{ fontSize: 13, lineHeight: 1.3, color: "rgba(255,255,255,0.85)" }}
                >
                  {breederName}
                </span>
              ) : (
                <span style={{ fontSize: 13, lineHeight: 1.3, color: "rgba(255,255,255,0.75)" }}>
                  {breederName}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
