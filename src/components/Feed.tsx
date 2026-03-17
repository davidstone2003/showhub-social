import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { posts, filterCategories } from "@/data/mock";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { FilterRow } from "./FilterRow";

export function Feed() {
  const [activeFilter, setActiveFilter] = useState(filterCategories[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === filterCategories[0]) return posts;
    const clean = activeFilter.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim().toLowerCase();
    return posts.filter((p) =>
      p.tags.some((t) => t.label.toLowerCase().includes(clean)) ||
      p.caption.toLowerCase().includes(clean)
    );
  }, [activeFilter]);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full">
      <FilterRow active={activeFilter} onSelect={setActiveFilter} />

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
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition-colors"
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
