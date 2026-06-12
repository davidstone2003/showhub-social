import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from "lucide-react";
import { toast } from "sonner";

interface Clip {
  id: string;
  video_url: string;
  caption: string | null;
  likes: number;
  comments: number;
  breeder_name: string;
  breeder_logo: string | null;
  breeder_slug: string | null;
  created_at: string;
  species: string | null;
}

export function ReelsView() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchClips = async () => {
      const { data } = await (supabase.from("posts") as any)
        .select(
          "id, video_url, caption, likes, comments, created_at, tags, posted_as_breeder_id, user_id"
        )
        .not("video_url", "is", null)
        .eq("status", "active")
        .eq("show_on_feed", true)
        .order("created_at", { ascending: false })
        .limit(30);

      const rows = (data || []) as any[];

      const breederIds = [...new Set(rows.filter(r => r.posted_as_breeder_id).map(r => r.posted_as_breeder_id))];
      const userIds = [...new Set(rows.filter(r => r.user_id && !r.posted_as_breeder_id).map(r => r.user_id))];

      let bpMap: Record<string, any> = {};
      let pMap: Record<string, any> = {};

      if (breederIds.length > 0) {
        const { data: bps } = await supabase
          .from("breeder_profiles")
          .select("id, breeder_name, breeder_slug, logo_url")
          .in("id", breederIds);
        if (bps) bpMap = Object.fromEntries(bps.map((b: any) => [b.id, b]));
      }

      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name, username, logo_url")
          .in("id", userIds);
        if (profs) pMap = Object.fromEntries(profs.map((p: any) => [p.id, p]));
      }

      setClips(rows.map((p: any) => {
        const bp = p.posted_as_breeder_id ? bpMap[p.posted_as_breeder_id] : null;
        const pr = p.user_id ? pMap[p.user_id] : null;
        const fullName = pr ? [pr.first_name, pr.last_name].filter(Boolean).join(" ") : "";
        return {
          id: p.id,
          video_url: p.video_url,
          caption: p.caption,
          likes: p.likes || 0,
          comments: p.comments || 0,
          breeder_name: bp?.breeder_name || fullName || pr?.display_name || pr?.username || "Unknown",
          breeder_logo: bp?.logo_url || pr?.logo_url || null,
          breeder_slug: bp?.breeder_slug || pr?.username || null,
          created_at: p.created_at,
          species: p.tags?.[0] || null,
        };
      }));
      setLoading(false);
    };
    fetchClips();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex) {
        v.muted = muted;
        if (!paused) v.play().catch(() => {});
        else v.pause();
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [activeIndex, muted, paused, clips.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
      setPaused(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "70vh" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center text-center px-6" style={{ paddingTop: 80 }}>
        <div style={{ fontSize: 56 }}>🎬</div>
        <h3 className="font-bold mt-3 text-[18px]" style={{ color: "#0A1628" }}>No Clips Yet</h3>
        <p className="text-[#6B7280] text-[14px] mt-2 max-w-xs">
          Be the first to post a fitting video, walk-around, or show day moment.
        </p>
        <Link
          to="/submit"
          className="inline-flex items-center justify-center font-bold active:scale-95 transition-transform mt-5"
          style={{ padding: "0 22px", height: 48, borderRadius: 24, fontSize: 15, backgroundColor: "#C9A84C", color: "#0A1628", boxShadow: "0 4px 12px rgba(201,168,76,0.35)" }}
        >
          Post a Clip
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-scroll snap-y snap-mandatory scrollbar-hide -mx-3"
      style={{ height: "calc(100vh - 200px)", scrollSnapType: "y mandatory" }}
    >
      {clips.map((clip, i) => (
        <div
          key={clip.id}
          className="relative w-full bg-black snap-start"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            src={clip.video_url}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={muted}
            playsInline
            onClick={() => setPaused(p => !p)}
          />

          {paused && i === activeIndex && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
                <Play className="w-8 h-8 text-white" fill="white" />
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
          />

          {/* Top controls */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setMuted(m => !m)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              {muted
                ? <VolumeX className="w-4 h-4 text-white" />
                : <Volume2 className="w-4 h-4 text-white" />
              }
            </button>
          </div>

          {/* Right side actions */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10">
            <div className="flex flex-col items-center gap-1">
              <button className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <Heart className="w-5 h-5 text-white" />
              </button>
              <span className="text-white text-[11px] font-bold">{clip.likes || ""}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <MessageCircle className="w-5 h-5 text-white" />
              </button>
              <span className="text-white text-[11px] font-bold">{clip.comments || ""}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${clip.id}`);
                  toast.success("Link copied");
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <span className="text-white text-[11px] font-bold">Share</span>
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}>
                {clip.breeder_logo ? (
                  <img src={clip.breeder_logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] font-bold text-[#C9A84C]">
                    {clip.breeder_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {clip.breeder_slug ? (
                <Link to={`/breeder/${clip.breeder_slug}`} className="font-bold text-white text-[14px]">
                  {clip.breeder_name}
                </Link>
              ) : (
                <span className="font-bold text-white text-[14px]">{clip.breeder_name}</span>
              )}
              {clip.species && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(201,168,76,0.9)", color: "#0A1628" }}>
                  {clip.species}
                </span>
              )}
            </div>
            {clip.caption && (
              <p className="text-white text-[13px] leading-snug line-clamp-3" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                {clip.caption}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
