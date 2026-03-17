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

        {/* Full dark gradient: top transparent → bottom 50% black */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />

        {/* Bottom-left: Breeder + PRO — 16px from edges */}
        <div className="absolute bottom-0 left-0 right-0" style={{ padding: '16px' }}>
          <div className="flex items-center" style={{ gap: '4px' }}>
            <span className="text-[16px] font-bold text-white drop-shadow-md" style={{ lineHeight: '16px' }}>
              {post.breeder.name}
            </span>
            {post.breeder.is_pro && (
              <span className="bg-green-500 text-white text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                P
              </span>
            )}
          </div>
        </div>

        {/* Champion badge */}
        {post.post_type === "champion" && (
          <div className="absolute bottom-12 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-background text-[11px] font-bold shadow-lg">
            <Trophy className="w-3 h-3" />
            Champion
          </div>
        )}
      </div>

      {/* Below image: genetics + meta */}
      <div style={{ padding: '12px', paddingBottom: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {subtitle && (
            <p className="text-[14px] font-semibold text-foreground truncate" style={{ lineHeight: '16px' }}>
              {subtitle}
            </p>
          )}
          <p className="text-[12px] text-muted-foreground" style={{ lineHeight: '16px' }}>
            {post.breeder.location} · {post.created_at}
          </p>
          {body && (
            <p className="text-[14px] text-muted-foreground truncate" style={{ lineHeight: '16px', marginTop: '2px' }}>
              {body}
            </p>
          )}
        </div>
      </div>

      {/* Engagement */}
      <div className="flex items-center justify-between" style={{ padding: '6px 12px' }}>
        <p className="text-[12px] text-muted-foreground" style={{ lineHeight: '16px' }}>
          {likeCount.toLocaleString()} likes · {post.comments} comments
        </p>
      </div>

      <div className="border-t border-border" style={{ margin: '0 12px' }} />

      <div className="flex items-center justify-around" style={{ padding: '4px' }}>
        <button onClick={handleLike} className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Heart className={`w-[17px] h-[17px] transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-destructive"}`} />
          <span className={`text-[12px] font-medium ${liked ? "text-destructive" : "text-muted-foreground"}`} style={{ lineHeight: '16px' }}>Save</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Share2 className="w-[17px] h-[17px] text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[12px] font-medium text-muted-foreground" style={{ lineHeight: '16px' }}>Share</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <MessageCircle className="w-[17px] h-[17px] text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[12px] font-medium text-muted-foreground" style={{ lineHeight: '16px' }}>Contact</span>
        </button>
        <button onClick={() => setSaved(!saved)} className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Bookmark className={`w-[17px] h-[17px] transition-colors ${saved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
          <span className={`text-[12px] font-medium ${saved ? "text-primary" : "text-muted-foreground"}`} style={{ lineHeight: '16px' }}>Follow</span>
        </button>
      </div>
    </motion.article>
  );
}
