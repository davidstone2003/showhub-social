import React from "react";
import { Heart, MessageCircle, Flag } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminFlagModal } from "@/components/AdminFlagModal";
import { BreederIdentity } from "@/components/BreederIdentity";

interface PostCardProps {
  post: Post & { status?: string; user_id?: string | null };
  index: number;
  onModerated?: () => void;
}

export function PostCard({ post, index, onModerated }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imageFailed, setImageFailed] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const { isAdmin } = useUserRole();

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const isUploadedWinnerImage = post.image.includes("/storage/v1/object/public/winner-images/");
  const imageSrc = imageFailed ? "/placeholder.svg" : post.image;

  const status = (post as any).status || "active";
  const isFlagged = status === "flagged";
  const isRestricted = status === "restricted";
  const isRemoved = status === "removed";

  const isWinner = post.post_type === "champion" || post.win_placing;

  const currentYear = new Date().getFullYear();
  const postYear = post.created_at ? new Date(post.created_at).getFullYear() : currentYear;
  const showYearInline = !isNaN(postYear) && postYear <= currentYear && postYear > 2000;

  const showNameWithYear = post.show_name
    ? (showYearInline ? `${postYear} ${post.show_name}` : post.show_name)
    : null;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        className={cn(
          "bg-card overflow-hidden relative",
          isFlagged && "ring-2 ring-amber-400",
          isRestricted && "ring-2 ring-orange-400 opacity-75",
          isRemoved && "ring-2 ring-destructive opacity-50"
        )}
        style={{ borderRadius: "12px", boxShadow: "var(--shadow-card)" }}
      >
        {/* Status banner */}
        {status !== "active" && (
          <div
            className={cn(
              "px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5",
              isFlagged && "bg-amber-50 text-amber-800",
              isRestricted && "bg-orange-50 text-orange-800",
              isRemoved && "bg-red-50 text-red-800"
            )}
          >
            <Flag className="w-3 h-3" />
            {isFlagged && "This post has been flagged for review"}
            {isRestricted && "This post is restricted"}
            {isRemoved && "This post has been removed"}
          </div>
        )}

        {/* Admin flag button */}
        {isAdmin && (
          <button
            onClick={() => setShowFlagModal(true)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-destructive/10 transition-colors"
            title="Moderate post"
          >
            <Flag className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        {/* Breeder Header */}
        <BreederIdentity
          name={post.breeder?.name || "Unknown"}
          slug={(post.breeder as any)?.slug || post.breeder?.id}
          logoUrl={post.breeder?.logo || null}
          location={post.breeder?.location || null}
          tier={post.breeder?.is_pro ? "breeder_page" : "free"}
          variant="feed"
        />

        {/* Image */}
        <Link
          to={post.animal_id ? `/animal/${post.animal_id}` : "#"}
          className="block w-full overflow-hidden bg-muted"
        >
          <img
            src={imageSrc}
            alt={post.win_placing || post.show_name || "Post image"}
            className={cn(
              "w-full aspect-video",
              isUploadedWinnerImage ? "object-contain bg-muted" : "object-cover"
            )}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </Link>

        {/* Content */}
        <div className="px-3.5 pt-2.5 pb-1.5">
          {isWinner ? (
            <WinnerDetails
              winPlacing={post.win_placing}
              winTitle={post.win_title}
              showNameWithYear={showNameWithYear}
              shownBy={post.shown_by}
              placedBy={post.placed_by}
              siredBy={post.sired_by}
              sireId={(post as any).sire_id}
              dam={post.dam}
              bredBy={post.bred_by || post.breeder?.name}
              caption={post.caption}
            />
          ) : (
            <GeneralDetails
              showName={post.show_name}
              caption={post.caption}
              shownBy={post.shown_by || post.breeder?.name}
            />
          )}

          {/* Engagement */}
          <div className="flex items-center justify-end gap-3 pb-1 mt-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-destructive transition-colors"
              style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}
            >
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-destructive text-destructive")} />
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-1" style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments}</span>
            </span>
          </div>
        </div>
      </motion.article>

      <AdminFlagModal
        open={showFlagModal}
        onOpenChange={setShowFlagModal}
        postId={post.id}
        postOwnerId={(post as any).user_id}
        onActionComplete={onModerated}
      />
    </>
  );
}

/* ── Winner Detail Block ── */
function WinnerDetails({
  winPlacing,
  winTitle,
  showNameWithYear,
  shownBy,
  placedBy,
  siredBy,
  sireId,
  dam,
  bredBy,
  caption,
}: {
  winPlacing?: string;
  winTitle?: string;
  showNameWithYear: string | null;
  shownBy?: string;
  placedBy?: string;
  siredBy?: string;
  sireId?: string;
  dam?: string;
  bredBy?: string;
  caption?: string;
}) {
  return (
    <div className="space-y-1">
      {/* Result / placement — strongest */}
      {winPlacing && (
        <p className="text-foreground font-bold" style={{ fontSize: "15px", lineHeight: 1.3 }}>
          {winPlacing}
        </p>
      )}

      {/* Show name + year */}
      {showNameWithYear && (
        <p className="text-muted-foreground font-medium" style={{ fontSize: "13px" }}>
          {showNameWithYear}
        </p>
      )}

      {/* Stacked detail lines */}
      <div className="pt-0.5 space-y-px">
        {shownBy && <DetailLine label="Shown by" value={shownBy} />}
        {placedBy && <DetailLine label="Placed by" value={placedBy} />}
        {siredBy && (
          <DetailLine
            label="Sired by"
            value={siredBy}
            linkTo={sireId ? `/sire/${sireId}` : undefined}
          />
        )}
        {dam && <DetailLine label="Dam" value={dam} />}
        {bredBy && <DetailLine label="Bred by" value={bredBy} />}
      </div>

      {/* Caption */}
      {caption && !caption.includes("Shown By:") && caption.trim() && (
        <p className="text-foreground line-clamp-2 pt-0.5" style={{ fontSize: "13px" }}>
          {caption}
        </p>
      )}
    </div>
  );
}

/* ── General Detail Block ── */
function GeneralDetails({
  showName,
  caption,
  shownBy,
}: {
  showName?: string;
  caption?: string;
  shownBy?: string;
}) {
  return (
    <div className="space-y-0.5">
      {showName && (
        <p className="font-medium text-foreground" style={{ fontSize: "14px" }}>
          {showName}
        </p>
      )}
      {shownBy && (
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
          {shownBy}
        </p>
      )}
      {caption && caption.trim() && (
        <p className="text-foreground line-clamp-2" style={{ fontSize: "14px" }}>
          {caption}
        </p>
      )}
    </div>
  );
}

/* ── Reusable detail line ── */
function DetailLine({
  label,
  value,
  linkTo,
}: {
  label: string;
  value: string;
  linkTo?: string;
}) {
  return (
    <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.4 }}>
      {label}{" "}
      {linkTo ? (
        <Link
          to={linkTo}
          className="text-primary font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </Link>
      ) : (
        <span className="text-foreground font-medium">{value}</span>
      )}
    </p>
  );
}
