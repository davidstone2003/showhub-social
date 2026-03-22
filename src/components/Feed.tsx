import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { posts, Post } from "@/data/mock";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { supabase } from "@/integrations/supabase/client";

export function Feed() {
  const [loading, setLoading] = useState(true);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchWinners() {
      const { data } = await supabase
        .from('winners')
        .select('*')
        .eq('status', 'active')
        .eq('show_on_feed', true)
        .order('created_at', { ascending: false });

      if (data) {
        // Fetch profiles for posts that have user_id
        const userIds = [...new Set(data.filter(w => w.user_id).map(w => w.user_id as string))];
        let profilesMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, first_name, last_name, username, logo_url, location, subscription_tier')
            .in('id', userIds);
          if (profiles) {
            profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
          }
        }

        // Fetch breeder_profiles for posts that have posted_as_breeder_id
        const breederIds = [...new Set(data.filter(w => w.posted_as_breeder_id).map(w => w.posted_as_breeder_id as string))];
        let breederProfilesMap: Record<string, any> = {};
        if (breederIds.length > 0) {
          const { data: bps } = await supabase
            .from('breeder_profiles')
            .select('id, breeder_name, breeder_slug, logo_url, location')
            .in('id', breederIds);
          if (bps) {
            breederProfilesMap = Object.fromEntries(bps.map(bp => [bp.id, bp]));
          }
        }

        const mapped: Post[] = data.map((w: any) => {
          const profile = w.user_id ? profilesMap[w.user_id] : null;
          const bp = w.posted_as_breeder_id ? breederProfilesMap[w.posted_as_breeder_id] : null;

          // If posted as breeder, use breeder profile identity
          let breederName: string;
          let breederSlug: string | undefined;
          let breederLogo: string;
          let breederLocation: string;
          let isPro: boolean;

          if (bp) {
            breederName = bp.breeder_name;
            breederSlug = bp.breeder_slug;
            breederLogo = bp.logo_url || profile?.logo_url || "";
            breederLocation = bp.location || profile?.location || "";
            isPro = true; // posted as breeder = treat as pro
          } else {
            const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
            breederName = w.bred_by || fullName || profile?.display_name || profile?.username || w.shown_by;
            breederSlug = profile?.username;
            breederLogo = profile?.logo_url || "";
            breederLocation = profile?.location || "";
            isPro = profile?.subscription_tier === 'breeder_page' || profile?.subscription_tier === 'listing';
          }

          return {
            id: w.id,
            image: w.image_urls?.[0] || "/placeholder.svg",
            breeder: {
              id: bp?.id || profile?.id || "unknown",
              name: breederName,
              location: breederLocation,
              logo: breederLogo,
              is_pro: isPro,
              slug: breederSlug,
            },
            win_title: w.title,
            show_name: w.show_name,
            shown_by: w.shown_by,
            bred_by: w.bred_by || undefined,
            sired_by: w.sired_by || undefined,
            sire_id: w.sire_id || undefined,
            dam: w.dam || undefined,
            placed_by: w.placed_by || undefined,
            win_placing: w.win_placing || undefined,
            caption: w.caption || "",
            tags: (w.tags || []).map((t: string) => ({ label: t, type: "breed" })),
            post_type: "champion" as const,
            created_at: w.created_at,
            likes: w.likes || 0,
            comments: w.comments || 0,
            saved: false,
            user_id: w.user_id,
            status: w.status,
          };
        });

        setDbPosts(mapped);
      }
      setLoading(false);
    }
    fetchWinners();
  }, []);

  const allPosts = useMemo(() => [...dbPosts, ...posts], [dbPosts]);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full">
      <div style={{ padding: '12px 0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : allPosts.length > 0 ? (
          allPosts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))
        ) : (
          <div className="text-center" style={{ padding: '80px 0' }}>
            <p className="text-muted-foreground" style={{ fontSize: '16px', lineHeight: '24px' }}>
              No posts yet. Be the first!
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              style={{ marginTop: '12px', padding: '0 16px', height: '40px', borderRadius: '10px', fontSize: '14px' }}
            >
              <Plus className="w-4 h-4" />
              Add to Backdrop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
