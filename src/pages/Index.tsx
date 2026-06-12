import { useState } from "react";
import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";
import { Feed } from "@/components/Feed";
import { ReelsView } from "@/components/ReelsView";
import { ReelsStrip } from "@/components/ReelsStrip";
import { CreateButton } from "@/components/shared/CreateButton";
import { X } from "lucide-react";

const Index = () => {
  const [reelsOpen, setReelsOpen] = useState(false);

  return (
    <Layout showDiscovery={false}>
      <div style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        {/* Shared dark PageHeader band */}
        <div
          className="sticky top-0 z-20 px-4 flex items-center justify-between"
          style={{ height: 60, backgroundColor: "hsl(var(--primary))", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-[22px] font-bold leading-none" style={{ color: "#FFFFFF" }}>Home</h1>
          <CreateButton
            label="Post"
            menu={[
              { label: "New post", to: "/submit" },
              { label: "New reel", to: "/submit?type=reel" },
            ]}
          />
        </div>

        <div className="max-w-2xl mx-auto w-full px-3 pb-24">
          <div className="-mt-2">
            <LiveStrip />
          </div>

          <ReelsStrip onOpen={() => setReelsOpen(true)} />

          <Feed />
        </div>
      </div>

      {reelsOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setReelsOpen(false)}
            aria-label="Close reels"
            className="absolute top-3 left-3 z-[60] w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="h-full w-full max-w-2xl mx-auto px-3">
            <ReelsView />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
