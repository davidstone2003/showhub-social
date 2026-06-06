## Scope
Build the missing features only. Existing Home/Winners/Sales/Breeders/Sires/Market pages stay as-is. All new pages use hardcoded demo data (no new DB tables). New pages use the spec's blue (#1A4FB5) and green (#1A7A3A); existing pages keep their earth-tone tokens.

## Demo data file
Create `src/data/demoLambs.ts` with:
- 14 breeders (id, name, slug, location, color, wins, lambs_count, followers_count)
- 8 demo lambs (tag, breeder, sire ref, dam, sex, breed, color, dob, weight, for_sale, price, results[])
- 6+ show results
Sire references reuse existing `catalog_sires` rows by name (lookup helper).

## New routes
1. `/lamb/:tag` — **Public QR lamb profile** (no auth)
   - Top bar, photo placeholder, info chips, show results, sire card (with genotype badges), dam card, grandsire card, contact button, "Powered by Backdrop" footer.

2. `/breeder/:username` — **Add tabs** (Sires | Lambs | Results)
   - Edit existing `BreederProfilePage.tsx`: add a tab strip below the hero. Sires = filter `catalog_sires` by breeder name match. Lambs = grid from demo data. Results = existing winners list.

3. `/sire/:id` — **Add Semen Booking section**
   - Edit existing `SirePage.tsx`: if catalog row has `semen_available`, append a section with a date picker (shadcn Calendar), "$X per unit", "Order Semen" (green) + "Contact Breeder" (outlined) buttons. Submit shows a toast only (no backend).

4. `/dashboard` — **Breeder dashboard** (requires auth)
   - Welcome header, 4 quick stats, 4 quick-action buttons, recent activity list. Stats and activity are derived from existing `winners`/`posts` tables filtered by `user_id`.

5. `/dashboard/lambs/new` — **Lamb registration 3-step flow**
   - Step 1: tag, DOB, sex pills, breed pills, color pills, notes.
   - Step 2: sire picker (searches `catalog_sires`), dam text input, grandsire read-only.
   - Step 3: review + Save.
   - Success screen with "Register Next Lamb" and "View All Lambs" buttons.
   - State stored in component; on Save, append to localStorage `backdrop_demo_lambs` so newly registered lambs are visible at `/lamb/:tag` during the demo.

## Routing changes (`src/App.tsx`)
Add 4 routes: `/lamb/:tag`, `/dashboard`, `/dashboard/lambs/new`, `/dashboard/lambs`.

## Minor polish
- Sire catalog: confirm genotype badges render as 3 separate chips (already do — no change).
- Breeders directory: add a Follow/Following toggle (local state only, no DB).

## Files to create
- `src/data/demoLambs.ts`
- `src/pages/LambPublicPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/LambRegisterPage.tsx`
- `src/components/breeder/BreederTabs.tsx`
- `src/components/sire/SemenBookingSection.tsx`

## Files to edit
- `src/App.tsx` (routes)
- `src/pages/BreederProfilePage.tsx` (tabs)
- `src/pages/SirePage.tsx` (booking section)
- `src/pages/BreedersPage.tsx` (Follow toggle)

## Out of scope
- New DB tables (lambs, show_results, follows)
- QR code image generation (placeholder only)
- Photo uploads in lamb registration
- Print-all-tags PDF
- Switching app-wide design tokens
- Email/order processing for semen booking
