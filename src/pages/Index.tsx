import { Layout } from "@/components/Layout";
import { LiveStrip } from "@/components/LiveStrip";

const Index = () => {
  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full px-3 pb-24">
        <LiveStrip />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Welcome to Backdrop — your livestock show hub.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Browse Winners, Sales, Breeders, and Events from the tabs below.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
