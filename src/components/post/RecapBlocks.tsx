import { Link } from "react-router-dom";

export interface RecapWinner {
  id: string;
  animal_name?: string | null;
  shown_by?: string | null;
  win_placing?: string | null;
  show_name?: string | null;
  bred_by?: string | null;
  placed_by?: string | null;
  sired_by?: string | null;
  sire_id?: string | null;
  dam?: string | null;
}

interface RecapBlocksProps {
  winners: RecapWinner[];
}

/**
 * Group winner cards by the exhibitor (shown_by) and render each as a
 * compact recap block. Multiple placings for the same animal/exhibitor
 * collapse into one block with a bulleted list of placings.
 */
export function RecapBlocks({ winners }: RecapBlocksProps) {
  if (!winners || winners.length === 0) return null;

  // Group by shown_by (animal/exhibitor identifier)
  const groups = new Map<string, RecapWinner[]>();
  for (const w of winners) {
    const key = (w.shown_by || w.animal_name || w.id).trim().toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }

  return (
    <div className="px-3 pt-2 pb-1 space-y-2.5">
      {Array.from(groups.values()).map((grp) => {
        const head = grp[0];
        const label = head.shown_by || head.animal_name || "Animal";
        const placings = grp.map((g) => g.win_placing).filter(Boolean) as string[];
        return (
          <div key={head.id} className="leading-[1.4]">
            <p className="font-bold text-[14px]" style={{ color: "#0A1628" }}>
              {label}
            </p>
            {placings.length > 0 && (
              <ul className="mt-0.5 space-y-0.5">
                {placings.map((p, i) => (
                  <li key={i} className="text-[13px]" style={{ color: "#0A1628" }}>
                    <span style={{ color: "#C9A84C", marginRight: 6 }}>•</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {(head.bred_by || head.placed_by || head.sired_by) && (
              <p className="text-[12px] mt-1" style={{ color: "#6B7280" }}>
                {head.bred_by && (
                  <>Bred by <span style={{ color: "#0A1628", fontWeight: 600 }}>{head.bred_by}</span></>
                )}
                {head.placed_by && (
                  <>
                    {head.bred_by && " · "}
                    Placed by <span style={{ color: "#0A1628", fontWeight: 600 }}>{head.placed_by}</span>
                  </>
                )}
                {head.sired_by && (
                  <>
                    {(head.bred_by || head.placed_by) && " · "}
                    Sired by{" "}
                    {head.sire_id ? (
                      <Link
                        to={`/sire/${head.sire_id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#C9A84C", fontWeight: 600 }}
                      >
                        {head.sired_by}
                      </Link>
                    ) : (
                      <span style={{ color: "#C9A84C", fontWeight: 600 }}>{head.sired_by}</span>
                    )}
                  </>
                )}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Rank order for picking the "primary" placing across many cards. */
const PLACING_RANK: Array<[RegExp, number]> = [
  [/grand\s*champ/i, 5],
  [/reserve\s*grand/i, 4],
  [/division\s*champ/i, 3],
  [/class\s*winner/i, 2],
];

export function highestPlacing(winners: RecapWinner[]): string | null {
  if (!winners || winners.length === 0) return null;
  let best: { rank: number; placing: string } | null = null;
  for (const w of winners) {
    if (!w.win_placing) continue;
    let rank = 1;
    for (const [re, r] of PLACING_RANK) {
      if (re.test(w.win_placing)) {
        rank = r;
        break;
      }
    }
    if (!best || rank > best.rank) best = { rank, placing: w.win_placing };
  }
  return best?.placing || null;
}
