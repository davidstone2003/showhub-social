import { Layout } from "@/components/Layout";
import { Bookmark } from "lucide-react";

const SavedPage = () => (
  <Layout showDiscovery={false}>
    <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
      <div className="pb-2 pt-4">
        <h1 className="text-lg font-bold text-foreground">Saved</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your bookmarked posts, results & animals
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Bookmark className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">Nothing saved yet</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Bookmark winners, animals, and posts to find them here.
        </p>
      </div>
    </div>
  </Layout>
);

export default SavedPage;
