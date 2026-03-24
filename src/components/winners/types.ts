import type { PlacementSlot } from "@/lib/normalizePlace";

export interface SlotEntry {
  slot: PlacementSlot;
  exhibitor: string | null;
  breeder: string | null;
  image: string | null;
  filled: boolean;
}

export interface ShowBlock {
  showName: string;
  latestDate: string;
  location: string | null;
  species: string | null;
  slots: SlotEntry[];
  classResults: { placing: string; exhibitor: string; breeder: string | null }[];
}
