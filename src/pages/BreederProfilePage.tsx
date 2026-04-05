import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Dna, ShoppingBag, Star, Activity } from "lucide-react";
import { BreederHero } from "@/components/breeder/BreederHero";
import { BreederSection } from "@/components/breeder/BreederSection";
import { LockedSection } from "@/components/breeder/LockedSection";
import type { Post } from "@/data/mock";

type WinnerRow = {
  id: string;
  title: string;
  show_name: string;
  shown_by: string;
  placed_by: string | null;
  sired_by: string | null;
  sire_id: string | null;
  dam: string | null;
  bred_by: string | null;
  caption: string | null;
  image_urls: string[] | null;
  video_url: string | null;
  likes: number;
  comments: number;
  date: string;
  win_placing: string | null;
  post_type: string;
  is_featured: boolean;
  tags: string[] | null;
  created_at: string;
  user_id: string | null;
  status: string;
};

function toPost(row: WinnerRow, profile: any): Post {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  return {
    id: row.id,
    image: row.image_urls?.[0] || "/placeholder.svg",
    breeder: {
      id: profile?.id || "",
      name: fullName || profile?.display_name || profile?.username || "",
      location: profile?.location || "",
      logo: profile?.logo_url || "",
      is_pro: profile?.subscription_tier === "breeder_page" || profile?.subscription_tier === "listing",
      slug: profile?.username,
    },
    caption: row.caption || "",
    tags: (row.tags || []).map((t) => ({ label: t, type: "tag" })),
    post_type: "champion",
    created_at: row.created_at || row.date,
    likes: row.likes,
    comments: row.comments,
    saved: false,
    show_name: row.show_name,
    shown_by: row.shown_by,
    placed_by: row.placed_by || undefined,
    sired_by: row.sired_by || undefined,
    sire_id: row.sire_id || undefined,
    dam: row.dam || undefined,
    bred_by: row.bred_by || undefined,
    win_placing: row.win_placing || undefined,
    video_url: row.video_url || null,
    user_id: row.user_id,
    status: row.status,
    winner_id: row.id,
  };
}

export default function BreederProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["breeder-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!username,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["breeder-posts", profile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("winners") as any)
        .select("*")
        .eq("user_id", profile!.id)
        .eq("show_on_breeder_page", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as WinnerRow[];
    },
    enabled: !!profile?.id,
  });

  const tier: string = profile?.subscription_tier || "free";
  const isFeatured = tier === "featured" || tier === "breeder_page";

  const featured = posts.filter((p) => p.is_featured);
  const winners = posts.filter((p) => p.post_type === "winner");
  const sires = posts.filter((p) => p.post_type === "sire");
  const donors = posts.filter((p) => p.post_type === "donor");
  const sales = posts.filter((p) => p.post_type === "sale");
  const recentPosts = posts.slice(0, isFeatured ? 10 : 3);

  const renderCards = (items: WinnerRow[]) =>
    items.map((post, i) => <PostCard key={post.id} post={toPost(post, profile)} index={i} />);

  if (profileLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Breeder not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-background pb-24">
        <BreederHero
          profile={profile}
          tier={tier}
          stats={isFeatured ? { winners: winners.length, sires: sires.length, posts: posts.length } : undefined}
        />

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
          {!isFeatured && (
            <>
              {recentPosts.length > 0 && (
                <BreederSection icon={Activity} title="Recent Posts">
                  {renderCards(recentPosts)}
                </BreederSection>
              )}
              <LockedSection icon={Trophy} title="Winners" count={winners.length || 3} isOwner={false} />
              <LockedSection icon={Dna} title="Sires" count={sires.length || 2} isOwner={false} />
              <LockedSection icon={Dna} title="Donors / Genetics" count={donors.length || 2} isOwner={false} />
              <LockedSection icon={ShoppingBag} title="Sales / Available" count={sales.length || 2} isOwner={false} />
            </>
          )}

          {isFeatured && (
            <>
              {featured.length > 0 && (
                <BreederSection icon={Star} title="Featured">
                  {renderCards(featured)}
                </BreederSection>
              )}
              {winners.length > 0 && (
                <BreederSection icon={Trophy} title="Recent Winners">
                  {renderCards(winners)}
                </BreederSection>
              )}
              {sires.length > 0 && (
                <BreederSection icon={Dna} title="Sires">
                  {renderCards(sires)}
                </BreederSection>
              )}
              {donors.length > 0 && (
                <BreederSection icon={Dna} title="Donors / Genetics">
                  {renderCards(donors)}
                </BreederSection>
              )}
              {sales.length > 0 && (
                <BreederSection icon={ShoppingBag} title="Available / For Sale">
                  {renderCards(sales)}
                </BreederSection>
              )}
              {recentPosts.length > 0 && (
                <BreederSection icon={Activity} title="Recent Activity">
                  {renderCards(recentPosts.slice(0, 5))}
                </BreederSection>
              )}
            </>
          )}

          {postsLoading && (
            <div className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && !isFeatured && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
