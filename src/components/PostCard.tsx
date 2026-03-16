import { Heart, MessageCircle, Share2, Bookmark, Trophy, Phone } from "lucide-react";
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

// Extract contact numbers from caption
function extractContacts(caption: string): { name: string; phone: string }[] {
  const contacts: { name: string; phone: string }[] = [];
  const phoneRegex = /(\w+)\s+([\d.]{10,})/g;
  let match;
  while ((match = phoneRegex.exec(caption)) !== null) {
    contacts.push({ name: match[1], phone: match[2].replace(/\./g, "") });
  }
  return contacts;
}

// Extract title (first line) and subtitle from caption
function parseCaption(caption: string) {
  const lines = caption.split("\n").filter((l) => l.trim() !== "");
  const title = lines[0] || "";
  // Check if second line looks like a genetics line (contains "x" or "×")
  const subtitle = lines[1] && /[x×]/i.test(lines[1]) ? lines[1] : undefined;
  const startIdx = subtitle ? 2 : 1;
  const body = lines.slice(startIdx).join("\n");
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
  const contacts = extractContacts(post.caption);

  // Remove phone lines from body for cleaner display
  const cleanBody = body
    .split("\n")
    .filter((line) => !/📞/.test(line))
    .join("\n");

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mx-3 mb-4 lg:mx-0"
    >
      {/* Breeder header */}
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

      {/* Title + subtitle hierarchy */}
      <div className="px-4 pb-2">
        <h3 className="text-[18px] font-bold text-foreground leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-[14px] font-medium text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Body text */}
      {cleanBody.trim() && (
        <div className="px-4 pb-3">
          {cleanBody.split("\n").map((line, i) => (
            <p key={i} className={`text-[13px] leading-relaxed ${line.trim() === "" ? "h-1.5" : "text-muted-foreground"}`}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Full-width image */}
      <div className="relative w-full overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={title}
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
                  className="text-[12px] cursor-pointer bg-pill text-pill-text border-0 hover:bg-primary hover:text-primary-foreground transition-colors"
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
              className="text-[12px] cursor-pointer bg-pill text-pill-text border-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onTagClick?.(tag)}
            >
              {tag.label}
            </Badge>
          );
        })}
      </div>

      {/* Contact buttons */}
      {contacts.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {contacts.map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pill text-pill-text text-[12px] font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Phone className="w-3 h-3" />
              Call {c.name}
            </a>
          ))}
        </div>
      )}

      {/* Engagement count */}
      <div className="px-4 pb-1">
        <p className="text-[13px] text-muted-foreground">
          {likeCount.toLocaleString()} likes · {post.comments} comments
        </p>
      </div>

      <div className="border-t border-border mx-4" />

      {/* Quick action bar */}
      <div className="flex items-center justify-around px-2 py-1.5">
        <button onClick={handleLike} className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Heart className={`w-[18px] h-[18px] transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover:text-destructive"}`} />
          <span className={`text-[13px] font-medium ${liked ? "text-destructive" : "text-muted-foreground"}`}>Save</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Share2 className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[13px] font-medium text-muted-foreground">Share</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <MessageCircle className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[13px] font-medium text-muted-foreground">Contact</span>
        </button>
        <button onClick={() => setSaved(!saved)} className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors group flex-1 justify-center">
          <Bookmark className={`w-[18px] h-[18px] transition-colors ${saved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
          <span className={`text-[13px] font-medium ${saved ? "text-primary" : "text-muted-foreground"}`}>Follow</span>
        </button>
      </div>
    </motion.article>
  );
}
