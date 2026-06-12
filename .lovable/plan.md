# Global UI Consistency Refactor

Consolidate the app onto one shared layout system across Home, Winners, Sales, Breeders, Sires, and Market. Preserve current brand (navy #0A1628 / #1B2A4A, gold #C9A84C, cream #F8F7F4). No routing, data, or backend changes.

## New shared components

Create under `src/components/shared/`:

1. **`PageHeader.tsx`** — dark navy band beneath the top app bar.
   - Props: `title`, `view?`, `onViewChange?`, `createButton?: ReactNode`, `onSearch?: (q: string) => void`, `searchPlaceholder?`.
   - Layout: title left; right cluster in fixed order — Search icon (expands inline within the band, collapses on blur/empty + Esc), optional List/Grid toggle, optional CreateButton slot.
   - Height ~56px, sticky under top app bar where pages already sticky-stack.

2. **`FilterBar.tsx`** — white band directly under PageHeader.
   - Row 1 slot: chip row (species OR Market category chips). Uses a single `Chip` style: inactive = white pill + navy outline + navy text; active = solid navy + white text. Removes gold-active variant.
   - Row 2 slot: dropdowns. Enforces max 3 visible; if more passed, renders first 2 + a "Filters" button that opens a bottom sheet (shadcn `Sheet` side=bottom) listing all remaining filters with an Apply action.
   - Exports `FilterChip`, `FilterDropdown` subcomponents so each page wires its own options.

3. **`CreateButton.tsx`** — compact gold pill with `+` icon + label.
   - Hidden when `useAuth()` user is null. No disabled state for logged-out.
   - Collapses to icon-only at <360px via responsive class.
   - Accepts `to` (Link) OR `onClick` (menu). For Home, renders a popover menu (New post / New reel).

4. **`shared/Card.tsx`** — base card: `rounded-xl border border-border bg-card shadow-[var(--shadow-card)]`, padding tokens, image aspect-ratio helper. Winner/sale/sire/market list cards re-use it.

5. **`shared/SectionLabel.tsx`** — uppercase tracked-wider 12px gray label for result counts and section headers. One style: `text-[12px] font-bold uppercase tracking-wider text-muted-foreground`.

## Per-page changes

- **Home (`src/pages/Index.tsx`)**: Add `<PageHeader title="Home" createButton={<CreateButton menu />}>`. Delete floating gold `+` FAB. Delete the "Post a Reel" tile from `ReelsStrip` (leave existing reel thumbnails). Verify bottom nav uses dark navy variant — adjust `MobileNav` so it does not lighten on `/` route.
- **WinnersPage**: PageHeader (title "Winners", CreateButton "+ Add win" → `/submit`). Move season tabs above FilterBar, restyle to gold-underline. FilterBar: species row + 2 dropdowns (Level, Year) + Filters sheet for State + Breeder. Remove its own FAB.
- **SalesPage**: PageHeader (title "Sales", CreateButton "+ Add sale"). FilterBar with species chips on WHITE band — fix existing dark band chips. Use shared chip style (no gold active).
- **BreedersPage**: PageHeader (title "Breeders", grid/list toggle, no CreateButton). FilterBar with species + ≤3 dropdowns.
- **SiresPage**: PageHeader (title "Sires", grid/list toggle, "+ Add sire" CreateButton). Remove inline `Search` input from body and the "+ Submit" button next to "All Sires". FilterBar with species + Owner + Semen Available (2 dropdowns + chip toggle fits within 3).
- **MarketPage**: PageHeader (title "Market", grid/list toggle, "+ Post listing"). FilterBar: Row 1 = Stock / Nutrition / Show Supplies / Services chips (shared style). Row 2 = Species, State, Price. Remove floating "+ Post a Listing" pill.

## Deletions / removals

- Floating `+` FAB block in `src/pages/Index.tsx`.
- Floating create pill in `src/pages/MarketPage.tsx`.
- Inline `+ Submit` Link in SiresPage catalog header.
- Standalone search `<input>` block in SiresPage body.
- "Post a Reel" tile in `src/components/ReelsStrip.tsx`.
- Any per-page FABs found in Winners/Sales.

## Bottom nav fix

Audit `MobileNav.tsx` — ensure background is always navy `#0A1628`, active = gold `#C9A84C`, inactive = `#6B7280`. Remove any route-based theming. Confirm Home uses identical instance.

## Acceptance verification

After edits: open `/`, `/winners`, `/sales`, `/breeders`, `/sires`, `/market` in preview at 390px viewport, screenshot each, and confirm checklist (no FABs, identical header, chip parity, ≤3 dropdowns, dark nav on Home).

## Out of scope

- No routing changes, no schema or query changes, no copy changes beyond create-button labels, no new brand colors.
