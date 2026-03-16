import { useState, useMemo } from "react";
import { posts, filterCategories } from "@/data/mock";
import { PostCard } from "./PostCard";
import { FilterRow } from "./FilterRow";

export function Feed() {
  const [activeFilter, setActiveFilter] = useState(filterCategories[0]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === filterCategories[0]) return posts;
    return posts.filter((p) =>
      p.tags.some((t) =>
        t.label.toLowerCase().includes(activeFilter.replace(/\s*[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim().toLowerCase())
      )
    );
  }, [activeFilter]);

  const handleTagClick = (tag: { label: string; type: string }) => {
    const match = filterCategories.find((c) =>
      tag.label.toLowerCase().includes(c.replace(/\s*[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim().toLowerCase())
    );
    if (match) setActiveFilter(match);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full">
      <FilterRow active={activeFilter} onSelect={setActiveFilter} />

      <div className="lg:py-4">
        {filteredPosts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            index={i}
            onTagClick={handleTagClick}
          />
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No posts match "{activeFilter}"</p>
            <button
              onClick={() => setActiveFilter(filterCategories[0])}
              className="mt-2 text-sm text-foreground font-medium hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
