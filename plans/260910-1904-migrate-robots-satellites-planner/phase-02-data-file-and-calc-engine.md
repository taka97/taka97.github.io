---
phase: 2
title: "Calc Engine"
status: complete
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: Calc Engine

## Overview

Build `assets/js/planners/robots-satellites-core.js`, a pure calc engine mirroring
`tomes-core.js`'s shape: no requirement/cascade graph (source has none for this
tool), just per-instance current/target index → summed cost, plus grand totals.
Differs from `tomes-core.js` in two ways: (1) Robot is dynamic like Tomes, but
Satellites are a *fixed* list keyed by id, not a repeatable add-up-to-N category;
(2) breakdown rows must carry an `estimated` flag (and which resource keys) when
the range crosses a flagged level.

## Requirements

- Functional:
  - `createRobotsSatellitesPlanner(data)` validates/normalizes the yml JSON
    (mirrors `createTomesPlanner`'s validation style: throw `TypeError` with a
    specific message per malformed field, check row counts).
  - `calculateRobotsSatellitesRequirements(planner, robotInstances, satelliteState)`
    returns `{ totals, robotBreakdown, satelliteBreakdown }` — `totals` summed
    across both, `satelliteBreakdown` includes `tier` per row (needed by Phase 3 to
    render three separate breakdown sub-tables, or filter one combined table by
    tier if that's simpler at UI time — Phase 3 decides).
  - Each breakdown row that sums a level carrying an `estimated` list gets
    `estimated: [...resourceKeys]` on the row (empty array when nothing in range is
    estimated) — matches source's per-row granularity.
- Non-functional: no cross-track prerequisite logic — a range sum is a straight
  loop over `levels[currentIndex+1 .. targetIndex]`, same as `tomes-core.js`'s
  `sumCostRange`. Do not build a cascade engine; it would be unused dead
  complexity for this tool (per project YAGNI/KISS rules — Forticlad's cascade
  exists because Forticlad's source data actually has `requires`, this tool's does
  not).

## Architecture

```
createRobotsSatellitesPlanner(data)
  → normalizes: robotLevels[11], satelliteTiers{R,SR,SSR}.levels[6|8|10],
    satellites[9] (id/tier), resources[5], caps.robots

calculateRobotsSatellitesRequirements(planner, robotInstances, satelliteState)
  robotInstances: [{currentIndex, targetIndex}, ...]  (dynamic, like tomeInstances)
  satelliteState: { [satelliteId]: {currentIndex, targetIndex} }  (fixed keys = the
    9 ids from planner.satellites — NOT an array; there's no add/remove, so keying
    by id avoids needing index-stable ordering logic Tomes doesn't need either)

  For each robot instance: sum planner.robotLevels[cur+1..tgt] → totals + row.
  For each of the 9 satellites: look up its tier's levels array, sum
  levels[cur+1..tgt] → totals + row (tagged with tier + satellite id).
```

Resource-key partitioning: Robot only touches
`{PrisonerArmorData,PowerModule,AdvancedPowerModule}`; Satellites only touch
`{DataDisk,PlanetCoin}` — `totals` still covers all 5 keys (zero-filled), matching
`emptyResourceTotals()`'s pattern in `tomes-core.js`.

## Related Code Files

- Create: `assets/js/planners/robots-satellites-core.js`
- Read (reference only, no changes): `assets/js/planners/tomes-core.js`,
  `assets/js/planners/planner-core.js` (for the shared `formatNumber` re-export
  pattern `tomes-core.js` uses — `robots-satellites-core.js` should do the same:
  `import { formatNumber } from './planner-core.js'; export { formatNumber };`)

## Implementation Steps

1. Re-export `formatNumber` from `planner-core.js`, matching `tomes-core.js` line 1-3.
2. Define `RESOURCE_KEYS` (5 keys, all of them — totals cover all resources even
   though Robot/Satellite each only use a subset).
3. `createRobotsSatellitesPlanner(data)`:
   - Validate `data.robotLevels` is an array of exactly 11; validate
     `data.satelliteTiers` has exactly `R`/`SR`/`SSR` with `levels` arrays of 6/8/10
     respectively; validate `data.satellites` is an array of exactly 9 with valid
     `id`/`tier`/`labelKey`; validate `data.resources` (5) and `data.caps.robots`
     (positive integer).
   - Normalize each level row's cost via a `normalizeCost` helper like
     `tomes-core.js`'s (accept only the resource keys relevant to that
     category — reject/ignore stray keys, matching `normalizeCost`'s exact-key
     iteration), and carry through `estimated` (array of resource keys, default
     `[]`) per row.
4. `calculateRobotsSatellitesRequirements(planner, robotInstances, satelliteState)`:
   - `buildBreakdown`-style helper reused/adapted from `tomes-core.js`'s shape, but
     also propagate `estimated` — for each summed row, `estimated` is the union of
     every crossed level's `estimated` array (empty array if none).
   - Robot side: iterate `robotInstances` (array, like `tomeInstances`), same
     `clampIndex`/range-validation errors (`RangeError` "Choose a target level that
     is not lower than the current level.") reused verbatim from
     `tomes-core.js`'s pattern.
   - Satellite side: iterate `planner.satellites` (the fixed 9, in yml order), pull
     `satelliteState[satellite.id] ?? {currentIndex:0, targetIndex:0}`, resolve its
     tier's `levels` array, sum the same way. Row carries `{ id, tier, currentIndex,
     targetIndex, cost, estimated }`.
5. Export both functions + `formatNumber`.

## Todo

- [x] Implement `robots-satellites-core.js` per steps above.
- [x] Confirm error messages/types match the existing `tomes-core.js` conventions
      (`TypeError` for malformed data, `RangeError` for target-below-current) so
      Phase 3's UI error handling (which expects `error.message`) works unchanged
      from the Tomes pattern.
- [x] Sanity-check by hand: Robot instance current=0(baseline "1"), target=1
      (level "10") → cost `{PrisonerArmorData:1200, PowerModule:20,
      AdvancedPowerModule:0}`. R-tier satellite current=0, target=5 (level "50") →
      cost totals `DataDisk: 1565+2840+4730+7480+11230=27845`,
      `PlanetCoin: 10+20+40+60+80=210`, `estimated: ['DataDisk']`. — verified via a
      Node script run against the actual built JSON data island; both matched
      exactly.

## Success Criteria

- [x] `createRobotsSatellitesPlanner` throws on any malformed/incomplete input
      (mirroring `tomes-core.js`'s defensive validation).
- [x] `calculateRobotsSatellitesRequirements` returns correct totals + per-row
      `estimated` flags for the hand-checked example above.
- [x] No cascade/prerequisite logic present — file stays comparable in size/shape
      to `tomes-core.js` (~90 lines), not `planner-core.js`'s cascade engine.

## Risk Assessment

- Keying satellite state by `id` (object) instead of an array (like
  `tomeInstances`) is a deliberate deviation from the Tomes pattern — satellites
  are fixed and named, an array would need fragile index-to-identity assumptions.
  Phase 3 must persist `satelliteState` as an object keyed by id in the stored
  tool-data blob, not an array.
