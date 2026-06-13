# Multi-animal show recap posts

Add Facebook-style recap support alongside the existing single-win flow, plus photo credits and clamped captions.

## 1. Database

Single migration:
- `posts.photo_credit text null` — free text, used by every post type with photos.
- `posts.photo_credit_breeder_id uuid null references breeder_profiles(id)` — optional match to a Backdrop breeder/business profile so the credit becomes a link.

No changes to `winners` — each result block already writes its own row with `source_post_id`, which is exactly what we need.

## 2. CreatePostPage — multi-result winner flow

In the existing winner panel, replace the single set of result fields with a `resultBlocks` array. Each block holds:
- `animal_name` (a.k.a. shown_by / nickname)
- `placings: string[]` (one or more, with “+ add placing” inside the block)
- `bred_by`
- `placed_by`
- `sired_by` + `sire_id` (uses existing sire AutocompleteInput)

Shared across the post: `show_name`, `date` (+ `date_assumed`), `species`, `caption`, photos/video, `photo_credit`.

Controls:
- “+ Add another animal” button below the last block.
- Each block has a remove (X) button when there is more than one.
- First placing in the first block drives the ribbon’s “primary” placing.

On submit:
- Insert one `posts` row (carrying caption, media, `photo_credit`, `photo_credit_breeder_id`, `post_type='champion'`, shared show fields).
- For each block × each placing in the block, insert a `winners` row with `source_post_id = post.id`, copying the shared show/date/species and the block’s breeder/exhibitor/sire fields. Reuse the existing sire normalization logic.

Single-result mode keeps working because one block × one placing produces exactly today’s behavior.

## 3. PostCard — recap rendering

When a post has more than one linked winner card, render a `RecapBlocks` section between the caption and the engagement row:
- Group winner rows by `animal_name` (shown_by).
- Per animal: bold name; compact bulleted/list of placings; one metadata line “Bred by X · Placed by Y · Sired by Z” with breeder/sire as links where matched.
- Ribbon overlay still appears once, using the highest-ranked placing across all blocks (Grand → Reserve Grand → Division → Class → other).

Single-card posts continue to use the existing compact metadata line — no visual change for the common case.

## 4. Caption clamp

Wrap the caption `<p>` in a small `ClampedText` component:
- CSS line-clamp 4 by default.
- If the rendered text overflows, show an inline “… more” / “less” toggle (gray, 12px) styled to match the muted metadata.
- Photo credit (when present) renders directly under the caption as a separate small line, e.g. `📸 J. Hutch Media`, with the name linking to `/breeder/{slug}` when `photo_credit_breeder_id` resolves.

## 5. Out of scope (unchanged)

- Sale flow, reel flow, ResultRibbon styling, edge-to-edge photos, double-tap-to-like, headers, filters.

## Technical notes

- Feed.tsx already fetches multiple winner cards per post into `winnerCardsMap[postId]` but only uses the first card. Extend its `Post` mapping to pass the full array (e.g. `winner_cards`) so PostCard can render recaps without an extra query.
- WinnersPage already lists each winner row individually, so multi-animal posts will naturally appear as multiple archive entries with no changes there.
- Photo credit matching: simple optional autocomplete against `breeder_profiles.breeder_name` in the composer; stores `photo_credit` text always and `photo_credit_breeder_id` only on match.
