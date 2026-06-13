import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReelCard {
  id: string;
  video_url: string;
  poster: string | null;
  breeder_name: string;
  breeder_logo: string | null;
}

interface ReelsStripProps {
  onOpen?: (id: string) => void;
}

export function ReelsStrip({ onOpen }: ReelsStripProps) {
  const { user } = useAuth();
  const [reels, setReels] = useState<ReelCard[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("posts") as any)
        .select("id, video_url, image_urls, posted_as_breeder_id, user_id, is_reel, created_at")
        .not("video_url", "is", null)
        .eq("status", "active")
        .eq("show_on_feed", true)
        .order("is_reel", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

      const rows = (data || []) as any[];
      const breederIds = [...new Set(rows.filter((r) => r.posted_as_breeder_id).map((r) => r.posted_as_breeder_id))];
      const userIds = [...new Set(rows.filter((r) => r.user_id && !r.posted_as_breeder_id).map((r) => r.user_id))];

      let bpMap: Record<string, any> = {};
      let pMap: Record<string, any> = {};

      if (breederIds.length) {
        const { data: bps } = await supabase
          .from("breeder_profiles")
          .select("id, breeder_name, logo_url")
          .in("id", breederIds);
        if (bps) bpMap = Object.fromEntries(bps.map((b: any) => [b.id, b]));
      }
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name, username, logo_url")
          .in("id", userIds);
        if (profs) pMap = Object.fromEntries(profs.map((p: any) => [p.id, p]));
      }

      setReels(
        rows.map((p: any) => {
          const bp = p.posted_as_breeder_id ? bpMap[p.posted_as_breeder_id] : null;
          const pr = p.user_id ? pMap[p.user_id] : null;
          const fullName = pr ? [pr.first_name, pr.last_name].filter(Boolean).join(" ") : "";
          return {
            id: p.id,
            video_url: p.video_url,
            poster: p.image_urls?.[0] || null,
            breeder_name: bp?.breeder_name || fullName || pr?.display_name || pr?.username || "Reel",
            breeder_logo: bp?.logo_url || pr?.logo_url || null,
          };
        })
      );
      setLoading(false);
    })();
  }, []);

  // Hide strip entirely when nothing to show
  if (!loading && reels.length === 0 && !user) return null;

  return (
    <div className="-mx-3 px-3 pt-2 pb-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {/* Create Reel tile — logged-in users only */}
        {user && (
          <Link
            to="/submit?type=reel"
            className="shrink-0 snap-start relative rounded-2xl overflow-hidden flex flex-col items-center justify-end"
            style={{
              width: 84,
              height: 126,
              background: "linear-gradient(180deg, #1B3A6B 0%, #0A1628 100%)",
            }}
          >
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
              style={{ backgroundColor: "#C9A84C" }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} style={{ color: "#0A1628" }} />
            </div>
            <div className="w-full text-center pb-2">
              <p className="text-white text-[10px] font-bold leading-tight">Post a Reel</p>
            </div>
          </Link>
        )}


        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 snap-start rounded-2xl bg-[#E5E7EB] animate-pulse"
                style={{ width: 84, height: 126 }}
              />
            ))
          : reels.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`ghost-${i}`}
                className="shrink-0 snap-start rounded-2xl flex items-center justify-center"
                style={{
                  width: 84,
                  height: 126,
                  backgroundColor: "#F1EFEA",
                  border: "1px dashed #D6D1C4",
                }}
              >
                <Play className="w-4 h-4" style={{ color: "#C9C3B2" }} />
              </div>
            ))
          : reels.map((r) => (
              <button
                key={r.id}
                onClick={() => onOpen?.(r.id)}
                className="shrink-0 snap-start relative rounded-2xl overflow-hidden bg-black active:scale-[0.97] transition-transform"
                style={{ width: 84, height: 126 }}
              >
                {r.poster ? (
                  <img src={r.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <video
                    src={r.video_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                {/* Gradients */}
                <div
                  className="absolute inset-x-0 top-0 h-16 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
                />
                {/* Avatar circle */}
                <div
                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border-2"
                  style={{ borderColor: "#C9A84C", background: "linear-gradient(135deg, #0A1628, #1B3A6B)" }}
                >
                  {r.breeder_logo ? (
                    <img src={r.breeder_logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-[#C9A84C]">
                      {r.breeder_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Play icon */}
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white" fill="white" />
                </div>
                {/* Name */}
                <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] font-bold leading-tight line-clamp-2 text-left">
                  {r.breeder_name}
                </p>
              </button>
            ))}
      </div>
    </div>
  );
}
