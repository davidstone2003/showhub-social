import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFlagModal } from "@/components/AdminFlagModal";
import { Flag, Trash2, RotateCcw, CheckCircle, AlertTriangle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface AdminContentTabProps {
  filter: "flagged" | "all";
}

export function AdminContentTab({ filter }: AdminContentTabProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [flagModalPost, setFlagModalPost] = useState<ModerationPost | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const query = filter === "flagged"
      ? supabase.from("winners").select("id, title, show_name, shown_by, status, created_at, user_id, image_urls").neq("status", "active").order("created_at", { ascending: false })
      : supabase.from("winners").select("id, title, show_name, shown_by, status, created_at, user_id, image_urls").order("created_at", { ascending: false }).limit(200);

    const { data } = await query;
    setPosts((data as ModerationPost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  const restorePost = async (postId: string) => {
    await supabase.from("winners").update({ status: "active" as any }).eq("id", postId);
    await supabase.from("moderation_actions").insert({
      post_id: postId,
      admin_id: user!.id,
      action: "restore",
    });
    toast.success("Post restored");
    fetchPosts();
  };

  const deletePost = async () => {
    if (!deletePostId || !user) return;
    await supabase.from("winners").delete().eq("id", deletePostId);
    await supabase.from("moderation_actions").insert({
      post_id: deletePostId,
      admin_id: user.id,
      action: "delete",
    });
    toast.success("Post permanently deleted");
    setDeletePostId(null);
    fetchPosts();
  };

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

  const filtered = posts.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.shown_by.toLowerCase().includes(search.toLowerCase()) ||
    p.show_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">
          {filter === "flagged" ? "No flagged posts" : "No posts found"}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
              {post.image_urls?.[0] && (
                <img src={post.image_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon[post.status]}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass[post.status]}`}>
                    {post.status}
                  </span>
                </div>
                <p className="font-medium text-foreground truncate text-sm">{post.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {post.show_name} · {post.shown_by}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
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
                <Button variant="destructive" size="sm" onClick={() => setDeletePostId(post.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {flagModalPost && (
        <AdminFlagModal
          open={!!flagModalPost}
          onOpenChange={(open) => !open && setFlagModalPost(null)}
          postId={flagModalPost.id}
          postOwnerId={flagModalPost.user_id}
          onActionComplete={fetchPosts}
        />
      )}

      <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
