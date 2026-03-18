import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AdminFlagModal } from "@/components/AdminFlagModal";
import { Button } from "@/components/ui/button";
import { Shield, Flag, AlertTriangle, XCircle, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ModerationPost {
  id: string;
  title: string;
  show_name: string;
  shown_by: string;
  status: string;
  created_at: string;
  user_id: string | null;
  image_urls: string[] | null;
}

interface ModerationAction {
  id: string;
  post_id: string;
  action: string;
  reason: string | null;
  note: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagModalPost, setFlagModalPost] = useState<ModerationPost | null>(null);
  const [tab, setTab] = useState<"flagged" | "all" | "log">("flagged");

  const fetchData = async () => {
    setLoading(true);

    const query = tab === "flagged"
      ? supabase.from("winners").select("id, title, show_name, shown_by, status, created_at, user_id, image_urls").neq("status", "active").order("created_at", { ascending: false })
      : supabase.from("winners").select("id, title, show_name, shown_by, status, created_at, user_id, image_urls").order("created_at", { ascending: false }).limit(100);

    const { data } = await query;
    setPosts((data as ModerationPost[]) || []);

    if (tab === "log") {
      const { data: logData } = await supabase
        .from("moderation_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setActions((logData as ModerationAction[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, tab]);

  const restorePost = async (postId: string) => {
    await supabase.from("winners").update({ status: "active" as any }).eq("id", postId);
    await supabase.from("moderation_actions").insert({
      post_id: postId,
      admin_id: user!.id,
      action: "restore",
    });
    toast.success("Post restored");
    fetchData();
  };

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
          <p className="text-foreground font-semibold" style={{ fontSize: 18 }}>Access Denied</p>
          <p className="text-muted-foreground" style={{ fontSize: 14 }}>You don't have admin privileges.</p>
        </div>
      </Layout>
    );
  }

  const statusIcon: Record<string, React.ReactNode> = {
    active: <CheckCircle className="w-4 h-4 text-green-600" />,
    flagged: <Flag className="w-4 h-4 text-amber-500" />,
    restricted: <AlertTriangle className="w-4 h-4 text-orange-500" />,
    removed: <XCircle className="w-4 h-4 text-destructive" />,
  };

  const statusBadgeClass: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    flagged: "bg-amber-100 text-amber-800",
    restricted: "bg-orange-100 text-orange-800",
    removed: "bg-red-100 text-red-800",
  };

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-3xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-foreground font-bold" style={{ fontSize: 22 }}>Moderation Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["flagged", "all", "log"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t === "flagged" ? "Flagged" : t === "all" ? "All Posts" : "Action Log"}
            </button>
          ))}
        </div>

        {tab === "log" ? (
          <div className="space-y-2">
            {actions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" style={{ fontSize: 14 }}>No moderation actions yet</p>
            ) : (
              actions.map((a) => (
                <div key={a.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground capitalize" style={{ fontSize: 13 }}>{a.action}</span>
                    {a.reason && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{a.reason}</span>
                    )}
                  </div>
                  {a.note && <p className="text-muted-foreground" style={{ fontSize: 12 }}>{a.note}</p>}
                  <p className="text-muted-foreground" style={{ fontSize: 11, marginTop: 4 }}>
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-center py-8" style={{ fontSize: 14 }}>Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" style={{ fontSize: 14 }}>
                {tab === "flagged" ? "No flagged posts" : "No posts"}
              </p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                  {post.image_urls?.[0] && (
                    <img
                      src={post.image_urls[0]}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon[post.status]}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass[post.status]}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="font-medium text-foreground truncate" style={{ fontSize: 14 }}>{post.title}</p>
                    <p className="text-muted-foreground truncate" style={{ fontSize: 12 }}>
                      {post.show_name} · {post.shown_by}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 11, marginTop: 2 }}>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {post.status !== "active" && (
                      <Button variant="outline" size="sm" onClick={() => restorePost(post.id)}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Restore
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setFlagModalPost(post)}>
                      <Flag className="w-3.5 h-3.5 mr-1" />
                      Moderate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {flagModalPost && (
        <AdminFlagModal
          open={!!flagModalPost}
          onOpenChange={(open) => !open && setFlagModalPost(null)}
          postId={flagModalPost.id}
          postOwnerId={flagModalPost.user_id}
          onActionComplete={fetchData}
        />
      )}
    </Layout>
  );
}
