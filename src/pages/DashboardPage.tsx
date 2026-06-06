import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trophy, ShoppingBag, QrCode } from "lucide-react";
import { allDemoLambs } from "@/data/demoLambs";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [winnerCount, setWinnerCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [recent, setRecent] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const lambsCount = allDemoLambs().length;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: wc }, { data: posts, count: pc }] = await Promise.all([
        supabase.from("winners").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("winners")
          .select("id, title, created_at", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setWinnerCount(wc || 0);
      setPostCount(pc || 0);
      setRecent((posts as any[]) || []);
    })();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const breederName = profile?.display_name || profile?.username || "Your";
  const stats = [
    { label: "Lambs registered", value: lambsCount },
    { label: "Show results", value: winnerCount },
    { label: "Posts", value: postCount },
    { label: "Profile views", value: 0 },
  ];

  const actions = [
    { icon: Plus, label: "Register Lamb", to: "/dashboard/lambs/new", tone: "bg-[#1A4FB5]" },
    { icon: Trophy, label: "Add Result", to: "/submit", tone: "bg-[#1A1A2E]" },
    { icon: ShoppingBag, label: "List for Sale", to: "/submit", tone: "bg-[#1A7A3A]" },
    { icon: QrCode, label: "View QR Tags", to: "/dashboard/lambs", tone: "bg-gray-700" },
  ];

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full px-4 pb-24 pt-4">
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {breederName} Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your lambs, sires, and results.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-2xl font-bold text-[#1A1A2E]">{s.value}</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          {actions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className={`flex items-center gap-2 ${a.tone} text-white font-semibold text-sm px-3 py-3 rounded-xl`}
            >
              <a.icon className="w-4 h-4" />
              {a.label}
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wide mt-6 mb-2">
          Recent activity
        </h2>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            No recent activity yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-gray-200 bg-white p-3 flex items-start gap-3"
              >
                <Trophy className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{r.title}</p>
                  <p className="text-[11px] text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
