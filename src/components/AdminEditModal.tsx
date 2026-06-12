import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PeopleTagger, type TaggedPerson } from "@/components/post/PeopleTagger";

interface AdminEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    title?: string;
    show_name?: string;
    shown_by?: string;
    win_placing?: string | null;
    caption?: string | null;
    bred_by?: string | null;
    sired_by?: string | null;
    dam?: string | null;
    date?: string | null;
    source_post_id?: string | null;
    tagged_people?: any[];
  };
  onSaved?: () => void;
}

export function AdminEditModal({ open, onOpenChange, post, onSaved }: AdminEditModalProps) {
  const [title, setTitle] = useState(post.title || "");
  const [showName, setShowName] = useState(post.show_name || "");
  const [shownBy, setShownBy] = useState(post.shown_by || "");
  const [winPlacing, setWinPlacing] = useState(post.win_placing || "");
  const [caption, setCaption] = useState(post.caption || "");
  const [bredBy, setBredBy] = useState(post.bred_by || "");
  const [siredBy, setSiredBy] = useState(post.sired_by || "");
  const [dam, setDam] = useState(post.dam || "");
  const [date, setDate] = useState(post.date || "");
  const [saving, setSaving] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState<TaggedPerson[]>(
    ((post as any).tagged_people || []).map((p: any) => ({
      id: p.id || p.user_id,
      name: p.name || p.display_name || "",
      username: p.username || "",
      logo_url: p.logo_url || null,
    }))
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: winnersError } = await supabase
        .from("winners")
        .update({
          title, show_name: showName, shown_by: shownBy,
          win_placing: winPlacing || null, caption: caption || null,
          bred_by: bredBy || null, sired_by: siredBy || null,
          dam: dam || null, date: date || undefined,
        })
        .eq("id", post.id);

      if (winnersError) throw winnersError;

      if ((post as any).source_post_id) {
        await supabase
          .from("posts")
          .update({
            caption: caption || null,
            tagged_user_ids: taggedPeople.map(p => p.id),
          })
          .eq("id", (post as any).source_post_id);
      }

      toast.success("Post updated");
      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      toast.error("Failed to save changes", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Win / Placing</label>
            <Input value={winPlacing} onChange={(e) => setWinPlacing(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Show Name</label>
            <Input value={showName} onChange={(e) => setShowName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date / Year</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Shown By</label>
            <Input value={shownBy} onChange={(e) => setShownBy(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Bred By</label>
            <Input value={bredBy} onChange={(e) => setBredBy(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Sired By</label>
            <Input value={siredBy} onChange={(e) => setSiredBy(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Dam</label>
            <Input value={dam} onChange={(e) => setDam(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Caption</label>
            <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className="resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tag People</label>
              {taggedPeople.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#C9A84C", color: "#0A1628" }}>
                  {taggedPeople.length} tagged
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Tag exhibitors, fitters, breeders or anyone involved</p>
            <PeopleTagger tagged={taggedPeople} onChange={setTaggedPeople} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
