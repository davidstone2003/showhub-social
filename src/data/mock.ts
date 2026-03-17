import compassSire from "@/assets/posts/compass-sire.jpeg";
import brandSaleDay from "@/assets/posts/brand-sale-day.jpeg";
import beattyThankyou from "@/assets/posts/beatty-thankyou.jpeg";
import whitcombFlush from "@/assets/posts/whitcomb-flush.jpeg";
import beattySale from "@/assets/posts/beatty-sale.jpeg";
import stoneIndianaFair from "@/assets/posts/stone-indiana-fair.jpeg";
import stoneHoustonRodeo from "@/assets/posts/stone-houston-rodeo.jpeg";
import stoneHotGrandchamp from "@/assets/posts/stone-hot-grandchamp.jpeg";
import stoneBringHeat from "@/assets/posts/stone-bring-heat.jpeg";

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

export type PostType = "lamb" | "champion" | "sire" | "sale" | "hauler" | "flush" | "event";

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
  { id: "b1", name: "Silvers Livestock", location: "Texas", logo: "🐑", is_pro: true },
  { id: "b2", name: "The Brand Sale", location: "Webster City, Iowa", logo: "🏷️", is_pro: true },
  { id: "b3", name: "Beatty's Club Lambs", location: "Indiana, PA", logo: "🏆", is_pro: true },
  { id: "b4", name: "Whitcomb Club Lambs", location: "Illinois", logo: "🐏", is_pro: true },
  { id: "b5", name: "Allen Newcomb Show Lambs", location: "Oklahoma", logo: "🎯", is_pro: false },
  { id: "b6", name: "Stone Show Stock", location: "Georgia", logo: "🪨", is_pro: true },
];

export const sires: Sire[] = [
  { id: "s1", name: "Compass", breeder_id: "b1", photo: "" },
  { id: "s2", name: "2.0", breeder_id: "b1", photo: "" },
  { id: "s3", name: "Beast", breeder_id: "b5", photo: "" },
  { id: "s4", name: "Trifecta", breeder_id: "b4", photo: "" },
];

export const animals: Animal[] = [
  {
    id: "a1", name: "Compass", breed: "Club Lamb",
    sire: "2.0", dam: "Gas Monkey", dob: "Jan 2024",
    weight: "140 lbs", breeder: breeders[0], photos: [compassSire],
    price: "Contact", status: "Reference",
    description: "2.0 x Beast x Gas Monkey. Headed in the right direction. Owned with Silvers Livestock.",
    tags: [{ label: "Compass", type: "sire" }, { label: "Club Lamb", type: "breed" }],
  },
];

export const filterCategories = [
  "🔥 HOT",
  "🏆 WINNERS",
  "💰 SALE",
  "⏱ CLOSING",
];

export const posts: Post[] = [
  {
    id: "p1", image: compassSire, breeder: breeders[0], post_type: "sire",
    caption: "COMPASS 🧭\n2.0 x Beast x Gas Monkey\n\nHeaded in the right direction. Owned with Silvers Livestock. Raised by Allen Newcomb Show Lambs & Treadmills.\n\n📞 Sam 830.234.7021 | Ty 580.225.2679 | Cooper 580.821.2361",
    tags: [{ label: "Compass", type: "sire" }, { label: "Club Lamb 🐑", type: "breed" }, { label: "For Sale 💰", type: "sale" }],
    sire_id: "s1", created_at: "2h ago", likes: 247, comments: 34, saved: false,
  },
  {
    id: "p2", image: brandSaleDay, breeder: breeders[1], post_type: "event",
    caption: "🔥 THE BRAND — SALE DAY 🔥\nMarch 6 & 7, 2026 • Webster City, Iowa\n\nCustomer Appreciation Sale\nSelling 120+ Decembers from 80+ Consignors\n\n8am: Viewing & Donuts sponsored by DuraFerm\n10am: Sale Starts • Food Truck: Texas Toast & Tots\n\n📞 Charlie: 515.351.2070 | Tanner: 928.285.8975\n📍 2268 Neely Ave, Webster City, Iowa",
    tags: [{ label: "Sale Previews 📅", type: "sale" }, { label: "December Lambs", type: "breed" }, { label: "For Sale 💰", type: "sale" }],
    created_at: "5h ago", likes: 389, comments: 56, saved: false,
  },
  {
    id: "p3", image: beattyThankyou, breeder: breeders[2], post_type: "event",
    caption: "Thank you for your support! 💙\n\nWhat an incredible turnout this year. We are so grateful for each and every one of you who came out, bid, and believed in our program. This community is everything.\n\nSee you next time! 🐑",
    tags: [{ label: "Recent Winners 🏆", type: "sale" }, { label: "Club Lamb 🐑", type: "breed" }],
    created_at: "8h ago", likes: 512, comments: 89, saved: false,
  },
  {
    id: "p4", image: whitcombFlush, breeder: breeders[3], post_type: "flush",
    caption: "🧬 ONLINE FLUSH SALE — March 16\n\nLot 1: Trifecta x Perry x Sundown\nLot 2: Trifecta x Perry x Sundown\nLot 3: Trifecta x Perry x Sundown\n\nSelling via NXT GEN Online Sales\n\n📞 Jared Whitcomb: 217.737.3122",
    tags: [{ label: "Flush 🧬", type: "sale" }, { label: "Trifecta", type: "sire" }, { label: "For Sale 💰", type: "sale" }],
    sire_id: "s4", created_at: "12h ago", likes: 178, comments: 22, saved: false,
  },
  {
    id: "p5", image: beattySale, breeder: breeders[2], post_type: "sale",
    caption: "Tomorrow! March 15th 🐑\n\nAll January born wethers + ewes selling:\n• Private Bid Link\n• Pen Sale at the Farm\n📍 Indiana, PA\n\nDon't miss out on some of our best January lambs yet!",
    tags: [{ label: "For Sale 💰", type: "sale" }, { label: "Private Treaty 📄", type: "sale" }, { label: "Club Lamb 🐑", type: "breed" }],
    created_at: "1d ago", likes: 334, comments: 47, saved: false,
  },
];
