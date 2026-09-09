---
title: "Phase 4: T11 Research data + calculation engine"
status: done
---

# Phase 4: T11 Research data + calculation engine

## Overview

Add the T11 Research data (new yml file) and a new calculation engine module
that mirrors `planner-core.js`'s shape and quality but fits research's actual
structure: per-track variable-length numeric levels, Hyperalloy-only costs,
and a cross-track (not cross-building) prerequisite graph. Do **not** try to
bolt this onto `planner-core.js`'s shared-"steps"-row model — that model
assumes one global ordered list of base labels shared by every tracked entity,
which doesn't hold for research (tracks have independent level counts: 5, 10,
12, 1). This is a data+engine-only phase; UI wiring is Phase 5.

## Requirements

- [x] New data file with all 27 tracks (3 troops x 9 tracks) and their level costs + `requires`, sourced from [Phase 1](./phase-01-start.md) — no invented numbers.
- [x] New engine module can: build a validated planner from that data; given a set of `{trackId: targetLevel}` selections plus an `fcLabLevel` number, resolve cascading cross-track prerequisites to a fixed point (same fixed-point approach as `planner-core.js`'s `resolveRequirements`, generalized to `{trackId, levelId}` pairs); sum total Hyperalloy; report which tracks/levels were auto-added vs explicitly selected.
- [x] Cycle detection on the requirement graph (same guarantee `planner-core.js` provides via `validateRequirementGraph`).
- [x] Reuses `formatNumber` from `planner-core.js` rather than reimplementing it; does not duplicate `planner-core.js`'s building-specific logic.
- [x] Takes FC Lab's level as a plain number parameter (Validation Session 1) — no import of/call into `planner-core.js` beyond `formatNumber`.

<!-- Updated: Validation Session 1 - FC Lab level is a plain number input, not a cross-engine call -->

## Related Code Files

- Create: `_data/lands_of_jail/forticlad_research.yml`
- Create: `assets/js/planners/research-core.js`
- Reference only: `assets/js/planners/planner-core.js` (import `formatNumber` from it)

## Implementation Steps

1. **Data file shape.** Design `forticlad_research.yml` to mirror
   `forticlad.yml`'s spirit (a `source:` provenance block, then structured game
   data) but shaped for tracks-with-levels instead of shared steps rows.
   Suggested shape (adjust for actual YAML ergonomics, but keep every field
   traceable to Phase 1):
   ```yaml
   schema_version: 1
   source:
     url: https://www.lojcalc.com/index.html
     retrieved: 2026-09-09
     note: T11 Research tree (3 troop lines x 9 tracks each); Hyperalloy-only costs.
   troops: [shieldbearer, bomber, shooter]
   tracks:
     expedition:
       label: Expedition Troops Capacity
       levels: [30, 50, 80, 130, 220]
       requires: { 4: [{ track: fc_lab, level: 2 }] }   # fc_lab is a BUILDING, cross-references Phase 2/3's building data
     lethality:
       label: Increases Lethality
       levels: [80, 100, 140, 180, 240, 300, 380, 480, 600, 800]
       requires:
         4: [{ track: fc_lab, level: 2 }]
         5: [{ track: expedition, level: 4 }]           # same-troop track, troop prefix applied at planner-build time
         8: [{ track: fc_lab, level: 3 }]
     # ... atk, def, hp identical curve/requires pattern to lethality
     rally:
       label: Increase Rally Troop Capacity
       levels: [160, 200, 240, 290, 360, 430, 530, 650, 810, 1010, 1260, 1580]
       requires:
         1: [{track: lethality, level: 5}, {track: atk, level: 5}, {track: def, level: 5}, {track: hp, level: 5}, {track: fc_lab, level: 4}]
         7: [{track: lethality, level: 10}, {track: atk, level: 10}, {track: def, level: 10}, {track: hp, level: 10}]
     bastion:
       label: Unlocks Troop Lv.11
       levels: [4500]
       accent: true
       requires: { 1: [{ track: rally, level: 12 }, { track: fc_lab, level: 5 }] }
     heal_lethality:
       label: Reduce Resource Consumption for Healing and Increase Their Lethality
       levels: [200, 260, 340, 440, 590, 800, 1120, 1570, 2360, 3530]
       requires: { 1: [{ track: bastion, level: 1 }] }
     train_hp:
       label: Reduce Resource Consumption for Training and Increase Their HP
       levels: [200, 260, 340, 440, 590, 800, 1120, 1570, 2360, 3530]
       requires: { 1: [{ track: bastion, level: 1 }] }
   ```
   Since the cost curve and requirement *pattern* are identical across all 3
   troops, define each track's data **once** (as above) rather than repeating
   it 3x — the engine (step 2) expands it per-troop into `shieldbearer_lethality`,
   `bomber_lethality`, `shooter_lethality`, etc. at planner-build time, exactly
   like the source's own `fcLabTree(troopKey)` factory does.

   **FC Lab cross-reference (decided, Validation Session 1):** `fc_lab` is a
   *building*, defined in `forticlad.yml`, not this file. `research-core.js`
   takes FC Lab's current level as a **plain number input**
   (`calculateResearchRequirements(planner, selections, fcLabLevel)`), not a
   live reference into `planner-core.js`. Since Phase 5 also decided research
   selections persist in the same `forticlad` profile tool-data key as
   `buildingBases`, `research.js` reads `fcLabLevel` straight off the
   already-loaded `buildingBases['fc_lab'].currentBase` in that same profile
   blob — no cross-engine call, no shared module beyond `formatNumber`.

