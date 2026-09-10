---
phase: 3
title: "Phase 3: UI wiring and storage"
status: complete
priority: P1
effort: ""
dependencies: [2]
---

# Phase 3: UI wiring and storage

## Overview

Build `tomes.js`: DOM rendering, add-instance controls, current/target
selects, the combined breakdown table, and the sticky summary bar. Persist
state via the existing generic profile-store (`storage.js`), no storage schema
changes needed.

## Requirements

- Functional: "+ Add Tome" / "+ Add Collection" buttons create a new instance
  (capped at 18/6 per Phase 1), disabled at cap, exactly matching source
  behavior (no remove-one button — confirmed decision).
- Functional: a "Reset to default" control (double-click/confirm pattern) is
  required for instance counts to ever shrink back to 1/1 — confirmed grep of
  `forticlad.js`/`research.js` found **no existing reset control anywhere on
  this site today**, so this is new UI scoped to this page only, not a
  retrofit onto Forticlad. Without it, "match source exactly" (add-only, no
  per-instance remove) would leave no way to undo an accidental add at all.
- Functional: each instance renders current/target `<select>` pair; changing
  either recalculates and re-renders stock/summary/breakdown/sticky-bar
  immediately (mirrors `forticlad.js`'s `save()` -> re-render pattern).
- Functional: stock inputs (6 resources) persist per profile, same
  sanitize-on-input pattern as existing planners (non-negative integer, no
  silent `NaN`).
- Functional: sticky bar shows one chip per resource with `missing > 0`,
  hidden when nothing is missing or no target is set anywhere; click/Enter/
  Space scrolls to the "what you're missing" heading (Phase 1's
  `renderStickyBar` behavior, reimplemented — not copied verbatim, this site
  doesn't load `shared.js`).
- Non-functional: read-modify-write against live storage on every save (not a
  stale page-load snapshot) — this is the exact bug class the prior Forticlad
  migration's code review caught (`forticlad.js`/`research.js` independently
  snapshotting the shared profile blob). `tomes.js` is the only script writing
  the `tomes-collections` tool key, but must still re-fetch the current
  profile immediately before merging its own change in, for consistency with
  the rest of the codebase and safety if a future script ever shares the key.

## Architecture

New profile tool key: `tomes-collections`, stored via the existing generic
`getToolData(profile, 'tomes-collections')` / `updateToolData(...)` in
`storage.js` — no changes to `storage.js` needed (its only per-tool special
case is a legacy Forticlad migration shim, unrelated to this key).

Persisted shape:
```js
{
  stock: { SealOfWisdom, SealOfKnowledge, CommonCoin, RareCoin, PreciousCoin, LegendaryCoin }, // all default 0
  tomes: [{ currentIndex, targetIndex }, ...],       // length = current tome count, default 1 instance at {0,0}
  collections: [{ currentIndex, targetIndex }, ...], // length = current collection count, default 1 instance at {0,0}
}
```

Adding an instance appends `{currentIndex:0, targetIndex:0}`; there is no
remove path other than the page's own Reset control re-initializing to 1
instance each (matches Forticlad's existing Reset pattern if one exists, or
introduces the same "reset to default" affordance source has — check
`forticlad.js` for whether Reset already exists site-wide before adding a new
one here).

DOM structure follows `forticlad.md`'s `data-role` hook pattern: a `<section
data-tomes-planner>` skeleton in the content Markdown (built in Phase 5),
`tomes.js` queries `data-role="..."` hooks the same way `forticlad.js` does.

## Related Code Files

- Create: `assets/js/planners/tomes.js`
- Modify: none (storage.js, table-helpers.js need no functional changes here —
  table-helpers.js's class-name constants are handled in Phase 4)
- Read (pattern reference): `assets/js/planners/forticlad.js`,
  `assets/js/planners/research.js`, `assets/js/planners/storage.js`

## Implementation Steps

1. Import `createTomesPlanner`, `calculateTomesRequirements`, `formatNumber`
   from `tomes-core.js`; `createProfileStore`, `getToolData`, `updateToolData`
   from `storage.js`; `createTable`, `clearElement`, `setSummaryValue`,
   `setStatus`, `renderMissingCard`, `targetCell`, `grandTotalFooter` from
   `table-helpers.js` (same import set as `forticlad.js`/`research.js`).
2. Render stock inputs (6 resources) — same sanitize/persist/refresh pattern as
   `forticlad.js`'s inventory inputs.
3. Render Tomes section: list of instance cards (current/target selects,
   level labels "Level I".."Level XII"). No roman-numeral helper exists
   anywhere in this codebase today (confirmed grep of `planner-core.js`/
   `table-helpers.js`) — add a small `toRoman()` helper in `tomes-core.js` or
   `table-helpers.js` (whichever fits better once Phase 2 lands; prefer
   `table-helpers.js` since it's a display formatter, not calc logic). "+ Add
   Tome" button disabled at 18.
4. Render Collections section: same pattern, level labels via tier name lookup
   (`Uncommon`, `Rare`, ..., `Exotic T3`, suffixed "· star N" for sub-levels
   per Phase 1's `stageWordKey` rule), "+ Add Collection" button disabled at 6.
5. Render combined "what's missing" summary cards (only resources with
   `totals[r] > 0`, per Phase 1's `summaryResourceKeys` default) and one
   combined breakdown table (Target/From/To/Cost, `targetCell`/
   `grandTotalFooter` from `table-helpers.js`) covering both Tomes and
   Collections rows together, hidden when empty (matches Forticlad's existing
   "hidden when nothing to show" convention).
6. Implement the sticky bar: a fixed-position element mirroring missing
   totals, hidden when nothing is missing, click/keyboard-activates a scroll
   to the summary heading.
7. Wire load/save: on any change, re-fetch the live profile via
   `getToolData`, merge in the changed field, `updateToolData`, save, then
   recompute + re-render (stock/summary/breakdown/sticky-bar), matching the
   read-modify-write fix from the prior migration's post-implementation
   review.

7b. Add a "Reset to default" button (double-click-to-confirm, no native
    `confirm()` dialog per this site's existing UX conventions) that
    reinitializes stock to 0 and both instance lists to a single `{0,0}` entry
    — the only way instance counts shrink, matching source behavior.

## Success Criteria

- [x] Adding a 19th tome or 7th collection is impossible via the UI (button
      disabled at cap).
- [x] Reset control returns the page to 1 tome + 1 collection + zeroed stock,
      requiring a second confirming click/keypress (not a single accidental
      click).
- [x] Changing any current/target select updates stock summary, breakdown
      table, and sticky bar without a page reload.
- [x] No stale-snapshot save bug: verified by a standalone script (or manual
      trace) confirming a save reads the current profile immediately before
      writing, not a page-load-time copy.
- [x] Breakdown table and sticky bar both hide cleanly when no target is set
      anywhere (matches Forticlad's existing empty-state convention).

## Risk Assessment

The stale-snapshot bug class already bit this codebase once (Forticlad +
Research scripts independently snapshotting the shared blob). `tomes.js` is a
single script owning one tool key, so the specific two-script race can't recur
here — but copy the *pattern* (re-fetch before merge) anyway since it's the
established site convention and costs nothing.
