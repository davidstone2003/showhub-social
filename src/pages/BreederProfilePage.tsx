import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Trophy, Dna, ShoppingBag, Star } from "lucide-react";
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

/** Map a DB winner row to the Post interface used by PostCard */
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["breeder-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["breeder-posts", profile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("winners") as any)
        .select("*")
        .eq("user_id", profile!.id)
        .eq("show_on_breeder_page", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as WinnerRow[];
    },
    enabled: !!profile?.id,
  });

  const featured = posts.filter((p) => p.is_featured && p.post_type === "winner");
  const winners = posts.filter((p) => p.post_type === "winner");
  const sires = posts.filter((p) => p.post_type === "sire");
  const sales = posts.filter((p) => p.post_type === "sale");
  const donors = posts.filter((p) => p.post_type === "donor");

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
        {/* Hero */}
        <div className="bg-card border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.display_name || username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {profile.display_name || username}
                  </h1>
                  {profile.is_premium && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-accent-foreground">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
                )}
              </div>
            </div>

            <div className="flex gap-6 mt-4 text-sm">
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground">{winners.length}</span> wins
              </span>
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground">{sires.length}</span> sires
              </span>
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground">{posts.length}</span> posts
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
          {featured.length > 0 && (
            <Section icon={Star} title="Featured Winners">
              {featured.map((post, i) => (
                <PostCard key={post.id} post={toPost(post)} index={i} />
              ))}
            </Section>
          )}

          {winners.length > 0 && (
            <Section icon={Trophy} title="Winners">
              {winners.map((post, i) => (
                <PostCard key={post.id} post={toPost(post)} index={i} />
              ))}
            </Section>
          )}

          {sires.length > 0 && (
            <Section icon={Dna} title="Current Sires">
              {sires.map((post, i) => (
                <PostCard key={post.id} post={toPost(post)} index={i} />
              ))}
            </Section>
          )}

          {donors.length > 0 && (
            <Section icon={Dna} title="Donors / Genetics">
              {donors.map((post, i) => (
                <PostCard key={post.id} post={toPost(post)} index={i} />
              ))}
            </Section>
          )}

          {sales.length > 0 && (
            <Section icon={ShoppingBag} title="Available / For Sale">
              {sales.map((post, i) => (
                <PostCard key={post.id} post={toPost(post)} index={i} />
              ))}
            </Section>
          )}

          {postsLoading && (
            <div className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
