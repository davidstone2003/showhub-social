// Species + sub-category taxonomy for the Breeder Directory navigation.
// Matched against `profiles.bio`, `tagline`, `display_name` (case-insensitive).

export type SpeciesKey = "sheep" | "goats" | "cattle" | "pigs";

export interface SpeciesTile {
  key: SpeciesKey;
  name: string;
  blurb: string;
  // keywords used to softly assign a profile to a species
  keywords: string[];
  silhouette: string; // emoji fallback silhouette
  subcategories: SubCategory[];
}

export interface SubCategory {
  slug: string;
  name: string;
  keywords: string[];
  silhouette: string;
}

export const SPECIES: SpeciesTile[] = [
  {
    key: "sheep",
    name: "Sheep",
    blurb: "Club lambs, breeding stock & wool breeds",
    keywords: ["sheep", "lamb", "ewe", "ram", "suffolk", "hampshire", "southdown", "dorset", "wool"],
    silhouette: "🐏",
    subcategories: [
      { slug: "club-lambs", name: "Club Lambs", keywords: ["club lamb", "crossbred", "market lamb"], silhouette: "🐑" },
      { slug: "fine-wool", name: "Fine Wool", keywords: ["fine wool", "merino", "rambouillet"], silhouette: "🐑" },
      { slug: "suffolk-hampshire", name: "Suffolks & Hampshires", keywords: ["suffolk", "hampshire"], silhouette: "🐑" },
      { slug: "southdown", name: "Southdowns", keywords: ["southdown"], silhouette: "🐑" },
      { slug: "hair", name: "Hair Breeds", keywords: ["dorper", "valais", "katahdin", "hair"], silhouette: "🐑" },
      { slug: "et", name: "Breeding Stock & ET Programs", keywords: ["et program", "embryo", "donor", "breeding stock"], silhouette: "🐑" },
    ],
  },
  {
    key: "goats",
    name: "Goats",
    blurb: "Boer, Dairy, Myotonic & ET programs",
    keywords: ["goat", "boer", "myotonic", "fainting", "savanna", "dairy goat", "wether"],
    silhouette: "🐐",
    subcategories: [
      { slug: "boer", name: "Boer", keywords: ["boer"], silhouette: "🐐" },
      { slug: "myotonic", name: "Myotonic / Fainting", keywords: ["myotonic", "fainting"], silhouette: "🐐" },
      { slug: "dairy", name: "Dairy", keywords: ["dairy", "nubian", "alpine"], silhouette: "🐐" },
      { slug: "savanna", name: "Savanna", keywords: ["savanna"], silhouette: "🐐" },
      { slug: "et", name: "Breeding Stock & ET Programs", keywords: ["et program", "embryo", "donor"], silhouette: "🐐" },
    ],
  },
  {
    key: "cattle",
    name: "Cattle",
    blurb: "Club calves, registered breeds & commercial",
    keywords: ["cattle", "calf", "calves", "heifer", "steer", "angus", "simmental", "hereford", "maine"],
    silhouette: "🐄",
    subcategories: [
      { slug: "club-calves", name: "Club Calves", keywords: ["club calf", "club calves"], silhouette: "🐄" },
      { slug: "angus", name: "Angus", keywords: ["angus"], silhouette: "🐄" },
      { slug: "simmental", name: "Simmental / SimAngus", keywords: ["simmental", "simangus"], silhouette: "🐄" },
      { slug: "commercial", name: "Commercial", keywords: ["commercial"], silhouette: "🐄" },
      { slug: "et", name: "Breeding Stock & ET Programs", keywords: ["et program", "embryo", "donor"], silhouette: "🐄" },
    ],
  },
  {
    key: "hair",
    name: "Hair Breeds",
    blurb: "Dorper, Valais Blacknose & Katahdin",
    keywords: ["dorper", "valais", "blacknose", "katahdin", "hair sheep"],
    silhouette: "🐑",
    subcategories: [
      { slug: "dorper", name: "Dorper", keywords: ["dorper"], silhouette: "🐑" },
      { slug: "valais", name: "Valais Blacknose", keywords: ["valais", "blacknose"], silhouette: "🐑" },
      { slug: "katahdin", name: "Katahdin", keywords: ["katahdin"], silhouette: "🐑" },
      { slug: "et", name: "Breeding Stock & ET Programs", keywords: ["et program", "embryo", "donor"], silhouette: "🐑" },
    ],
  },
];

export function getSpecies(key: string): SpeciesTile | undefined {
  return SPECIES.find((s) => s.key === key);
}

export function matchesKeywords(haystack: string, keywords: string[]): boolean {
  const h = haystack.toLowerCase();
  return keywords.some((k) => h.includes(k.toLowerCase()));
}
