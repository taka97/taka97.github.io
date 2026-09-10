---
phase: 3
title: "Table Helper and UI Wiring"
status: complete
priority: P1
effort: "3h"
dependencies: [2]
---

# Phase 3: Table Helper and UI Wiring

## Overview

Add one new reusable helper to `table-helpers.js` (the "estimated cost" disclosure
badge) without touching any existing export, then build
`assets/js/planners/robots-satellites.js`, the UI controller — mirroring
`tomes.js`'s structure (profile load, stock inputs, instance-range rendering,
breakdown table, sticky bar, reset-with-confirm) but split into a Robot
add-instance section and 3 fixed rarity-tier Satellite sections.

## Requirements

- Functional:
  - New `table-helpers.js` export: an accessible click-to-toggle "≈" badge +
    hidden note, matching source's `<button class="estimated-tag"
    aria-expanded="false">≈</button><span class="estimated-note" hidden>...</span>`
    disclosure pattern. Must not alter `createTable`, `grandTotalFooter`, or any
    other existing export's signature or behavior — purely additive.
  - Robot section: add-instance UI identical in behavior to Tomes' (`+ Add Robot`,
    capped at `planner.caps.robots` = 12, default 1 instance, no per-instance
    remove).
  - Satellite sections: 3 subsections (R, SR, SSR), each with a heading + rarity
    badge (colored via `satelliteTiers[tier].badge`) and flat, always-visible
    instance-range cards for that tier's satellites — no add/remove control (fixed
    set of 9).
  - Breakdown table shows the "≈" badge on any row whose `estimated` array is
    non-empty.
  - Persistence: profile tool-data key `robots-satellites`, same
    read-latest-then-merge-then-write pattern as `tomes.js`'s `persist()`. Stored
    shape: `{ stock, robots: [...], satellites: { [id]: {currentIndex,
    targetIndex} } }`.
- Non-functional: reuse `createProfileStore`/`getToolData`/`updateToolData` from
  `storage.js` unchanged (no storage.js changes needed, same as Tomes round).

## Architecture

```
table-helpers.js (+1 export, additive only)
  renderEstimatedBadge(container, isEstimated, label, noteText)
    — clears/hides if !isEstimated; else renders toggle button + hidden note,
      wires click/keydown to toggle `hidden` + aria-expanded (mirrors source's
      inline onclick, done properly as an addEventListener here since this
      codebase builds DOM via createElement, not innerHTML+onclick strings)

robots-satellites.js
  initializeRobotsSatellitesPlanner(container)
    - load planner data (JSON island) + profile (same flow as tomes.js lines 60-106)
    - state: stock{}, robotInstances[{currentIndex,targetIndex}],
      satelliteState{ [id]: {currentIndex,targetIndex} } (all 9 ids seeded to
      {0,0} by default, not sparse — simplifies rendering, no "missing key" branch)
    - renderStockInputs() — same as tomes.js, 5 resource inputs
    - renderRobotSection() — reuses tomes.js's renderInstanceList shape verbatim
      for the add/current/target/badge card UI, capped add button
    - renderSatelliteTierSection(tierKey) x3 — renders that tier's badge heading +
      one instance-range card per satellite.id in that tier (no add button, no
      index-based selectedInstances() scan — read/write directly by satellite id
      instead of position, since Robot's helper assumes array index === identity
      and Satellites' doesn't)
    - renderResult() — calls calculateRobotsSatellitesRequirements, renders
      missing-grid (reuse renderMissingCard), breakdown table (reuse
      createTable/grandTotalFooter + new renderEstimatedBadge per estimated row),
      sticky bar (reuse updateStickyBar)
    - handleReset() — same double-click-confirm pattern as tomes.js, resets to
      stock={}, robotInstances=[{0,0}], satelliteState=all 9 ids at {0,0}
