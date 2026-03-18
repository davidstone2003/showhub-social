import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/data/mock";

export default function WinnersPage() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchWinners() {
      const { data } = await supabase
        .from("winners")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setWinners(
          data.map((w) => ({
            id: w.id,
            image: w.image_urls?.[0] || "/placeholder.svg",
            breeder: {
              id: `winner-${w.id}`,
              name: w.shown_by,
              location: w.show_name,
              logo: "🏆",
              is_pro: false,
            },
            win_title: w.title,
            show_name: w.show_name,
            shown_by: w.shown_by,
            bred_by: w.bred_by || undefined,
            sired_by: w.sired_by || undefined,
            dam: w.dam || undefined,
            placed_by: w.placed_by || undefined,
            win_placing: (w as any).win_placing || undefined,
            caption: w.caption || "",
            tags: (w.tags || []).map((tag: string) => ({ label: tag, type: "winner" })),
            post_type: "champion" as const,
            created_at: new Date(w.created_at).toLocaleDateString(),
            likes: w.likes || 0,
            comments: w.comments || 0,
            saved: false,
          }))
        );
      }

      setLoading(false);
    }

    fetchWinners();
  }, []);

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Backdrop</h1>
        </div>

        <div className="max-w-2xl mx-auto w-full py-3 flex flex-col gap-6">
          {loading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : winners.length > 0 ? (
            winners.map((post, index) => <PostCard key={post.id} post={post} index={index} />)
          ) : (
            <div className="px-6 py-20 text-center">
              <p className="text-muted-foreground">No winners posted yet.</p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 mt-4 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to Backdrop
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