2. **Engine module** (`research-core.js`), mirroring `planner-core.js`'s public
   shape:
   - `createResearchPlanner(data, troops)` — validates level arrays are
     non-empty, validates every `requires` reference points at a real
     `troop_track:level` (or `fc_lab:level`), expands per-troop tracks, returns
     an immutable-ish planner object (`structuredClone` pattern like
     `planner-core.js`).
   - `calculateResearchRequirements(planner, selections, fcLabLevel)` —
     `fcLabLevel` is the plain number described above (Validation Session 1);
     `selections` is `{ trackId: targetLevel }` (only explicitly-chosen
     tracks); resolves cascading `requires` to a fixed point exactly like
     `planner-core.js`'s `resolveRequirements` (loop until no more additions),
     but keyed by `{trackId, level}` pairs and additionally checking
     `fc_lab:level` requirements against the passed-in `fcLabLevel` (not
     part of the cascade — either it's met or the whole selection is invalid,
     matching how "prerequisite unreachable" is surfaced today via
     `RangeError` in `planner-core.js`).
   - Returns the same shape of result `planner-core.js` returns for buildings
     (`selectedTrackKeys`, `effectiveTrackKeys`, `automaticTrackKeys`, `steps`,
     `totals` (Hyperalloy per track), `grandTotal`) so Phase 5's UI code can
     follow the same rendering patterns as `forticlad.js` without reinventing
     table/chart logic.
   - `validateRequirementGraph`-equivalent cycle check, run at planner-build
     time (throw on cycle, same as buildings).
   - Import `formatNumber` from `./planner-core.js`; do not copy it.

3. **No UI, no page changes in this phase** — verify the engine with a
   throwaway Node script (not committed) exercising: a track with no
   prerequisites, a track needing FC Lab only, `rally` cascading its 4 combat
   stats, `bastion` cascading `rally` to max, and a cycle (should throw).

## Todo

- [x] Write `forticlad_research.yml` (27-track data, deduplicated per source's own per-troop-identical-curve structure)
- [x] Write `research-core.js` (`createResearchPlanner`, `calculateResearchRequirements`, cycle check)
- [x] Decide + document how `fc_lab` (building) requirements are supplied to the research engine
- [x] Throwaway script verifying cascade + cycle-detection behavior

## Success Criteria

- Selecting `shieldbearer_rally` target level 7 (with FC Lab at a sufficient level) auto-resolves `shieldbearer_lethality/atk/def/hp` to level 10 each, and the Hyperalloy total matches hand-summing Phase 1's per-level tables for those tracks/levels.
- Selecting `shieldbearer_bastion` target level 1 auto-resolves `shieldbearer_rally` to level 12, which in turn cascades the 4 combat stats to level 10.
- A deliberately-introduced cycle in test data throws, mirroring `planner-core.js`'s behavior.

## Risk Assessment

The `requires` cascade for research is deeper (rally -> 4 stats -> expedition,
bastion -> rally -> 4 stats) than anything in the current building graph
(2 levels deep at most). Reuse `planner-core.js`'s proven fixed-point loop
structure rather than a fresh recursive implementation, to inherit its
termination guarantee (bounded by `while(changed)` over a finite, cycle-checked
graph).
