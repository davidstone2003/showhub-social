import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imageFailed, setImageFailed] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const isUploadedWinnerImage = post.image.includes("/storage/v1/object/public/winner-images/");
  const imageSrc = imageFailed ? "/placeholder.svg" : post.image;

  const showName = post.show_name || post.breeder?.location || "";
  const shownBy = post.shown_by || post.breeder?.name || "";
  const winPlacing = post.win_placing;

  // Show year suffix for archive posts (not current year)
  const currentYear = new Date().getFullYear();
  const postYear = post.created_at ? new Date(post.created_at).getFullYear() : currentYear;
  const showYear = !isNaN(postYear) && postYear < currentYear;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card overflow-hidden"
      style={{ borderRadius: "12px", boxShadow: "var(--shadow-card)" }}
    >
      {/* Image — 16:9 */}
      <Link
        to={post.animal_id ? `/animal/${post.animal_id}` : "#"}
        className="block w-full overflow-hidden bg-muted"
      >
        <img
          src={imageSrc}
          alt={showName}
          className={cn(
            "w-full aspect-video",
            isUploadedWinnerImage ? "object-contain bg-muted" : "object-cover"
          )}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      </Link>

      {/* Content — tight left-aligned */}
      <div className="px-3.5 pt-2 pb-1.5">
        {/* Win Placing — H4 bold */}
        {winPlacing && (
          <p className="font-bold text-foreground text-xl leading-tight">
            {winPlacing}
          </p>
        )}

        {/* Show Name — H5 medium */}
        {showName && (
          <p
            className={cn(
              "leading-snug",
              winPlacing
                ? "text-base font-medium text-muted-foreground mt-0.5"
                : "text-xl font-bold text-foreground"
            )}
          >
            {showName}
            {showYear && (
              <span className="text-muted-foreground font-normal"> · {postYear}</span>
            )}
          </p>
        )}

        {/* Shown By — 14px */}
        {shownBy && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Shown by: <span className="text-foreground font-medium">{shownBy}</span>
          </p>
        )}

        {/* Placed By — 14px */}
        {post.placed_by && (
          <p className="text-sm text-muted-foreground mt-px">
            Placed by: <span className="text-foreground font-medium">{post.placed_by}</span>
          </p>
        )}

        {/* Sire — 12px caption */}
        {post.sired_by && (
          <p className="text-xs text-muted-foreground mt-px">
            Sire: <span className="font-medium">{post.sired_by}</span>
          </p>
        )}

        {/* Dam — 12px caption */}
        {post.dam && (
          <p className="text-xs text-muted-foreground mt-px">
            Dam: <span className="font-medium">{post.dam}</span>
          </p>
        )}

        {/* Caption */}
        {post.caption && !post.caption.includes("Shown By:") && post.caption.trim() && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {post.caption}
          </p>
        )}

        {/* Engagement row — right-aligned */}
        <div className="flex items-center justify-end gap-3 mt-2 pb-1">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Heart
              className={cn(
                "w-4 h-4",
                liked && "fill-destructive text-destructive"
              )}
            />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>
          <span className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{post.comments}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
