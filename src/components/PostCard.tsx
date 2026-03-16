import { Heart, MessageCircle, Eye, Bookmark, Trophy, Truck } from "lucide-react";
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

const tagEmoji: Record<string, string> = {
  sire: "🐑",
  breed: "🐑",
  location: "📍",
  show: "🏆",
  sale: "💰",
};

const typeIcons: Record<string, React.ReactNode> = {
  champion: <Trophy className="w-3 h-3" />,
  hauler: <Truck className="w-3 h-3" />,
};

export function PostCard({ post, index, onTagClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card border-b border-border lg:rounded-lg lg:border lg:mb-4 overflow-hidden"
    >
      {/* Full-bleed 4:5 image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.caption}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Breeder + PRO badge */}
      <div className="flex items-center gap-2.5 px-3 pt-2.5 pb-1">
        <span className="w-8 h-8 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-sm shrink-0">
          {post.breeder.logo}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground truncate">{post.breeder.name}</p>
            {post.breeder.is_pro && (
              <span className="bg-primary text-primary-foreground text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0">
                P
              </span>
            )}
            {typeIcons[post.post_type] && (
              <span className="text-primary shrink-0">{typeIcons[post.post_type]}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{post.breeder.location} · {post.created_at}</p>
        </div>
      </div>

      {/* Caption */}
      <div className="px-3 pt-1 pb-1.5">
        <p className="text-sm leading-snug text-muted-foreground">{post.caption}</p>
      </div>

      {/* Tag pills with emoji */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
        {post.tags.map((tag) => {
          const emoji = tagEmoji[tag.type] || "";
          if (tag.type === "sire" && post.sire_id) {
            return (
              <Link key={tag.label} to={`/sire/${post.sire_id}`}>
                <Badge
                  variant="outline"
                  className="text-[11px] cursor-pointer hover:border-primary hover:text-primary transition-colors text-muted-foreground border-border"
                >
                  {tag.label} {emoji}
                </Badge>
              </Link>
            );
          }
          return (
            <Badge
              key={tag.label}
              variant="outline"
              className="text-[11px] cursor-pointer hover:border-primary hover:text-primary transition-colors text-muted-foreground border-border"
              onClick={() => onTagClick?.(tag)}
            >
              {tag.label} {emoji}
            </Badge>
          );
        })}
      </div>

      {/* Actions: ❤️ 💬 👁View Sire 🔖Save */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1 group">
            <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-destructive"}`} />
            <span className="text-xs text-muted-foreground font-medium">{likeCount.toLocaleString()}</span>
          </button>
          <button className="flex items-center gap-1 group">
            <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {post.comments > 0 && <span className="text-xs text-muted-foreground">{post.comments}</span>}
          </button>
          {post.sire_id && (
            <Link to={`/sire/${post.sire_id}`} className="flex items-center gap-1 group">
              <Eye className="w-5 h-5 text-primary group-hover:text-primary-hover transition-colors" />
              <span className="text-xs text-primary font-semibold">View Sire</span>
            </Link>
          )}
        </div>
        <button onClick={() => setSaved(!saved)} className="flex items-center gap-1 group">
          <Bookmark className={`w-5 h-5 transition-colors ${saved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
          <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Save</span>
        </button>
      </div>
    </motion.article>
  );
}
