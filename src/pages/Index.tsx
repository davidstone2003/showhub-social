import { Layout } from "@/components/Layout";
import { Feed } from "@/components/Feed";
import { LiveStrip } from "@/components/LiveStrip";

const Index = () => {
  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Compact live strip */}
        <LiveStrip />
        {/* Main social feed */}
        <Feed />
      </div>
    </Layout>
  );
};

export default Index;
