import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";
import { Feed } from "@/components/Feed";
import { ReelsView } from "@/components/ReelsView";

const Index = () => {
  const [feedTab, setFeedTab] = useState<"feed" | "reels">("feed");

  return (
    <Layout showDiscovery={false}>
      <div style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        <div className="max-w-2xl mx-auto w-full px-3 pb-24">
          <div className="-mt-2">
            <LiveStrip />
          </div>

          <div className="flex gap-2 px-1 pt-2 pb-3">
            <button
              onClick={() => setFeedTab("feed")}
              className="flex-1 py-2 rounded-full text-[14px] font-bold transition-colors"
              style={feedTab === "feed"
                ? { backgroundColor: "#0A1628", color: "#FFFFFF" }
                : { backgroundColor: "#F3F4F6", color: "#6B7280" }
              }
            >
              Feed
            </button>
            <button
              onClick={() => setFeedTab("reels")}
              className="flex-1 py-2 rounded-full text-[14px] font-bold transition-colors"
              style={feedTab === "reels"
                ? { backgroundColor: "#0A1628", color: "#FFFFFF" }
                : { backgroundColor: "#F3F4F6", color: "#6B7280" }
              }
            >
              🎬 Reels
            </button>
          </div>

          {feedTab === "feed" ? <Feed /> : <ReelsView />}
        </div>
      </div>

      <Link
        to="/submit"
        aria-label="Post to Backdrop"
        className="fixed z-40 flex items-center justify-center rounded-full active:scale-95 transition-transform"
        style={{
          width: 56,
          height: 56,
          right: 16,
          bottom: 88,
          backgroundColor: "#C9A84C",
          color: "#0A1628",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)",
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </Link>
    </Layout>
  );
};

export default Index;
