export type ScoSaleSpecies = "Sheep" | "Goats" | "Cattle" | "Pigs";

export interface ScoRecentSale {
  id: string;
  name: string;
  date: string;
  location: string;
  host: string;
  link: string;
  species: ScoSaleSpecies;
  photo?: string;
}

export const SCO_RECENT_SALES: ScoRecentSale[] = [
  {
    id: "sco-47929",
    name: "Colburn Cattle Co. Frozen Genetics Sale",
    date: "6/9/2026",
    location: "CA",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47929",
    species: "Cattle",
    photo: "https://sco-media.azureedge.net/media-sm/2026/06/05/fbca58acfe664e958b2c29233a966f6e.jpg",
  },
  {
    id: "sco-47918",
    name: "Phat Head Farms Bred Gilt Online Sale",
    date: "6/10/2026",
    location: "OK",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47918",
    species: "Pigs",
    photo: "https://sco-media.azureedge.net/media-sm/2026/06/05/f9241b590e8a47878ee763fb00fa3c61.jpg",
  },
  {
    id: "sco-47651",
    name: "Hummel Livestock Spring Born Wethers, Doe Kids & Semen Sale",
    date: "6/9/2026",
    location: "IL",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47651",
    species: "Goats",
    photo: "https://sco-media.azureedge.net/media-sm/2026/05/08/3ff8c08c4deb46eb9d3faf394e3f694b.jpg",
  },
  {
    id: "sco-47793",
    name: "Fricke Farms Spring Born Wether \u0026  Doe Sale",
    date: "6/9/2026",
    location: "IL",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47793",
    species: "Goats",
    photo: "https://sco-media.azureedge.net/media-sm/2026/05/28/1dc9aef6f9944fb48e6a9bc37c3bc36f.jpg",
  },
  {
    id: "sco-47847",
    name: "KWL/Prickett \u201cSelect 6ix\u201d March Born Doe Kid Sale",
    date: "6/9/2026",
    location: "OK",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47847",
    species: "Goats",
    photo: "https://sco-media.azureedge.net/media-sm/2026/06/01/e25cfbefcd064a4f92b7ebd0bf2c6b3b.png",
  },
  {
    id: "sco-47926",
    name: "Ceasefire Frozen Semen Sale",
    date: "6/10/2026",
    location: "KS",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47926",
    species: "Sheep",
    photo: "https://sco-media.azureedge.net/media-sm/2026/06/06/0ef3617f166a49d1b541d2731a05e68e.jpg",
  },
  {
    id: "sco-47931",
    name: "Nathan Club Lambs Online Ewe Lamb Sale",
    date: "6/10/2026",
    location: "KS",
    host: "SC Online Sales",
    link: "https://www.sconlinesales.com/Bids/AuctionsListing/47931",
    species: "Sheep",
    photo: "https://sco-media.azureedge.net/media-sm/2026/06/06/305e576ffba044a4a535327c9e276cf4.jpg",
  },
];
