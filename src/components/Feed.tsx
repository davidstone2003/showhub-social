import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { posts } from "@/data/mock";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { FilterRow, SortOption, CategoryOption } from "./FilterRow";

export function Feed() {
  const [activeSort, setActiveSort] = useState<SortOption>("Recent");
  const [activeCategory, setActiveCategory] = useState<CategoryOption>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Category filter
    if (activeCategory !== "All") {
      const catLower = activeCategory.toLowerCase();
      result = result.filter((p) =>
        p.tags.some((t) => t.label.toLowerCase().includes(catLower)) ||
        p.caption.toLowerCase().includes(catLower)
      );
    }

    // Sort
    if (activeSort === "Trending") {
      result.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
    }

    return result;
  }, [activeSort, activeCategory]);

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
              Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
