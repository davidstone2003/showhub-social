// Hardcoded demo data for the lamb / QR / dashboard demo flow.
// New DB tables are intentionally out of scope.

export interface DemoShowResult {
  show: string;
  year: number;
  placement: string;
}

export interface DemoLamb {
  tag: string;
  breederName: string;
  breederLocation: string;
  breederColor: string;
  sireName: string;
  damName: string;
  grandsireDamName?: string;
  sex: "Ewe" | "Wether" | "Ram";
  breed: string;
  color: string;
  dob: string; // ISO
  weightLbs: number;
  forSale: boolean;
  price?: number;
  notes?: string;
  results: DemoShowResult[];
}

export const DEMO_LAMBS: DemoLamb[] = [
  {
    tag: "001",
    breederName: "Stone Show Stock",
    breederLocation: "Troy, Ohio",
    breederColor: "#1A4FB5",
    sireName: "Unfiltered",
    damName: "Stone 2023 Donor",
    grandsireDamName: "Tres Amigos",
    sex: "Ewe",
    breed: "Crossbred",
    color: "White",
    dob: "2026-01-14",
    weightLbs: 82,
    forSale: false,
    results: [
      { show: "Miami County Fair", year: 2026, placement: "Reserve Champion" },
      { show: "Ohio State Fair", year: 2026, placement: "3rd Overall" },
    ],
  },
  {
    tag: "042",
    breederName: "Beatty Club Lambs",
    breederLocation: "Kansas",
    breederColor: "#a82828",
    sireName: "Bingo!",
    damName: "Beatty 2104",
    sex: "Wether",
    breed: "Hampshire x",
    color: "White/Black",
    dob: "2026-02-02",
    weightLbs: 95,
    forSale: true,
    price: 2200,
    results: [{ show: "American Royal", year: 2026, placement: "Grand Champion" }],
  },
  {
    tag: "019",
    breederName: "Berry Farms",
    breederLocation: "Missouri",
    breederColor: "#b8621a",
    sireName: "Cocky Rocky",
    damName: "Berry F22",
    sex: "Ewe",
    breed: "Crossbred",
    color: "White",
    dob: "2026-01-21",
    weightLbs: 78,
    forSale: true,
    price: 1500,
    results: [],
  },
  {
    tag: "077",
    breederName: "Stone Show Stock",
    breederLocation: "Troy, Ohio",
    breederColor: "#1A4FB5",
    sireName: "Bingo!",
    damName: "Stone 2021",
    sex: "Wether",
    breed: "Hampshire x",
    color: "Black",
    dob: "2026-01-30",
    weightLbs: 88,
    forSale: true,
    price: 1800,
    results: [{ show: "Ohio State Fair", year: 2026, placement: "Class Winner" }],
  },
  {
    tag: "103",
    breederName: "Beatty Club Lambs",
    breederLocation: "Kansas",
    breederColor: "#a82828",
    sireName: "Unfiltered",
    damName: "Beatty 1908",
    sex: "Ewe",
    breed: "Crossbred",
    color: "White",
    dob: "2026-02-11",
    weightLbs: 80,
    forSale: false,
    results: [{ show: "Kansas State Fair", year: 2026, placement: "Reserve Champion Ewe" }],
  },
  {
    tag: "055",
    breederName: "Berry Farms",
    breederLocation: "Missouri",
    breederColor: "#b8621a",
    sireName: "Cocky Rocky",
    damName: "Berry G07",
    sex: "Wether",
    breed: "Crossbred",
    color: "Spotted",
    dob: "2026-02-04",
    weightLbs: 91,
    forSale: true,
    price: 2500,
    results: [{ show: "American Royal", year: 2026, placement: "5th Overall" }],
  },
  {
    tag: "210",
    breederName: "Stone Show Stock",
    breederLocation: "Troy, Ohio",
    breederColor: "#1A4FB5",
    sireName: "Unfiltered",
    damName: "Stone 2024 Donor",
    sex: "Ewe",
    breed: "Crossbred",
    color: "White",
    dob: "2026-03-02",
    weightLbs: 70,
    forSale: false,
    results: [],
  },
];

export function findDemoLamb(tag: string): DemoLamb | undefined {
  const all = [...DEMO_LAMBS, ...loadStoredLambs()];
  return all.find((l) => l.tag.toLowerCase() === tag.toLowerCase());
}

const LS_KEY = "backdrop_demo_lambs";

export function loadStoredLambs(): DemoLamb[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DemoLamb[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredLamb(lamb: DemoLamb) {
  if (typeof window === "undefined") return;
  const list = loadStoredLambs();
  const next = [lamb, ...list.filter((l) => l.tag !== lamb.tag)];
  window.localStorage.setItem(LS_KEY, JSON.stringify(next));
}

export function allDemoLambs(): DemoLamb[] {
  return [...loadStoredLambs(), ...DEMO_LAMBS];
}
