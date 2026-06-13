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
  bred_by: string | null;
  sired_by: string | null;
  sire_id: string | null;
  dam: string | null;
}

export function Feed() {
  const [loading, setLoading] = useState(true);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [featuredBreeder, setFeaturedBreeder] = useState<any>(null);


  const handleModerated = (postId?: string) => {
    if (postId) {
      setHiddenPostIds((current) => (current.includes(postId) ? current : [...current, postId]));
    }
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    async function fetchFeed() {
      // Fetch one featured breeder for in-feed spotlight
      const { data: fb } = await (supabase.from("breeder_profiles") as any)
        .select("id, breeder_name, breeder_slug, logo_url, short_bio, location")
        .eq("subscription_tier", "featured")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setFeaturedBreeder(fb || null);

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
          .select("id, source_post_id, win_placing, show_name, shown_by, placed_by, bred_by, sired_by, sire_id, dam, date, date_assumed")
          .in("source_post_id", postIds);
        if (linkedWinners) {
          for (const w of linkedWinners) {
            const pid = (w as any).source_post_id;
            if (!winnerCardsMap[pid]) winnerCardsMap[pid] = [];
            winnerCardsMap[pid].push(w as WinnerCard);
          }
        }
      }

      // Collect all user/breeder IDs for profile lookups (including tagged users)
      const allItems = [...(postsData || []), ...(standaloneWinners || [])];
      const taggedIds = (postsData || []).flatMap((p: any) => (p.tagged_user_ids || []) as string[]);
      const userIds = [...new Set([
        ...allItems.filter((w: any) => w.user_id).map((w: any) => w.user_id as string),
        ...taggedIds,
      ])];
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


      const photoCreditBreederIds = (postsData || [])
        .filter((p: any) => p.photo_credit_breeder_id)
        .map((p: any) => p.photo_credit_breeder_id as string);
      const breederIds = [...new Set([
        ...allItems.filter((w: any) => w.posted_as_breeder_id).map((w: any) => w.posted_as_breeder_id as string),
        ...photoCreditBreederIds,
      ])];
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
        const taggedUserIds = (p.tagged_user_ids || []) as string[];
        const taggedNames = taggedUserIds
          .map((uid) => {
            const pr = profilesMap[uid];
            if (!pr) return null;
            const full = [pr.first_name, pr.last_name].filter(Boolean).join(" ");
            return full || pr.display_name || pr.username || null;
          })
          .filter(Boolean) as string[];

        const photoCreditBp = p.photo_credit_breeder_id ? breederProfilesMap[p.photo_credit_breeder_id] : null;

        mapped.push({
          id: p.id,
          image: p.image_urls?.[0] || "/placeholder.svg",
          image_urls: p.image_urls || [],
          breeder,
          win_title: firstCard?.win_placing || undefined,
          show_name: firstCard?.show_name || undefined,
          show_date: (firstCard as any)?.date || undefined,
          show_date_assumed: (firstCard as any)?.date_assumed || false,
          shown_by: firstCard?.shown_by || undefined,
          bred_by: firstCard?.bred_by || undefined,
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
          tagged_user_ids: taggedUserIds,
          tagged_names: taggedNames,
          photo_credit: p.photo_credit || null,
          photo_credit_breeder: photoCreditBp
            ? { id: photoCreditBp.id, name: photoCreditBp.breeder_name, slug: photoCreditBp.breeder_slug }
            : null,
          winner_cards: cards,
        } as any);
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
            <div key={post.id}>
              <PostCard post={post} index={i} onModerated={handleModerated} />
              {i > 0 && i % 20 === 0 && featuredBreeder && (
                <Link
                  to={`/breeder/${featuredBreeder.breeder_slug}`}
                  className="mx-3 my-2 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm block"
                >
                  <div className="flex items-center gap-3 p-3">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                      style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}
                    >
                      {featuredBreeder.logo_url ? (
                        <img src={featuredBreeder.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span
                          className="w-full h-full flex items-center justify-center text-[16px] font-black"
                          style={{ color: "#C9A84C" }}
                        >
                          {featuredBreeder.breeder_name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[14px] text-[#0A1628] truncate">{featuredBreeder.breeder_name}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: "#FFFBF0", color: "#8B6914", border: "1px solid rgba(201,168,76,0.3)" }}
                        >
                          Featured
                        </span>
                      </div>
                      {featuredBreeder.short_bio && (
                        <p className="text-[12px] truncate mt-0.5" style={{ color: "#6B7280" }}>
                          {featuredBreeder.short_bio}
                        </p>
                      )}
                      {featuredBreeder.location && (
                        <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>
                          {featuredBreeder.location}
                        </p>
                      )}
                    </div>
                    <span className="text-[12px] font-bold shrink-0" style={{ color: "#C9A84C" }}>
                      View →
                    </span>
                  </div>
                </Link>
              )}
            </div>
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
