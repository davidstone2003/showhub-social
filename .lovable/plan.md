## Goal

Make Backdrop's directory pages (Winners, Sales, Sires, Breeders) show each real-world event exactly once, no matter how many places it came from (daily scrape, breeder post, exhibitor post). The home feed stays untouched — every post still shows there.

## Architecture

Two layers, already partially in place:

```text
SOURCES                       MATCHING                CANONICAL RECORDS         SURFACES
- scraped_results       ─┐                            ┌─ winners (canonical)    Winners page (1 card + "N posts")
- scraped_upcoming       │                            │
- posts (winner-tagged)  ├─►  match_event() ────────► ├─ sale_records           Sales page (1 card + "N posts")
- posts (sale-tagged)    │    (fuzzy + date window)   │
- winners (legacy)      ─┘                            └─ event_links            Home feed (all posts, unchanged)
```

A new `event_links` table connects every source row (scrape, post, winner) to a single `canonical_event_id`. Directory pages render canonical events; the feed renders posts.

## Database changes (one migration)

1. `canonical_events` — one row per real-world win/sale.
   - `kind` ('winner' | 'sale')
   - `show_name`, `show_name_normalized`
   - `event_date` (date), `species`, `placement_slot` (null for sales)
   - `breeder_name`, `breeder_name_normalized`
   - `verified_level` ('none' | 'exhibitor' | 'breeder')
   - `best_image_url`, `best_source_id`, `post_count`
2. `event_links` — `(canonical_event_id, source_type, source_id)` unique. `source_type` in ('scrape_result','scrape_upcoming','winner','post').
3. `event_aliases` — known short→long show name pairs (seed: OSF↔Ohio State Fair, NAILE, AKSARBEN, etc.) used by the matcher.
4. RPC `public.match_or_create_event(...)` — security definer; runs the fuzzy match (normalized names + 3-day window + species + placement) and returns the canonical id, inserting if no match.

All tables get the required GRANTs + RLS (public SELECT on canonical_events/event_links; service_role write).

## Matching rules

`normalize(name)` = lowercase, strip punctuation, collapse spaces, apply alias map, drop years.

Match if ALL true:
- same `kind`
- `normalized` show names equal OR one is a known alias of the other OR trigram similarity ≥ 0.75
- `abs(date1 - date2) ≤ 3 days`
- same species (or one is null)
- for winners: same `placement_slot`
- breeder name normalized matches OR one is null

Outcomes:
- **no match** → insert canonical, link source, verified_level from source
- **scrape ↔ user post** → user post wins: update canonical's `best_image_url` to user photo, bump `verified_level` to breeder/exhibitor, link both sources
- **multiple user posts** → keep canonical, link each post, increment `post_count`, upgrade verified_level if a breeder post arrives

## Code changes

1. **Edge function `scrape-sales-daily`** — after each scrape row insert, call `match_or_create_event` and insert into `event_links`.
2. **Edge function `match-event` (new)** — invoked from client when a post is created with structured winner/sale fields. Does the same RPC call so user posts join the canonical graph.
3. **`SubmitWinnerPage` + post-create flow** — already collects show/date/placement/breeder/species. After insert, call `match-event`.
4. **`WinnersPage` / `WinnersTab`** — query `canonical_events kind='winner'` joined with `event_links` for `post_count` and the best source row for display. Replace the current "group by show_name" logic with one card per canonical event. Add the "N posts about this" expandable that lists linked posts inline.
5. **`SalesPage`** — same pattern for `kind='sale'`. Replace dedupe-by-(name,date) string logic with canonical_events query.
6. **Verified badge** — small gold/silver pip in the corner of `WinnerCard` / sales card, driven by `verified_level`.

## Out of scope for this pass

- Sires and Breeders directories: they aggregate by breeder/sire identity, not by event, so they inherit dedup for free once Winners is canonical. No structural change needed; just confirm their queries pull from canonical_events.
- Backfill of historical rows: handled by a one-shot SQL script after the schema lands (mentioned, not built here).
- Manual "merge / unmerge" admin tools — follow-up.

## Question before I build

This is a meaningful schema + matcher change. Want me to ship the whole thing in one pass, or land it in two PRs: (1) schema + matcher + scrape integration, then (2) post-create integration + UI badges + "N posts" expander?
