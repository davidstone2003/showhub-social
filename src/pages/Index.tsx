import { useState } from "react";
import { X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";
import { Feed } from "@/components/Feed";
import { ReelsView } from "@/components/ReelsView";
import { ReelsStrip } from "@/components/ReelsStrip";

const Index = () => {
  const [reelsOpen, setReelsOpen] = useState(false);

  return (
    <Layout showDiscovery={false}>
      <div style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
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
