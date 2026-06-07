import type { CatalogSire } from "@/pages/SireCatalogPage";

// Real data scraped from championdrive.com/stud-ram-showcase/ (2026 listings)
// Photos served directly from championdrive.com CDN.

const ACCENTS = [
  "#1A4FB5",
  "#1A7A3A",
  "#B5651D",
  "#7A1A4F",
  "#1A1A2E",
  "#4F1A7A",
  "#0F766E",
  "#9A3412",
  "#0E7490",
  "#7C2D12",
  "#3F6212",
  "#6D28D9",
];

const BREEDER_SITES: Record<string, string | null> = {
  "Beatty": "beattysclublambs.com",
  "Estes": "estesshowlambs.com",
  "Allen/Newcomb": "allenshowlambs.com",
  "Garrett Goodwin": "garrettgoodwinlivestock.com",
  "RCE Livestock": null,
  "Fairley": "fairleyfarms.com",
  "HC": "hcshowstock.com",
  "Diamond C Genetics": "diamondcclublambs.com",
  "Diamond C Livestock": "diamondcclublambs.com",
  "Double F": "doublefclublambs.com",
  "May Valley": "mayeclublambs.com",
  "Lautenschlager": null,
  "Platinum/Shelton": "platinumsheltonlivestock.com",
  "MacLennan": "maclennanclublambs.com",
  "Hassebrook": "hassebrookshowlambs.com",
  "Balfanz": "balfanzclublambs.com",
  "Prunty/Dyer": "pruntydyerclublambs.com",
  "Nathan": "nathanclublambs.com",
  "Amstutz": "amstutzshowlambs.com",
  "Silver Smith": "silversmithgenetics.com",
  "Rookstool": "rookstoolshowstock.com",
  "Zerbach": null,
  "Hobbs": "hobbsshowlambs.com",
  "Molitor": "molitorclublambs.com",
  "ET Livestock": null,
  "Dale Family": "daleclublambs.com",
  "McCoon": "mccoonclublambs.com",
  "Neff": "nefflivestock.com",
  "Hindman": "hindmanshowlambs.com",
};

interface Raw {
  name: string;
  pedigree: string;
  owned: string;
  bred: string;
  semen: boolean;
  photo: string;
}

