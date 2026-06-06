import { Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { allDemoLambs } from "@/data/demoLambs";
import { Plus } from "lucide-react";

export default function MyLambsPage() {
  const { user, loading } = useAuth();
  const lambs = allDemoLambs();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full px-4 pb-24 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
            My Lambs
          </h1>
          <Link
            to="/dashboard/lambs/new"
            className="inline-flex items-center gap-1 bg-[#1A4FB5] text-white text-sm font-semibold px-3 py-2 rounded-full"
          >
            <Plus className="w-4 h-4" />
            Register
          </Link>
        </div>

        {lambs.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-12">No lambs yet.</div>
        ) : (
          <ul className="mt-4 space-y-2">
            {lambs.map((l) => (
              <li key={l.tag}>
                <Link
                  to={`/lamb/${l.tag}`}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3"
                >
                  <span
                    className="inline-flex items-center justify-center min-w-12 h-10 px-2 rounded-md text-sm font-bold text-white"
                    style={{
                      background: l.breederColor,
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                    }}
                  >
                    #{l.tag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E]">
                      {l.sex} · {l.breed}
                    </p>
                    <p className="text-[12px] text-gray-500 truncate">Sire: {l.sireName}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(l.dob).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
