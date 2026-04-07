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
      className="block w-full text-left focus:outline-none active:scale-[0.99] transition-transform"
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3 / 2" }}>
        <img
          src={imageSrc}
          alt={placing || "Winner"}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />

        <div
          className="absolute left-0 top-0 bottom-0"
          style={{ width: 4, backgroundColor: accent, zIndex: 2 }}
        />
      </div>

      <div className="bg-card px-4 py-3 flex flex-col gap-0.5">
        {placing && (
          <p
            className="text-foreground font-bold uppercase tracking-wide"
            style={{ fontSize: 18, lineHeight: 1.2 }}
          >
            {placing}
          </p>
        )}

        {showLine && (
          <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.3 }}>
            {showLine}
          </p>
        )}

        {post.shown_by && (
          <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.3 }}>
            Shown by {post.shown_by}
          </p>
        )}

        {breederName && (
          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-full bg-muted text-xs"
              style={{ width: 22, height: 22 }}
            >
              {breederLogo ? (
                typeof breederLogo === "string" && breederLogo.startsWith("http") ? (
                  <img src={breederLogo} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{breederLogo}</span>
                )
              ) : (
                <span>🐑</span>
              )}
            </div>
            <span className="text-muted-foreground" style={{ fontSize: 11 }}>{breederName}</span>
          </div>
        )}
      </div>
    </button>
  );
}
