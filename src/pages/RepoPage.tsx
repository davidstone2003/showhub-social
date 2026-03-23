import { Layout } from "@/components/Layout";
import { RefreshCw } from "lucide-react";

const RepoPage = () => (
  <Layout showDiscovery={false}>
    <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
      <div className="pb-2 pt-4">
        <h1 className="text-lg font-bold text-foreground">Repo</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Reproduction dates, breeding records & more
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <RefreshCw className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">Coming Soon</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Track breeding dates, heat cycles, and reproduction records for your herd.
        </p>
      </div>
    </div>
  </Layout>
);

export default RepoPage;
