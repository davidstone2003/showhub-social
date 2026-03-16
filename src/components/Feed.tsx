import { useState, useMemo } from "react";
import { posts } from "@/data/mock";
import { PostCard } from "./PostCard";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function Feed() {
  const [activeFilter, setActiveFilter] = useState<{ label: string; type: string } | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return posts;
    return posts.filter((p) => p.tags.some((t) => t.label === activeFilter.label));
  }, [activeFilter]);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full">
      {/* Active filter */}
      {activeFilter && (
        <div className="sticky top-0 lg:top-0 z-30 bg-background/95 backdrop-blur-sm py-2 px-4 lg:px-0 flex items-center gap-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          <Badge variant="outline" className="gap-1 text-xs bg-primary/10 text-primary border-primary/20">
            {activeFilter.label}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setActiveFilter(null)} />
          </Badge>
        </div>
      )}

      {/* Post grid */}
      <div className="p-4 lg:p-0 lg:py-6 space-y-5">
        {filteredPosts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            index={i}
            onTagClick={(tag) => setActiveFilter(tag)}
          />
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No posts match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
