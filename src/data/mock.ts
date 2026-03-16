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
  { id: "b1", name: "Iron Oak Livestock", location: "Texas", logo: "🐑", is_pro: true },
  { id: "b2", name: "Stone Show Stock", location: "Ohio", logo: "🪨", is_pro: true },
  { id: "b3", name: "Rule Sheep Co", location: "Texas", logo: "♟️", is_pro: true },
  { id: "b4", name: "Beatty Club Lambs", location: "Kentucky", logo: "🏆", is_pro: true },
  { id: "b5", name: "Prairie Fire Genetics", location: "Kansas", logo: "🔥", is_pro: false },
  { id: "b6", name: "Blue Ribbon Ranch", location: "Ohio", logo: "🎗️", is_pro: true },
  { id: "b7", name: "Midwest Hauling Co.", location: "Missouri", logo: "🚛", is_pro: true },
];

export const sires: Sire[] = [
  { id: "s1", name: "Iron Throne", breeder_id: "b1", photo: "" },
  { id: "s2", name: "Wingman", breeder_id: "b2", photo: "" },
  { id: "s3", name: "Chess Not Checkers", breeder_id: "b3", photo: "" },
  { id: "s4", name: "Tres Amigos", breeder_id: "b4", photo: "" },
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
];

export const animals: Animal[] = [
  {
    id: "a1", name: "Iron Throne 24-01", breed: "Hampshire",
    sire: "Iron Throne", dam: "Iron Oak 21-08", dob: "Jan 15, 2024",
    weight: "135 lbs", breeder: breeders[0], photos: [images[0], images[1], images[2]],
    price: "$3,500", status: "For Sale",
    description: "This Iron Throne son is putting it all together heading into Fort Worth. Built like a tank with the look to match. Heavy-boned, square-built, and moves like a dream.",
    tags: [{ label: "Iron Throne", type: "sire" }, { label: "Hampshire", type: "breed" }, { label: "For Sale", type: "sale" }],
  },
];

export const filterCategories = [
  "All 🗹",
  "For Sale 💰",
  "Private Treaty 📄",
  "Sale Previews 📅",
  "Recent Winners 🏆",
  "Flush 🧬",
  "Embryos 🧪",
  "Equipment 🔧",
];

export const posts: Post[] = [
  {
    id: "p1", image: images[0], breeder: breeders[0], post_type: "champion",
    caption: "Hampshire Wether • Sire: Iron Throne 🏆 Champion. This Iron Throne son is putting it all together heading into Fort Worth. Built like a tank with the look to match.",
    tags: [{ label: "Hampshire 🐑", type: "breed" }, { label: "For Sale 💰", type: "sale" }, { label: "Private Treaty 📄", type: "sale" }],
    sire_id: "s1", animal_id: "a1", created_at: "2h ago", likes: 142, comments: 18, saved: false,
  },
  {
    id: "p2", image: images[1], breeder: breeders[1], post_type: "sale",
    caption: "Wingman wethers ready for show season. These guys have the bone, muscle shape and balance to compete at the highest level. Private treaty available.",
    tags: [{ label: "Wingman", type: "sire" }, { label: "For Sale 💰", type: "sale" }, { label: "Private Treaty 📄", type: "sale" }],
    sire_id: "s2", created_at: "4h ago", likes: 98, comments: 12, saved: false,
  },
  {
    id: "p3", image: images[2], breeder: breeders[2], post_type: "sale",
    caption: "Chess Not Checkers flush available. Limited availability on this cross — some of the best lambs we've ever raised. Contact for details.",
    tags: [{ label: "Chess Not Checkers", type: "sire" }, { label: "Flush 🧬", type: "sale" }, { label: "Hampshire 🐑", type: "breed" }],
    sire_id: "s3", created_at: "6h ago", likes: 76, comments: 8, saved: false,
  },
  {
    id: "p4", image: images[3], breeder: breeders[3], post_type: "sire",
    caption: "Tres Amigos semen now available. This sire has produced multiple champions across the country. Limited units — contact for pricing and availability.",
    tags: [{ label: "Tres Amigos", type: "sire" }, { label: "Semen Available 🧪", type: "sale" }, { label: "Kentucky", type: "location" }],
    sire_id: "s4", created_at: "8h ago", likes: 213, comments: 31, saved: false,
  },
];
