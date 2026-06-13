import { FilterChipDropdown } from "@/components/FilterChipDropdown";
import { useSpecies } from "@/contexts/SpeciesContext";
import type { SpeciesPill } from "@/components/SpeciesPills";

const SPECIES_OPTIONS: SpeciesPill[] = ["All", "Cattle", "Sheep", "Goats", "Pigs"];
const speciesLabel = (s: SpeciesPill) => (s === "All" ? "All Species" : s);

export function SpeciesChip() {
  const { species, setSpecies } = useSpecies();
  return (
    <FilterChipDropdown
      label="All Species"
      value={speciesLabel(species)}
      options={SPECIES_OPTIONS.map(speciesLabel)}
      defaultOption="All Species"
      onChange={(v) => {
        const found = SPECIES_OPTIONS.find((s) => speciesLabel(s) === v) ?? "All";
        setSpecies(found);
      }}
      align="start"
      width={200}
    />
  );
}
