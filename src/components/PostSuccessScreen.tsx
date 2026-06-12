import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Facebook } from "lucide-react";
import { toast } from "sonner";

export interface WinnerRef {
  winnerId: string;
  showName: string;
  shownBy: string;
  showId: string | null;
}

interface WinData {
  showName: string;
  winPlacing: string;
  shownBy: string;
  placedBy: string;
  sireName: string;
  damName: string;
  caption: string;
  imageUrls: string[];
  resultCount?: number;
  postedAsBreederId?: string | null;
  winnerRefs?: WinnerRef[];
}

function buildFacebookCaption(d: WinData): string {
  const lines: string[] = [];
  if (d.winPlacing) lines.push(`🏆 ${d.winPlacing}`);
  if (d.showName) lines.push(d.showName);
  if (lines.length) lines.push("");
  if (d.shownBy) lines.push(`Shown by ${d.shownBy}`);
  if (d.placedBy) lines.push(`Placed by ${d.placedBy}`);
  if (d.sireName) lines.push(`Sired by ${d.sireName}`);
  if (d.damName) lines.push(`Dam: ${d.damName}`);
  if (d.caption) { lines.push(""); lines.push(d.caption); }
  return lines.join("\n").trim();
}

export default function PostSuccessScreen({ data }: { data: WinData }) {
  const navigate = useNavigate();
  const fbCaption = buildFacebookCaption(data);

  const handleShareFacebook = async () => {
    try { await navigator.clipboard.writeText(fbCaption); } catch {}
    if (navigator.share) {
      try {
        const shareData: ShareData = { text: fbCaption };
        if (data.imageUrls[0]) {
          try {
            const resp = await fetch(data.imageUrls[0]);
            const blob = await resp.blob();
            shareData.files = [new File([blob], "win.jpg", { type: blob.type })];
          } catch {}
        }
        await navigator.share(shareData);
        return;
      } catch (e: any) { if (e.name === "AbortError") return; }
    }
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(fbCaption)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Caption copied to clipboard", { description: "Paste it into your Facebook post." });
  };

  const handlePostAnother = () => {
    navigate("/submit", {
      state: {
        showName: data.showName,
        shownBy: data.shownBy,
        sireName: data.sireName,
        damName: data.damName,
        postedAsBreederId: data.postedAsBreederId || null,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(34,197,94,0.12)" }}>
        <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
      </div>
      <h1 className="text-[22px] font-bold text-[#0A1628]">Posted!</h1>
      <p className="text-[14px] text-[#6B7280] mt-1 text-center">
        {data.showName ? `${data.showName}${data.shownBy ? ` — ${data.shownBy}` : ""}` : "Your post is live on Backdrop"}
      </p>

      <div className="w-full max-w-xs mt-8 space-y-3">
        <button
          onClick={() => navigate("/")}
          className="w-full h-12 rounded-xl text-[15px] font-bold"
          style={{ backgroundColor: "#0A1628", color: "white" }}
        >
          View Feed
        </button>

        <button
          onClick={handleShareFacebook}
          className="w-full h-12 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2.5"
          style={{ backgroundColor: "#1877F2", color: "white" }}
        >
          <Facebook className="w-5 h-5" />
          Share to Facebook
        </button>

        <button
          onClick={handlePostAnother}
          className="w-full py-3 text-[14px] font-semibold text-center"
          style={{ color: "#C9A84C" }}
        >
          + Post Another
        </button>
      </div>
    </div>
  );
}
