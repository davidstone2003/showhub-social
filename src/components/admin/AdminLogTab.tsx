import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ModerationAction {
  id: string;
  post_id: string;
  action: string;
  reason: string | null;
  note: string | null;
  created_at: string;
}

export function AdminLogTab() {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("moderation_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setActions((data as ModerationAction[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground text-center py-8 text-sm">Loading...</p>;

  if (actions.length === 0) return <p className="text-muted-foreground text-center py-8 text-sm">No moderation actions yet</p>;

  return (
    <div className="space-y-2">
      {actions.map((a) => (
        <div key={a.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground capitalize text-sm">{a.action}</span>
            {a.reason && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{a.reason}</span>
            )}
          </div>
          {a.note && <p className="text-muted-foreground text-xs">{a.note}</p>}
          <p className="text-muted-foreground text-xs mt-1">
            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}