```

Satellite card current/target `<select>` option counts differ by tier (R: 6
options i.e. indices 0-5, SR: 8, SSR: 10) — `renderSatelliteTierSection` must pass
`planner.satelliteTiers[tierKey].levels.length - 1` as `maxIndex` per tier, not a
single shared constant (this is the one place the UI can't reuse Tomes'
single-maxIndex assumption unchanged).

## Related Code Files

- Modify: `assets/js/planners/table-helpers.js` (add one export)
- Create: `assets/js/planners/robots-satellites.js`
- Read (reference only): `assets/js/planners/tomes.js` (structural template),
  `assets/js/planners/storage.js` (unchanged, just consumed)

## Implementation Steps

1. Add `renderEstimatedBadge(container, isEstimated, label, noteText)` to
   `table-helpers.js`, following the file's existing style (plain functions,
   `document.createElement`, no framework). Use `<button>` for the toggle (keyboard
   accessible by default, unlike source's inline-styled span) + a sibling `<span
   hidden>` for the note, toggling `hidden` and `aria-expanded` on click.
2. Scaffold `robots-satellites.js`: copy `tomes.js`'s top-level structure
   (MESSAGES en/vi, `getElements`, `initializeRobotsSatellitesPlanner`,
   profile/store bootstrap) and adapt field names.
3. Add MESSAGES keys: satellite labels (9), tier labels (R/SR/SSR — reuse as-is,
   short codes), `robotLabel: 'Robot {n}'`, `estimatedLabel`/`estimatedNote` (EN +
   VI text — VI text can equal EN for this round per the deferred-translation
   decision), plus all the shared keys `tomes.js` already has (range/inventory/etc,
   adapted).
4. Implement `sanitizeStock`/`sanitizeRobotInstances` (same as `tomes.js`'s
   `sanitizeInstances`, capped at `planner.caps.robots`) and
   `sanitizeSatelliteState` (new: for each of the 9 known ids, clamp stored
   `{currentIndex,targetIndex}` against that satellite's tier maxIndex, default
   `{0,0}` for missing/unknown ids — drop any stored id no longer in
   `planner.satellites`, defensively, same spirit as `clampInstanceValue`).
5. Implement `renderRobotSection` — adapt `tomes.js`'s `renderInstanceList` +
   `handleAdd`/`updateAddButtonState` for the single Robot category.
6. Implement `renderSatelliteTierSection(tierKey)` x3 (or one parametrized function
   called 3 times) — same card markup as `renderInstanceList` per instance, but
   iterating `planner.satellites.filter(s => s.tier === tierKey)` (fixed identity,
   keyed writes) instead of a positional array; wrap the tier's cards in a
   `<section>` with a heading using `satelliteTiers[tierKey].badge` as an inline
   `--badge-color` custom property (reuse the `.loj-planner__rarity-badge` class
   Phase 4 adds).
7. Implement `renderResult()`: call
   `calculateRobotsSatellitesRequirements(planner, robotInstances,
   satelliteState)`, render missing-grid via `renderMissingCard` per non-zero
   resource, render one combined breakdown table (Robot rows + all 3 tiers'
   Satellite rows) via `createTable`/`grandTotalFooter`, with
   `renderEstimatedBadge` appended into any row's cost cell where
   `row.estimated.length > 0`.
8. Wire `updateStickyBar` (unchanged import from `table-helpers.js`) exactly as
   `tomes.js` does.
9. Implement `handleReset` with the same double-click-confirm UX as `tomes.js`.
10. Wire event listeners: stock inputs, robot add button, robot instance-list
    change delegation, satellite section change delegation (3 sections or one
    delegated listener on a shared parent — implementer's choice, follow whichever
    keeps `robots-satellites.js` closer to `tomes.js`'s existing delegation
    pattern), reset button, sticky bar click/keydown.

## Todo

- [x] Add `renderEstimatedBadge` to `table-helpers.js`; confirm existing exports'
      call sites (`forticlad.js`, `research.js`, `tomes.js`) are untouched — run a
      grep for `table-helpers.js` imports across `assets/js/planners/` after the
      edit to confirm no signature was accidentally changed. — grepped; none of the
      three import the new export.
- [x] Implement `robots-satellites.js` per steps above.
- [x] Confirm satellite state persists/restores correctly across a page reload
      (manual check deferred to Phase 6, but code review here should trace the
      persist → getToolData round trip once). — traced: `handleSatelliteChange`
      merges only the changed tier's cards into `satelliteState` before persisting
      the whole object, so other tiers' entries aren't clobbered.

## Success Criteria

- [x] Existing Forticlad/Research/Tomes pages' JS is unmodified in behavior (only
      `table-helpers.js` gains one new export).
- [x] Robot add-instance UX matches Tomes' exactly (cap 12, no remove, default 1).
- [x] All 9 satellites render with correct per-tier level-option counts (R:6, SR:8,
      SSR:10) and no add/remove control.
- [x] Estimated badge appears only on breakdown rows that actually cross the
      flagged R-tier level-50 step, and is keyboard-operable (a native `<button>` is
      used for the toggle, so Enter/Space activation is free — matches the
      sticky-bar's existing keydown pattern in spirit without needing a manual
      keydown handler).

## Risk Assessment

- Reusing one combined breakdown table (Robot + all Satellites) vs. splitting per
  category: source shows everything in one combined table (matches Tomes &
  Collections' precedent of "one combined missing/breakdown table across
  categories" per the brainstorm decisions) — do not split into 4 separate tables,
  that would be new unrequested scope.
