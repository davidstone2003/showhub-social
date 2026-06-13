import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Flag, MoreVertical, Pencil, Trash2, User, Trophy } from "lucide-react";
import { FeedVideo } from "@/components/post/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "@/data/mock";
import { cn } from "@/lib/utils";
import { ResultRibbon } from "@/components/ResultRibbon";
import { ClampedText } from "@/components/post/ClampedText";
import { RecapBlocks, highestPlacing, type RecapWinner } from "@/components/post/RecapBlocks";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { AdminFlagModal } from "@/components/AdminFlagModal";
import { AdminEditModal } from "@/components/AdminEditModal";
import { AuthGate } from "@/components/AuthGate";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerifyEmailModal } from "@/components/VerifyEmailModal";
import { WinnerImageViewer } from "@/components/winners/WinnerImageViewer";
import { WinnerDetailDrawer } from "@/components/post/WinnerDetailDrawer";
import { CommentSheet } from "@/components/post/CommentSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post & { status?: string; user_id?: string | null };
  index: number;
  onModerated?: (postId?: string) => void;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function accentForPlacing(placing?: string | null): string {
  if (!placing) return "#C9A84C";
  if (/grand\s*champ/i.test(placing) && !/reserve/i.test(placing)) return "#C9A84C";
  if (/reserve/i.test(placing)) return "#A8A9AD";
  if (/class\s*winner/i.test(placing)) return "#4A7C59";
  return "#C9A84C";
}

