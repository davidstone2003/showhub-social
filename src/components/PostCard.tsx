import { Heart, MessageCircle, Share2, Bookmark, Trophy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: Post;
  index: number;
  onTagClick?: (tag: { label: string; type: string }) => void;
}

export function PostCard({ post, index, onTagClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  // Split caption into lines for proper rendering
  const captionLines = post.caption.split("\n");

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card lg:rounded-xl lg:border lg:border-border lg:shadow-sm overflow-hidden border-b border-border lg:mb-4"
    >
      {/* Breeder header — Facebook style */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg shrink-0 shadow-sm">
          {post.breeder.logo}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[15px] text-foreground truncate">{post.breeder.name}</p>
            {post.breeder.is_pro && (
              <span className="bg-gold text-white text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                P
              </span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground">{post.breeder.location} · {post.created_at}</p>
        </div>
      </div>

      {/* Caption text — above image like Facebook */}
      <div className="px-4 pb-2.5">
        {captionLines.map((line, i) => (
          <p key={i} className={`text-[14px] leading-relaxed ${line.trim() === "" ? "h-2" : "text-foreground"}`}>
            {line}
          </p>
        ))}
      </div>

      {/* Full-width image */}
      <div className="relative w-full overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.caption.split("\n")[0]}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        {post.post_type === "champion" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-white text-[11px] font-bold shadow-lg">
            <Trophy className="w-3 h-3" />
            Champion
          </div>
        )}
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2">
        {post.tags.map((tag) => {
          if (tag.type === "sire" && post.sire_id) {
            return (
              <Link key={tag.label} to={`/sire/${post.sire_id}`}>
                <Badge
                  variant="outline"
                  className="text-[12px] cursor-pointer bg-pill text-pill-text border-pill-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {tag.label}
                </Badge>
              </Link>
            );
          }
          return (
            <Badge
              key={tag.label}
              variant="outline"
              className="text-[12px] cursor-pointer bg-pill text-pill-text border-pill-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              onClick={() => onTagClick?.(tag)}
            >
              {tag.label}
            </Badge>
          );
        })}
      </div>

      {/* Engagement bar — Facebook/IG style */}
      <div className="px-4 pb-1 pt-0.5">
        <p className="text-[13px] text-muted-foreground">
          {likeCount.toLocaleString()} likes · {post.comments} comments
        </p>
      </div>

      <div className="border-t border-border mx-4" />

      <div className="flex items-center justify-around px-2 py-1.5">
        <button onClick={handleLike} className="flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-muted transition-colors group flex-1 justify-center">
          <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-destructive"}`} />
          <span className={`text-[13px] font-medium ${liked ? "text-destructive" : "text-muted-foreground"}`}>Like</span>
        </button>
        <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-muted transition-colors group flex-1 justify-center">
          <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[13px] font-medium text-muted-foreground">Comment</span>
        </button>
        <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-muted transition-colors group flex-1 justify-center">
          <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[13px] font-medium text-muted-foreground">Share</span>
        </button>
        <button onClick={() => setSaved(!saved)} className="flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-muted transition-colors group flex-1 justify-center">
          <Bookmark className={`w-5 h-5 transition-colors ${saved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
          <span className={`text-[13px] font-medium ${saved ? "text-primary" : "text-muted-foreground"}`}>Save</span>
        </button>
      </div>
    </motion.article>
  );
}