const RAW: Raw[] = [
  { name: "All Rise", pedigree: "Unfiltered x Saban", owned: "Beatty, Casciano, Kirschner", bred: "Beatty", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_AllRise.jpg" },
  { name: "Beth", pedigree: "Company Man x King Arthur", owned: "Estes, Kennedy-Robertson", bred: "Estes", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_Beth3.jpg" },
  { name: "Chain Of Command", pedigree: "Behind Enemy Lines x Unicorn", owned: "Allen/Newcomb, RSC", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_ChainOfCommand.jpg" },
  { name: "Chaos", pedigree: "Behind Enemy Lines x Springbreak", owned: "Garrett Goodwin, Schminke", bred: "Garrett Goodwin", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Chaos.jpg" },
  { name: "Chick Magnet", pedigree: "Unicorn x Rumor Mill", owned: "RCE Livestock", bred: "RCE Livestock", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/06/SRS_ChickMagnet.jpg" },
  { name: "Dark Side", pedigree: "Switch Blade Sam x Chief", owned: "Fairley", bred: "Fairley", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_DarkSide.jpg" },
  { name: "Delbert", pedigree: "Company Man x Puppet Master", owned: "Estes", bred: "Estes", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Delbert.jpg" },
  { name: "El Hefe", pedigree: "Tres Amigos x Truce", owned: "HC, Upperhand, Allen/Newcomb", bred: "HC", semen: false, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_ElHefe.jpg" },
  { name: "El Toro Loco", pedigree: "Ride Time x Truce", owned: "Garrett Goodwin", bred: "Garrett Goodwin", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_ElToroLoco.jpg" },
  { name: "Final Call", pedigree: "Never Say Never x Thunder", owned: "Diamond C Livestock", bred: "Diamond C Genetics", semen: false, photo: "https://championdrive.com/wp-content/uploads/2026/03/FinalCall-SRS.gif" },
  { name: "Final Say", pedigree: "Never Say Never x Gable", owned: "Beatty, Double F", bred: "Double F", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/finalsay-may2026.jpg" },
  { name: "Front Line", pedigree: "Behind Enemy Lines x Unicorn", owned: "Allen/Newcomb, Rule", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_FrontLine.jpg" },
  { name: "Front Runner", pedigree: "Behind Enemy Lines x Pegasus", owned: "Upperhand, Allen/Newcomb", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/Front-runner-final.jpeg" },
  { name: "Fundido", pedigree: "Hit Stick x Ceasefire", owned: "Beatty, May Valley", bred: "May Valley", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/fundido.jpg" },
  { name: "Get On Board", pedigree: "Follow Me x Saban", owned: "Fairley", bred: "Fairley", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_GetOnBoard-Fairley.jpg" },
  { name: "Good Life", pedigree: "Thank Me Later x Big City", owned: "Burch", bred: "Lautenschlager", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/06/SRS_GoodLife.jpg" },
  { name: "Google Me", pedigree: "Behind Enemy Lines x Unicorn", owned: "Platinum/Shelton, Hobbs", bred: "Platinum/Shelton", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_GoogleMe.jpg" },
  { name: "High Value Target", pedigree: "Behind Enemy Lines x Unicorn", owned: "Allen/Newcomb, Southern Plains Genetics", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_HighValueTarget.jpg" },
  { name: "Hittin' Bombs", pedigree: "Sonar x American Outlaw x Hot Mess", owned: "Harms", bred: "MacLennan", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_HittinBombs.jpg" },
  { name: "Hole In One", pedigree: "Tres Amigos x Road Warrior", owned: "Beatty, Hoeing/Hill", bred: "Hassebrook", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/holeinone.jpg" },
  { name: "Konvict", pedigree: "White Mocha x Smack", owned: "Stardust, Harvey Larosh, Erickson Family", bred: "Balfanz", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/03/konvict-srs-final-web.jpg" },
  { name: "Landman", pedigree: "Holy Smoke x Close Enough", owned: "Prunty/Dyer", bred: "Prunty/Dyer", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Landman.jpg" },
  { name: "Loyalty", pedigree: "Contagious x Truce", owned: "Nathan, Pruitt", bred: "Nathan", semen: false, photo: "https://championdrive.com/wp-content/uploads/2026/01/SRS_Loyalty.jpg" },
  { name: "Narcan", pedigree: "Behind Enemy Lines x Deuces Wild", owned: "Amstutz, Cox", bred: "Amstutz", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_Narcan.jpg" },
  { name: "Never A Doubt", pedigree: "Never Say Never x Frog", owned: "Allen/Newcomb, Newsom, Flanagan", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_NeverADoubt.jpg" },
  { name: "Never Back Down", pedigree: "Never Say Never x Chewbacca", owned: "Allen/Newcomb, Amthauer, Williams", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_NeverBackDown.jpg" },
  { name: "Now Or Never", pedigree: "Never Say Never x Thunder", owned: "Diamond C Genetics, Hobbs", bred: "Diamond C Genetics", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_NowOrNever.jpg" },
  { name: "On The Rocks", pedigree: "Twice The Ice x Bezos", owned: "Knepper", bred: "Silver Smith", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/06/SRS_OnTheRocks.jpg" },
  { name: "Paloma", pedigree: "Behind Enemy Lines x Unicorn", owned: "Olson, Allen/Newcomb", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Paloma.jpg" },
  { name: "Paradise City", pedigree: "Canseco x Bob Ross", owned: "Rookstool", bred: "Rookstool", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/01/SRS_ParadiseCity.jpg" },
  { name: "Pendleton", pedigree: "Chief x Wizard x Popcorn", owned: "Zerbach, Burch, Nathan", bred: "Zerbach", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Pendleton.jpg" },
  { name: "Picture Perfect", pedigree: "Behind Enemy Lines x Chief", owned: "RCE Livestock", bred: "RCE Livestock", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/06/SRS_PicturePerfect.jpg" },
  { name: "Pipas", pedigree: "Under The Radar x Saban", owned: "Diamond C Genetics, Diamond C Livestock", bred: "Diamond C Genetics", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/06/SRS_Pipas3.jpg" },
  { name: "PowWow", pedigree: "Chief x Chief", owned: "Estes, D.K Farms", bred: "Estes", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_PowWow.jpg" },
  { name: "Prep", pedigree: "Little Dale x Robin-Hood x Shark", owned: "Estes, Silvers, Kennedy", bred: "Estes", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Prep.jpg" },
  { name: "Proxy War", pedigree: "Behind Enemy Lines x How High", owned: "Molitor, Burch, CLM", bred: "Molitor", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_ProxyWar.jpg" },
  { name: "Scooter", pedigree: "Tres Amigos x Blindside", owned: "Beatty, Harrell", bred: "Beatty", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/scooter.jpg" },
  { name: "Smoke Bomb", pedigree: "Holy Smokes x Glitterbomb", owned: "Hobbs, Long", bred: "Hobbs", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_Smokebomb.jpg" },
  { name: "Strikeforce", pedigree: "Behind Enemy Lines x Truce", owned: "Garrett Goodwin, Schminke", bred: "Garrett Goodwin", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Strikeforce.jpg" },
  { name: "Stylebender", pedigree: "Ride Time x GOAT", owned: "ET Livestock", bred: "Dale Family", semen: true, photo: "https://championdrive.com/wp-content/uploads/2024/06/SRS_Stylebender.jpg" },
  { name: "Swan Song", pedigree: "Alliance x Little Berry", owned: "McCoon", bred: "McCoon", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_SwanSong.jpg" },
  { name: "Tariff", pedigree: "2.0hh x Saban", owned: "Neff, Allen/Newcomb", bred: "Neff", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_Tariff-v2.jpg" },
  { name: "The Cat's Meow", pedigree: "Behind Enemy Lines x Chief", owned: "RCE Livestock", bred: "RCE Livestock", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/06/the-cats-meow-srs.jpg" },
  { name: "Tomahawk", pedigree: "Behind Enemy Lines x Mythical", owned: "Williams Family, Wilson Show Stock, Simpson (OK), Allen/Newcomb", bred: "Allen/Newcomb", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_Tomahawk-v2.jpg" },
  { name: "Try Me", pedigree: "Tres Amigos x Unicorn", owned: "Hindman", bred: "Hindman", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/04/SRS_TryMe-v3.jpg" },
  { name: "Turn The Page", pedigree: "Follow Me x Compton", owned: "Fairley, Bacon", bred: "Fairley", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_TurnThePage.jpg" },
  { name: "Windtalker", pedigree: "Under the Radar x Navajo", owned: "Diamond C Livestock", bred: "Diamond C Livestock", semen: true, photo: "https://championdrive.com/wp-content/uploads/2026/05/SRS_Windtalker.jpg" },
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const breederMap = new Map<string, { id: string; name: string; accent_color: string; website: string | null }>();
RAW.forEach((r) => {
  const primary = r.bred.split(",")[0].trim();
  if (!breederMap.has(primary)) {
    const idx = breederMap.size;
    breederMap.set(primary, {
      id: slug(primary),
      name: primary,
      accent_color: ACCENTS[idx % ACCENTS.length],
      website: BREEDER_SITES[primary] ?? null,
    });
  }
});

export const CHAMPION_DRIVE_SIRES: CatalogSire[] = RAW.map((r) => {
  const primary = r.bred.split(",")[0].trim();
  const breeder = breederMap.get(primary)!;
  return {
    id: slug(r.name),
    sire_name: r.name,
    pedigree: r.pedigree,
    notes: null,
    genotype: null,
    semen_available: r.semen,
    price: null,
    ownership: `Owned by ${r.owned}`,
    photo_url: r.photo,
    breeder,
  };
});
