---
title: "Phase 3: Buildings JS: rename, FC Lab wiring, storage migration"
status: done
---

# Phase 3: Buildings JS: rename, FC Lab wiring, storage migration

## Overview

Update `assets/js/planners/forticlad.js` and `storage.js` for the data changes
made in Phase 2 (bomber-barrack rename, FC Lab), and add the explicit
"automatically required buildings" list (Key Decision from plan.md — currently
implicit only). `planner-core.js`'s calculation logic does not need to change
in this phase — it already computes `automaticBuildingKeys`; it's only unused
by the UI today.

<!-- Updated: Validation Session 1 - locked VI labels for bomber-barrack and fc_lab -->

## Requirements

- [x] `BUILDING_TRANSLATIONS` key renamed `boomer-barrack` -> `bomber-barrack`; `fc_lab` VI translation added.
- [x] `CHART_COLORS` has an 8th color for `fc_lab`.
- [x] `storage.js` `getToolData('forticlad', ...)` transparently migrates any locally-saved `buildingBases['boomer-barrack']` to `bomber-barrack` (old key wins if both somehow present — old data shouldn't silently vanish for anyone who already used the planner).
- [x] Page renders a visible "Automatically required" list (reusing `.forticlad-planner__prerequisites` CSS) driven by `result.automaticBuildingKeys` from `calculateBuildingRequirements()`.

## Related Code Files

- Modify: `assets/js/planners/forticlad.js`
- Modify: `assets/js/planners/storage.js`
- Reference only (no changes expected): `assets/js/planners/planner-core.js`

## Implementation Steps

1. **Rename in JS.** In `forticlad.js`, change `BUILDING_TRANSLATIONS['boomer-barrack']` key+value to
   `'bomber-barrack': 'Doanh trại Bomber'` (loanword "Bomber", matching existing
   site convention — confirmed via `contents/vi/lands-of-jail/season-2/heroes.md`
   already using "Bomber" untranslated; decided in Validation Session 1). Add
   `'fc_lab': 'Phòng Lab FC'` to `BUILDING_TRANSLATIONS` (decided in Validation
   Session 1 — loanword "Lab", matching the same convention).

2. **Extend `CHART_COLORS`** with one more hex color (8 buildings now) that's visually distinct from the existing 7 — check `_sass/custom.scss` chart legend styling isn't hardcoded to exactly 7.

3. **Storage migration.** In `storage.js`, `getToolData()` already special-cases `tool === 'forticlad'` for the `fcOnHand`/`coreOnHand` legacy field. Extend that same special-case: if `data.buildingBases?.['boomer-barrack']` exists and `data.buildingBases?.['bomber-barrack']` doesn't, copy it over under the new key when returning (read-time migration, same pattern already used for `coreOnHand` -> `fcOnHand`). Don't add a new IndexedDB migration path — this is a plain object key rename inside the existing tool-data blob, no new database version needed.

4. **Explicit prerequisites list.** In `forticlad.js` `renderResult()`, after computing `result` via `calculateBuildingRequirements()`, render `result.automaticBuildingKeys` (non-empty case) into a new `<section class="forticlad-planner__prerequisites">` with a heading + `<ul>` of `"{buildingName} -> {targetBase}"` entries (one per automatically-added building/target pair — note `automaticBuildingKeys` alone doesn't carry the resolved target base; pull it from `result.effectiveRanges[key].targetBase`). Hide/empty the section when there are no automatic targets. Add the section's markup shell to `contents/{en,vi}/lands-of-jail/planners/forticlad.md` in Phase 5 (this phase only wires the JS renderer against a `data-role="auto-required"` container that Phase 5 will add to the page).
   - EN copy: e.g. "Automatically required: {building} to {base}".
   - VI copy: matching existing `MESSAGES.vi` tone in `forticlad.js`.

## Todo

- [x] Rename `BUILDING_TRANSLATIONS` key, add `fc_lab`
- [x] Extend `CHART_COLORS`
- [x] Add `boomer-barrack` -> `bomber-barrack` read-time migration in `storage.js`
- [x] Render explicit auto-required list from `result.automaticBuildingKeys`

## Success Criteria

- Selecting a target that cascades a prerequisite (e.g. Warden Office -> FC6) shows both the inline "automatic" row in the breakdown table (existing behavior, unchanged) AND a new explicit list naming the auto-added building + target.
- A profile with pre-existing `buildingBases['boomer-barrack']` data (simulate via IndexedDB devtools or a temporary console script) still shows its saved current/target after this change, now under `bomber-barrack`.
- No console errors when FC Lab is selected as a target and its cascade resolves.

## Risk Assessment

FC Lab participates in the *building* cascade only as something research
depends on — it has no reverse effect on the other 7 buildings' calculations.
Verify `calculateBuildingRequirements()` behaves correctly with 8 building keys
without modification (it's already generic over `planner.buildingKeys`); if it
doesn't, that's a `planner-core.js` bug to fix in this phase, not a scope
change.
