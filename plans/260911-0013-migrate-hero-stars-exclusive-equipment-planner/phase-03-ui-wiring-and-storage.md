---
phase: 3
title: "Phase 3: UI Wiring and Storage"
status: done
priority: P1
effort: "3.5h"
dependencies: [2]
---

# Phase 3: UI Wiring and Storage

## Overview

Build `assets/js/planners/hero-stars-exclusive-equipment.js` — the ES-module
UI controller that reads the JSON data island, renders two independent
addable instance lists (Hero Stars, Exclusive Equipment; each capped at 6,
add-only — no remove control, matching source: neither the live page nor
`robots-satellites.js`'s precedent exposes a per-instance delete button),
renders one combined breakdown table, and persists state through the
existing `storage.js` profile pattern. No new UI primitives needed —
`table-helpers.js`'s shared exports plus a module-local instance-card
renderer (same split as `robots-satellites.js`: shared primitives from
`table-helpers.js`, but `renderInstanceCards`/`readCardState`/
`updateRangeWarnings` are file-local helpers, not shared — copy that
pattern rather than the specific 9-satellite-tier code).

## Requirements

- Functional: render 2 sections — "Hero Stars" and "Exclusive Equipment" —
  each with a heading, an instance-card list (start with 1 instance,
  matching source's default state `counts: {HeroStar: 1, ExclusiveEquip:
  1}`), and a "+ Add Hero" button that appends one more instance up to the
  cap of 6, then disables (mirrors `robots-satellites.js:206-219`'s
  `handleAddRobot`/`updateAddButtonState` exactly, applied twice — once per
  list, with its own independent cap check, matching source's "the two add
  buttons are independent" copy). This is the **only** place the cap is
  enforced (Validation Session 1: `calculateHeroStarsEquipment` in Phase 2
  does not itself check instance-array length, matching
  `robots-satellites-core.js` precedent exactly).
- Functional: each Hero Stars instance has a Current `<select>` (all 32
  levels) and Target `<select>` restricted to `recruited` + the 5 "whole
  tier" ids (`star1`..`star5`) — exclude `start` and every id matching
  `/_s\d+$/` from the Target options. This generalizes
  `hero-equipment.js:105`'s existing `!id.endsWith('_s1')` filter (that
  tool has exactly 1 stage checkpoint per tier; this one has 5) — write it
  as `!/_s\d+$/.test(id) && id !== 'start'` instead of a literal suffix
  check.
- Functional: each Exclusive Equipment instance has a Current/Target
  `<select>` pair over all 11 levels (0-10) — no Target filtering needed,
  numeric levelStyle has no stage sub-levels.
- Functional: one combined breakdown table (Hero Stars rows + Exclusive
  Equipment rows together, one per instance with a set target), reusing
  `createTable`, `grandTotalFooter` from `table-helpers.js` — **do not**
  import or call `renderEstimatedBadge` (no `estimated` flags exist on
  either track, confirmed live — this is the first of the 5 planners that
  doesn't need it).
- Functional: state persists via `createProfileStore`/`getToolData`/
  `updateToolData` from `storage.js`, under a new
  `hero-stars-exclusive-equipment` tool-data key, same
  read-latest-then-merge-then-write pattern as every existing planner.
- Non-functional: sticky "missing" bar via `updateStickyBar`, target-set
  badges via `renderInstanceBadge` — same as every existing planner page.

## Architecture

**State shape** (`hero-stars-exclusive-equipment` profile tool-data key):
```js
{
  stock: { HeroFragment, ExclusiveEquipPart },
  heroStars: [ {currentIndex, targetIndex}, ... ],       // up to 6
  exclusiveEquipment: [ {currentIndex, targetIndex}, ... ], // up to 6
}
```
Two flat instance arrays (not addable-with-remove, not fixed-object-keyed)
— closest to Robots & Satellites' `robotInstances` array shape, applied
twice instead of once (that tool only had one addable list; Satellites
were the fixed-object-keyed half).

**Module structure**, mirroring `robots-satellites.js` (582 lines, closest
structural sibling — addable-instance cards + combined breakdown table
already solved there) minus its satellite-tier complexity and estimated
badge (neither needed here):
1. Parse `#hero-stars-exclusive-equipment-data` JSON island →
   `createHeroStarsEquipmentPlanner`.
2. Build/cache DOM refs for both instance-list containers, both add
   buttons, 2 stock inputs, breakdown table container, sticky bar, missing
   cards.
3. `renderHeroStarsSection()` / `renderExclusiveEquipmentSection()`: map
   each list's instances to cards via a module-local `renderInstanceCards`
   (copy `robots-satellites.js`'s local helper, not a `table-helpers.js`
   export), Hero Stars cards using the filtered Target option list, Equip
   cards using the full 0-10 list.
4. On any select/input change: `commitStateFromDom()` (read both lists'
   card state back into `heroStarsInstances`/`exclusiveEquipmentInstances`
   arrays), call `calculateHeroStarsEquipment`, re-render the breakdown
   table + missing cards + sticky bar + badges, then persist via
   `updateToolData`.
5. `handleAddHeroStars()` / `handleAddExclusiveEquipment()`: append one
   instance to the relevant array if under cap, re-render that section,
   update that section's add-button disabled state, persist.
6. On load: fetch the active profile's `hero-stars-exclusive-equipment`
   tool data, populate both lists from it (default to source's 1-instance
   starting state if no saved data — matches every other planner's
   "no data yet" default), then run the same render/calculate pass as
   step 4.

## Related Code Files

- Create: `assets/js/planners/hero-stars-exclusive-equipment.js`
- Reference (read, do not modify): `assets/js/planners/robots-satellites.js`
  (addable-instance cards, add-button cap-disable, combined breakdown
  table, `commitStateFromDom` pattern — robots-satellites.js:195-251),
  `assets/js/planners/hero-equipment.js:105` (Target-list id-suffix
  filtering precedent, to generalize), `assets/js/planners/storage.js`
  (`createProfileStore`, `getToolData`, `updateToolData`),
  `assets/js/planners/table-helpers.js` (shared exports only —
  `createTable`, `grandTotalFooter`, `updateStickyBar`,
  `renderInstanceBadge`, `renderMissingCard`, `clearElement`, `setStatus`)

## Implementation Steps

1. Read `robots-satellites.js` in full before writing — this phase is
   almost entirely a recombination of its addable-instance pattern applied
   to 2 lists instead of 1 (+1 fixed set), minus the estimated-badge
   wiring it also has (not needed here).
2. Write `hero-stars-exclusive-equipment.js`: data parsing, DOM building
   for both sections, the module-local instance-card helpers, the
   calculate/render/persist cycle, EN/VI `MESSAGES` object (mirror
   `robots-satellites.js:7+`'s shape, dropping `estimatedLabel`/
   `estimatedNote`/satellite-specific keys, adding Hero Stars' star-tier +
   stage-label copy — "K stars", "K stars · stage N" per source UI text).
3. Manually verify in a local Docker Jekyll build (see Phase 5) rather than
   guessing at DOM wiring correctness from code alone.

## Success Criteria

- [x] Adding a Hero Stars or Exclusive Equipment instance appends a new
      card with independent Current/Target selects, re-renders the
      breakdown table, and persists.
- [x] Each add button disables independently once its own list reaches 6
      instances (verified: source's live buttons behave this way, clicking
      one does not affect the other's count).
- [x] Hero Stars' Target `<select>` never offers `start` or any
      stage-checkpoint id (`*_s1`..`*_s5`) — only `recruited`, `star1`..
      `star5`.
- [x] Changing any select/input re-renders the breakdown table, missing
      cards, sticky bar, and target-set badges synchronously, and persists
      to the active profile.
- [x] No `renderEstimatedBadge` call anywhere in this file.
- [x] Reloading the page restores both lists' saved current/target state
      and stock values from the active profile.

## Risk Assessment

Two independent addable lists on one page (up to 12 total instances) is
less DOM surface than Hero Equipment's fixed 48-select grid, so no
incremental-render concern expected. Main risk is copy-pasting
`robots-satellites.js`'s satellite-tier-specific branching where a
simpler flat structure would do — actively simplify rather than carry over
unused tier/label-lookup complexity that this tool (2 flat lists, not 3
tiers × 9 named satellites) doesn't need.
