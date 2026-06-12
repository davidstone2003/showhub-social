import React, { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Dna, ShoppingBag, Play, MapPin, Phone, Mail, Globe, Lock } from "lucide-react";
import { BreederHero } from "@/components/breeder/BreederHero";
import { LockedSection } from "@/components/breeder/LockedSection";
import PhotoViewer from "@/components/PhotoViewer";

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

  const winners = posts.filter((p) => p.post_type === "winner");
  const sires = posts.filter((p) => p.post_type === "sire");
  const sales = posts.filter((p) => p.post_type === "sale");
  const recentPosts = posts.slice(0, isPaid ? 20 : 3);

  const breederName = profile?.display_name || profile?.username || "";
  const lambs = useMemo(
    () => allDemoLambs().filter((l) => l.breederName.toLowerCase() === breederName.toLowerCase()),
    [breederName]
  );

  const [tab, setTab] = useState<"feed" | "about" | "winners" | "sires" | "forsale" | "videos">("feed");
  const [winnerViewerIndex, setWinnerViewerIndex] = useState<number | null>(null);


  const { data: breederVideos = [] } = useQuery({
    queryKey: ["breeder-videos", profile?.id],
    queryFn: async () => {
      const { data } = await (supabase.from("posts") as any)
        .select("id, video_url, caption, created_at")
        .or(`user_id.eq.${profile!.id},posted_as_breeder_id.eq.${profile!.id}`)
        .not("video_url", "is", null)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data || []) as any[];
    },
    enabled: !!profile?.id,
  });

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

  const p: any = profile;
  const availability = p.availability || {};
  const speciesTags: string[] = p.species_tags || [];
  const shortBio: string = p.short_bio || p.bio || "";
  const profileEmail: string | null = p.email || null;

  const tabs = [
    { key: "feed", label: "Posts" },
    { key: "about", label: "About" },
    { key: "winners", label: `Winners${winners.length > 0 ? ` (${winners.length})` : ""}` },
    { key: "sires", label: `Sires${sires.length > 0 ? ` (${sires.length})` : ""}` },
    { key: "forsale", label: "For Sale" },
    { key: "videos", label: `Videos${breederVideos.length > 0 ? ` (${breederVideos.length})` : ""}` },
  ] as const;

  const lockedGate = (
    <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#FFFBF0", border: "1px solid rgba(201,168,76,0.3)" }}>
      <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--gold))" }} />
      <p className="font-bold text-[16px]" style={{ color: "hsl(var(--primary))" }}>Full profile is for upgraded breeders</p>
      <p className="text-[13px] mt-1 mb-3" style={{ color: "#6B7280" }}>
        This breeder hasn't unlocked their full page yet.
      </p>
    </div>
  );

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-background pb-24">
        <BreederHero
          profile={profile}
          tier={tier}
          stats={isPaid ? { winners: winners.length, sires: sires.length, posts: posts.length } : undefined}
        />

        {/* Tab bar — horizontal scroll */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] overflow-x-auto">
          <div className="flex max-w-2xl mx-auto px-2">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as any)}
                className="shrink-0 px-4 py-3 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap"
                style={tab === key
                  ? { borderColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }
                  : { borderColor: "transparent", color: "#9CA3AF" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* FEED */}
          {tab === "feed" && (
            <div className="space-y-4">
              {postsLoading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : !isPaid && !isOwnProfile ? (
                <>
                  {recentPosts.slice(0, 3).map((post, i) => (
                    <PostCard key={post.id} post={toPost(post, profile)} index={i} />
                  ))}
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#FFFBF0", border: "1px solid rgba(201,168,76,0.3)" }}>
                    <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--gold))" }} />
                    <p className="font-bold text-[16px]" style={{ color: "hsl(var(--primary))" }}>
                      See all posts from {breederName}
                    </p>
                    <p className="text-[13px] mt-1 mb-3" style={{ color: "#6B7280" }}>
                      Follow this breeder to see their full feed
                    </p>
                    {user ? (
                      <button
                        className="rounded-full px-5 py-2 font-bold text-[14px]"
                        style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
                      >
                        Follow
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        className="inline-block rounded-full px-5 py-2 font-bold text-[14px]"
                        style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
                      >
                        Join Free to Follow
                      </Link>
                    )}
                  </div>
                </>
              ) : recentPosts.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-4 text-center">
                  <Trophy className="w-12 h-12 mb-3" style={{ color: "hsl(var(--gold))" }} />
                  <p className="font-bold text-[17px]" style={{ color: "hsl(var(--primary))" }}>No posts yet</p>
                  {isOwnProfile && (
                    <Link
                      to="/create"
                      className="mt-3 inline-block rounded-full px-5 py-2 font-bold text-[14px]"
                      style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
                    >
                      Post Your First Win
                    </Link>
                  )}
                </div>
              ) : (
                recentPosts.map((post, i) => (
                  <PostCard key={post.id} post={toPost(post, profile)} index={i} />
                ))
              )}
            </div>
          )}

          {/* ABOUT */}
          {tab === "about" && (
            <div className="space-y-3">
              {/* About card */}
              <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F3F4F6]">
                  <h3 className="font-black text-[15px]" style={{ color: "hsl(var(--primary))" }}>About</h3>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {shortBio && (
                    <p className="text-[14px] leading-relaxed" style={{ color: "#374151" }}>{shortBio}</p>
                  )}
                  {[
                    { icon: MapPin, value: profile?.location, label: "Location" },
                    { icon: Phone, value: profile?.phone, label: "Phone", href: profile?.phone ? `tel:${profile.phone}` : undefined },
                    { icon: Mail, value: profileEmail, label: "Email", href: profileEmail ? `mailto:${profileEmail}` : undefined },
                    {
                      icon: Globe,
                      value: profile?.website_url,
                      label: "Website",
                      href: profile?.website_url,
                      display: profile?.website_url?.replace(/^https?:\/\//, ""),
                    },
                  ]
                    .filter((item) => item.value)
                    .map(({ icon: Icon, value, href, display }, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" style={{ color: "#6B7280" }} />
                        </div>
                        {href ? (
                          <a
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="text-[14px] font-semibold underline"
                            style={{ color: "#1B3A6B" }}
                          >
                            {display || value}
                          </a>
                        ) : (
                          <span className="text-[14px]" style={{ color: "#374151" }}>{value}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Species */}
              {speciesTags.length > 0 && (
                <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F3F4F6]">
                    <h3 className="font-black text-[15px]" style={{ color: "hsl(var(--primary))" }}>Breeds / Species</h3>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {speciesTags.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full text-[12px] font-bold"
                        style={{ backgroundColor: "#FFFBF0", color: "hsl(var(--primary))", border: "1px solid rgba(201,168,76,0.3)" }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F3F4F6]">
                  <h3 className="font-black text-[15px]" style={{ color: "hsl(var(--primary))" }}>Lambs Available</h3>
                </div>
                <div className="px-4 py-3">
                  {Object.values(availability).some(Boolean) ? (
                    <div className="flex flex-wrap gap-2">
                      {availability.currently_available && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold"
                          style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
                          Available Now
                        </span>
                      )}
                      {[
                        [availability.fall_borns, "Fall Borns"],
                        [availability.december, "December"],
                        [availability.jan_feb, "Jan–Feb"],
                        [availability.mar_april, "Mar–April"],
                        [availability.semen, "Semen"],
                        [availability.breeding_stock, "Breeding Stock"],
                      ]
                        .filter(([v]) => v)
                        .map(([, label]) => (
                          <span
                            key={String(label)}
                            className="px-3 py-1 rounded-full text-[12px] font-bold"
                            style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
                          >
                            {String(label)}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[13px]" style={{ color: "#9CA3AF" }}>
                      {isOwnProfile ? "Add your availability in profile settings" : "No availability listed"}
                    </p>
                  )}
                  {availability.availability_note && (
                    <p className="text-[13px] mt-3 pt-3 border-t border-[#F3F4F6]" style={{ color: "#6B7280" }}>
                      {availability.availability_note}
                    </p>
                  )}
                </div>
              </div>

              {/* Social */}
              {profile?.facebook_url && (
                <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F3F4F6]">
                    <h3 className="font-black text-[15px]" style={{ color: "hsl(var(--primary))" }}>Follow on Social</h3>
                  </div>
                  <a
                    href={profile.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 active:bg-[#F9FAFB]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <span className="text-[14px] font-semibold" style={{ color: "hsl(var(--primary))" }}>Facebook Page</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* WINNERS */}
          {tab === "winners" && (
            <div className="-mx-4">
              {!isPaid && !isOwnProfile ? (
                <div className="px-4"><LockedSection icon={Trophy} title="Winners" count={winners.length || 3} isOwner={false} /></div>
              ) : winners.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-4 text-center">
                  <Trophy className="w-12 h-12 mb-3" style={{ color: "hsl(var(--gold))" }} />
                  <p className="font-bold text-[17px]" style={{ color: "hsl(var(--primary))" }}>No winners yet</p>
                  {isOwnProfile && (
                    <Link
                      to="/create"
                      className="mt-3 inline-block rounded-full px-5 py-2 font-bold text-[14px]"
                      style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
                    >
                      Post Your First Win
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#6B7280" }}>
                      {winners.length} total wins
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: "hsl(var(--gold))" }}>
                      {winners.filter((w) => w.win_placing?.toLowerCase().includes("grand")).length} Grand Championships
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5">
                    {winners.map((w, idx) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => w.image_urls?.[0] && setWinnerViewerIndex(idx)}
                        className="relative aspect-square overflow-hidden bg-[#F3F4F6] active:opacity-80"
                      >
                        {w.image_urls?.[0] ? (
                          <img src={w.image_urls[0]} alt={w.win_placing || ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #1B3A6B 100%)" }}>
                            <span className="text-[10px] font-black text-center px-1 leading-tight"
                              style={{ color: "rgba(201,168,76,0.6)" }}>
                              {w.win_placing?.slice(0, 15) || "W"}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1.5"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
                          <p className="text-[9px] font-bold text-white truncate leading-tight">
                            {w.win_placing || ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <PhotoViewer
                    images={winners.map((w) => w.image_urls?.[0] || "").filter(Boolean)}
                    initialIndex={winnerViewerIndex ?? 0}
                    isOpen={winnerViewerIndex !== null}
                    onClose={() => setWinnerViewerIndex(null)}
                    placement={winnerViewerIndex !== null ? winners[winnerViewerIndex]?.win_placing || undefined : undefined}
                    caption={winnerViewerIndex !== null ? [winners[winnerViewerIndex]?.show_name, winners[winnerViewerIndex]?.shown_by].filter(Boolean).join(" • ") : undefined}
                  />

                </>
              )}
            </div>
          )}

          {/* SIRES */}
          {tab === "sires" && (
            <div className="space-y-3">
              {!isPaid && !isOwnProfile ? (
                <LockedSection icon={Dna} title="Sires" count={sires.length || 2} isOwner={false} />
              ) : sires.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-4 text-center">
                  <Dna className="w-12 h-12 mb-3" style={{ color: "hsl(var(--gold))" }} />
                  <p className="font-bold text-[17px]" style={{ color: "hsl(var(--primary))" }}>No sires yet</p>
                </div>
              ) : (
                sires.map((post, i) => (
                  <PostCard key={post.id} post={toPost(post, profile)} index={i} />
                ))
              )}
            </div>
          )}

          {/* FOR SALE */}
          {tab === "forsale" && (
            <div>
              {!isPaid && !isOwnProfile ? (
                <LockedSection icon={ShoppingBag} title="For Sale" count={sales.length || 2} isOwner={false} />
              ) : sales.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-4 text-center">
                  <ShoppingBag className="w-12 h-12 mb-3" style={{ color: "hsl(var(--gold))" }} />
                  <p className="font-bold text-[17px]" style={{ color: "hsl(var(--primary))" }}>Nothing listed for sale</p>
                  {isOwnProfile && (
                    <Link
                      to="/create"
                      className="mt-3 inline-block rounded-full px-5 py-2 font-bold text-[14px]"
                      style={{ backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" }}
                    >
                      + Add a Listing
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {sales.map((s) => (
                    <div key={s.id} className="rounded-xl overflow-hidden bg-white border border-[#E5E7EB]">
                      <div className="aspect-square bg-[#F3F4F6]">
                        {s.image_urls?.[0] ? (
                          <img src={s.image_urls[0]} alt={s.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8" style={{ color: "#D1D5DB" }} />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-[13px] line-clamp-1" style={{ color: "hsl(var(--primary))" }}>
                          {s.title || "For Sale"}
                        </p>
                        {s.caption && (
                          <p className="text-[12px] mt-1 line-clamp-2" style={{ color: "#6B7280" }}>
                            {s.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIDEOS */}
          {tab === "videos" && (
            <div className="-mx-4">
              {breederVideos.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-4 text-center">
                  <div style={{ fontSize: 40 }}>🎬</div>
                  <p className="font-bold text-[17px] mt-2" style={{ color: "hsl(var(--primary))" }}>No videos yet</p>
                  <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>
                    Post fitting videos, walk-arounds, and show day moments
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  {breederVideos.map((v: any) => (
                    <div key={v.id} className="relative aspect-square overflow-hidden bg-black">
                      <video
                        src={v.video_url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white" fill="white" />
                        </div>
                      </div>
                      {v.caption && (
                        <div className="absolute inset-x-0 bottom-0 p-1.5"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                          <p className="text-[9px] font-bold text-white truncate leading-tight">{v.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
