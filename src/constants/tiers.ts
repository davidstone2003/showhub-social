export const TIERS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "Post to main feed",
      "Winners archive access",
      "Basic profile",
      "Follow other breeders",
      "Like and comment on posts",
    ],
    color: "#6B7280",
  },
  breeder: {
    name: "Breeder Page",
    price: 24.99,
    badge: "🏆",
    features: [
      "Everything in Free",
      "Full breeder profile page",
      "Winners tab with photo archive",
      "Sires tab with semen info",
      "For Sale / Available tab",
      "Availability calendar",
      "Verified gold badge",
      "Breeder directory listing",
      "Follower analytics",
      "Email followers",
    ],
    color: "#C9A84C",
  },
  featured: {
    name: "Featured",
    price: 49.99,
    badge: "⭐",
    features: [
      "Everything in Breeder Page",
      "Top placement in directory",
      "Featured Breeder card in main feed",
      "Homepage spotlight",
      "Priority search results",
    ],
    color: "#0A1628",
  },
} as const;

export type TierKey = keyof typeof TIERS;
