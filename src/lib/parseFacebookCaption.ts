/**
 * Parse a Facebook-style livestock show caption into structured fields.
 */

export interface ParsedCaption {
  showName: string;
  winPlacing: string;
  shownBy: string;
  placedBy: string;
  siredBy: string;
  dam: string;
  caption: string;
}

/* Title-case a name string */
function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

/* Strip leading label text like "Shown by:" or "Shown By -" */
function stripLabel(line: string, ...labels: string[]): string | null {
  const lower = line.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label.toLowerCase());
    if (idx !== -1) {
      return line
        .slice(idx + label.length)
        .replace(/^[\s:·•\-–—]+/, "")
        .trim();
    }
  }
  return null;
}

/* Check if a line looks like a placement */
const PLACING_KEYWORDS = /\b(grand\s*champion|reserve\s*(grand\s*)?champion|champion|1st\s+overall|2nd\s+overall|3rd\s+overall|\d+(st|nd|rd|th)\s+overall|overall|breed\s+champion|reserve)\b/i;

/* Check if line looks like a show name (contains year or common show words) */
const SHOW_HINTS = /\b(show|expo|fair|rodeo|classic|jackpot|livestock|futurity|festival|invitational|slam|shootout|20\d{2})\b/i;

export function parseFacebookCaption(text: string): ParsedCaption {
  const result: ParsedCaption = {
    showName: "",
    winPlacing: "",
    shownBy: "",
    placedBy: "",
    siredBy: "",
    dam: "",
    caption: "",
  };

  if (!text.trim()) return result;

  const rawLines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const usedLines = new Set<number>();

  // Pass 1: Extract labeled lines
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    const shownMatch = stripLabel(line, "shown by", "exhibited by", "exhibitor");
    if (shownMatch && !result.shownBy) {
      result.shownBy = titleCase(shownMatch);
      usedLines.add(i);
      continue;
    }

    const placedMatch = stripLabel(line, "placed by", "fitted by", "program:");
    if (placedMatch && !result.placedBy) {
      result.placedBy = titleCase(placedMatch);
      usedLines.add(i);
      continue;
    }

    const sireMatch = stripLabel(line, "sired by", "sire:");
    if (sireMatch && !result.siredBy) {
      result.siredBy = titleCase(sireMatch);
      usedLines.add(i);
      continue;
    }

    const damMatch = stripLabel(line, "dam:");
    if (damMatch && !result.dam) {
      result.dam = titleCase(damMatch);
      usedLines.add(i);
      continue;
    }

    const bredMatch = stripLabel(line, "bred by");
    if (bredMatch) {
      // bred by → placed by if empty
      if (!result.placedBy) result.placedBy = titleCase(bredMatch);
      usedLines.add(i);
      continue;
    }
  }

  // Pass 2: Detect placement & show from unlabeled lines
  for (let i = 0; i < rawLines.length; i++) {
    if (usedLines.has(i)) continue;
    const line = rawLines[i];
    // Remove emojis for matching
    const clean = line.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();

    if (!result.winPlacing && PLACING_KEYWORDS.test(clean)) {
      result.winPlacing = titleCase(clean);
      usedLines.add(i);
      continue;
    }

    if (!result.showName && SHOW_HINTS.test(clean)) {
      // Strip trailing year if present, keep it clean
      result.showName = titleCase(clean);
      usedLines.add(i);
      continue;
    }
  }

  // Pass 3: Remaining lines become caption
  const captionLines: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    if (usedLines.has(i)) continue;
    const line = rawLines[i];
    // Skip phone number lines, generic emoji-only lines
    if (/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+$/u.test(line)) continue;
    captionLines.push(line);
  }
  result.caption = captionLines.join("\n").trim();

  return result;
}
