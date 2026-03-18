import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { posts, Post } from "@/data/mock";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { FilterRow, SortOption, CategoryOption } from "./FilterRow";
import { supabase } from "@/integrations/supabase/client";

export function Feed() {
  const [activeSort, setActiveSort] = useState<SortOption>("Recent");
  const [activeCategory, setActiveCategory] = useState<CategoryOption>("All");
  const [loading, setLoading] = useState(true);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchWinners() {
      const { data } = await supabase
        .from('winners')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const mapped: Post[] = data.map((w) => ({
          id: w.id,
          image: w.image_urls?.[0] || "/placeholder.svg",
          breeder: {
            id: "db-" + w.id,
            name: w.shown_by,
            location: "",
            logo: "🏆",
            is_pro: false,
          },
          // Structured fields
          win_title: w.title,
          show_name: w.show_name,
          shown_by: w.shown_by,
          bred_by: w.bred_by || undefined,
          sired_by: w.sired_by || undefined,
          dam: w.dam || undefined,
          placed_by: w.placed_by || undefined,
          caption: w.caption || "",
          tags: (w.tags || []).map((t: string) => ({ label: t, type: "breed" })),
          post_type: "champion" as const,
          created_at: new Date(w.created_at).toLocaleDateString(),
          likes: w.likes || 0,
          comments: w.comments || 0,
          saved: false,
        }));
        setDbPosts(mapped);
      }
      setLoading(false);
    }
    fetchWinners();
  }, []);

  const allPosts = useMemo(() => [...dbPosts, ...posts], [dbPosts]);

  const filteredPosts = useMemo(() => {
    let result = [...allPosts];

    if (activeCategory !== "All") {
      const catLower = activeCategory.toLowerCase();
      result = result.filter((p) =>
        p.tags.some((t) => t.label.toLowerCase().includes(catLower)) ||
        p.caption.toLowerCase().includes(catLower)
      );
    }

    if (activeSort === "Trending") {
      result.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
    }

    return result;
  }, [activeSort, activeCategory, allPosts]);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full">
      <FilterRow
        activeSort={activeSort}
        activeCategory={activeCategory}
        onSortChange={setActiveSort}
        onCategoryChange={setActiveCategory}
      />

      <div style={{ padding: '12px 0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
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
