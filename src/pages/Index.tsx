import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";
import { Feed } from "@/components/Feed";

const Index = () => {
  return (
    <Layout showDiscovery={false}>
      <div style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        <div className="max-w-2xl mx-auto w-full px-3 pb-24">
          <div className="-mt-2">
            <LiveStrip />
          </div>
          <Feed />
        </div>
      </div>

      {/* Floating action button */}
      <Link
        to="/submit"
        aria-label="Post to Backdrop"
        className="fixed z-40 flex items-center justify-center rounded-full active:scale-95 transition-transform"
        style={{
          width: 56,
          height: 56,
          right: 16,
          bottom: 80,
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
