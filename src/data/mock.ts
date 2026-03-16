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

export interface Post {
  id: string;
  image: string;
  breeder: Breeder;
  caption: string;
  tags: { label: string; type: string }[];
  sire_id?: string;
  created_at: string;
  likes: number;
  saved: boolean;
}

export const breeders: Breeder[] = [
  { id: "b1", name: "Iron Oak Livestock", location: "Stephenville, TX", logo: "🐑", is_pro: true },
  { id: "b2", name: "Ridgeline Club Lambs", location: "Stillwater, OK", logo: "🏔️", is_pro: true },
  { id: "b3", name: "Herd & Wool Co.", location: "Des Moines, IA", logo: "🐏", is_pro: false },
  { id: "b4", name: "Summit Show Stock", location: "San Angelo, TX", logo: "⛰️", is_pro: true },
  { id: "b5", name: "Prairie Fire Genetics", location: "Manhattan, KS", logo: "🔥", is_pro: false },
  { id: "b6", name: "Blue Ribbon Ranch", location: "Columbus, OH", logo: "🎗️", is_pro: true },
];

export const sires: Sire[] = [
  { id: "s1", name: "Iron Throne", breeder_id: "b1", photo: "" },
  { id: "s2", name: "Ridge Runner", breeder_id: "b2", photo: "" },
  { id: "s3", name: "Thunder Road", breeder_id: "b3", photo: "" },
  { id: "s4", name: "Summit Peak", breeder_id: "b4", photo: "" },
  { id: "s5", name: "Blaze", breeder_id: "b5", photo: "" },
];

const lambImages = [
  "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1605726439061-30d0dab29cba?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580377968131-75a35ac6577b?w=800&h=600&fit=crop&q=80",
];

export const posts: Post[] = [
  {
    id: "p1", image: lambImages[0], breeder: breeders[0],
    caption: "This Iron Throne son is putting it all together heading into Fort Worth. Built like a tank with the look to match.",
    tags: [{ label: "Iron Throne", type: "sire" }, { label: "Fort Worth Stock Show", type: "show" }, { label: "Hampshire", type: "breed" }],
    sire_id: "s1", created_at: "2h ago", likes: 142, saved: false,
  },
  {
    id: "p2", image: lambImages[1], breeder: breeders[1],
    caption: "Ridge Runner daughters are bringing the bone and presence we're after. Ready for San Antonio.",
    tags: [{ label: "Ridge Runner", type: "sire" }, { label: "San Antonio", type: "show" }, { label: "Southdown", type: "breed" }],
    sire_id: "s2", created_at: "4h ago", likes: 98, saved: true,
  },
  {
    id: "p3", image: lambImages[2], breeder: breeders[2],
    caption: "Fresh off the shears and feeling good about this set of wether prospects. Thunder Road x our best Hamp ewes.",
    tags: [{ label: "Thunder Road", type: "sire" }, { label: "Hampshire", type: "breed" }, { label: "Club Lambs", type: "type" }],
    sire_id: "s3", created_at: "6h ago", likes: 76, saved: false,
  },
  {
    id: "p4", image: lambImages[3], breeder: breeders[3],
    caption: "Summit Peak is stamping his lambs with muscle shape and presence. This ewe lamb is special.",
    tags: [{ label: "Summit Peak", type: "sire" }, { label: "Shropshire", type: "breed" }, { label: "For Sale", type: "type" }],
    sire_id: "s4", created_at: "8h ago", likes: 213, saved: false,
  },
  {
    id: "p5", image: lambImages[4], breeder: breeders[4],
    caption: "Blaze lambs hitting the ground running. This cross on our Dorset ewes is exactly what we were hoping for.",
    tags: [{ label: "Blaze", type: "sire" }, { label: "Dorset", type: "breed" }, { label: "Prairie Fire Genetics", type: "breeder" }],
    sire_id: "s5", created_at: "12h ago", likes: 55, saved: false,
  },
  {
    id: "p6", image: lambImages[5], breeder: breeders[5],
    caption: "National Western champion prospect. Blue Ribbon genetics at their finest.",
    tags: [{ label: "National Western", type: "show" }, { label: "Suffolk", type: "breed" }, { label: "Champion", type: "type" }],
    created_at: "1d ago", likes: 324, saved: true,
  },
  {
    id: "p7", image: lambImages[6], breeder: breeders[0],
    caption: "Sale day at Iron Oak. These wethers are ready to compete at the highest level.",
    tags: [{ label: "Iron Oak Sale", type: "sale" }, { label: "Wethers", type: "type" }, { label: "Stephenville, TX", type: "location" }],
    created_at: "1d ago", likes: 189, saved: false,
  },
  {
    id: "p8", image: lambImages[7], breeder: breeders[1],
    caption: "Ridgeline spring drop is looking incredible. Ridge Runner x our foundation ewes.",
    tags: [{ label: "Ridge Runner", type: "sire" }, { label: "Spring Lambs", type: "type" }, { label: "Stillwater, OK", type: "location" }],
    sire_id: "s2", created_at: "2d ago", likes: 167, saved: false,
  },
];
