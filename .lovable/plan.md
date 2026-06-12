Apply 8 consistency fixes across the app. Each fix is scoped, mostly presentational, with one new submission form.

## Fix 1 — Species labels: All | Sheep | Goats | Cattle | Pigs
Audit and replace any remaining legacy labels ("Hair", "Hogs", etc.) across:
- `SpeciesPills` (already correct — verify)
- `breederTaxonomy.ts` species tiles (already correct)
- `BreedersPage`, `BreederCategoryPage`, `SpeciesHubPage`, any pill/filter row
Goal: identical ordering and wording everywhere.

## Fix 2 — Sires page
- Replace empty state with: headline "Sires Coming Soon", subline, and a "Submit a Sire" button.
- New route `/submit-sire` with a simple form (Sire Name, Breed, Owner/Operation, Semen Available, Species) writing to a new `sire_submissions` table.
- Seed 6 sire cards (Good Life, Chick Magnet, Pipas, Common Ground, On The Rocks, Smoke Bomb) shown as fallback when DB is empty; each: name, "Sheep" breed tag, green "SEMEN" badge, monogram avatar.

## Fix 3 — Sales empty state
- Replace "Source not yet updated" with "Results update daily at 6:00 AM CT" + last-updated timestamp.
- Add 3 seeded fallback sale-result cards so the page never looks empty.

## Fix 4 — Breeders page hero
- Remove dark navy hero background.
- Light background `#F8F7F4`, navy `#0A1628` text, gold stat numbers, same search bar.

## Fix 5 — Remind button color
- Upcoming sale "Remind" buttons: gold `#C9A84C` bg, navy `#0A1628` text.

## Fix 6 — Bottom nav contrast
- Active: gold `#C9A84C`, bold.
- Inactive: `#9CA3AF`, regular.
- Update `MobileNav`.

## Fix 7 — Species pill styling (universal)
- Active: solid navy `#1B3A6B` fill, white text, no border.
- Inactive: white fill, navy text, 1px navy border.
- Update `SpeciesPills` once; all pages inherit.

## Fix 8 — Page headers
- White bg, page title 28px bold navy, action icons right.
- Apply to Winners, Sales, Sires, Breeders, Repo, Market headers.
- Exception: Home feed keeps current header.

## Technical
- Migration: `sire_submissions` table (sire_name, breed, owner, semen_available, species, submitted_by, created_at) with RLS + grants. Authenticated users insert; service_role full; admins read.
- Add `/submit-sire` route + page.
- Hardcoded hex values used here are translated to the existing semantic tokens in `index.css` where possible; only introduce new tokens if the existing palette can't express them.

## Out of scope
Authentication/profiles work (offered as follow-up).
