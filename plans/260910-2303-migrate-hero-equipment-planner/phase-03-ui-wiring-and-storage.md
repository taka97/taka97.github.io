---
phase: 3
title: "Phase 3: UI Wiring and Storage"
status: complete
priority: P1
effort: "4h"
dependencies: [2]
---

# Phase 3: UI Wiring and Storage

## Overview

Build `assets/js/planners/hero-equipment.js` — the ES-module UI controller
that reads the JSON data island, renders the fixed 3×4 grid (12 sections,
each with Rarity current/target + Mastery current/target dropdowns), renders
one combined breakdown table, and persists state through the existing
`storage.js` profile pattern. No new UI primitives needed — everything reuses
`table-helpers.js` and `.loj-planner__*` SCSS exactly as-is.

## Requirements

- Functional: render 3 troop groups (Shieldbearer, Bomber, Shooter — EN
  label via `troop.charAt(0).toUpperCase() + troop.slice(1)`, same
  convention as `research.js:399`; VI labels via a `TROOP_TRANSLATIONS` map
  mirroring `research.js:6-10`'s `{shieldbearer: 'Khiên binh', bomber:
  'Bomber', shooter: 'Xạ thủ'}`), each with 4 fixed slot sections (Gloves,
  Helm, Outerwear, Boots — matching source's actual field labels, not its
  page-subtitle copy which inconsistently says "Jacket"/"Helmet"; VI
  translations to be authored this phase, no existing precedent to reuse).
- Functional: each slot section has 2 tracks (Rarity, Mastery), each with
  Current + Target `<select>` pairs — Rarity's Target `<select>` options
  restricted to the 11 non-`_s1` level ids; Rarity's Current `<select>`
  offers all 21. Reuse the existing per-track current/target dropdown-pair
  DOM pattern from `research.js` (same `.loj-planner__track`-style markup
  Forticlad/Research already use for its current/target level pairs) —
  do not invent new markup.
- Functional: one combined breakdown table (all 12 cells' rarity + auto-added
  mastery rows together), reusing `createTable`, `targetCell` (for the
  "(auto-added — prerequisite)" tag), `grandTotalFooter`, and
  `renderEstimatedBadge` from `table-helpers.js` exactly as Robots &
  Satellites' combined table already does.
- Functional: state persists via `createProfileStore`/`getToolData`/
  `updateToolData` from `storage.js`, under a new `hero-equipment` tool-data
  key, using the same read-latest-then-merge-then-write pattern as
  Forticlad/Research/Tomes/Robots & Satellites (each save re-fetches the
  current profile before merging its own change in).
- Non-functional: sticky "missing" bar via `updateStickyBar`, target-set
  badges via `renderInstanceBadge` — same as every existing planner page,
  no behavior differences to invent.

## Architecture

**State shape** (`hero-equipment` profile tool-data key):
```js
{
  stock: { EquipmentParts, PrecisionEquipment, Magnet, PotentialCoil },
  equipment: {
    shieldbearer: {
      gloves: { rarity: { currentIndex, targetIndex }, mastery: { currentIndex, targetIndex } },
      helmet: { /* same shape */ },
      chest:  { /* same shape */ },
      boots:  { /* same shape */ },
    },
    bomber:   { /* same 4 slots */ },
    shooter:  { /* same 4 slots */ },
  },
}
```
Fixed object, no add/remove UI — closer to how Robots & Satellites stores
its 9 fixed Satellites (object keyed by id, not an array of instances) than
to Tomes' or Robots' addable-instance arrays.

**Module structure**, mirroring `robots-satellites.js` (582 lines, most
recent/most structurally similar sibling — combined breakdown table +
estimated badge already solved there) and `research.js` (auto-added
prerequisite tagging already solved there):
1. Parse `#hero-equipment-data` JSON island → `createHeroEquipmentPlanner`.
2. Build/cache DOM refs for the 12 sections' 4 selects each (48 selects) +
   4 stock inputs + breakdown table container + sticky bar + missing cards.
3. On any select/input change: read all 12 cells' current selections from
   the DOM, call `calculateHeroEquipment`, re-render the breakdown table +
   missing cards + sticky bar + per-section target-set badges, then persist
   via `updateToolData`.
4. On load: fetch the active profile's `hero-equipment` tool data, populate
   all selects/inputs from it (defaulting every cell to Current=Common
   index 0 / no target, matching every other planner's "no target" default),
   then run the same render/calculate pass as step 3.

## Related Code Files

- Create: `assets/js/planners/hero-equipment.js`
- Reference (read, do not modify): `assets/js/planners/robots-satellites.js`
  (combined breakdown table + estimated badge wiring), `assets/js/planners/research.js`
  (troop label convention lines 6-10, 399; auto-added prerequisite tagging),
  `assets/js/planners/storage.js` (`createProfileStore`, `getToolData`,
  `updateToolData` — storage.js:5,65,82), `assets/js/planners/table-helpers.js`
  (all reused helpers, unmodified)

## Implementation Steps

1. Read `robots-satellites.js` and `research.js` in full before writing —
   this phase is almost entirely a recombination of patterns already solved
   in those two files (combined table + estimated badge from one, cascade
   auto-add tagging from the other), not new UI design.
2. Write `hero-equipment.js`: data parsing, DOM building for the 12 fixed
   sections, calculate/render/persist cycle, EN/VI `MESSAGES` object
   (mirror `research.js:24+`'s shape: `noProfile`, `storage`, `range`,
   `inventory`, `noTarget`, `noTargets`, `notSet`, `covered`, `needed`,
   `missing`, `surplus`, `autoLabel`, plus slot/troop labels).
3. Manually verify in a local Docker Jekyll build (see Phase 5) rather than
   guessing at DOM wiring correctness from code alone.

## Success Criteria

- [x] Changing any of the 48 selects or 4 stock inputs re-renders the
      breakdown table, missing cards, sticky bar, and target-set badges
      synchronously, and persists to the active profile.
- [x] Setting a Rarity target above the currently-targeted Mastery's
      sufficiency auto-bumps the Mastery target and tags the added row
      "(auto-added — prerequisite)" in the breakdown table.
- [x] The `common_s1` estimated cost shows a "≈" badge (click/keyboard
      togglable) on every row where it's summed, using
      `renderEstimatedBadge` unmodified.
- [x] Reloading the page restores all 12 cells' saved current/target state
      and stock values from the active profile.

## Risk Assessment

48 interactive selects on one page is more DOM surface than any prior
planner (Robots & Satellites had ~40 across Robot instances + 9
Satellites). Risk is UI sluggishness or event-listener bugs from the larger
grid — mitigate by building/updating DOM incrementally per cell (not a full
`clearElement` + full rebuild on every keystroke) if a manual check in
Phase 5 shows lag, same incremental-render discipline `forticlad.js` already
uses for its building grid.
