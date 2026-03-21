import { useParams, Link } from "react-router-dom";
import gooseImage from "@/assets/sires/goose.jpeg";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { SireCard } from "@/components/SireCard";
import { ArrowLeft, Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/data/mock";

interface SireData {
  id: string;
  name: string;
}

export default function SirePage() {
  const { id } = useParams();
  const [sire, setSire] = useState<SireData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSire() {
      if (!id) return;

      const { data: sireData } = await supabase
        .from("sires_lookup")
        .select("*")
        .eq("id", id)
        .single();

      if (sireData) setSire(sireData);

      const { data: winnerData } = await supabase
        .from("winners")
        .select("*")
        .eq("sire_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (winnerData) {
        setPosts(
          winnerData.map((w: any) => ({
            id: w.id,
            image: w.image_urls?.[0] || "/placeholder.svg",
            breeder: {
              id: "db-" + w.id,
              name: w.shown_by,
              location: "",
              logo: "",
              is_pro: false,
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
            tags: [],
            post_type: "champion" as const,
            created_at: w.created_at,
            likes: w.likes || 0,
            comments: w.comments || 0,
            saved: false,
          }))
        );
      }
      setLoading(false);
    }
    fetchSire();
  }, [id]);

  if (!loading && !sire) {
    return (
      <Layout showDiscovery={false}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Sire not found.</p>
          <Link to="/sires" className="mt-2 text-primary text-sm font-medium hover:underline">
            Back to sires
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full">
        <div className="px-3 py-3">
          <Link
            to="/sires"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Sires
          </Link>
        </div>

        {sire && (
          <div className="px-3 pb-5">
            <SireCard
              name={sire.name}
              image="/placeholder.svg"
              sireName={sire.name === "Goose" ? "Chief" : undefined}
              damName={sire.name === "Goose" ? "Top Tier" : undefined}
              breederName={sire.name === "Goose" ? "Nothdurft Livestock" : "Unknown"}
              traits={
                sire.name === "Goose"
                  ? ["Short bladed", "Massive center body", "Dense muscle", "Big paws", "Shallow made", "Three dimensional"]
                  : []
              }
              description={
                sire.name === "Goose"
                  ? "Full brother to the 23 Reserve Grand NWSS. Goose is in a league of his own. From day one, his presence stood out. Shallow built, massive muscled, with huge feet and a freaky skeleton. This one is built to generate big time wethers."
                  : undefined
              }
            />
            <p className="text-sm text-muted-foreground mt-3">
              {posts.length} winner {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
        )}

        <div className="px-3 pb-8 flex flex-col gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
          ) : posts.length > 0 ? (
            posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No posts yet for this sire.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
