import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";
import { HomeLiveActivity } from "@/components/HomeLiveActivity";

const Index = () => {
  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full">
        <LiveStrip />
        <HomeLiveActivity />
      </div>
    </Layout>
  );
};

export default Index;
