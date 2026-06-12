import React, { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
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
import { allDemoLambs } from "@/data/demoLambs";
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
  const isContacted = tier === "listing" || tier === "contacted" || isFeatured;
  const isPaid = isFeatured || isContacted;
  const isOwnProfile = user?.id === profile?.id;

  const featured = posts.filter((p) => p.is_featured);
  const winners = posts.filter((p) => p.post_type === "winner");
  const sires = posts.filter((p) => p.post_type === "sire");
  const donors = posts.filter((p) => p.post_type === "donor");
  const sales = posts.filter((p) => p.post_type === "sale");
  const recentPosts = posts.slice(0, isPaid ? 10 : 3);


  const breederName = profile?.display_name || profile?.username || "";
  const lambs = useMemo(
    () => allDemoLambs().filter((l) => l.breederName.toLowerCase() === breederName.toLowerCase()),
    [breederName]
  );

  const [tab, setTab] = useState<"posts" | "lambs" | "results">("posts");

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
          stats={isPaid ? { winners: winners.length, sires: sires.length, posts: posts.length } : undefined}
        />

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
          {!isPaid && (
            <>
              {recentPosts.length > 0 && (
                <BreederSection icon={Activity} title="Recent Posts">
                  {renderCards(recentPosts)}
                </BreederSection>
              )}
              <LockedSection icon={Trophy} title="Winners" count={winners.length || 3} isOwner={isOwnProfile} />
              <LockedSection icon={Dna} title="Sires" count={sires.length || 2} isOwner={isOwnProfile} />
              <LockedSection icon={Dna} title="Donors / Genetics" count={donors.length || 2} isOwner={isOwnProfile} />
              <LockedSection icon={ShoppingBag} title="Sales / Available" count={sales.length || 2} isOwner={isOwnProfile} />
            </>
          )}

          {isPaid && (
            <>
              <div className="flex gap-1 border-b border-border -mx-4 px-4 sticky top-0 bg-background z-10">

                {(["posts", "lambs", "results"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                      tab === t
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "posts" ? "Sires & Posts" : t === "lambs" ? `Lambs (${lambs.length})` : `Results (${winners.length})`}
                  </button>
                ))}
              </div>

              {tab === "posts" && (
                <>
                  {featured.length > 0 && (
                    <BreederSection icon={Star} title="Featured">{renderCards(featured)}</BreederSection>
                  )}
                  {sires.length > 0 && (
                    <BreederSection icon={Dna} title="Sires">{renderCards(sires)}</BreederSection>
                  )}
                  {donors.length > 0 && (
                    <BreederSection icon={Dna} title="Donors / Genetics">{renderCards(donors)}</BreederSection>
                  )}
                  {sales.length > 0 && (
                    <BreederSection icon={ShoppingBag} title="Available / For Sale">{renderCards(sales)}</BreederSection>
                  )}
                  {recentPosts.length > 0 && (
                    <BreederSection icon={Activity} title="Recent Activity">
                      {renderCards(recentPosts.slice(0, 5))}
                    </BreederSection>
                  )}
                </>
              )}

              {tab === "lambs" && (
                <BreederSection icon={Dna} title="Registered Lambs">
                  {lambs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No lambs registered yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {lambs.map((l) => (
                        <Link
                          key={l.tag}
                          to={`/lamb/${l.tag}`}
                          className="block bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="text-xs text-muted-foreground">Tag #{l.tag}</div>
                          <div className="text-sm font-bold mt-0.5">{l.sex} • {l.breed}</div>
                          <div className="text-[11px] text-muted-foreground mt-1">Sire: {l.sireName}</div>
                          {l.forSale && l.price && (
                            <div className="text-[11px] font-semibold text-primary mt-1">${l.price.toLocaleString()}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </BreederSection>
              )}

              {tab === "results" && (
                winners.length === 0 ? (
                  <div className="flex flex-col items-center py-16 px-4 text-center">
                    <Trophy className="w-12 h-12 mb-3" style={{ color: "#C9A84C" }} />
                    <p className="font-bold text-[17px]" style={{ color: "#0A1628" }}>No winners yet</p>
                    <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>Post your results to build your record</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[12px] px-4 pt-3 pb-2 font-semibold" style={{ color: "#9CA3AF" }}>
                      {winners.length} result{winners.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-3 gap-0.5">
                      {winners.map((w) => {
                        const img = w.image_urls?.[0];
                        return (
                          <div
                            key={w.id}
                            className="relative aspect-square overflow-hidden cursor-pointer active:opacity-80 bg-[#F3F4F6]"
                          >
                            {img ? (
                              <img
                                src={img}
                                alt={w.win_placing || ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #0A1628 0%, #1B3A6B 100%)" }}>
                                <span className="text-[10px] font-black text-center px-1 leading-tight"
                                  style={{ color: "rgba(201,168,76,0.6)" }}>
                                  {w.win_placing?.slice(0, 15) || "W"}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/3"
                              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                              <p className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white truncate leading-tight">
                                {w.win_placing || ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )
              )}

            </>
          )}

          {postsLoading && (
            <div className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && !isPaid && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
