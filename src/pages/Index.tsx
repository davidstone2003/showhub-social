import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Feed } from "@/components/Feed";
import { LiveFeed } from "@/components/LiveFeed";
import { cn } from "@/lib/utils";

type TopPill = "live" | "results" | "winners";

const Index = () => {
  const [activePill, setActivePill] = useState<TopPill>("results");

  return (
    <Layout>
      {/* Top pills */}
      <div className="sticky top-[44px] lg:top-0 z-30 bg-background border-b border-border">
        <div className="flex gap-1 px-4 py-2 max-w-2xl mx-auto">
          {(["live", "results", "winners"] as TopPill[]).map((pill) => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors",
                activePill === pill
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {pill === "live" && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              )}
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activePill === "live" && <LiveFeed />}
      {activePill === "results" && <Feed />}
      {activePill === "winners" && <Feed />}
    </Layout>
  );
};

export default Index;
