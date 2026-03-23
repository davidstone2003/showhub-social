import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface WinnerRecord {
  id: string;
  title: string;
  win_placing: string | null;
  show_name: string;
  shown_by: string;
  placed_by: string | null;
  sired_by: string | null;
  sire_id: string | null;
  dam: string | null;
  bred_by: string | null;
  image_urls: string[] | null;
  created_at: string;
  date: string;
}

interface WinnersTabProps {
  showId?: string;
}

export function WinnersTab({ showId }: WinnersTabProps) {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from("winners")
        .select("id, title, win_placing, show_name, shown_by, placed_by, sired_by, sire_id, dam, bred_by, image_urls, created_at, date")
        .eq("status", "active")
        .eq("show_on_winners_archive", true)
        .order("created_at", { ascending: false });

      if (showId) {
        query = query.eq("show_id", showId);
      }

      const { data } = await query;
      setWinners(data || []);
      setLoading(false);
    }
    fetch();
  }, [showId]);

  if (loading) {
    return (
      <div className="space-y-4 px-4 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-muted/50 rounded-xl animate-pulse" style={{ height: 320 }} />
        ))}
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-muted-foreground text-sm font-medium">No winners posted yet</p>
        <Link
          to="/submit"
          className="inline-flex items-center gap-1.5 mt-3 bg-primary text-primary-foreground font-semibold rounded-full px-5 py-2 text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post Result
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-4 pb-8">
      {winners.map((w, i) => (
        <WinnerCard key={w.id} winner={w} index={i} />
      ))}
    </div>
  );
}

function WinnerCard({ winner, index }: { winner: WinnerRecord; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const image = imgFailed ? "/placeholder.svg" : (winner.image_urls?.[0] || "/placeholder.svg");
  const year = new Date(winner.date || winner.created_at).getFullYear();
  const isUploaded = image.includes("/storage/v1/object/public/winner-images/");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card rounded-xl overflow-hidden border border-border"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Image */}
      <div className="w-full bg-muted">
        <img
          src={image}
          alt={winner.win_placing || winner.title}
          className={`w-full aspect-video ${isUploaded ? "object-contain bg-muted" : "object-cover"}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      </div>

      {/* Details */}
      <div className="p-3.5 space-y-1">
        {winner.win_placing && (
          <p className="text-foreground font-bold" style={{ fontSize: 15, lineHeight: 1.3 }}>
            {winner.win_placing}
          </p>
        )}
        <p className="text-muted-foreground font-medium" style={{ fontSize: 13 }}>
          {year} {winner.show_name}
        </p>

        <div className="pt-0.5 space-y-px">
          {winner.shown_by && <DetailLine label="Shown by" value={winner.shown_by} />}
          {winner.placed_by && <DetailLine label="Placed by" value={winner.placed_by} />}
          {winner.sired_by && (
            <DetailLine
              label="Sired by"
              value={winner.sired_by}
              linkTo={winner.sire_id ? `/sire/${winner.sire_id}` : undefined}
            />
          )}
          {winner.dam && <DetailLine label="Dam" value={winner.dam} />}
          {winner.bred_by && <DetailLine label="Bred by" value={winner.bred_by} />}
        </div>
      </div>
    </motion.div>
  );
}

function DetailLine({ label, value, linkTo }: { label: string; value: string; linkTo?: string }) {
  return (
    <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.4 }}>
      {label}{" "}
      {linkTo ? (
        <Link to={linkTo} className="text-primary font-medium hover:underline">
          {value}
        </Link>
      ) : (
        <span className="text-foreground font-medium">{value}</span>
      )}
    </p>
  );
}
