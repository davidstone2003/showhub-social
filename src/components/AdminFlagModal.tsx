import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AdminFlagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postOwnerId?: string | null;
  onActionComplete?: () => void;
}

const REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "copyright", label: "Copyright violation" },
  { value: "other", label: "Other" },
] as const;

const ACTIONS = [
  { value: "flag", label: "Flag post", description: "Notify the user about an issue" },
  { value: "restrict", label: "Restrict post", description: "Hide from public feed" },
  { value: "remove", label: "Remove post", description: "Remove from all views" },
] as const;

type ReasonValue = typeof REASONS[number]["value"];
type ActionValue = typeof ACTIONS[number]["value"];

export function AdminFlagModal({ open, onOpenChange, postId, postOwnerId, onActionComplete }: AdminFlagModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState<ReasonValue>("inappropriate");
  const [action, setAction] = useState<ActionValue>("flag");
  const [note, setNote] = useState("");
  const [notifyUser, setNotifyUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Map action to post status
      const statusMap: Record<string, string> = {
        flag: "flagged",
        restrict: "restricted",
        remove: "removed",
      };

      // Update post status
      await supabase
        .from("winners")
        .update({ status: statusMap[action] as any })
        .eq("id", postId);

      // Log moderation action
      await supabase.from("moderation_actions").insert({
        post_id: postId,
        admin_id: user.id,
        action,
        reason,
        note: note || null,
      });

      // Send notification to post owner
      if (notifyUser && postOwnerId) {
        const reasonLabel = REASONS.find((r) => r.value === reason)?.label || reason;
        const actionLabel = action === "flag" ? "flagged" : action === "restrict" ? "restricted" : "removed";

        await supabase.from("notifications").insert({
          user_id: postOwnerId,
          type: "post_flagged",
          title: `Your post was ${actionLabel}`,
          message: `Reason: ${reasonLabel}. ${note || "Please review your post."}`,
          link: `/animal/${postId}`,
          related_post_id: postId,
        });
      }

      toast.success(`Post ${action === "flag" ? "flagged" : action === "restrict" ? "restricted" : "removed"} successfully`);
      onOpenChange(false);
      onActionComplete?.();
      setNote("");
    } catch (err) {
      toast.error("Failed to perform moderation action");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Moderate Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Reason</label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    reason === r.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Action</label>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAction(a.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    action === a.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-medium">{a.label}</span>
                  <p className={`text-xs mt-0.5 ${action === a.value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {a.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Note (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for the user..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Notify toggle */}
          {postOwnerId && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Notify the user</span>
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting}
              variant={action === "remove" ? "destructive" : "default"}
            >
              {submitting ? "..." : action === "flag" ? "Flag Post" : action === "restrict" ? "Restrict Post" : "Remove Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
