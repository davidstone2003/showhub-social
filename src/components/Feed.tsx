import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { posts as mockPosts, Post } from "@/data/mock";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { BackdropLogo } from "./RinglyLogo";
import { supabase } from "@/integrations/supabase/client";

interface WinnerCard {
  id: string;
  win_placing: string | null;
  show_name: string;
  shown_by: string;
  placed_by: string | null;
  sired_by: string | null;
  sire_id: string | null;
  dam: string | null;
}

export function Feed() {
  const [loading, setLoading] = useState(true);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleModerated = (postId?: string) => {
    if (postId) {
      setHiddenPostIds((current) => (current.includes(postId) ? current : [...current, postId]));
    }
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    async function fetchFeed() {
      // 1. Fetch social posts
      const { data: postsData } = await (supabase.from("posts") as any)
        .select("*")
        .eq("status", "active")
        .eq("show_on_feed", true)
        .order("created_at", { ascending: false });

      // 2. Fetch standalone winners (no source_post_id = legacy)
      const { data: standaloneWinners } = await supabase
        .from("winners")
        .select("*")
        .eq("status", "active")
        .eq("show_on_feed", true)
        .is("source_post_id", null)
        .order("created_at", { ascending: false });

      // 3. Fetch winner cards linked to posts
      const postIds = (postsData || []).map((p: any) => p.id);
      let winnerCardsMap: Record<string, WinnerCard[]> = {};
      if (postIds.length > 0) {
        const { data: linkedWinners } = await supabase
          .from("winners")
          .select("id, source_post_id, win_placing, show_name, shown_by, placed_by, sired_by, sire_id, dam")
          .in("source_post_id", postIds);
        if (linkedWinners) {
          for (const w of linkedWinners) {
            const pid = (w as any).source_post_id;
            if (!winnerCardsMap[pid]) winnerCardsMap[pid] = [];
            winnerCardsMap[pid].push(w as WinnerCard);
          }
        }
      }

      // Collect all user/breeder IDs for profile lookups
      const allItems = [...(postsData || []), ...(standaloneWinners || [])];
      const userIds = [...new Set(allItems.filter((w: any) => w.user_id).map((w: any) => w.user_id as string))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name, username, logo_url, location, subscription_tier")
          .in("id", userIds);
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }

      const breederIds = [...new Set(allItems.filter((w: any) => w.posted_as_breeder_id).map((w: any) => w.posted_as_breeder_id as string))];
      let breederProfilesMap: Record<string, any> = {};
      if (breederIds.length > 0) {
        const { data: bps } = await supabase
          .from("breeder_profiles")
          .select("id, breeder_name, breeder_slug, logo_url, location")
          .in("id", breederIds);
        if (bps) {
          breederProfilesMap = Object.fromEntries(bps.map((bp) => [bp.id, bp]));
        }
      }

      const resolveIdentity = (item: any) => {
        const profile = item.user_id ? profilesMap[item.user_id] : null;
        const bp = item.posted_as_breeder_id ? breederProfilesMap[item.posted_as_breeder_id] : null;

        if (bp) {
          return {
            id: bp.id,
            name: bp.breeder_name,
            location: bp.location || profile?.location || "",
            logo: bp.logo_url || profile?.logo_url || "",
            is_pro: true,
            slug: bp.breeder_slug,
          };
        }
        const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
        return {
          id: profile?.id || "unknown",
          name: fullName || profile?.display_name || profile?.username || "",
          location: profile?.location || "",
          logo: profile?.logo_url || "",
          is_pro: profile?.subscription_tier === "breeder_page" || profile?.subscription_tier === "listing",
          slug: profile?.username,
        };
      };

      const mapped: Post[] = [];

      // Map social posts (with linked winner cards)
      for (const p of postsData || []) {
        const breeder = resolveIdentity(p);
        const cards = winnerCardsMap[p.id] || [];
        const firstCard = cards[0];

        mapped.push({
          id: p.id,
          image: p.image_urls?.[0] || "/placeholder.svg",
          breeder,
          win_title: firstCard?.win_placing || undefined,
          show_name: firstCard?.show_name || undefined,
          shown_by: firstCard?.shown_by || undefined,
          sired_by: firstCard?.sired_by || undefined,
          sire_id: firstCard?.sire_id || undefined,
          dam: firstCard?.dam || undefined,
          placed_by: firstCard?.placed_by || undefined,
          win_placing: firstCard?.win_placing || undefined,
          video_url: p.video_url || null,
          caption: p.caption || "",
          tags: (p.tags || []).map((t: string) => ({ label: t, type: "breed" })),
          post_type: cards.length > 0 ? ("champion" as const) : ((p.post_type || "general") as any),
          created_at: p.created_at,
          likes: p.likes || 0,
          comments: p.comments || 0,
          saved: false,
          user_id: p.user_id,
          status: p.status,
          winner_id: firstCard?.id || null,
        });
      }

      // Map standalone winners (legacy)
      for (const w of standaloneWinners || []) {
        const breeder = resolveIdentity(w);
        mapped.push({
          id: w.id,
          image: w.image_urls?.[0] || "/placeholder.svg",
          breeder,
          win_title: w.title,
          show_name: w.show_name,
          shown_by: w.shown_by,
          bred_by: w.bred_by || undefined,
          sired_by: w.sired_by || undefined,
          sire_id: w.sire_id || undefined,
          dam: w.dam || undefined,
          placed_by: w.placed_by || undefined,
          win_placing: w.win_placing || undefined,
          video_url: (w as any).video_url || null,
          caption: w.caption || "",
          tags: (w.tags || []).map((t: string) => ({ label: t, type: "breed" })),
          post_type: "champion" as const,
          created_at: w.created_at,
          likes: w.likes || 0,
          comments: w.comments || 0,
          saved: false,
          user_id: w.user_id,
          status: w.status,
        });
      }

      mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setDbPosts(mapped);
      setLoading(false);
    }
    fetchFeed();
  }, [refreshKey]);

  const allPosts = useMemo(() => {
    return dbPosts.filter((post) => !hiddenPostIds.includes(post.id));
  }, [dbPosts, hiddenPostIds]);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full">
      <div style={{ padding: "8px 0 12px", display: "flex", flexDirection: "column", gap: "0px" }}>
        {loading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : allPosts.length > 0 ? (
          allPosts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onModerated={handleModerated} />
          ))
        ) : (
          <div className="flex flex-col items-center text-center" style={{ padding: "80px 16px" }}>
            <div className="mb-5">
              <BackdropLogo size="lg" showTagline={false} onDark={false} />
            </div>
            <h2 className="font-bold text-foreground" style={{ fontSize: 22, lineHeight: 1.2 }}>
              Nothing here yet
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xs" style={{ fontSize: 14, lineHeight: 1.4 }}>
              Be the first to post a win, sale result, or update
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center justify-center font-bold active:scale-95 transition-transform"
              style={{
                marginTop: 20,
                padding: "0 22px",
                height: 48,
                borderRadius: 24,
                fontSize: 15,
                backgroundColor: "#C9A84C",
                color: "#0A1628",
                boxShadow: "0 4px 12px rgba(201,168,76,0.35)",
              }}
            >
              Post to Backdrop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
