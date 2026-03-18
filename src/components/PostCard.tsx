import { Heart, Share2, MessageCircle, Trophy, Bookmark } from "lucide-react";
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
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imageFailed, setImageFailed] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const isUploadedWinnerImage = post.image.includes("/storage/v1/object/public/winner-images/");
  const imageSrc = imageFailed ? "/placeholder.svg" : post.image;

  // Use structured fields if available, otherwise parse caption
  const isStructured = !!(post.win_title || post.show_name);
  const captionLines = post.caption.split("\n").filter((l) => l.trim() !== "");
  const fallbackTitle = captionLines[0] || "";
  const fallbackBody = captionLines.slice(1).find((l) => !l.startsWith("Shown By") && !l.startsWith("Bred By") && !l.startsWith("Sired By") && !l.startsWith("Dam:") && l.trim().length > 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card overflow-hidden mx-3 lg:mx-0"
      style={{ borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      {/* Image */}
      <Link to={post.animal_id ? `/animal/${post.animal_id}` : "#"} className="block relative w-full overflow-hidden bg-muted" style={{ borderRadius: "12px 12px 0 0" }}>
        <img
          src={imageSrc}
          alt={post.breeder.name}
          className={cn(
            "w-full",
            isUploadedWinnerImage ? "aspect-[4/3] object-contain bg-muted" : "aspect-[4/5] object-cover"
          )}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />
      </Link>

      {/* Structured Content */}
      <div style={{ padding: "12px 14px 8px" }}>
        {isStructured ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {/* Win Title */}
            <div className="flex items-center" style={{ gap: "6px" }}>
              <Trophy className="w-4 h-4 text-gold shrink-0" />
              <p className="font-bold text-foreground truncate" style={{ fontSize: "15px", lineHeight: "20px" }}>
                {post.win_title}
              </p>
            </div>

            {/* Show Name */}
            {post.show_name && (
              <p className="font-semibold text-primary truncate" style={{ fontSize: "13px", lineHeight: "18px", paddingLeft: "22px" }}>
                {post.show_name}
              </p>
            )}

            {/* Structured Details */}
            <div style={{ paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "1px", marginTop: "4px" }}>
              {post.shown_by && (
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px" }}>
                  <span className="text-foreground font-medium">Shown By:</span> {post.shown_by}
                </p>
              )}
              {post.bred_by && (
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px" }}>
                  <span className="text-foreground font-medium">Bred By:</span> {post.bred_by}
                </p>
              )}
              {post.sired_by && (
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px" }}>
                  <span className="text-foreground font-medium">Sire:</span> {post.sired_by}
                </p>
              )}
              {post.dam && (
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px" }}>
                  <span className="text-foreground font-medium">Dam:</span> {post.dam}
                </p>
              )}
              {post.placed_by && (
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: "18px" }}>
                  <span className="text-foreground font-medium">Placed By:</span> {post.placed_by}
                </p>
              )}
            </div>

            {/* Caption */}
            {post.caption && !post.caption.includes("Shown By:") && (
              <p className="text-muted-foreground mt-1" style={{ fontSize: "13px", lineHeight: "18px", paddingLeft: "22px" }}>
                {post.caption}
              </p>
            )}
          </div>
        ) : (
          /* Fallback for non-structured posts (mock data) */
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="flex items-center" style={{ gap: "4px" }}>
              <Link to={`/breeders/${post.breeder.id}`} className="hover:underline">
                <span className="font-bold text-foreground" style={{ fontSize: "14px", lineHeight: "18px" }}>
                  {post.breeder.name}
                </span>
              </Link>
              {post.breeder.is_pro && (
                <span className="bg-green-500 text-white font-black flex items-center justify-center shrink-0 shadow-sm" style={{ fontSize: "8px", width: "18px", height: "18px", borderRadius: "50%" }}>
                  P
                </span>
              )}
            </div>
            {fallbackTitle && (
              <p className="font-semibold text-foreground truncate" style={{ fontSize: "14px", lineHeight: "18px" }}>
                {fallbackTitle}
              </p>
            )}
            <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "16px" }}>
              {post.breeder.location}{post.breeder.location && " · "}{post.created_at}
            </p>
            {fallbackBody && (
              <p className="text-muted-foreground truncate" style={{ fontSize: "14px", lineHeight: "16px" }}>
                {fallbackBody}
              </p>
            )}
          </div>
        )}

        <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "16px", marginTop: "6px" }}>
          {likeCount.toLocaleString()} likes · {post.comments} comments
          {post.created_at && <span> · {post.created_at}</span>}
        </p>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border" style={{ margin: "0 14px" }} />
      <div className="flex items-center" style={{ height: "44px", padding: "0 8px", gap: "6px" }}>
        <button onClick={handleLike} className="flex items-center justify-center gap-1.5 rounded-lg hover:bg-muted transition-colors" style={{ height: "32px", padding: "0 10px" }}>
          <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          <span className="text-xs font-medium text-muted-foreground">Save</span>
        </button>

        <button className="flex items-center justify-center gap-1.5 rounded-lg hover:bg-muted transition-colors" style={{ height: "32px", padding: "0 10px" }}>
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{post.comments}</span>
        </button>

        <button className="flex items-center justify-center gap-1.5 rounded-lg hover:bg-muted transition-colors" style={{ height: "32px", padding: "0 10px" }}>
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Share</span>
        </button>

        <div className="flex-1" />

        <button className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors" style={{ borderRadius: "10px", fontSize: "12px", lineHeight: "16px", height: "32px", padding: "0 14px" }}>
          <MessageCircle className="w-3.5 h-3.5" />
          CONTACT
        </button>
      </div>
    </motion.article>
  );
}
