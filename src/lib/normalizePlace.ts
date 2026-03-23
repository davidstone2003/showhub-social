/**
 * Normalize a win_placing string to a canonical placement slot.
 */

const PATTERNS: [RegExp, string][] = [
  [/\bgrand\s*(champion)?\b/i, "grand"],
  [/\breserve\s*(grand\s*)?(champion)?\b/i, "reserve"],
  [/\b3rd\s+overall\b/i, "third"],
  [/\b4th\s+overall\b/i, "fourth"],
  [/\b5th\s+overall\b/i, "fifth"],
];

export type PlacementSlot = "grand" | "reserve" | "third" | "fourth" | "fifth";

export function normalizePlace(raw: string | null): PlacementSlot | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  for (const [re, slot] of PATTERNS) {
    if (re.test(cleaned)) return slot as PlacementSlot;
  }
  return null;
}

export const SLOT_ORDER: PlacementSlot[] = ["grand", "reserve", "third", "fourth", "fifth"];

export const SLOT_LABELS: Record<PlacementSlot, string> = {
  grand: "Grand Champion",
  reserve: "Reserve Champion",
  third: "3rd Overall",
  fourth: "4th Overall",
  fifth: "5th Overall",
};

export const SLOT_ICONS: Record<PlacementSlot, string> = {
  grand: "🏆",
  reserve: "🥈",
  third: "🥉",
  fourth: "",
  fifth: "",
};
