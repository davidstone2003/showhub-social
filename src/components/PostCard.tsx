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

      {/* Content */}
      <div className="px-3.5 pt-2 pb-1.5" style={{ lineHeight: 1.35 }}>
        {/* Show Name */}
        {showName && (
          <p className="font-medium text-foreground" style={{ fontSize: "14px" }}>
            {showName}
            {showYear && (
              <span className="text-muted-foreground font-normal"> · {postYear}</span>
            )}
          </p>
        )}

        {/* Win Placing */}
        {winPlacing && (
          <p className="font-medium text-foreground" style={{ fontSize: "14px" }}>
            {winPlacing}
          </p>
        )}

        {/* Shown By */}
        {shownBy && (
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
            Shown by {shownBy}
          </p>
        )}

        {/* Placed By */}
        {post.placed_by && (
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
            Placed by {post.placed_by}
          </p>
        )}

        {/* Sire */}
        {post.sired_by && (
          <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
            Sire: {post.sired_by}
          </p>
        )}

        {/* Dam */}
        {post.dam && (
          <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
            Dam: {post.dam}
          </p>
        )}

        {/* Caption */}
        {post.caption && !post.caption.includes("Shown By:") && post.caption.trim() && (
          <p className="text-foreground mt-1 line-clamp-2" style={{ fontSize: "14px" }}>
            {post.caption}
          </p>
        )}

        {/* Engagement row */}
        <div className="flex items-center justify-end gap-3 mt-2 pb-1">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-destructive transition-colors"
            style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5",
                liked && "fill-destructive text-destructive"
              )}
            />
            <span>{likeCount}</span>
          </button>
          <span className="flex items-center gap-1" style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.comments}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
