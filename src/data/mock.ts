export interface Breeder {
  id: string;
  name: string;
  location: string;
  logo: string;
  is_pro: boolean;
}

export interface Sire {
  id: string;
  name: string;
  breeder_id: string;
  photo: string;
}

export type PostType = "lamb" | "champion" | "sire" | "sale" | "hauler";

export interface Post {
  id: string;
  image: string;
  breeder: Breeder;
  caption: string;
  tags: { label: string; type: string }[];
  sire_id?: string;
  animal_id?: string;
  post_type: PostType;
  created_at: string;
  likes: number;
  comments: number;
  saved: boolean;
}

export interface Animal {
  id: string;
  name: string;
  breed: string;
  sire: string;
  dam: string;
  dob: string;
  weight: string;
  breeder: Breeder;
  photos: string[];
  price?: string;
  status: "For Sale" | "Sold" | "Reference";
  description: string;
  tags: { label: string; type: string }[];
}

export const breeders: Breeder[] = [
  { id: "b1", name: "Iron Oak Livestock", location: "Stephenville, TX", logo: "🐑", is_pro: true },
  { id: "b2", name: "Ridgeline Club Lambs", location: "Stillwater, OK", logo: "🏔️", is_pro: true },
  { id: "b3", name: "Herd & Wool Co.", location: "Des Moines, IA", logo: "🐏", is_pro: false },
  { id: "b4", name: "Summit Show Stock", location: "San Angelo, TX", logo: "⛰️", is_pro: true },
  { id: "b5", name: "Prairie Fire Genetics", location: "Manhattan, KS", logo: "🔥", is_pro: false },
  { id: "b6", name: "Blue Ribbon Ranch", location: "Columbus, OH", logo: "🎗️", is_pro: true },
  { id: "b7", name: "Midwest Hauling Co.", location: "Springfield, MO", logo: "🚛", is_pro: true },
];

export const sires: Sire[] = [
  { id: "s1", name: "Iron Throne", breeder_id: "b1", photo: "" },
  { id: "s2", name: "Ridge Runner", breeder_id: "b2", photo: "" },
  { id: "s3", name: "Thunder Road", breeder_id: "b3", photo: "" },
  { id: "s4", name: "Summit Peak", breeder_id: "b4", photo: "" },
  { id: "s5", name: "Blaze", breeder_id: "b5", photo: "" },
];

const images = [
  "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1605726439061-30d0dab29cba?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580377968131-75a35ac6577b?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1591634616938-1dfa7ee2e617?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=1000&fit=crop&q=80",
  "https://images.unsplash.com/photo-1562618817-4ed0c06b431c?w=800&h=1000&fit=crop&q=80",
];

export const animals: Animal[] = [
  {
    id: "a1", name: "Iron Throne 24-01", breed: "Hampshire",
    sire: "Iron Throne", dam: "Iron Oak 21-08", dob: "Jan 15, 2024",
    weight: "135 lbs", breeder: breeders[0], photos: [images[0], images[1], images[2]],
    price: "$3,500", status: "For Sale",
    description: "This Iron Throne son is putting it all together heading into Fort Worth. Built like a tank with the look to match. Heavy-boned, square-built, and moves like a dream. Dam is one of our best producing Hampshire ewes.",
    tags: [{ label: "Iron Throne", type: "sire" }, { label: "Hampshire", type: "breed" }, { label: "For Sale", type: "sale" }],
  },
  {
    id: "a2", name: "Ridge Runner 24-05", breed: "Southdown",
    sire: "Ridge Runner", dam: "Ridgeline 22-03", dob: "Feb 2, 2024",
    weight: "110 lbs", breeder: breeders[1], photos: [images[3], images[4]],
    status: "Reference",
    description: "Ridge Runner daughters are bringing the bone and presence we're after. This ewe lamb is one of the best we've raised. Grand Champion at the San Antonio Livestock Show.",
    tags: [{ label: "Ridge Runner", type: "sire" }, { label: "Southdown", type: "breed" }, { label: "Champion", type: "show" }],
  },
];

export const filterCategories = [
  "All", "Private Treaty", "Champions", "Hampshires", "Southdowns", "Suffolks", "Dorsets",
  "Ohio", "Texas", "Oklahoma", "Kansas", "Iowa", "Sires", "Haulers",
];

