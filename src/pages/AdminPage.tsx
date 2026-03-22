import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, FileText, Users, ClipboardList } from "lucide-react";
import { AdminContentTab } from "@/components/admin/AdminContentTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminLogTab } from "@/components/admin/AdminLogTab";

type Tab = "flagged" | "all" | "users" | "log";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [tab, setTab] = useState<Tab>("flagged");

  if (authLoading || roleLoading) {
    return (
      <Layout showDiscovery={false}>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout showDiscovery={false}>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Shield className="w-12 h-12 text-muted-foreground" />
          <p className="text-foreground font-semibold text-lg">Access Denied</p>
          <p className="text-muted-foreground text-sm">You don't have admin privileges.</p>
        </div>
      </Layout>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "flagged", label: "Flagged", icon: <Shield className="w-4 h-4" /> },
    { key: "all", label: "All Posts", icon: <FileText className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "log", label: "Log", icon: <ClipboardList className="w-4 h-4" /> },
  ];

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-3xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-foreground font-bold text-xl">Admin Panel</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "flagged" && <AdminContentTab filter="flagged" />}
        {tab === "all" && <AdminContentTab filter="all" />}
        {tab === "users" && <AdminUsersTab />}
        {tab === "log" && <AdminLogTab />}
      </div>
    </Layout>
  );
}
