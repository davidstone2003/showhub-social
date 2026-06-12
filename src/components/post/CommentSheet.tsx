import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Send, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CommentSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  commentCount: number;
}

interface CommentRow {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  mentioned_user_ids: string[] | null;
  author?: { display_name: string | null; username: string | null; logo_url: string | null };
}

interface ProfileSuggestion {
  id: string;
  username: string | null;
  display_name: string | null;
  logo_url: string | null;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function renderBodyWithMentions(body: string) {
  const parts = body.split(/(@[A-Za-z0-9_.]+)/g);
  return parts.map((p, i) =>
    p.startsWith("@") ? (
      <span key={i} className="font-semibold text-[#1A2A44]">{p}</span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function CommentSheet({ postId, open, onClose, commentCount }: CommentSheetProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [mentionedIds, setMentionedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, user_id, body, created_at, mentioned_user_ids")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error("Couldn't load comments");
        setComments([]);
      } else {
        const userIds = Array.from(new Set((data || []).map((c) => c.user_id)));
        let profilesById: Record<string, any> = {};
        if (userIds.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, display_name, username, logo_url")
            .in("id", userIds);
          (profs || []).forEach((p: any) => { profilesById[p.id] = p; });
        }
        setComments((data || []).map((c: any) => ({ ...c, author: profilesById[c.user_id] })));
      }
      setLoading(false);
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    })();

    // realtime
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
        async (payload) => {
          const c = payload.new as any;
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, display_name, username, logo_url")
            .eq("id", c.user_id)
            .maybeSingle();
          setComments((prev) => prev.find((x) => x.id === c.id) ? prev : [...prev, { ...c, author: prof || undefined }]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [open, postId]);

  useEffect(() => {
    if (mentionQuery === null) { setSuggestions([]); return; }
    const q = mentionQuery.trim();
    const handle = setTimeout(async () => {
      let query = supabase.from("profiles").select("id, username, display_name, logo_url").limit(6);
      if (q.length > 0) {
        query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
      }
      const { data } = await query;
      setSuggestions(data || []);
    }, 150);
    return () => clearTimeout(handle);
  }, [mentionQuery]);

  const handleTextChange = (v: string) => {
    setText(v);
    const cursor = inputRef.current?.selectionStart ?? v.length;
    const before = v.slice(0, cursor);
    const match = before.match(/@([A-Za-z0-9_.]*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const insertMention = (p: ProfileSuggestion) => {
    const handle = p.username || (p.display_name || "user").replace(/\s+/g, "");
    const cursor = inputRef.current?.selectionStart ?? text.length;
    const before = text.slice(0, cursor).replace(/@([A-Za-z0-9_.]*)$/, `@${handle} `);
    const after = text.slice(cursor);
    setText(before + after);
    setMentionedIds((prev) => new Set(prev).add(p.id));
    setMentionQuery(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    const body = text.trim();
    if (!body) return;
    setSubmitting(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: user.id,
      body,
      mentioned_user_ids: Array.from(mentionedIds),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't post comment", { description: error.message });
      return;
    }
    setText("");
    setMentionedIds(new Set());
    setMentionQuery(null);
  };

  const handleDelete = async (id: string) => {
    const prev = comments;
    setComments((cs) => cs.filter((c) => c.id !== id));
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) { setComments(prev); toast.error("Couldn't delete"); }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-[#E5E7EB]">
          <SheetTitle className="text-[16px] font-bold text-[hsl(var(--primary))]">
            {comments.length || commentCount} {(comments.length || commentCount) === 1 ? "Comment" : "Comments"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loading && comments.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[#6B7280]">Loading…</div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <MessageCircle className="w-9 h-9 text-[hsl(var(--gold))] mb-2" />
              <p className="text-[14px] font-semibold text-[hsl(var(--primary))]">No comments yet</p>
              <p className="text-[12px] text-[#6B7280] mt-1">Be the first to say something.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => {
                const name = c.author?.display_name || c.author?.username || "User";
                const initial = name.charAt(0).toUpperCase();
                const canDelete = isAdmin || (user && user.id === c.user_id);
                return (
                  <li key={c.id} className="flex gap-2.5 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary))" }}>
                      {c.author?.logo_url ? (
                        <img src={c.author.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-[13px] font-semibold">{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-[#F3F4F6] rounded-2xl px-3 py-2">
                        {c.author?.username ? (
                          <Link to={`/breeder/${c.author.username}`} className="block text-[13px] font-bold text-[hsl(var(--primary))] leading-tight">
                            {name}
                          </Link>
                        ) : (
                          <span className="block text-[13px] font-bold text-[hsl(var(--primary))] leading-tight">{name}</span>
                        )}
                        <p className="text-[14px] text-[hsl(var(--primary))] leading-snug mt-0.5 whitespace-pre-wrap break-words">
                          {renderBodyWithMentions(c.body)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-3">
                        <span className="text-[11px] text-[#6B7280]">{timeAgo(c.created_at)}</span>
                        {canDelete && (
                          <button onClick={() => handleDelete(c.id)} className="text-[11px] text-[#6B7280] hover:text-destructive flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              <div ref={listEndRef} />
            </ul>
          )}
        </div>

        {mentionQuery !== null && suggestions.length > 0 && (
          <div className="border-t border-[#E5E7EB] bg-white max-h-44 overflow-y-auto">
            {suggestions.map((p) => (
              <button
                key={p.id}
                onClick={() => insertMention(p)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F3F4F6] text-left"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary))" }}>
                  {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-[12px]">{(p.display_name || p.username || "U").charAt(0).toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[hsl(var(--primary))] truncate">{p.display_name || p.username}</p>
                  {p.username && <p className="text-[11px] text-[#6B7280] truncate">@{p.username}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-[#E5E7EB] bg-white p-2 pb-3 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
            rows={1}
            placeholder={user ? "Write a comment… use @ to tag" : "Sign in to comment"}
            disabled={!user || submitting}
            className="flex-1 resize-none rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-2 text-[14px] focus:outline-none focus:border-[hsl(var(--gold))] max-h-32"
          />
          <Button
            onClick={handleSubmit}
            disabled={!user || submitting || !text.trim()}
            size="icon"
            className="rounded-full bg-[#1A2A44] hover:bg-[hsl(var(--primary))] flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
