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
import { UpgradeCallout } from "@/components/breeder/UpgradeCallout";
import { LockedContact } from "@/components/upgrade/LockedContact";
import type { Post } from "@/data/mock";

type WinnerRow = {
  id: string;
  title: string;
  show_name: string;
  shown_by: string;
  placed_by: string | null;
  sired_by: string | null;
  dam: string | null;
  caption: string | null;
  image_urls: string[] | null;
  likes: number;
  comments: number;
  date: string;
  win_placing: string | null;
  post_type: string;
  is_featured: boolean;
  tags: string[] | null;
  created_at: string;
};

function toPost(row: WinnerRow): Post {
  return {
    id: row.id,
    image: row.image_urls?.[0] || "/placeholder.svg",
    breeder: { id: "", name: "", location: "", logo: "", is_pro: false },
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
    dam: row.dam || undefined,
    win_placing: row.win_placing || undefined,
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
  const isFullPage = tier === "breeder_page";
  const isListing = tier === "listing";
  const isOwner = !!user && profile?.id === user.id;
  const hasContact = tier === "contacted" || tier === "featured" || isFullPage;

  const featured = posts.filter((p) => p.is_featured);
  const winners = posts.filter((p) => p.post_type === "winner");
  const sires = posts.filter((p) => p.post_type === "sire");
  const donors = posts.filter((p) => p.post_type === "donor");
  const sales = posts.filter((p) => p.post_type === "sale");
  const recentPosts = posts.slice(0, isFullPage ? 10 : 3);

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
          isFullPage={isFullPage}
          stats={isFullPage ? { winners: winners.length, sires: sires.length, posts: posts.length } : undefined}
        />

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
          {/* Owner upgrade banner */}
          {isOwner && !isFullPage && (
            <UpgradeCallout variant="banner" />
          )}

          {/* Contact section */}
          {!hasContact && (
            <LockedContact isOwner={isOwner} />
          )}

          {/* ===== BREEDER PAGE (full) ===== */}
          {isFullPage && (
            <>
              {featured.length > 0 && (
                <BreederSection icon={Star} title="Featured">
                  {featured.map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}

              {winners.length > 0 && (
                <BreederSection icon={Trophy} title="Recent Winners">
                  {winners.map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}

              {sires.length > 0 && (
                <BreederSection icon={Dna} title="Sires">
                  {sires.map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}

              {donors.length > 0 && (
                <BreederSection icon={Dna} title="Donors / Genetics">
                  {donors.map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}

              {sales.length > 0 && (
                <BreederSection icon={ShoppingBag} title="Available / For Sale">
                  {sales.map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}

              {recentPosts.length > 0 && (
                <BreederSection icon={Activity} title="Recent Activity">
                  {recentPosts.slice(0, 5).map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}
            </>
          )}

          {/* ===== LISTING PAGE ===== */}
          {(isListing || tier === "free") && (
            <>
              {/* Recent Posts Preview (max 3) */}
              {recentPosts.length > 0 && (
                <BreederSection icon={Activity} title="Recent Posts">
                  {recentPosts.map((post, i) => (
                    <PostCard key={post.id} post={toPost(post)} index={i} />
                  ))}
                </BreederSection>
              )}

              {/* Locked preview sections */}
              <LockedSection icon={Trophy} title="Winners" count={winners.length || 3} isOwner={isOwner} />
              <LockedSection icon={Dna} title="Sires" count={sires.length || 2} isOwner={isOwner} />
              <LockedSection icon={Dna} title="Donors / Genetics" count={donors.length || 2} isOwner={isOwner} />
              <LockedSection icon={ShoppingBag} title="Sales / Available" count={sales.length || 2} isOwner={isOwner} />

              {/* Upgrade CTA */}
              <UpgradeCallout variant="listing" />
            </>
          )}

          {postsLoading && (
            <div className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && !isFullPage && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
