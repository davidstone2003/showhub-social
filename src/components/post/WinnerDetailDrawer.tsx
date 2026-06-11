import React from "react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Share2, Trophy, MapPin, User, Scissors, FlaskConical, Calendar } from "lucide-react";
import type { Post } from "@/data/mock";
import { toast } from "sonner";

interface WinnerDetailDrawerProps {
  post: Post & { status?: string; user_id?: string | null };
  open: boolean;
  onClose: () => void;
}

function Chip({ icon: Icon, label, tappable, onClick }: { icon: any; label: string; tappable?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${tappable ? "bg-[#C9A84C]/12 text-[#8B6914] border border-[#C9A84C]/30" : "bg-white text-[#0A1628] border border-[#E5E7EB]"}`}
      disabled={!tappable}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

export function WinnerDetailDrawer({ post, open, onClose }: WinnerDetailDrawerProps) {
  const placing = post.win_placing || post.win_title || "";
  const showName = post.show_name || "";
  const year = post.created_at ? new Date(post.created_at).getFullYear() : new Date().getFullYear();
  const shownBy = post.shown_by || "";
  const bredBy = post.bred_by || post.breeder?.name || "";
  const siredBy = post.sired_by || "";
  const dateStr = post.created_at || "";

  const handleShare = async () => {
    const caption = `${placing} at ${showName} 🏆 Bred by ${bredBy} #BackdropMoments`;
    try {
      if (navigator.share) {
        await navigator.share({ text: caption });
      } else {
        await navigator.clipboard.writeText(caption);
        toast.success("Caption copied!");
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        try { await navigator.clipboard.writeText(caption); toast.success("Caption copied!"); } catch {}
      }
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-t-0 rounded-t-2xl" style={{ backgroundColor: "#F8F6F1", borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto mt-2 mb-3 h-1 w-10 rounded-full bg-[#0A1628]/15" />
        <div className="px-5 pt-1 pb-6 max-h-[45vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: "#0A1628" }}>Details</h3>
            <DrawerClose asChild>
              <button className="p-1 rounded-full hover:bg-black/5">
                <X className="w-4 h-4" style={{ color: "#0A1628" }} />
              </button>
            </DrawerClose>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {placing && <Chip icon={Trophy} label={placing} />}
            {showName && <Chip icon={MapPin} label={`${year} ${showName}`} />}
            {shownBy && <Chip icon={User} label={`Shown by ${shownBy}`} />}
            {bredBy && <Chip icon={Scissors} label={`Bred by ${bredBy}`} />}
            {siredBy && <Chip icon={FlaskConical} label={`Sired by ${siredBy}`} tappable />}
            {dateStr && <Chip icon={Calendar} label={new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />}
          </div>

          {/* Share */}
          <Button
            onClick={handleShare}
            className="w-full h-11 rounded-xl mt-5 font-bold gap-2"
            style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