function PhotoGrid({ images, onTap }: { images: string[]; onTap: (index: number, e: React.MouseEvent<HTMLElement>) => void }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={(e) => onTap(0, e)}
        className="block w-full overflow-hidden"
      >
        <img
          src={images[0]}
          alt=""
          className="w-full object-cover"
          style={{ aspectRatio: "4 / 3" }}
          loading="lazy"
          decoding="async"
        />
      </button>
    );
  }

  if (images.length === 2) {
    return (
      <div className="flex w-full" style={{ gap: 2, aspectRatio: "2 / 1" }}>
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => onTap(i, e)}
            className="flex-1 overflow-hidden"
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="w-full flex flex-col" style={{ gap: 2 }}>
        <button
          type="button"
          onClick={(e) => onTap(0, e)}
          className="block w-full overflow-hidden"
        >
          <img
            src={images[0]}
            alt=""
            className="w-full object-cover"
            style={{ aspectRatio: "16 / 9" }}
            loading="lazy"
            decoding="async"
          />
        </button>
        <div className="flex w-full" style={{ gap: 2, aspectRatio: "2 / 1" }}>
          {[images[1], images[2]].map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => onTap(i + 1, e)}
              className="flex-1 overflow-hidden"
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const visible = images.slice(0, 4);
  const remaining = images.length - 4;
  return (
    <div className="w-full grid grid-cols-2" style={{ gap: 2 }}>
      {visible.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={(e) => onTap(i, e)}
          className="relative overflow-hidden"
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{ aspectRatio: "1 / 1" }}
            loading="lazy"
            decoding="async"
          />
          {i === 3 && remaining > 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.55)", fontSize: 24 }}
            >
              +{remaining}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function PostCard({ post, index, onModerated }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [repostCaption, setRepostCaption] = useState("");
  const [showRepostComposer, setShowRepostComposer] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { showVerifyModal, setShowVerifyModal, requireVerification, resendVerification } = useEmailVerification();

  const canManage = isAdmin || (user && (post as any).user_id === user.id);
  const isWinner = post.post_type === "champion" && (post.win_placing || post.win_title);
  const isPersistedRecord = UUID_PATTERN.test(post.id);

  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const triggerLike = (force?: boolean) => {
    if (!user) { setShowAuthGate(true); return; }
    if (requireVerification()) return;
    if (force && liked) return; // double-tap shouldn't unlike
    setLiked((prev) => {
      const next = force ? true : !prev;
      setLikeCount((c) => (next === prev ? c : next ? c + 1 : c - 1));
      return next;
    });
  };

  const handleLike = () => triggerLike(false);

  const handlePhotoTap = (i: number, e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap → like burst
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setBurst({ id: now, x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setBurst(null), 600);
      triggerLike(true);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    setTimeout(() => {
      if (lastTapRef.current && Date.now() - lastTapRef.current >= 290) {
        lastTapRef.current = 0;
        openViewer(i);
      }
    }, 310);
  };


  const handleDelete = async () => {
    if (!isPersistedRecord) {
      toast.success("Sample post removed");
      onModerated?.(post.id);
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const { error: linkedWinnersError } = await supabase
        .from("winners")
        .delete()
        .eq("source_post_id", post.id);
      if (linkedWinnersError) throw linkedWinnersError;

      const { error: postsError, count: postsDeleted } = await supabase
        .from("posts")
        .delete({ count: "exact" })
        .eq("id", post.id);
      if (postsError) throw postsError;

      const { error: winnersError, count: winnersDeleted } = await supabase
        .from("winners")
        .delete({ count: "exact" })
        .eq("id", post.id);
      if (winnersError) throw winnersError;

      if ((postsDeleted ?? 0) === 0 && (winnersDeleted ?? 0) === 0) {
        toast.error("Post was not found");
      } else {
        toast.success("Post deleted");
        onModerated?.(post.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete post";
      toast.error(message);
    }

    setShowDeleteConfirm(false);
  };

  const resultTitle = post.win_placing || post.show_name || "";
  const status = (post as any).status || "active";
  const isFlagged = status === "flagged";
  const isRestricted = status === "restricted";
  const isRemoved = status === "removed";

  const allImages: string[] = (post as any).image_urls?.length > 0
    ? (post as any).image_urls
    : (post.image && post.image !== "/placeholder.svg" ? [post.image] : []);

  const accent = accentForPlacing(post.win_placing);
  const breederLogo = post.breeder?.logo;
  const breederName = post.breeder?.name || "Unknown";
  const breederSlug = post.breeder?.slug;

  const openViewer = (i: number) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(
          "overflow-hidden relative -mx-3 bg-white",
          isFlagged && "ring-2 ring-amber-400",
          isRestricted && "ring-2 ring-orange-400 opacity-75",
          isRemoved && "ring-2 ring-destructive opacity-50"
        )}
        style={{ borderRadius: 0, borderBottom: "1px solid #E5E7EB" }}
      >
        {status !== "active" && (
          <div className={cn(
            "px-3 py-1 text-xs font-semibold flex items-center gap-1.5",
            isFlagged && "bg-amber-50 text-amber-800",
            isRestricted && "bg-orange-50 text-orange-800",
            isRemoved && "bg-red-50 text-red-800"
          )}>
            <Flag className="w-3 h-3" />
            {isFlagged && "Flagged for review"}
            {isRestricted && "Restricted"}
            {isRemoved && "Removed"}
          </div>
        )}

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors">
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => setShowFlagModal(true)}>
                  <Flag className="w-3.5 h-3.5 mr-2" /> Moderate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Identity row */}
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
          <div
            className="flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
            style={{ width: 38, height: 38, backgroundColor: "#0A1628" }}
          >
            {breederLogo && typeof breederLogo === "string" && breederLogo.startsWith("http") ? (
              <img src={breederLogo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span style={{ fontSize: 16, color: "#fff" }}>
                {breederLogo || breederName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {breederSlug ? (
              <Link
                to={`/breeder/${breederSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-[14px] leading-tight block"
                style={{ color: "#0A1628" }}
              >
                {breederName}
              </Link>
            ) : (
              <span className="font-bold text-[14px] leading-tight block" style={{ color: "#0A1628" }}>
                {breederName}
              </span>
            )}
            <span className="text-[12px] text-muted-foreground leading-tight">
              {post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
              {isWinner && post.show_name && (
                <>
                  {" · "}
                  <span style={{ color: "#0A1628", fontWeight: 600 }}>
                    {post.created_at ? `${new Date(post.created_at).getFullYear()} ` : ""}{post.show_name}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Caption — always before photos */}
        {(post as any).caption && (
          <div className="px-3 pb-2">
            <p className="text-foreground" style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {(post as any).caption}
            </p>
          </div>
        )}

        {/* Photos */}
        <div className="relative">
          {isWinner && (post.win_placing || post.win_title) && (
            <ResultRibbon placing={(post.win_placing || post.win_title) as string} />
          )}
          {(post as any).video_url ? (
            <FeedVideo src={(post as any).video_url} aspectRatio="4 / 3" />
          ) : (
            <PhotoGrid images={allImages} onTap={handlePhotoTap} />
          )}
          <AnimatePresence>
            {burst && (
              <motion.div
                key={burst.id}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute pointer-events-none"
                style={{ left: burst.x - 40, top: burst.y - 40 }}
              >
                <Heart
                  className="w-20 h-20"
                  fill="#C9A84C"
                  strokeWidth={1.5}
                  style={{ color: "#C9A84C", filter: "drop-shadow(0 2px 8px rgba(10,22,40,0.35))" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Winner info — one compact metadata line */}
        {isWinner && (post.win_placing || post.win_title) && (
          (post.breeder?.name || post.shown_by || post.sired_by) && (
            <div className="px-3 pb-1 pt-2">
              <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
                {post.breeder?.name && (
                  <>Bred by <span style={{ color: "#0A1628", fontWeight: 600 }}>{post.breeder.name}</span></>
                )}
                {post.shown_by && (
                  <>
                    {post.breeder?.name && " · "}
                    Shown by <span style={{ color: "#0A1628", fontWeight: 600 }}>{post.shown_by}</span>
                  </>
                )}
                {post.sired_by && (
                  <>
                    {(post.breeder?.name || post.shown_by) && " · "}
                    Sired by{" "}
                    {post.sire_id ? (
                      <Link
                        to={`/sire/${post.sire_id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#C9A84C", fontWeight: 600 }}
                      >
                        {post.sired_by}
                      </Link>
                    ) : (
                      <span style={{ color: "#C9A84C", fontWeight: 600 }}>{post.sired_by}</span>
                    )}
                  </>
                )}
              </p>
            </div>
          )
        )}





        {/* Engagement row */}
        <div className="flex items-center gap-4 px-3 pb-3 pt-2 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 hover:text-destructive transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-destructive text-destructive")} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={() => {
              if (!user) { setShowAuthGate(true); return; }
              setShowComments(true);
            }}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments || 0}</span>
          </button>
          <button
            onClick={() => setShowShareSheet(true)}
            className="flex items-center gap-1.5 ml-auto hover:text-primary transition-colors"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Comment teaser — Instagram style */}
        {post.comments > 0 && (
          <div className="px-3 pb-2">
            {post.comments > 2 && (
              <button
                type="button"
                onClick={() => {
                  if (!user) { setShowAuthGate(true); return; }
                  setShowComments(true);
                }}
                className="block text-[13px] font-semibold mb-1"
                style={{ color: "#9CA3AF" }}
              >
                View all {post.comments} comments
              </button>
            )}
            {(post as any).latest_comment_author && (post as any).latest_comment && (
              <p className="text-[13px]" style={{ color: "#0A1628", lineHeight: 1.4 }}>
                <span className="font-semibold">{(post as any).latest_comment_author}</span>{" "}
                <span>{(post as any).latest_comment}</span>
              </p>
            )}
          </div>
        )}
      </motion.article>

      {showShareSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => { setShowShareSheet(false); setShowRepostComposer(false); setRepostCaption(""); }}
        >
          <div
            className="bg-white rounded-t-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            {!showRepostComposer ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6]">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}
                  >
                    {post.breeder?.logo && (post.breeder.logo as string).startsWith("http") ? (
                      <img src={post.breeder.logo as string} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[13px] font-bold text-[#C9A84C]">
                        {(post.breeder?.name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-[#0A1628] truncate">
                      {post.win_placing || post.breeder?.name || "Post"}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] truncate">
                      {post.show_name || (post as any).caption?.slice(0, 50) || ""}
                    </p>
                  </div>
                  {post.image && post.image !== "/placeholder.svg" && (
                    <img
                      src={post.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  )}
                </div>

                <div className="px-4 py-2">
                  <button
                    onClick={() => {
                      if (!user) { setShowShareSheet(false); setShowAuthGate(true); return; }
                      setShowRepostComposer(true);
                    }}
                    className="w-full flex items-center gap-4 py-3.5 border-b border-[#F3F4F6]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F4FF" }}>
                      <User className="w-5 h-5" style={{ color: "#0A1628" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-[#0A1628]">Share to Your Profile</p>
                      <p className="text-[12px] text-[#9CA3AF]">Add to your Backdrop profile page</p>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      if (!user) { setShowShareSheet(false); setShowAuthGate(true); return; }
                      setSharing(true);
                      try {
                        const { error } = await (supabase.from("posts") as any).insert({
                          user_id: user.id,
                          caption: (post as any).caption || null,
                          image_urls: (post as any).image_urls || (post.image && post.image !== "/placeholder.svg" ? [post.image] : []),
                          video_url: (post as any).video_url || null,
                          post_type: "general",
                          status: "active",
                          show_on_feed: false,
                          show_on_breeder_page: true,
                          reposted_from_id: (post as any).source_post_id || post.id,
                        });
                        if (error) throw error;
                        toast.success("Added to your breeder page");
                        setShowShareSheet(false);
                      } catch (err: any) {
                        toast.error("Couldn't add to breeder page", { description: err.message });
                      } finally {
                        setSharing(false);
                      }
                    }}
                    className="w-full flex items-center gap-4 py-3.5 border-b border-[#F3F4F6]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFF8E7" }}>
                      <Trophy className="w-5 h-5" style={{ color: "#C9A84C" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-[#0A1628]">Add to Breeder Page</p>
                      <p className="text-[12px] text-[#9CA3AF]">Show on your operation's profile</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      toast.info("Direct messaging coming soon");
                      setShowShareSheet(false);
                    }}
                    className="w-full flex items-center gap-4 py-3.5 border-b border-[#F3F4F6]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0FFF4" }}>
                      <MessageCircle className="w-5 h-5" style={{ color: "#16A34A" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-[#0A1628]">Send as Message</p>
                      <p className="text-[12px] text-[#9CA3AF]">Share privately with someone</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/post/${post.id}`;
                      const text = [post.win_placing, post.show_name, post.breeder?.name].filter(Boolean).join(" · ");
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, "_blank");
                      setShowShareSheet(false);
                    }}
                    className="w-full flex items-center gap-4 py-3.5 border-b border-[#F3F4F6]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EEF2FF" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-[#0A1628]">Share to Facebook</p>
                      <p className="text-[12px] text-[#9CA3AF]">Post on your Facebook timeline</p>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      const shareUrl = `${window.location.origin}/post/${post.id}`;
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copied to clipboard");
                      setShowShareSheet(false);
                    }}
                    className="w-full flex items-center gap-4 py-3.5 border-b border-[#F3F4F6]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFF8E7" }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#C9A84C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#C9A84C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-[#0A1628]">Copy Link</p>
                      <p className="text-[12px] text-[#9CA3AF]">Copy post link to clipboard</p>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      const shareUrl = `${window.location.origin}/post/${post.id}`;
                      const shareText = [post.win_placing, post.show_name, post.breeder?.name ? `Bred by ${post.breeder.name}` : null].filter(Boolean).join(" · ");
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: "Backdrop Post", text: shareText, url: shareUrl });
                        } catch {}
                      }
                      setShowShareSheet(false);
                    }}
                    className="w-full flex items-center gap-4 py-3.5"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F4FF" }}>
                      <Share2 className="w-5 h-5" style={{ color: "#6366F1" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-[#0A1628]">More Options</p>
                      <p className="text-[12px] text-[#9CA3AF]">Share via text, email, or other apps</p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowShareSheet(false)}
                  className="w-full py-4 font-semibold text-[15px] border-t border-[#E5E7EB]"
                  style={{ color: "#6B7280" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                  <button
                    onClick={() => setShowRepostComposer(false)}
                    className="text-[14px] text-[#6B7280]"
                  >
                    ← Back
                  </button>
                  <h3 className="font-bold text-[16px] text-[#0A1628]">Share to Feed</h3>
                  <button
                    onClick={async () => {
                      if (!user) return;
                      setSharing(true);
                      try {
                        const { error } = await (supabase.from("posts") as any).insert({
                          user_id: user.id,
                          caption: repostCaption.trim() || null,
                          image_urls: (post as any).image_urls || (post.image && post.image !== "/placeholder.svg" ? [post.image] : []),
                          video_url: (post as any).video_url || null,
                          post_type: "general",
                          status: "active",
                          show_on_feed: true,
                          show_on_breeder_page: true,
                          reposted_from_id: (post as any).source_post_id || post.id,
                        });
                        if (error) throw error;
                        toast.success("Reposted to your feed! 🎉");
                        setShowShareSheet(false);
                        setShowRepostComposer(false);
                        setRepostCaption("");
                        onModerated?.();
                      } catch (err: any) {
                        toast.error("Couldn't repost", { description: err.message });
                      } finally {
                        setSharing(false);
                      }
                    }}
                    disabled={sharing}
                    className="text-[14px] font-bold rounded-full px-4 py-1.5"
                    style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}
                  >
                    {sharing ? "Posting..." : "Post"}
                  </button>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}>
                    <span className="text-[14px] font-bold text-[#C9A84C]">
                      {(user?.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[14px] text-[#0A1628]">Sharing to your profile</p>
                    <p className="text-[12px] text-[#9CA3AF]">Visible on your Backdrop profile page</p>
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <textarea
                    value={repostCaption}
                    onChange={e => setRepostCaption(e.target.value)}
                    placeholder="Say something about this post..."
                    className="w-full text-[15px] text-[#0A1628] placeholder:text-[#9CA3AF] outline-none resize-none"
                    rows={3}
                    autoFocus
                  />
                </div>

                <div className="mx-4 mb-4 rounded-xl border border-[#E5E7EB] overflow-hidden">
                  {post.image && post.image !== "/placeholder.svg" && (
                    <img src={post.image} alt="" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3 bg-[#F8F7F4]">
                    <p className="font-semibold text-[13px] text-[#0A1628] truncate">
                      {post.win_placing || post.breeder?.name || "Post"}
                    </p>
                    <p className="text-[12px] text-[#6B7280] truncate mt-0.5">
                      {post.show_name || (post as any).caption?.slice(0, 60) || ""}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <WinnerDetailDrawer post={post} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CommentSheet postId={(post as any).source_post_id || post.id} open={showComments} onClose={() => setShowComments(false)} commentCount={post.comments || 0} />

      <AdminFlagModal open={showFlagModal} onOpenChange={setShowFlagModal} postId={post.id} postOwnerId={(post as any).user_id} onActionComplete={onModerated} />
      <AdminEditModal
        open={showEditModal} onOpenChange={setShowEditModal}
        post={{
          id: (post as any).winner_id || post.id,
          title: post.win_placing || post.show_name || "",
          show_name: post.show_name || "",
          shown_by: post.shown_by || "",
          win_placing: post.win_placing,
          caption: (post as any).caption,
          bred_by: (post as any).bred_by,
          sired_by: (post as any).sired_by,
          dam: (post as any).dam,
          date: (post as any).date || post.created_at?.split("T")[0],
          source_post_id: post.id,
        }}
        onSaved={onModerated}
      />
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AuthGate open={showAuthGate} onOpenChange={setShowAuthGate} />
      <VerifyEmailModal open={showVerifyModal} onOpenChange={setShowVerifyModal} onResend={resendVerification} />
      <WinnerImageViewer
        slides={allImages.map((img) => ({ image: img, name: post.shown_by || resultTitle, placement: resultTitle, breeder: post.breeder?.name || null }))}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}
