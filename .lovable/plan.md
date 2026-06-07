# Backdrop — Design System Consistency Pass

Goal: every page feels like one app. Light-mode base, dark hero only on Breeders. Standardize tokens, header, bottom nav, cards, and typography. Fix Sires page. Polish Sales and Market.

## 1. Design tokens (single source of truth)

Update `src/index.css` and `tailwind.config.ts` with:

- `--background` → `#F8F7F4` (warm off-white)
- `--card` → `#FFFFFF`
- `--foreground` → `#0A1628` (deep navy)
- `--muted-foreground` → `#6B7280`
- `--border` → `#E5E7EB`
- `--divider-soft` → `#F3F4F6`
- `--primary` → `#1B3A6B` (navy)
- `--gold` → `#C9A84C`
- `--radius` → `12px`
- `--shadow-card` → `0 2px 8px rgba(0,0,0,0.08)`

Typography scale utilities:
- `.text-page-title` 28px bold navy
- `.text-section` 18px semibold navy
- `.text-card-title` 16px semibold navy
- `.text-body` 15px regular `#374151`
- `.text-meta` 13px `#6B7280`
- `.text-stat` 24px bold (navy or gold variant)

All existing semantic tokens stay — components don't need rewrites, just the token values shift.

## 2. Header & Bottom Nav

`MobileHeader.tsx`:
- White bg, bottom border `#E5E7EB`
- Navy wordmark left, Search + (Filter on directory pages) right
- Unauth: Join Free (navy pill) + Log In text
- Auth: notification bell + avatar

`MobileNav.tsx`:
- 6 tabs: Home | Winners | Sales | Breeders | Sires | Market (rename Sires from "Repo")
- Active: gold `#C9A84C` icon+label
- Inactive: `#9CA3AF`
- Add tap bounce via `active:scale-90 transition-transform`

## 3. Per-page changes

**Home** — keep. Live banner becomes white card pill with pulsing red dot + gold border. Add Share icon next to like/comment in `PostCard.tsx`.

**Winners** — keep cards. Add horizontal filter pills: All | Grand Champions | Reserve | Class Winners | By Breed.

**Sales** — keep live ticker concept. Restyle rows: money-bag icon, bold lot+price, right-aligned timestamp, soft dividers. Replace dropdowns with single "Filter & Sort" button → bottom sheet. Sale result rows: show name bold, date/location meta, indented lot rows with breeder left / price gold right.

**Breeders** — keep dark navy hero (`#0A1628`) with headline, search, stats. Below hero switch to light bg. Species tiles become white cards with navy text + gold count + soft shadow (not dark tiles). Update `BreedersPage.tsx` and `SpeciesHubPage.tsx` body sections.

**Sires (`/repo` → `/sires`)** — biggest fix:
- Remove broken placeholder image card
- Default to list view: horizontal rows (Apple Music style) — monogram avatar, sire name bold, breed + owner meta, green "SEMEN AVAILABLE" pill, chevron right
- Grid toggle: 2-col cards with monogram + name + top stat
- Add "Trending Sires" horizontal scroll row at top
- Fix `SirePhoto.tsx` placeholder to clean monogram avatar (no broken icon)

**Market** — add warm gradient hero "Buy. Sell. Connect." Category icons get tinted bg (Animals gold, Nutrition green, Supplies blue, Services purple). Add "Recently Listed" horizontal scroll row. Add gold FAB "Post a Listing" bottom-right above nav.

## 4. Universal card rules

Audit `PostCard`, `WinnerCard`, `HorizontalBreederCard`, `SireListRow`, `SireCardCatalog`, sales rows, market rows to all use:
- `bg-card` white
- `rounded-xl` (12px)
- `shadow-[var(--shadow-card)]`
- `p-4` internal
- Divider `#F3F4F6` between list items
- `active:bg-muted/50` press state

## 5. Transitions

- Cards: `animate-fade-in` on scroll entry (use existing keyframe)
- Bottom sheets: existing Sheet component already slides up — add `backdrop-blur-sm` to overlay
- Directory drill: wrap level pages in slide transition class

## Technical notes

- Token changes in `index.css` propagate automatically — most components untouched
- `SiresPage.tsx` currently exists separately from `RepoPage.tsx`; consolidate route so bottom nav `/sires` lands on the redesigned page
- Skip the authenticated-feed redesign — user offered, hasn't requested it yet
- No backend/data changes; pure presentation pass

## Out of scope

- Dark mode toggle (mentioned as future option, not building now)
- New authenticated home feed (user offered separately)
- Functional changes to filters, search, or data fetching
