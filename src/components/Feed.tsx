import { useState, useMemo } from "react";
import { posts } from "@/data/mock";
import { PostCard } from "./PostCard";
import { FilterRow } from "./FilterRow";

export function Feed() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") return posts;
    return posts.filter((p) =>
      p.tags.some((t) =>
        t.label.toLowerCase().includes(activeFilter.toLowerCase())
      )
    );
  }, [activeFilter]);

  const handleTagClick = (tag: { label: string; type: string }) => {
    setActiveFilter(tag.label);
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
              onClick={() => setActiveFilter("All")}
              className="mt-2 text-sm text-primary font-medium hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
