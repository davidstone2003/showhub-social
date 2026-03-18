import { Heart, Share2, MessageCircle, Trophy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  index: number;
}

function parseCaption(caption: string) {
  const lines = caption.split("\n").filter((l) => l.trim() !== "");
  const title = lines[0] || "";
  const subtitle = lines[1] && /[x×]/i.test(lines[1]) ? lines[1] : undefined;
  const body = lines.slice(subtitle ? 2 : 1).find((l) => l.trim().length > 0);
  return { title, subtitle, body };
}

export function PostCard({ post, index }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imageFailed, setImageFailed] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const { title, subtitle, body } = parseCaption(post.caption);
  const isHot = post.tags.some((t) => t.label.toLowerCase().includes("sale") || t.label.toLowerCase().includes("hot"));
  const isUploadedWinnerImage = post.image.includes("/storage/v1/object/public/winner-images/");
  const imageSrc = imageFailed ? "/placeholder.svg" : post.image;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card overflow-hidden mx-3 lg:mx-0"
      style={{ borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      <Link to={post.animal_id ? `/animal/${post.animal_id}` : "#"} className="block relative w-full overflow-hidden bg-muted" style={{ borderRadius: "12px 12px 0 0" }}>
        <img
          src={imageSrc}
          alt={post.breeder.name}
          className={cn(
            "w-full",
            isUploadedWinnerImage ? "aspect-[4/3] object-contain bg-muted" : "aspect-[4/5] object-cover"
          )}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />

        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />

        <div className="absolute bottom-0 left-0 right-0" style={{ padding: "16px" }}>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Link to={`/breeders/${post.breeder.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
              <span className="font-bold text-white drop-shadow-md" style={{ fontSize: "16px", lineHeight: "16px" }}>
                {post.breeder.name}
              </span>
            </Link>
            {post.breeder.is_pro && (
              <span className="bg-green-500 text-white font-black flex items-center justify-center shrink-0 shadow-sm" style={{ fontSize: "8px", width: "18px", height: "18px", borderRadius: "50%", marginLeft: "4px" }}>
                P
              </span>
            )}
          </div>
          {post.post_type === "champion" && (
            <div className="flex items-center text-white mt-1" style={{ gap: "4px", fontSize: "12px", lineHeight: "16px" }}>
              <Trophy className="w-3 h-3" />
              <span>12 wins this season</span>
            </div>
          )}
        </div>
      </Link>

      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {title && (
            <p className="font-semibold text-foreground truncate" style={{ fontSize: "14px", lineHeight: "18px" }}>
              {title}
            </p>
          )}
          {subtitle && (
            <p className="font-bold text-primary truncate" style={{ fontSize: "14px", lineHeight: "16px" }}>
              {subtitle}
            </p>
          )}
          <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "16px" }}>
            {post.breeder.location}{post.breeder.location && " · "}{post.created_at}
            {isHot && <span className="ml-1">🔥 Hot</span>}
          </p>
          {body && (
            <p className="text-muted-foreground truncate" style={{ fontSize: "14px", lineHeight: "16px" }}>
              {body}
            </p>
          )}
        </div>

        <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "16px", marginTop: "4px" }}>
          {likeCount.toLocaleString()} likes · {post.comments} comments
        </p>
      </div>

      <div className="border-t border-border" style={{ margin: "0 12px" }} />

      <div className="flex items-center" style={{ height: "44px", padding: "0 8px", gap: "6px" }}>
        <button className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition-colors flex-1" style={{ borderRadius: "10px", fontSize: "12px", lineHeight: "16px", height: "32px" }}>
          <MessageCircle className="w-4 h-4" />
          CONTACT
        </button>

        <button onClick={handleLike} className="flex items-center justify-center rounded-lg hover:bg-muted transition-colors" style={{ width: "36px", height: "32px" }}>
          <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
        </button>

        <button className="flex items-center justify-center rounded-lg hover:bg-muted transition-colors" style={{ width: "36px", height: "32px" }}>
          <Share2 className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center justify-center font-bold border transition-colors flex-1 ${saved ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-primary border-primary hover:bg-primary/5"}`}
          style={{ borderRadius: "10px", fontSize: "12px", lineHeight: "16px", height: "32px" }}
        >
          {saved ? "FOLLOWING" : "FOLLOW"}
        </button>
      </div>
    </motion.article>
  );
}