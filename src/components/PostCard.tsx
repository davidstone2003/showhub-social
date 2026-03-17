import { Heart, Share2, MessageCircle, Bookmark, Trophy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock";

interface PostCardProps {
  post: Post;
  index: number;
  onTagClick?: (tag: { label: string; type: string }) => void;
}

// Extract title (first line) and genetics line from caption
function parseCaption(caption: string) {
  const lines = caption.split("\n").filter((l) => l.trim() !== "");
  const title = lines[0] || "";
  const subtitle = lines[1] && /[x×]/i.test(lines[1]) ? lines[1] : undefined;
  return { title, subtitle };
}

export function PostCard({ post, index, onTagClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const { title, subtitle } = parseCaption(post.caption);

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mx-3 mb-3 lg:mx-0"
    >
      {/* Image-first: full-bleed photo with overlay */}
      <div className="relative w-full overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={title}
          className="w-full aspect-[4/5] object-cover"
          loading="lazy"
        />

        {/* Top-right overlay info */}
        <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-transparent p-3">
          <div className="flex items-start justify-between">
            <div />
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-background drop-shadow-sm">
                  {post.breeder.name}
                </span>
                {post.breeder.is_pro && (
                  <span className="bg-gold text-background text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    P
                  </span>
                )}
              </div>
              {subtitle && (
                <span className="text-[12px] font-medium text-background/90 drop-shadow-sm">
                  {subtitle}
                </span>
              )}
              <span className="text-[11px] text-background/80 drop-shadow-sm">
                {post.breeder.location} · {post.created_at}
              </span>
            </div>
          </div>
        </div>

        {/* Champion badge */}
        {post.post_type === "champion" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-background text-[11px] font-bold shadow-lg">
            <Trophy className="w-3 h-3" />
            Champion
          </div>
        )}
      </div>

      {/* 1-line caption below image */}
      <div className="px-3 pt-2.5 pb-2">
        <p className="text-[14px] font-semibold text-foreground truncate leading-snug">
          {title}
        </p>
      </div>

      {/* Engagement + actions */}
      <div className="flex items-center justify-between px-3 pb-2">
        <p className="text-[12px] text-muted-foreground">
          {likeCount.toLocaleString()} likes · {post.comments} comments
        </p>
      </div>

      <div className="border-t border-border mx-3" />

      <div className="flex items-center justify-around px-1 py-1">
        <button onClick={handleLike} className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Heart className={`w-[17px] h-[17px] transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-destructive"}`} />
          <span className={`text-[12px] font-medium ${liked ? "text-destructive" : "text-muted-foreground"}`}>Save</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Share2 className="w-[17px] h-[17px] text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[12px] font-medium text-muted-foreground">Share</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <MessageCircle className="w-[17px] h-[17px] text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[12px] font-medium text-muted-foreground">Contact</span>
        </button>
        <button onClick={() => setSaved(!saved)} className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Bookmark className={`w-[17px] h-[17px] transition-colors ${saved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
          <span className={`text-[12px] font-medium ${saved ? "text-primary" : "text-muted-foreground"}`}>Follow</span>
        </button>
      </div>
    </motion.article>
  );
}
