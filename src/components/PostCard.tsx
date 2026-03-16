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

const tagColors: Record<string, string> = {
  sire: "bg-primary/10 text-primary border-primary/20",
  show: "bg-primary/10 text-primary border-primary/20",
  breed: "bg-secondary text-foreground border-border",
  sale: "bg-destructive/10 text-destructive border-destructive/20",
  type: "bg-secondary text-muted-foreground border-border",
  breeder: "bg-secondary text-foreground border-border",
  location: "bg-secondary text-muted-foreground border-border",
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-card border-b border-border lg:rounded-lg lg:border lg:mb-4 overflow-hidden"
    >
      {/* Breeder header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="w-8 h-8 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-sm shrink-0">
          {post.breeder.logo}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground truncate">{post.breeder.name}</p>
            {post.breeder.is_pro && (
              <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-0.5">Pro</span>
            )}
            {typeIcons[post.post_type] && (
              <span className="text-primary shrink-0">{typeIcons[post.post_type]}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{post.breeder.location} · {post.created_at}</p>
        </div>
      </div>

      {/* Image — true edge-to-edge 4:5 portrait */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted -mx-px">
        <img
          src={post.image}
          alt={post.caption}
          className="w-[calc(100%+2px)] h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between px-3 pt-2.5">
        <div className="flex items-center gap-3">
          <button onClick={handleLike} className="flex items-center gap-1 group">
            <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground group-hover:text-destructive"}`} />
          </button>
          <button className="flex items-center gap-1 group">
            <MessageCircle className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          </button>
          {post.animal_id && (
            <Link to={`/animal/${post.animal_id}`} className="flex items-center gap-1 group">
              <Eye className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
            </Link>
          )}
        </div>
        <button onClick={() => setSaved(!saved)}>
          <Bookmark className={`w-5 h-5 transition-colors ${saved ? "fill-foreground text-foreground" : "text-foreground hover:text-primary"}`} />
        </button>
      </div>

      {/* Likes & comments count */}
      <div className="px-3 pt-1">
        <span className="text-xs font-semibold text-foreground">{likeCount.toLocaleString()} likes</span>
        {post.comments > 0 && (
          <span className="text-xs text-muted-foreground ml-2">{post.comments} comments</span>
        )}
      </div>

      {/* Caption */}
      <div className="px-3 pt-1">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-semibold">{post.breeder.name}</span>{" "}
          <span className="text-muted-foreground">{post.caption}</span>
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-3">
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
    </motion.article>
  );
}
