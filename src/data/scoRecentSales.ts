export type ScoSaleSpecies = "Sheep" | "Goats" | "Cattle" | "Pigs";

export interface ScoRecentSale {
  id: string;
  name: string;
  date: string;
  location: string;
  host: string;
  link: string;
  species: ScoSaleSpecies;
}

export const SCO_RECENT_SALES: ScoRecentSale[] = [
  {
    "id": "sco-47929",
    "name": "Colburn Cattle Co. Frozen Genetics Sale",
    "date": "6/9/2026",
    "location": "CA",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47929",
    "species": "Cattle"
  },
  {
    "id": "sco-47918",
    "name": "Phat Head Farms Bred Gilt Online Sale",
    "date": "6/10/2026",
    "location": "OK",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47918",
    "species": "Pigs"
  },
  {
    "id": "sco-47651",
    "name": "Hummel Livestock Spring Born Wethers, Doe Kids & Semen Sale",
    "date": "6/9/2026",
    "location": "IL",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47651",
    "species": "Goats"
  },
  {
    "id": "sco-47793",
    "name": "Fricke Farms Spring Born Wether &  Doe Sale",
    "date": "6/9/2026",
    "location": "IL",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47793",
    "species": "Goats"
  },
  {
    "id": "sco-47847",
    "name": "KWL/Prickett \u201cSelect 6ix\u201d March Born Doe Kid Sale",
    "date": "6/9/2026",
    "location": "OK",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47847",
    "species": "Goats"
  },
  {
    "id": "sco-47926",
    "name": "Ceasefire Frozen Semen Sale",
    "date": "6/10/2026",
    "location": "KS",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47926",
    "species": "Sheep"
  },
  {
    "id": "sco-47931",
    "name": "Nathan Club Lambs Online Ewe Lamb Sale",
    "date": "6/10/2026",
    "location": "KS",
    "host": "SC Online Sales",
    "link": "https://www.sconlinesales.com/Bids/AuctionsListing/47931",
    "species": "Sheep"
  }
];