export const posts: Post[] = [
  {
    id: "p1", image: images[0], breeder: breeders[0], post_type: "lamb",
    caption: "This Iron Throne son is putting it all together heading into Fort Worth. Built like a tank with the look to match.",
    tags: [{ label: "Iron Throne", type: "sire" }, { label: "Fort Worth Stock Show", type: "show" }, { label: "Hampshire", type: "breed" }],
    sire_id: "s1", animal_id: "a1", created_at: "2h ago", likes: 142, comments: 18, saved: false,
  },
  {
    id: "p2", image: images[1], breeder: breeders[1], post_type: "champion",
    caption: "🏆 Grand Champion Southdown — San Antonio Livestock Show. Ridge Runner genetics proving out at the highest level.",
    tags: [{ label: "Grand Champion", type: "show" }, { label: "San Antonio", type: "show" }, { label: "Southdown", type: "breed" }],
    sire_id: "s2", animal_id: "a2", created_at: "4h ago", likes: 324, comments: 47, saved: true,
  },
  {
    id: "p3", image: images[2], breeder: breeders[2], post_type: "lamb",
    caption: "Fresh off the shears and feeling good about this set of wether prospects. Thunder Road x our best Hamp ewes.",
    tags: [{ label: "Thunder Road", type: "sire" }, { label: "Hampshire", type: "breed" }, { label: "Private Treaty", type: "sale" }],
    sire_id: "s3", created_at: "6h ago", likes: 76, comments: 8, saved: false,
  },
  {
    id: "p4", image: images[3], breeder: breeders[3], post_type: "sire",
    caption: "Introducing Summit Peak — our new herd sire. This ram has the bone, muscle shape, and presence we've been looking for. Semen available.",
    tags: [{ label: "Summit Peak", type: "sire" }, { label: "Shropshire", type: "breed" }, { label: "Semen Available", type: "sale" }],
    sire_id: "s4", created_at: "8h ago", likes: 213, comments: 31, saved: false,
  },
  {
    id: "p5", image: images[4], breeder: breeders[4], post_type: "lamb",
    caption: "Blaze lambs hitting the ground running. This cross on our Dorset ewes is exactly what we were hoping for. Private treaty — DM for pricing.",
    tags: [{ label: "Blaze", type: "sire" }, { label: "Dorset", type: "breed" }, { label: "Private Treaty", type: "sale" }],
    sire_id: "s5", created_at: "12h ago", likes: 55, comments: 4, saved: false,
  },
  {
    id: "p6", image: images[5], breeder: breeders[5], post_type: "champion",
    caption: "🏆 National Western champion prospect. Blue Ribbon genetics at their finest. Reserve Grand Champion Market Lamb.",
    tags: [{ label: "National Western", type: "show" }, { label: "Suffolk", type: "breed" }, { label: "Champion", type: "show" }],
    created_at: "1d ago", likes: 456, comments: 62, saved: true,
  },
  {
    id: "p7", image: images[6], breeder: breeders[0], post_type: "sale",
    caption: "🔥 SALE DAY at Iron Oak — 40 head of club lamb prospects. Wethers and ewe lambs. On-site and online bidding available.",
    tags: [{ label: "Iron Oak Sale", type: "sale" }, { label: "Club Lambs", type: "type" }, { label: "Texas", type: "location" }],
    created_at: "1d ago", likes: 189, comments: 24, saved: false,
  },
  {
    id: "p8", image: images[7], breeder: breeders[6], post_type: "hauler",
    caption: "🚛 Running routes TX → OK → KS → IA this weekend. Space available. Climate-controlled trailer, fully insured. DM for quote.",
    tags: [{ label: "Hauling", type: "type" }, { label: "Texas", type: "location" }, { label: "Oklahoma", type: "location" }, { label: "Kansas", type: "location" }],
    created_at: "1d ago", likes: 34, comments: 12, saved: false,
  },
  {
    id: "p9", image: images[8], breeder: breeders[1], post_type: "lamb",
    caption: "Ridgeline spring drop is looking incredible. Ridge Runner x our foundation ewes. These will be available private treaty mid-March.",
    tags: [{ label: "Ridge Runner", type: "sire" }, { label: "Spring Lambs", type: "type" }, { label: "Oklahoma", type: "location" }],
    sire_id: "s2", created_at: "2d ago", likes: 167, comments: 19, saved: false,
  },
  {
    id: "p10", image: images[9], breeder: breeders[3], post_type: "sire",
    caption: "Summit Peak progeny report — 8 champions in his first lamb crop. This sire is changing the game for us. Semen and live cover available.",
    tags: [{ label: "Summit Peak", type: "sire" }, { label: "Progeny", type: "type" }, { label: "Champions", type: "show" }],
    sire_id: "s4", created_at: "2d ago", likes: 298, comments: 41, saved: false,
  },
  {
    id: "p11", image: images[10], breeder: breeders[4], post_type: "sale",
    caption: "Online sale live NOW — Prairie Fire Spring Production Sale. 25 head. Bid at LivestockAuctions.com.",
    tags: [{ label: "Online Sale", type: "sale" }, { label: "Kansas", type: "location" }, { label: "Production Sale", type: "sale" }],
    created_at: "3d ago", likes: 112, comments: 15, saved: false,
  },
  {
    id: "p12", image: images[11], breeder: breeders[5], post_type: "champion",
    caption: "🏆 Ohio State Fair Grand Champion. This Suffolk wether was sired by our homegrown ram. Ohio genetics at their best.",
    tags: [{ label: "Ohio State Fair", type: "show" }, { label: "Suffolk", type: "breed" }, { label: "Ohio", type: "location" }],
    created_at: "3d ago", likes: 387, comments: 53, saved: true,
  },
];
