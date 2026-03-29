import React, { useState } from "react";
import { Heart, MessageCircle, Flag, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post & { status?: string; user_id?: string | null };
  index: number;
  onModerated?: () => void;
}

export function PostCard({ post, index, onModerated }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imageFailed, setImageFailed] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();

  const canManage = isAdmin || (user && (post as any).user_id === user.id);

  const handleLike = () => {
    if (!user) { setShowAuthGate(true); return; }
    if (requireVerification()) return;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("winners").delete().eq("id", post.id);
    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted");
      onModerated?.();
    }
    setShowDeleteConfirm(false);
  };

  const isUploadedWinnerImage = post.image.includes("/storage/v1/object/public/winner-images/");
  const imageSrc = imageFailed ? "/placeholder.svg" : post.image;

  const status = (post as any).status || "active";
  const isFlagged = status === "flagged";
  const isRestricted = status === "restricted";
  const isRemoved = status === "removed";

  // Full result title
  const resultTitle = post.win_placing || post.show_name || "New Post";

  // Year prefix for show name
  const currentYear = new Date().getFullYear();
  const postYear = post.created_at ? new Date(post.created_at).getFullYear() : currentYear;
  const yearPrefix = !isNaN(postYear) && postYear <= currentYear && postYear > 2000 ? `${postYear} ` : "";

  // Show name with year
  const showLine = post.show_name && post.win_placing ? `${yearPrefix}${post.show_name}` : null;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(
          "bg-card overflow-hidden relative",
          isFlagged && "ring-2 ring-amber-400",
          isRestricted && "ring-2 ring-orange-400 opacity-75",
          isRemoved && "ring-2 ring-destructive opacity-50"
        )}
        style={{ borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {/* Status banner */}
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

        {/* Admin/Owner controls */}
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

        {/* Full-width image — tap to open fullscreen */}
        <button
          onClick={() => setViewerOpen(true)}
          className="block w-full overflow-hidden cursor-pointer"
          type="button"
        >
          <img
            src={imageSrc}
            alt={resultTitle}
            className="w-full object-cover"
            style={{ aspectRatio: "4 / 3" }}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </button>

        {/* Result information — tight, line-by-line */}
        <div style={{ padding: "8px 12px 10px" }}>
          {/* Result title */}
          <p
            className="text-foreground font-semibold"
            style={{ fontSize: "18px", lineHeight: 1.25 }}
          >
            {resultTitle}
          </p>

          {/* Exhibitor / Shown by */}
          {post.shown_by && (
            <p
              className="text-muted-foreground"
              style={{ fontSize: "14px", lineHeight: 1.3, marginTop: "8px" }}
            >
              {post.shown_by}
            </p>
          )}

          {/* Show name with year */}
          {showLine && (
            <p
              className="text-muted-foreground"
              style={{ fontSize: "14px", lineHeight: 1.3, marginTop: "8px" }}
            >
              {showLine}
            </p>
          )}

          {/* Bred by */}
          {post.breeder?.name && (
            <p
              className="text-muted-foreground"
              style={{ fontSize: "14px", lineHeight: 1.3, marginTop: "8px" }}
            >
              Bred by {post.breeder.name}
            </p>
          )}

          {/* Engagement row */}
          <div className="flex items-center gap-4" style={{ marginTop: "10px" }}>
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-destructive transition-colors"
              style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-destructive text-destructive")} />
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </span>
          </div>
        </div>
      </motion.article>

      <AdminFlagModal open={showFlagModal} onOpenChange={setShowFlagModal} postId={post.id} postOwnerId={(post as any).user_id} onActionComplete={onModerated} />
      <AdminEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        post={{
          id: post.id,
          title: post.win_placing || post.show_name || "",
          show_name: post.show_name || "",
          shown_by: post.shown_by || "",
          win_placing: post.win_placing,
          caption: (post as any).caption,
          bred_by: (post as any).bred_by,
          sired_by: (post as any).sired_by,
          dam: (post as any).dam,
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
    </>
  );
}
