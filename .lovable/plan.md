

# Exhibitor Memory + Smart Reuse System

## Overview

Build a system that remembers exhibitors a user posts for, tracks relationships (me, kid, family), and pre-fills fields on subsequent posts to reduce typing to near-zero over time.

## Database Changes

**New table: `exhibitors`**
- `id` (uuid, PK)
- `name` (text, not null)
- `created_by_user_id` (uuid, references auth.users)
- `created_at` (timestamp)
- RLS: users can read/insert/update their own; public read for display

**New table: `user_exhibitors`**
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users)
- `exhibitor_id` (uuid, references exhibitors)
- `label` (text: 'me', 'kid', 'family', 'other')
- `use_count` (integer, default 1)
- `last_used_at` (timestamp)
- `last_breeder_id` (uuid, nullable) — last breeder used with this exhibitor
- `last_show_name` (text, nullable) — last show context
- `last_sire_name` (text, nullable)
- `last_dam_name` (text, nullable)
- unique constraint on (user_id, exhibitor_id)
- RLS: users can CRUD their own rows

## Submission Flow Changes

**ResultBlock "Shown by" field** — Replace the plain text input with a new `ExhibitorPicker` component:

1. Shows a quick-select row: **Me** | **My Kids** (chips for saved exhibitors) | **Someone Else**
2. Selecting "Me" fills `shownBy` with user's display name
3. Selecting a saved kid/family member fills `shownBy` with their name
4. "Someone Else" shows the standard text input
5. Autocomplete against user's saved exhibitors as they type

**After successful post submission:**
- Upsert the exhibitor into `exhibitors` table
- Upsert `user_exhibitors` with incremented `use_count`, updated `last_used_at`, and context (breeder, show, sire, dam)

## Post Another Flow

**PostSuccessScreen** — Add a "Post Another" button that navigates back to `/submit` with query params or state carrying:
- Last show name (pre-filled)
- Last exhibitor (pre-selected)
- Last breeder identity (pre-selected)

The SubmitWinnerPage reads this carry-forward state on mount and pre-fills the first result block accordingly.

## Component: ExhibitorPicker

```text
┌─────────────────────────────────────┐
│  Who showed?                        │
│  [Me] [Kid1] [Kid2] [+ Add]        │
│  ─── or type a name ───            │
│  [________________________]         │
└─────────────────────────────────────┘
```

- Fetches `user_exhibitors` joined with `exhibitors` on mount
- Sorted by `use_count` desc (most-used first)
- Chips colored by label (me=primary, kid=amber, family=purple)

## Files to Create/Modify

1. **Migration SQL** — Create `exhibitors` and `user_exhibitors` tables with RLS
2. **`src/components/ExhibitorPicker.tsx`** — New component for exhibitor selection
3. **`src/components/ResultBlock.tsx`** — Replace "Shown by" input with ExhibitorPicker
4. **`src/pages/SubmitWinnerPage.tsx`** — Save exhibitor data after submit; read carry-forward state on mount
5. **`src/components/PostSuccessScreen.tsx`** — Add "Post Another" button with carry-forward data

## Technical Details

- Exhibitor upsert uses `ON CONFLICT (user_id, exhibitor_id)` to increment count
- ExhibitorPicker loads data once via `useEffect`, caches in component state
- Carry-forward state passed via `navigate('/submit', { state: {...} })` and read with `useLocation`
- All new tables require authenticated RLS policies scoped to `auth.uid() = user_id`

