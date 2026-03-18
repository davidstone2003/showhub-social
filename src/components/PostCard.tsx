import { Heart, MessageCircle, UserPlus } from "lucide-react";
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

  // Use structured fields if available, otherwise parse caption
  const showName = post.show_name || post.breeder?.location || "";
  const shownBy = post.shown_by || post.breeder?.name || "";
  const winCount = post.win_title ? 1 : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card overflow-hidden mx-3 lg:mx-0"
      style={{ borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      {/* Image */}
      <Link
        to={post.animal_id ? `/animal/${post.animal_id}` : "#"}
        className="block relative w-full overflow-hidden bg-muted"
        style={{ borderRadius: "12px 12px 0 0" }}
      >
        <img
          src={imageSrc}
          alt={showName}
          className={cn(
            "w-full",
            isUploadedWinnerImage ? "aspect-[4/3] object-contain bg-muted" : "aspect-[4/5] object-cover"
          )}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      </Link>

      {/* Content */}
      <div style={{ padding: "12px 14px 6px" }}>
        {/* Show Name */}
        {showName && (
          <p className="font-bold text-foreground" style={{ fontSize: "15px", lineHeight: "20px" }}>
            {showName}
          </p>
        )}

        {/* Shown By */}
        {shownBy && (
          <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px", marginTop: "2px" }}>
            Shown by: <span className="text-foreground font-medium">{shownBy}</span>
          </p>
        )}

        {/* Placed By (optional) */}
        {post.placed_by && (
          <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px", marginTop: "2px" }}>
            Placed by: <span className="text-foreground font-medium">{post.placed_by}</span>
          </p>
        )}

        {/* Caption (optional) */}
        {post.caption && !post.caption.includes("Shown By:") && post.caption.trim() && (
          <p className="text-muted-foreground mt-1.5" style={{ fontSize: "13px", lineHeight: "18px" }}>
            {post.caption}
          </p>
        )}

        {/* Stats line */}
        <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "16px", marginTop: "8px" }}>
          {winCount > 0 && <span>{winCount} {winCount === 1 ? "win" : "wins"} · </span>}
          {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"} · {post.comments} {post.comments === 1 ? "comment" : "comments"}
        </p>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border" style={{ margin: "0 14px" }} />
      <div className="flex items-center" style={{ height: "44px", padding: "0 8px", gap: "4px" }}>
        {/* Contact */}
        <button className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors" style={{ borderRadius: "10px", fontSize: "12px", lineHeight: "16px", height: "32px", padding: "0 14px" }}>
          Contact
        </button>

        <div className="flex-1" />

        {/* Like */}
        <button
          onClick={handleLike}
          className="flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          style={{ height: "32px", width: "32px" }}
        >
          <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>

        {/* Follow */}
        <button className="flex items-center justify-center gap-1.5 rounded-lg hover:bg-muted transition-colors font-semibold text-muted-foreground" style={{ height: "32px", padding: "0 10px", fontSize: "12px" }}>
          <UserPlus className="w-4 h-4" />
          Follow
        </button>
      </div>
    </motion.article>
  );
}
