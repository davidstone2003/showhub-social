import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { sires, breeders, posts } from "@/data/mock";
import { PostCard } from "@/components/PostCard";
import { ArrowLeft, Dna } from "lucide-react";

export default function SirePage() {
  const { id } = useParams();
  const sire = sires.find((s) => s.id === id);

  if (!sire) {
    return (
      <Layout showDiscovery={false}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Sire not found.</p>
          <Link to="/sires" className="mt-2 text-primary text-sm font-medium hover:underline">Back to sires</Link>
        </div>
      </Layout>
    );
  }

  const breeder = breeders.find((b) => b.id === sire.breeder_id);
  const offspringPosts = posts.filter((p) => p.sire_id === sire.id);

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <div className="px-3 py-3 lg:px-0 lg:pt-6">
          <Link to="/sires" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Sires
          </Link>
        </div>

        {/* Hero */}
        <div className="px-3 lg:px-0 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-4xl">
              🐏
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-primary" />
                <h1 className="font-display text-2xl text-foreground">{sire.name}</h1>
              </div>
              {breeder && (
                <p className="text-sm text-muted-foreground mt-1">
                  Owned by <Link to="/breeders" className="text-primary hover:underline">{breeder.name}</Link> · {breeder.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Offspring posts */}
        <div className="px-3 lg:px-0 pb-8">
          <h2 className="font-display text-lg text-foreground mb-3">
            Offspring & Posts ({offspringPosts.length})
          </h2>
          {offspringPosts.length > 0 ? (
            offspringPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No posts yet for this sire.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
