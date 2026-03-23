import { Layout } from "@/components/Layout";
import { FolderHeart, Trophy, DollarSign, Users, FileText } from "lucide-react";

const sections = [
  { icon: Trophy, label: "Saved Winners", count: 0 },
  { icon: DollarSign, label: "Saved Sales", count: 0 },
  { icon: Users, label: "Saved Breeders", count: 0 },
  { icon: FileText, label: "My Posts", count: 0 },
];

export default function RepoPage() {
  return (
    <Layout showDiscovery={false}>
      <div className="mx-auto max-w-2xl px-3 pb-24 lg:px-6">
        <div className="pt-4 pb-2">
          <h1 className="text-lg font-bold text-foreground">Repo</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your saved and tracked content
          </p>
        </div>

        <div className="mt-3 space-y-1.5">
          {sections.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{s.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <FolderHeart className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">
            Save winners, sales, and breeders to find them here
          </p>
        </div>
      </div>
    </Layout>
  );
}
