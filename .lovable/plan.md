## Goal
Replace per-page species pills and inline filter dropdowns with a single global species switcher (header + sidebar) and a single "Filters ▼" popover per directory page.

## 1. Global species preference

**New context:** `src/contexts/SpeciesContext.tsx`
- Provides `{ species: SpeciesPill, setSpecies(s) }`.
- Source of truth order: `profiles.preferred_species` (when logged in) → `localStorage.backdrop_species` → `"All"`.
- On `setSpecies`: update state, write localStorage, and (if user) update `profiles.preferred_species`.
- Mounted in `App.tsx` above the router (inside `AuthProvider`).

**Migration:** add `preferred_species text null` to `public.profiles`. No grant changes needed (column on existing table).

## 2. Global switcher component

**New:** `src/components/GlobalSpeciesSwitcher.tsx`
- Compact pill: `🐑 Sheep ▼` / `🐄 Cattle` / `🐐 Goats` / `🐖 Pigs` / `🌐 All Species`.
- Radix Popover dropdown with the 5 options; gold check on selected.
- Reads/writes the SpeciesContext.

**Placement:**
- `MobileHeader.tsx`: inserted to the left of `NotificationBell` (root pages) / always visible. Sized to match header (h-9, 12px font).
- `DesktopSidebar.tsx`: inserted under logo, above nav.

## 3. Page wiring (consume context, drop local pills)

`WinnersPage.tsx`, `SiresPage.tsx`, `BreedersPage.tsx`, `SalesPage.tsx`, `MarketPage.tsx`:
- Remove `<SpeciesPills>` row and local `species` state.
- Replace with `const { species } = useSpecies()`.
- Keep `matchesSpecies(...)` calls unchanged.
- MarketPage: replace its bespoke species dropdown the same way.

`SpeciesPills.tsx` stays only for `SPECIES_OPTIONS`, `SpeciesPill`, `matchesSpecies` exports (still used by `SubmitSirePage`). The visual `SpeciesPills` component is removed or left unused.

## 4. Single "Filters ▼" control per directory

**New:** `src/components/FiltersPopover.tsx` — generic anchored popover that takes a list of `{ key, label, options, value, onChange }` selects + a "Clear all" link. Renders a gold count badge on the trigger when `activeCount > 0`. Active filters render as removable chips below the row (handled by each page using existing chip styles).

**Per page filter sets:**
- Winners: Show Level, Year, State, Breeder
- Sires: Semen Available, Owner
- Breeders: State
- Sales / Market: keep existing non-species filters behind the same Filters popover (smallest viable list — Sales: Sale Type / State; Market: Category / State) so the rule "search + one Filters button" holds.

Each page renders only: compact title, then a row with `[Search] [Filters ▼ (badge)]`, then optional active-filter chips, then content. Existing tabs (Winners Current Season / All Results) are preserved.

## 5. Onboarding step

`OnboardingPage.tsx`: insert a "What do you show?" screen before the breeder/vendor form with 5 buttons (Cattle, Sheep, Goats, Pigs, A bit of everything). Selection writes to local state and is sent in the same `profiles.update({ preferred_species })` call as the existing onboarding submit. Default if skipped: null (= All).

## 6. Out of scope
No changes to header CTAs, bottom nav, ribbons/photos, post composer, current-season vs all-results logic, or gold-selected styling.

## Files

**Created**
- `src/contexts/SpeciesContext.tsx`
- `src/components/GlobalSpeciesSwitcher.tsx`
- `src/components/FiltersPopover.tsx`
- migration: add `profiles.preferred_species`

**Edited**
- `src/App.tsx` (mount provider)
- `src/components/MobileHeader.tsx`, `src/components/DesktopSidebar.tsx`
- `src/pages/WinnersPage.tsx`, `SiresPage.tsx`, `BreedersPage.tsx`, `SalesPage.tsx`, `MarketPage.tsx`
- `src/pages/OnboardingPage.tsx`
- `src/contexts/AuthContext.tsx` (add `preferred_species` to Profile type)
