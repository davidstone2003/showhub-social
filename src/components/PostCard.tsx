import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Flag, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { FeedVideo } from "@/components/post/VideoPlayer";
import { motion } from "framer-motion";
import type { Post } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { AdminFlagModal } from "@/components/AdminFlagModal";
import { AdminEditModal } from "@/components/AdminEditModal";
import { AuthGate } from "@/components/AuthGate";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import { WinnerImageViewer } from "@/components/winners/WinnerImageViewer";
import { WinnerDetailDrawer } from "@/components/post/WinnerDetailDrawer";
import { CommentSheet } from "@/components/post/CommentSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post & { status?: string; user_id?: string | null };
  index: number;
  onModerated?: (postId?: string) => void;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function accentForPlacing(placing?: string | null): string {
  if (!placing) return "#C9A84C";
  if (/grand\s*champ/i.test(placing) && !/reserve/i.test(placing)) return "#C9A84C";
  if (/reserve/i.test(placing)) return "#A8A9AD";
  if (/class\s*winner/i.test(placing)) return "#4A7C59";
  return "#C9A84C";
}

function PhotoGrid({ images, onTap }: { images: string[]; onTap: (index: number) => void }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onTap(0)}
        className="block w-full overflow-hidden"
      >
        <img
          src={images[0]}
          alt=""
          className="w-full object-cover"
          style={{ aspectRatio: "4 / 3" }}
          loading="lazy"
          decoding="async"
        />
      </button>
    );
  }

  if (images.length === 2) {
    return (
      <div className="flex w-full" style={{ gap: 2, aspectRatio: "2 / 1" }}>
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onTap(i)}
            className="flex-1 overflow-hidden"
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="w-full flex flex-col" style={{ gap: 2 }}>
        <button
          type="button"
          onClick={() => onTap(0)}
          className="block w-full overflow-hidden"
        >
          <img
            src={images[0]}
            alt=""
            className="w-full object-cover"
            style={{ aspectRatio: "16 / 9" }}
            loading="lazy"
            decoding="async"
          />
        </button>
        <div className="flex w-full" style={{ gap: 2, aspectRatio: "2 / 1" }}>
          {[images[1], images[2]].map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onTap(i + 1)}
              className="flex-1 overflow-hidden"
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const visible = images.slice(0, 4);
  const remaining = images.length - 4;
  return (
    <div className="w-full grid grid-cols-2" style={{ gap: 2 }}>
      {visible.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onTap(i)}
          className="relative overflow-hidden"
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{ aspectRatio: "1 / 1" }}
            loading="lazy"
            decoding="async"
          />
          {i === 3 && remaining > 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.55)", fontSize: 24 }}
            >
              +{remaining}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function PostCard({ post, index, onModerated }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();

  const canManage = isAdmin || (user && (post as any).user_id === user.id);
  const isWinner = post.post_type === "champion" && (post.win_placing || post.win_title);
  const isPersistedRecord = UUID_PATTERN.test(post.id);

  const handleLike = () => {
    if (!user) { setShowAuthGate(true); return; }
    if (requireVerification()) return;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleDelete = async () => {
    if (!isPersistedRecord) {
      toast.success("Sample post removed");
      onModerated?.(post.id);
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const { error: linkedWinnersError } = await supabase
        .from("winners")
        .delete()
        .eq("source_post_id", post.id);
      if (linkedWinnersError) throw linkedWinnersError;

      const { error: postsError, count: postsDeleted } = await supabase
        .from("posts")
        .delete({ count: "exact" })
        .eq("id", post.id);
      if (postsError) throw postsError;

      const { error: winnersError, count: winnersDeleted } = await supabase
        .from("winners")
        .delete({ count: "exact" })
        .eq("id", post.id);
      if (winnersError) throw winnersError;

      if ((postsDeleted ?? 0) === 0 && (winnersDeleted ?? 0) === 0) {
        toast.error("Post was not found");
      } else {
        toast.success("Post deleted");
        onModerated?.(post.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete post";
      toast.error(message);
    }

    setShowDeleteConfirm(false);
  };

  const resultTitle = post.win_placing || post.show_name || "";
  const status = (post as any).status || "active";
  const isFlagged = status === "flagged";
  const isRestricted = status === "restricted";
  const isRemoved = status === "removed";

  const allImages: string[] = (post as any).image_urls?.length > 0
    ? (post as any).image_urls
    : (post.image && post.image !== "/placeholder.svg" ? [post.image] : []);

  const accent = accentForPlacing(post.win_placing);
  const breederLogo = post.breeder?.logo;
  const breederName = post.breeder?.name || "Unknown";
  const breederSlug = post.breeder?.slug;

  const openViewer = (i: number) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(
          "overflow-hidden relative -mx-3 bg-white",
          isFlagged && "ring-2 ring-amber-400",
          isRestricted && "ring-2 ring-orange-400 opacity-75",
          isRemoved && "ring-2 ring-destructive opacity-50"
        )}
        style={{ borderRadius: 0, borderBottom: "1px solid #E5E7EB" }}
      >
        {status !== "active" && (
          <div className={cn(
            "px-3 py-1 text-xs font-semibold flex items-center gap-1.5",
            isFlagged && "bg-amber-50 text-amber-800",
            isRestricted && "bg-orange-50 text-orange-800",
            isRemoved && "bg-red-50 text-red-800"
          )}>
            <Flag className="w-3 h-3" />
            {isFlagged && "Flagged for review"}
            {isRestricted && "Restricted"}
            {isRemoved && "Removed"}
          </div>
        )}

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors">
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => setShowFlagModal(true)}>
                  <Flag className="w-3.5 h-3.5 mr-2" /> Moderate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Identity row */}
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
          <div
            className="flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
            style={{ width: 38, height: 38, backgroundColor: "#0A1628" }}
          >
            {breederLogo && typeof breederLogo === "string" && breederLogo.startsWith("http") ? (
              <img src={breederLogo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span style={{ fontSize: 16, color: "#fff" }}>
                {breederLogo || breederName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {breederSlug ? (
              <Link
                to={`/breeder/${breederSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-[14px] leading-tight block"
                style={{ color: "#0A1628" }}
              >
                {breederName}
              </Link>
            ) : (
              <span className="font-bold text-[14px] leading-tight block" style={{ color: "#0A1628" }}>
                {breederName}
              </span>
            )}
            <span className="text-[12px] text-muted-foreground leading-tight">
              {post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
            </span>
          </div>
        </div>

        {/* Caption — always before photos */}
        {(post as any).caption && (
          <div className="px-3 pb-2">
            <p className="text-foreground" style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {(post as any).caption}
            </p>
          </div>
        )}

        {/* Photos */}
        {(post as any).video_url ? (
          <FeedVideo src={(post as any).video_url} aspectRatio="4 / 3" />
        ) : (
          <PhotoGrid images={allImages} onTap={openViewer} />
        )}

        {/* Winner info — plain text, no card */}
        {isWinner && (post.win_placing || post.win_title) && (
          <div className="px-3 pb-1 pt-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-full text-left"
            >
              <p style={{ fontSize: 14, color: "#0A1628", lineHeight: 1.4 }}>
                <span className="font-bold">{post.win_placing || post.win_title}</span>
                {post.show_name && (
                  <span style={{ color: "#6B7280", fontWeight: 400 }}>
                    {" "}· {post.created_at ? `${new Date(post.created_at).getFullYear()} ` : ""}{post.show_name}
                  </span>
                )}
              </p>
              {post.breeder?.name && (
                <p style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>
                  Bred by <span style={{ fontWeight: 600, color: "#0A1628" }}>{post.breeder.name}</span>
                </p>
              )}
              {(post as any).placed_by && (
                <p style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>
                  Placed by <span style={{ fontWeight: 600, color: "#0A1628" }}>{(post as any).placed_by}</span>
                </p>
              )}
              {post.sired_by && (
                <p style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>
                  Sired by <span style={{ fontWeight: 600, color: "#C9A84C" }}>{post.sired_by}</span>
                </p>
              )}
            </button>
          </div>
        )}

        {/* Engagement row */}
        <div className="flex items-center gap-4 px-3 pb-3 pt-2 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 hover:text-destructive transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-destructive text-destructive")} />
            <span>{likeCount}</span>
          </button>
          <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments}</span>
          </span>
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="flex items-center gap-1.5 ml-auto hover:text-primary transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.article>

      <WinnerDetailDrawer post={post} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <AdminFlagModal open={showFlagModal} onOpenChange={setShowFlagModal} postId={post.id} postOwnerId={(post as any).user_id} onActionComplete={onModerated} />
      <AdminEditModal
        open={showEditModal} onOpenChange={setShowEditModal}
        post={{
          id: (post as any).winner_id || post.id,
          title: post.win_placing || post.show_name || "",
          show_name: post.show_name || "",
          shown_by: post.shown_by || "",
          win_placing: post.win_placing,
          caption: (post as any).caption,
          bred_by: (post as any).bred_by,
          sired_by: (post as any).sired_by,
          dam: (post as any).dam,
          date: (post as any).date || post.created_at?.split("T")[0],
        }}
        onSaved={onModerated}
      />
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AuthGate open={showAuthGate} onOpenChange={setShowAuthGate} />
      <VerifyEmailModal open={showVerifyModal} onOpenChange={setShowVerifyModal} onResend={resendVerification} />
      <WinnerImageViewer
        slides={allImages.map((img) => ({ image: img, name: post.shown_by || resultTitle, placement: resultTitle, breeder: post.breeder?.name || null }))}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}
