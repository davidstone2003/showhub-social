import { Heart, Share2, MessageCircle, Bookmark, Trophy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "@/data/mock";

interface PostCardProps {
  post: Post;
  index: number;
  onTagClick?: (tag: { label: string; type: string }) => void;
}

function parseCaption(caption: string) {
  const lines = caption.split("\n").filter((l) => l.trim() !== "");
  const title = lines[0] || "";
  const subtitle = lines[1] && /[x×]/i.test(lines[1]) ? lines[1] : undefined;
  const body = lines.slice(subtitle ? 2 : 1).find((l) => l.trim().length > 0);
  return { title, subtitle, body };
}

export function PostCard({ post, index, onTagClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const { title, subtitle, body } = parseCaption(post.caption);

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mx-3 lg:mx-0"
    >
      {/* Image with overlays */}
      <div className="relative w-full overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={title}
          className="w-full aspect-[4/5] object-cover"
          loading="lazy"
        />

        {/* Top-left: Breeder + PRO */}
        <div className="absolute top-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] font-bold text-background drop-shadow-md leading-4">
              {post.breeder.name}
            </span>
            {post.breeder.is_pro && (
              <span className="bg-gold text-background text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                P
              </span>
            )}
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Champion badge */}
        {post.post_type === "champion" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-background text-[11px] font-bold shadow-lg">
            <Trophy className="w-3 h-3" />
            Champion
          </div>
        )}
      </div>

      {/* Below image: genetics + meta */}
      <div className="px-3 pt-2.5 space-y-0.5">
        {subtitle && (
          <p className="text-[14px] font-semibold text-foreground truncate" style={{ lineHeight: '16px' }}>
            {subtitle}
          </p>
        )}
        <p className="text-[12px] text-muted-foreground" style={{ lineHeight: '16px' }}>
          {post.breeder.location} · {post.created_at}
        </p>
        {body && (
          <p className="text-[14px] text-muted-foreground truncate pt-0.5" style={{ lineHeight: '16px' }}>
            {body}
          </p>
        )}
      </div>

      {/* Engagement */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-1.5">
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
