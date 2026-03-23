import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface LiveResult {
  id: string;
  winPlacing: string | null;
  showName: string;
  shownBy: string;
  breederName: string | null;
  createdAt: string;
}

interface LiveSale {
  id: string;
  lotNumber: string;
  price: string;
  breederOrSale: string;
  createdAt: string;
}

interface LiveRingFeedProps {
  showId?: string;
}

export function LiveRingFeed({ showId }: LiveRingFeedProps) {
  const [results, setResults] = useState<LiveResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      let query = supabase
        .from("winners")
        .select("id, win_placing, show_name, shown_by, bred_by, created_at, posted_as_breeder_id")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (showId) {
        query = query.eq("show_id", showId);
      } else {
        const today = new Date().toISOString().split("T")[0];
        query = query.gte("date", today);
      }

      if (data) {
        // Resolve breeder names
        const breederIds = [...new Set(data.filter(d => d.posted_as_breeder_id).map(d => d.posted_as_breeder_id!))];
        let breederMap: Record<string, string> = {};
        if (breederIds.length > 0) {
          const { data: bps } = await supabase
            .from("breeder_profiles")
            .select("id, breeder_name")
            .in("id", breederIds);
          if (bps) breederMap = Object.fromEntries(bps.map(b => [b.id, b.breeder_name]));
        }

        setResults(data.map(d => ({
          id: d.id,
          winPlacing: d.win_placing,
          showName: d.show_name,
          shownBy: d.shown_by,
          breederName: d.posted_as_breeder_id ? breederMap[d.posted_as_breeder_id] || d.bred_by || null : d.bred_by || null,
          createdAt: d.created_at,
        })));
      }
      setLoading(false);
    }
    fetch();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("live-ring")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "winners" }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="space-y-2 px-4 pt-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-muted-foreground text-sm">No live results yet today</p>
        <p className="text-xs text-muted-foreground mt-1">Results will appear here as they're posted</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 px-3 pt-2">
      {results.map((r) => (
        <div key={r.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {r.winPlacing || "Result"}{r.showName ? ` — ${r.showName}` : ""}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {r.shownBy}{r.breederName ? ` • ${r.breederName}` : ""}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
            {formatDistanceToNow(new Date(r.createdAt), { addSuffix: false })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LiveSalesFeed() {
  // Sales data — currently placeholder since no sales table exists yet
  const [sales] = useState<LiveSale[]>([]);

  if (sales.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-muted-foreground text-sm">No active sales right now</p>
        <p className="text-xs text-muted-foreground mt-1">Sale results will appear here during live events</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 px-3 pt-2">
      {sales.map((s) => (
        <div key={s.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              Lot {s.lotNumber} — ${s.price}
            </p>
            <p className="text-xs text-muted-foreground truncate">{s.breederOrSale}</p>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
            {formatDistanceToNow(new Date(s.createdAt), { addSuffix: false })}
          </span>
        </div>
      ))}
    </div>
  );
}

type LiveSubTab = "ring" | "sales";

export function LiveFeed() {
  const [subTab, setSubTab] = useState<LiveSubTab>("ring");
  // In the future, check if an active sale exists to show the Sales tab
  const hasSales = false;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 px-4 pt-2 pb-1">
        <button
          onClick={() => setSubTab("ring")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
            subTab === "ring"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Ring
        </button>
        {hasSales && (
          <button
            onClick={() => setSubTab("sales")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
              subTab === "sales"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sales
          </button>
        )}
      </div>

      {subTab === "ring" ? <LiveRingFeed /> : <LiveSalesFeed />}
    </div>
  );
}
