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
          data.map((winner) => ({
            id: winner.id,
            image: winner.image_urls?.[0] || "/placeholder.svg",
            breeder: {
              id: `winner-${winner.id}`,
              name: winner.shown_by,
              location: winner.show_name,
              logo: "🏆",
              is_pro: false,
            },
            caption: [
              winner.title,
              `Shown By: ${winner.shown_by}`,
              winner.bred_by ? `Bred By: ${winner.bred_by}` : "",
              winner.sired_by ? `Sired By: ${winner.sired_by}` : "",
              winner.dam ? `Dam: ${winner.dam}` : "",
              "",
              winner.caption || "",
            ]
              .filter(Boolean)
              .join("\n"),
            tags: (winner.tags || []).map((tag: string) => ({ label: tag, type: "winner" })),
            post_type: "champion",
            created_at: new Date(winner.created_at).toLocaleDateString(),
            likes: winner.likes || 0,
            comments: winner.comments || 0,
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
