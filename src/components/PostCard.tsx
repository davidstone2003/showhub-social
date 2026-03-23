import React, { useState } from "react";
import { Heart, MessageCircle, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { AdminFlagModal } from "@/components/AdminFlagModal";
import { AuthGate } from "@/components/AuthGate";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";

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
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();

  const handleLike = () => {
    if (!user) { setShowAuthGate(true); return; }
    if (requireVerification()) return;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const isUploadedWinnerImage = post.image.includes("/storage/v1/object/public/winner-images/");
  const imageSrc = imageFailed ? "/placeholder.svg" : post.image;

  const status = (post as any).status || "active";
  const isFlagged = status === "flagged";
  const isRestricted = status === "restricted";
  const isRemoved = status === "removed";

  // Build title: win_placing or show_name
  const currentYear = new Date().getFullYear();
  const postYear = post.created_at ? new Date(post.created_at).getFullYear() : currentYear;
  const yearPrefix = !isNaN(postYear) && postYear <= currentYear && postYear > 2000 ? `${postYear} ` : "";
  
  const title = post.win_placing || post.show_name || "New Post";
  
  // Build single context line
  const contextParts: string[] = [];
  if (post.shown_by) contextParts.push(post.shown_by);
  if (post.show_name && post.win_placing) contextParts.push(`${yearPrefix}${post.show_name}`);
  if (post.breeder?.name && !contextParts.includes(post.breeder.name)) contextParts.push(post.breeder.name);
  const contextLine = contextParts.join(" • ");

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
        style={{ borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}
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

        {/* Admin flag */}
        {isAdmin && (
          <button
            onClick={() => setShowFlagModal(true)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-destructive/10 transition-colors"
          >
            <Flag className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        {/* Full-width image */}
        <Link
          to={post.animal_id ? `/animal/${post.animal_id}` : "#"}
          className="block w-full overflow-hidden bg-muted"
        >
          <img
            src={imageSrc}
            alt={title}
            className={cn(
              "w-full",
              isUploadedWinnerImage ? "aspect-[4/5] object-contain bg-muted" : "aspect-[4/5] object-cover"
            )}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </Link>

        {/* Title + context + engagement */}
        <div style={{ padding: "8px 12px 12px" }}>
          <p
            className="text-foreground font-semibold truncate"
            style={{ fontSize: "16px", lineHeight: 1.3 }}
          >
            {title}
          </p>

          {contextLine && (
            <p
              className="text-muted-foreground truncate"
              style={{ fontSize: "13px", lineHeight: 1.3, marginTop: "3px" }}
            >
              {contextLine}
            </p>
          )}

          {/* Engagement row */}
          <div className="flex items-center justify-end gap-3" style={{ marginTop: "8px" }}>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-destructive transition-colors"
              style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}
            >
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-destructive text-destructive")} />
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-1" style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments}</span>
            </span>
          </div>
        </div>
      </motion.article>

      <AdminFlagModal open={showFlagModal} onOpenChange={setShowFlagModal} postId={post.id} postOwnerId={(post as any).user_id} onActionComplete={onModerated} />
      <AuthGate open={showAuthGate} onOpenChange={setShowAuthGate} />
      <VerifyEmailModal open={showVerifyModal} onOpenChange={setShowVerifyModal} onResend={resendVerification} />
    </>
  );
}
