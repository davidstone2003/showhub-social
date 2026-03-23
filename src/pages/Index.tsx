import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";
import { Feed } from "@/components/Feed";

const Index = () => {
  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full">
        <LiveStrip />
        <Feed />
      </div>
    </Layout>
  );
};

export default Index;
