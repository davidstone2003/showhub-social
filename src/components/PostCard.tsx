import { Heart, Bookmark, MessageCircle, Eye } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: Post;
  index: number;
  onTagClick?: (tag: { label: string; type: string }) => void;
}

const tagColors: Record<string, string> = {
  sire: "bg-emerald/10 text-emerald-dark border-emerald/20",
  show: "bg-primary/10 text-primary border-primary/20",
  breed: "bg-charcoal/10 text-charcoal border-charcoal/15",
  sale: "bg-destructive/10 text-destructive border-destructive/20",
  type: "bg-muted text-muted-foreground border-border",
  breeder: "bg-secondary text-secondary-foreground border-border",
  location: "bg-muted text-muted-foreground border-border",
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
    >
      {/* Image — 70% of card */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {post.breeder.is_pro && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Pro
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Breeder row */}
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-sm">
            {post.breeder.logo}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{post.breeder.name}</p>
            <p className="text-xs text-muted-foreground">{post.breeder.location} · {post.created_at}</p>
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.caption}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge
              key={tag.label}
              variant="outline"
              className={`text-[11px] cursor-pointer hover:opacity-80 transition-opacity ${tagColors[tag.type] || tagColors.type}`}
              onClick={() => onTagClick?.(tag)}
            >
              {tag.label}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" onClick={handleLike}>
              <Heart className={`w-4 h-4 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {post.sire_id && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-emerald hover:text-emerald-dark">
                <Eye className="w-3.5 h-3.5 mr-1" /> Sire
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSaved(!saved)}>
              <Bookmark className={`w-4 h-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
