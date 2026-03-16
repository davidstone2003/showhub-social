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

// Tags that link to entity pages instead of filtering
const entityLinks: Record<string, (id?: string) => string | null> = {
  sire: (id) => id ? `/sire/${id}` : null,
};

export function PostCard({ post, index, onTagClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleTagClick = (tag: { label: string; type: string }) => {
    // Sire tags navigate to sire page
    if (tag.type === "sire" && post.sire_id) {
      return; // handled by Link wrapper
    }
    onTagClick?.(tag);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card border-b border-border lg:rounded-lg lg:border lg:mb-4 overflow-hidden"
    >
      {/* Breeder header — compact */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <span className="w-8 h-8 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-sm shrink-0">
          {post.breeder.logo}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground truncate">{post.breeder.name}</p>
            {post.breeder.is_pro && (
              <span className="bg-primary text-primary-foreground text-[8px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center uppercase tracking-wider shrink-0">
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

      {/* Image — TRUE edge-to-edge 4:5 portrait, dominates viewport */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.caption}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption — breeder name bold + caption */}
      <div className="px-3 pt-2">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{post.breeder.name}</span>{" "}
          <span className="text-muted-foreground">{post.caption}</span>
        </p>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 px-3 pt-2">
        {post.tags.map((tag) => {
          // Sire tags link to sire page
          if (tag.type === "sire" && post.sire_id) {
            return (
              <Link key={tag.label} to={`/sire/${post.sire_id}`}>
                <Badge
                  variant="outline"
                  className={`text-[11px] cursor-pointer hover:opacity-80 transition-opacity ${tagColors.sire}`}
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
              className={`text-[11px] cursor-pointer hover:opacity-80 transition-opacity ${tagColors[tag.type] || tagColors.type}`}
              onClick={() => onTagClick?.(tag)}
            >
              {tag.label}
            </Badge>
          );
        })}
      </div>

      {/* Actions row: ❤️💬👁🔖 */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1 group">
            <Heart className={`w-[22px] h-[22px] transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground group-hover:text-destructive"}`} />
            <span className="text-xs text-muted-foreground">{likeCount.toLocaleString()}</span>
          </button>
          <button className="flex items-center gap-1 group">
            <MessageCircle className="w-[22px] h-[22px] text-foreground group-hover:text-primary transition-colors" />
            {post.comments > 0 && <span className="text-xs text-muted-foreground">{post.comments}</span>}
          </button>
          {post.animal_id && (
            <Link to={`/animal/${post.animal_id}`} className="flex items-center gap-1 group">
              <Eye className="w-[22px] h-[22px] text-primary group-hover:text-primary-hover transition-colors" />
              <span className="text-xs text-primary font-medium">View</span>
            </Link>
          )}
        </div>
        <button onClick={() => setSaved(!saved)}>
          <Bookmark className={`w-[22px] h-[22px] transition-colors ${saved ? "fill-foreground text-foreground" : "text-foreground hover:text-primary"}`} />
        </button>
      </div>

      {/* Quick entity links */}
      {(post.sire_id || post.animal_id) && (
        <div className="flex gap-3 px-3 pb-2.5 -mt-1">
          {post.sire_id && (
            <Link to={`/sire/${post.sire_id}`} className="text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors">
              View Sire →
            </Link>
          )}
          {post.animal_id && (
            <Link to={`/animal/${post.animal_id}`} className="text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors">
              View Animal →
            </Link>
          )}
        </div>
      )}
    </motion.article>
  );
}
