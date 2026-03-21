import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Facebook, Download, Copy, FileJson, ChevronDown, ChevronUp } from "lucide-react";
import { PostListingUpsell } from "@/components/upgrade/PostListingUpsell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WinData {
  showName: string;
  winPlacing: string;
  shownBy: string;
  placedBy: string;
  sireName: string;
  damName: string;
  caption: string;
  imageUrls: string[];
}

function buildFacebookCaption(d: WinData): string {
  const lines: string[] = [];

  if (d.winPlacing) lines.push(`🏆 ${d.winPlacing}`);
  if (d.showName) lines.push(d.showName);

  if (lines.length) lines.push(""); // blank line

  if (d.shownBy) lines.push(`Shown by ${d.shownBy}`);
  if (d.placedBy) lines.push(`Placed by ${d.placedBy}`);
  if (d.sireName) lines.push(`Sired by ${d.sireName}`);
  if (d.damName) lines.push(`Dam: ${d.damName}`);

  if (d.caption) {
    lines.push("");
    lines.push(d.caption);
  }

  return lines.join("\n").trim();
}

function buildJsonExport(d: WinData): string {
  return JSON.stringify(
    {
      show: d.showName || undefined,
      placement: d.winPlacing || undefined,
      shownBy: d.shownBy || undefined,
      placedBy: d.placedBy || undefined,
      sire: d.sireName || undefined,
      dam: d.damName || undefined,
      caption: d.caption || undefined,
      images: d.imageUrls.length ? d.imageUrls : undefined,
      createdAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export default function PostSuccessScreen({ data }: { data: WinData }) {
  const navigate = useNavigate();
  const [exportOpen, setExportOpen] = useState(false);
  const fbCaption = buildFacebookCaption(data);

  const handleShareFacebook = async () => {
    // Copy caption first so it's on clipboard for pasting
    try {
      await navigator.clipboard.writeText(fbCaption);
    } catch {}

    // Try Web Share API with image if available
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          text: fbCaption,
        };

        // If we have a network image, try to fetch and attach it
        if (data.imageUrls[0]) {
          try {
            const resp = await fetch(data.imageUrls[0]);
            const blob = await resp.blob();
            const file = new File([blob], "win.jpg", { type: blob.type });
            shareData.files = [file];
          } catch {
            // Couldn't attach image, share text only
          }
        }

        await navigator.share(shareData);
        return;
      } catch (e: any) {
        if (e.name === "AbortError") return; // user cancelled
      }
    }

    // Fallback: open Facebook share dialog
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(fbCaption)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Caption copied to clipboard", {
      description: "Paste it into your Facebook post.",
    });
  };

  const handleCopyFacebook = async () => {
    try {
      await navigator.clipboard.writeText(fbCaption);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(buildJsonExport(data));
      toast.success("JSON copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
        <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
      </div>

      <h1 className="text-xl font-bold text-foreground">Posted</h1>
      <p className="text-sm text-muted-foreground mt-1 text-center">
        {data.showName}
        {data.shownBy ? ` — ${data.shownBy}` : ""}
      </p>

      {/* Primary actions */}
      <div className="w-full max-w-xs mt-8 space-y-3">
        <Button
          onClick={handleShareFacebook}
          className="w-full h-12 rounded-xl text-base font-bold gap-2.5"
          style={{ backgroundColor: "#1877F2", color: "#fff" }}
        >
          <Facebook className="w-5 h-5" />
          Share to Facebook
        </Button>

        {/* Export section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Download className="w-4 h-4 text-muted-foreground" />
              Export Post
            </span>
            {exportOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {exportOpen && (
            <div className="px-4 pb-3 space-y-2">
              {/* Facebook format */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Facebook Format
                </p>
                <pre className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                  {fbCaption}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFacebook}
                  className="mt-2 w-full gap-1.5 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Caption
                </Button>
              </div>

              {/* JSON format */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                className="w-full gap-1.5 text-xs text-muted-foreground"
              >
                <FileJson className="w-3.5 h-3.5" />
                Copy as JSON
              </Button>
            </div>
          )}
        </div>
        <PostListingUpsell />
      </div>

      {/* Back to feed */}
      <button
        onClick={() => navigate("/")}
        className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to feed
      </button>
    </div>
  );
}
