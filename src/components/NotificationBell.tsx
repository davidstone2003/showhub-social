import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const typeIcon: Record<string, string> = {
    post_flagged: "🚩",
    comment_reported: "⚠️",
    action_required: "❗",
    warning_issued: "⛔",
    admin_message: "💬",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-muted transition-colors relative"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span
            className="absolute bg-destructive text-destructive-foreground font-bold flex items-center justify-center rounded-full"
            style={{ top: 4, right: 4, width: 16, height: 16, fontSize: 10 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
          style={{ top: 44, width: 320, maxHeight: 400 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-foreground" style={{ fontSize: 14 }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-primary font-medium hover:underline"
                style={{ fontSize: 12 }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" style={{ fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border transition-colors cursor-pointer hover:bg-muted/50 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) {
                      setOpen(false);
                    }
                  }}
                >
                  {n.link ? (
                    <Link to={n.link} className="block" onClick={() => setOpen(false)}>
                      <NotificationContent n={n} typeIcon={typeIcon} />
                    </Link>
                  ) : (
                    <NotificationContent n={n} typeIcon={typeIcon} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationContent({
  n,
  typeIcon,
}: {
  n: { type: string; title: string; message: string; created_at: string; is_read: boolean };
  typeIcon: Record<string, string>;
}) {
  return (
    <div className="flex gap-2.5">
      <span style={{ fontSize: 16 }}>{typeIcon[n.type] || "📌"}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-foreground truncate ${!n.is_read ? "font-semibold" : "font-medium"}`}
          style={{ fontSize: 13 }}
        >
          {n.title}
        </p>
        <p className="text-muted-foreground line-clamp-2" style={{ fontSize: 12, marginTop: 2 }}>
          {n.message}
        </p>
        <p className="text-muted-foreground" style={{ fontSize: 11, marginTop: 4 }}>
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
        </p>
      </div>
      {!n.is_read && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}
