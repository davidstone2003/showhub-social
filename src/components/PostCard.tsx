import { Heart, MessageCircle, Eye, Bookmark, Trophy } from "lucide-react";
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card lg:rounded-xl lg:border lg:border-border lg:mb-4 lg:shadow-sm overflow-hidden"
    >
      {/* Full-bleed 4:5 image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.caption}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {post.post_type === "champion" && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-white text-[11px] font-bold shadow-md">
            <Trophy className="w-3 h-3" />
            Champion
          </div>
        )}
      </div>

      {/* Breeder info */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-1">
        <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">
          {post.breeder.logo}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[16px] text-foreground truncate">{post.breeder.name}</p>
            {post.breeder.is_pro && (
              <span className="bg-gold text-white text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                P
              </span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground">{post.breeder.location} · {post.created_at}</p>
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pt-1.5 pb-2">
        <p className="text-[14px] leading-relaxed text-muted-foreground">{post.caption}</p>
      </div>

      {/* Tag pills — light blue system */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
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

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
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
              <Eye className="w-5 h-5 text-primary group-hover:text-primary/70 transition-colors" />
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
