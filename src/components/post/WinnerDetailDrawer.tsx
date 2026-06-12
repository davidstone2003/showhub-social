import React from "react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Share2, Trophy, MapPin, User, Scissors, FlaskConical, Calendar, Building2 } from "lucide-react";
import type { Post } from "@/data/mock";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${tappable ? "bg-[hsl(var(--gold))]/12 text-[#8B6914] border border-[hsl(var(--gold))]/30" : "bg-white text-[hsl(var(--primary))] border border-[#E5E7EB]"}`}
      disabled={!tappable}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

export function WinnerDetailDrawer({ post, open, onClose }: WinnerDetailDrawerProps) {
  const { user } = useAuth();
  const placing = post.win_placing || post.win_title || "";
  const showName = post.show_name || "";
  const year = post.created_at ? new Date(post.created_at).getFullYear() : new Date().getFullYear();
  const shownBy = post.shown_by || "";
  const bredBy = post.bred_by || post.breeder?.name || "";
  const siredBy = post.sired_by || "";
  const placedBy = (post as any).placed_by || "";
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

  const handlePostToWinners = async () => {
    if (!user) {
      toast.error("Sign in to add to Winners Archive");
      return;
    }
    if (!placing && !showName) {
      toast.error("Please add a placement and show name first");
      return;
    }

    try {
      const { error } = await supabase
        .from("winners")
        .insert({
          source_post_id: post.id,
          title: placing || showName,
          show_name: showName || "",
          shown_by: shownBy || "",
          bred_by: bredBy || null,
          sired_by: siredBy || null,
          placed_by: placedBy || null,
          win_placing: placing || null,
          caption: (post as any).caption || null,
          image_urls: post.image ? [post.image] : [],
          date: new Date().toISOString().split("T")[0],
          user_id: user.id,
          posted_as_breeder_id: (post as any).posted_as_breeder_id || null,
          post_type: "winner",
          show_on_feed: false,
          show_on_breeder_page: true,
          show_on_winners_archive: true,
          status: "active",
        } as any);

      if (error) throw error;
      toast.success("Added to Winners Archive! 🏆");
      onClose();
    } catch (err: any) {
      toast.error("Failed to add", { description: err.message });
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="border-t-0 rounded-t-2xl" style={{ backgroundColor: "#F8F6F1", borderTop: "1px solid #E5E7EB" }}>
        <div className="mx-auto mt-2 mb-3 h-1 w-10 rounded-full bg-[hsl(var(--primary))]/15" />
        <div className="px-5 pt-1 pb-6 max-h-[45vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: "hsl(var(--primary))" }}>Details</h3>
            <DrawerClose asChild>
              <button className="p-1 rounded-full hover:bg-black/5">
                <X className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              </button>
            </DrawerClose>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {placing && <Chip icon={Trophy} label={placing} />}
            {showName && <Chip icon={MapPin} label={`${year} ${showName}`} />}
            {shownBy && <Chip icon={User} label={`Shown by ${shownBy}`} />}
            {bredBy && <Chip icon={Scissors} label={`Bred by ${bredBy}`} />}
            {placedBy && <Chip icon={Building2} label={`Placed by ${placedBy}`} />}
            {siredBy && <Chip icon={FlaskConical} label={`Sired by ${siredBy}`} tappable />}
            {dateStr && <Chip icon={Calendar} label={new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />}
          </div>

          {/* Share */}
          <Button
            onClick={handleShare}
            className="w-full h-11 rounded-xl mt-5 font-bold gap-2"
            style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          {/* Post to Winners */}
          <Button
            onClick={handlePostToWinners}
            className="w-full h-11 rounded-xl mt-2 font-bold gap-2"
            style={{ backgroundColor: "hsl(var(--primary))", color: "#FFFFFF" }}
          >
            <Trophy className="w-4 h-4" />
            Add to Winners Archive
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
