export type ScrapieCode = "RR" | "QR" | "QQ";
export type SpiderCode = "NN" | "SN" | "SS";
export type DwarfCode = "FF" | "FD" | "DD";

export interface ParsedGenotype {
  scrapie: ScrapieCode | null;
  spider: SpiderCode | null;
  dwarf: DwarfCode | null;
  rsg: string; // e.g. "RR.NN.FF"
}

export function parseGenotype(raw: string | null | undefined): ParsedGenotype {
  if (!raw) return { scrapie: null, spider: null, dwarf: null, rsg: "" };
  const s = raw.toUpperCase();
  const scrapie: ScrapieCode | null = s.startsWith("RR")
    ? "RR"
    : s.startsWith("QR")
      ? "QR"
      : s.startsWith("QQ")
        ? "QQ"
        : null;
  const spider: SpiderCode | null = /NN/.test(s)
    ? "NN"
    : /SN/.test(s)
      ? "SN"
      : /(^|[^F])SS/.test(s)
        ? "SS"
        : null;
  const dwarf: DwarfCode | null = /FF/.test(s)
    ? "FF"
    : /FD/.test(s)
      ? "FD"
      : /DD/.test(s)
        ? "DD"
        : null;
  const rsg = [scrapie, spider, dwarf].filter(Boolean).join(".");
  return { scrapie, spider, dwarf, rsg };
}

export const SCRAPIE_INFO: Record<ScrapieCode, { label: string; tone: string; tooltip: string }> = {
  RR: { label: "RR", tone: "bg-emerald-100 text-emerald-800 border-emerald-300", tooltip: "Scrapie codon 171: RR — Resistant to classical scrapie" },
  QR: { label: "QR", tone: "bg-amber-100 text-amber-800 border-amber-300", tooltip: "Scrapie codon 171: QR — Carrier, partial resistance" },
  QQ: { label: "QQ", tone: "bg-red-100 text-red-800 border-red-300", tooltip: "Scrapie codon 171: QQ — Susceptible to classical scrapie" },
};

export const SPIDER_INFO: Record<SpiderCode, { label: string; tone: string; tooltip: string }> = {
  NN: { label: "NN", tone: "bg-sky-100 text-sky-800 border-sky-300", tooltip: "Spider syndrome: NN — Free of the spider gene" },
  SN: { label: "SN", tone: "bg-violet-100 text-violet-800 border-violet-300", tooltip: "Spider syndrome: SN — Carrier, will not show symptoms" },
  SS: { label: "SS", tone: "bg-red-100 text-red-800 border-red-300", tooltip: "Spider syndrome: SS — Affected" },
};

export const DWARF_INFO: Record<DwarfCode, { label: string; tone: string; tooltip: string }> = {
  FF: { label: "FF", tone: "bg-sky-100 text-sky-800 border-sky-300", tooltip: "Dwarfism: FF — Free of the dwarf gene" },
  FD: { label: "FD", tone: "bg-violet-100 text-violet-800 border-violet-300", tooltip: "Dwarfism: FD — Carrier, will not show symptoms" },
  DD: { label: "DD", tone: "bg-red-100 text-red-800 border-red-300", tooltip: "Dwarfism: DD — Affected" },
};

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
