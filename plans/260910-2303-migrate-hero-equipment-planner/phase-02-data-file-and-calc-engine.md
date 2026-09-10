---
phase: 2
title: "Phase 2: Data File and Calc Engine"
status: complete
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Data File and Calc Engine

## Overview

Create `_data/lands_of_jail/hero_equipment.yml` (game data) and
`assets/js/planners/hero-equipment-core.js` (pure calc engine, no DOM). The
engine computes cost totals/breakdown for a fixed 3-troop × 4-slot grid,
where each cell has an independent Rarity track and Mastery track, and
Rarity levels from `legendary_t1` onward require the same cell's Mastery
track at a specific level (auto-bumped, single pass — no fixed-point loop
needed, unlike `research-core.js`, because the dependency graph here is
exactly 12 disjoint 1:1 pairs, never cross-cell and never bidirectional).

## Requirements

- Functional: data file holds one shared Rarity cost table (21 entries)
  and one shared Mastery cost table (21 entries) — verified byte-identical
  across all 3 troops and all 4 slots via live `localStorage` state dump
  during brainstorming (`resource-calc-heroequipment-state-v1`,
  schemaVersion 5) — plus the list of troops, slots, and the Rarity→Mastery
  requirement rule.
- Functional: `hero-equipment-core.js` exposes a `createHeroEquipmentPlanner`
  (build the 12-cell structure from data) and a `calculateHeroEquipment`
  (given per-cell current/target selections for both tracks, resolve
  auto-added Mastery bumps and return totals/breakdown), mirroring the
  `createResearchPlanner`/`calculateResearchRequirements` shape in
  `research-core.js` but without the iterative graph-resolution loop.
- Non-functional: pure functions, no DOM/global access (matches every
  existing `*-core.js`), so it stays independently unit-testable and
  consistent with `tomes-core.js`/`robots-satellites-core.js`/
  `research-core.js`.

## Architecture

**Data shape** (`_data/lands_of_jail/hero_equipment.yml`), source:
`https://www.lojcalc.com/hero-equipment.html`, retrieved 2026-09-10 via live
browser `localStorage` state (not static HTML — this is a client-rendered
SPA):

```yaml
schema_version: 1
source:
  url: https://www.lojcalc.com/hero-equipment.html
  retrieved: 2026-09-10
  note: >
    Rarity and Mastery cost curves are identical across all 3 troops and all
    4 equipment slots (verified via live localStorage state dump,
    resource-calc-heroequipment-state-v1, schemaVersion 5) — one shared
    rarity table and one shared mastery table apply to all 12 (troop, slot)
    pairs. Past Legendary, a slot's Rarity level requires that same slot's
    own Mastery track at the paired level (never cross-slot/cross-troop).
resources: [EquipmentParts, PrecisionEquipment, Magnet, PotentialCoil]
troops: [shieldbearer, bomber, shooter]
slots: [gloves, helmet, chest, boots]
rarity:
  # 21 entries: 11 tiers, each (except exotic_t3) paired with a "_s1"
  # "levels maxed" checkpoint. Target selects only the 11 non-"_s1" ids;
  # Current may select any of the 21. requiresMastery: level id (string,
  # matches mastery.levels ids below) the slot's own Mastery track must
  # reach before this Rarity level can be taken; omitted = no requirement.
  levels:
    - { id: common,             cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: common_s1,          cost: { EquipmentParts: 2620,   PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 }, estimated: true }
    - { id: uncommon,           cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 20,   PotentialCoil: 0 } }
    - { id: uncommon_s1,        cost: { EquipmentParts: 6980,   PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: rare,                cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 40,   PotentialCoil: 0 } }
    - { id: rare_s1,             cost: { EquipmentParts: 19220,  PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: epic,                cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 120,  PotentialCoil: 0 } }
    - { id: epic_s1,             cost: { EquipmentParts: 41020,  PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: legendary,           cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 200,  PotentialCoil: 0 } }
    - { id: legendary_s1,        cost: { EquipmentParts: 77000,  PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: legendary_t1,        cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 400,  PotentialCoil: 0 },  requiresMastery: "10" }
    - { id: legendary_t1_s1,     cost: { EquipmentParts: 117000, PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: legendary_t2,        cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 600,  PotentialCoil: 20 }, requiresMastery: "11" }
    - { id: legendary_t2_s1,     cost: { EquipmentParts: 157000, PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: exotic,              cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 1000, PotentialCoil: 40 }, requiresMastery: "12" }
    - { id: exotic_s1,           cost: { EquipmentParts: 197000, PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: exotic_t1,           cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 1000, PotentialCoil: 60 }, requiresMastery: "13" }
    - { id: exotic_t1_s1,        cost: { EquipmentParts: 258000, PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: exotic_t2,           cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 2000, PotentialCoil: 80 }, requiresMastery: "14" }
    - { id: exotic_t2_s1,        cost: { EquipmentParts: 338200, PrecisionEquipment: 0, Magnet: 0,    PotentialCoil: 0 } }
    - { id: exotic_t3,           cost: { EquipmentParts: 0,      PrecisionEquipment: 0, Magnet: 2000, PotentialCoil: 100 }, requiresMastery: "15" }
mastery:
  # 21 entries, Level 0-20. id is the numeric level as a string (matches
  # rarity[].requiresMastery values above).
  levels:
    - { id: "0",  cost: { EquipmentParts: 0, PrecisionEquipment: 0,   Magnet: 0,    PotentialCoil: 0 } }
    - { id: "1",  cost: { EquipmentParts: 0, PrecisionEquipment: 20,  Magnet: 0,    PotentialCoil: 0 } }
    - { id: "2",  cost: { EquipmentParts: 0, PrecisionEquipment: 40,  Magnet: 0,    PotentialCoil: 0 } }
    - { id: "3",  cost: { EquipmentParts: 0, PrecisionEquipment: 60,  Magnet: 0,    PotentialCoil: 0 } }
    - { id: "4",  cost: { EquipmentParts: 0, PrecisionEquipment: 80,  Magnet: 0,    PotentialCoil: 0 } }
    - { id: "5",  cost: { EquipmentParts: 0, PrecisionEquipment: 100, Magnet: 0,    PotentialCoil: 0 } }
    - { id: "6",  cost: { EquipmentParts: 0, PrecisionEquipment: 120, Magnet: 0,    PotentialCoil: 0 } }
    - { id: "7",  cost: { EquipmentParts: 0, PrecisionEquipment: 140, Magnet: 0,    PotentialCoil: 0 } }
    - { id: "8",  cost: { EquipmentParts: 0, PrecisionEquipment: 160, Magnet: 0,    PotentialCoil: 0 } }
    - { id: "9",  cost: { EquipmentParts: 0, PrecisionEquipment: 180, Magnet: 0,    PotentialCoil: 0 } }
    - { id: "10", cost: { EquipmentParts: 0, PrecisionEquipment: 200, Magnet: 220,  PotentialCoil: 0 } }
    - { id: "11", cost: { EquipmentParts: 0, PrecisionEquipment: 220, Magnet: 200,  PotentialCoil: 0 } }
    - { id: "12", cost: { EquipmentParts: 0, PrecisionEquipment: 240, Magnet: 400,  PotentialCoil: 0 } }
    - { id: "13", cost: { EquipmentParts: 0, PrecisionEquipment: 260, Magnet: 600,  PotentialCoil: 0 } }
    - { id: "14", cost: { EquipmentParts: 0, PrecisionEquipment: 280, Magnet: 800,  PotentialCoil: 0 } }
    - { id: "15", cost: { EquipmentParts: 0, PrecisionEquipment: 300, Magnet: 1000, PotentialCoil: 0 } }
    - { id: "16", cost: { EquipmentParts: 0, PrecisionEquipment: 320, Magnet: 1200, PotentialCoil: 0 } }
    - { id: "17", cost: { EquipmentParts: 0, PrecisionEquipment: 360, Magnet: 1400, PotentialCoil: 0 } }
    - { id: "18", cost: { EquipmentParts: 0, PrecisionEquipment: 380, Magnet: 1600, PotentialCoil: 0 } }
    - { id: "19", cost: { EquipmentParts: 0, PrecisionEquipment: 400, Magnet: 1800, PotentialCoil: 0 } }
    - { id: "20", cost: { EquipmentParts: 0, PrecisionEquipment: 400, Magnet: 2000, PotentialCoil: 0 } }
```

Double-check every number above against the raw JSON captured during
brainstorming before committing — it was extracted via a compact
`[id, EquipmentParts, PrecisionEquipment, Magnet, PotentialCoil, requiresMasteryLevel, estimated]`
tuple dump per level from `equip_shieldbearer_gloves` (Rarity) and
`mastery_shieldbearer_gloves` (Mastery), then independently spot-verified
identical across `equip_bomber_gloves`, `equip_shooter_gloves`, and
`equip_shieldbearer_boots` (same JS session). Re-fetch from
`https://www.lojcalc.com/hero-equipment.html`'s `localStorage` key
`resource-calc-heroequipment-state-v1` if any figure looks suspicious rather
than trusting transcription alone — this repo's convention (set during the
Robots & Satellites migration) is to independently re-verify source numbers,
not hand-copy once.

**Engine shape** (`hero-equipment-core.js`, mirrors `research-core.js`'s
export names/shape but single-pass, not iterative):

```js
import { formatNumber } from './planner-core.js';
export { formatNumber };

export function createHeroEquipmentPlanner(data) {
  // Validate data.resources/troops/slots/rarity.levels/mastery.levels shapes
  // (same style of guard clauses as createResearchPlanner). Build a Map of
  // 12 cell keys `${troop}-${slot}` -> { rarityLevels, masteryLevels }
  // (both arrays are the same shared arrays for every cell — no per-cell
  // copies needed since costs are identical). Also build a mastery
  // id -> index lookup (0-20) for the requiresMastery bump below.
}

export function calculateHeroEquipment(planner, selections) {
  // selections: { [cellKey]: { rarity: {currentIndex, targetIndex},
  //                             mastery: {currentIndex, targetIndex} } }
  // For each of the 12 cells:
  //   1. Determine the *effective* mastery target: start from the
  //      selected mastery targetIndex; walk the rarity range
  //      [rarityCurrent+1 .. rarityTarget]; for any level with
  //      requiresMastery, take the max(requiredIndex) needed; if that
  //      exceeds the effective mastery target, bump it and mark this
  //      cell's mastery row as auto-added. Single pass — no loop, because
  //      mastery levels never carry their own requires (verified: 0 of 21
  //      mastery levels have non-empty requires in the source dump).
  //   2. Sum rarity range cost (current+1..target) and effective mastery
  //      range cost (current+1..effectiveTarget) into per-resource totals;
  //      collect an `estimated` array of resource keys touched by any
  //      summed level flagged `estimated: true` (only `common_s1`,
  //      EquipmentParts).
  // Return { totals (per resource key), breakdown: [{ cellKey, troop, slot,
  //   track: 'rarity'|'mastery', fromLevelId, toLevelId, cost, automatic,
  //   estimated }], grandTotal } — same general shape as
  //   calculateResearchRequirements's return, adapted for the fixed-grid
  //   (not selection-driven-subset) case.
}
```

Range-sum semantics for Rarity: current index may be any of the 21 (mid-farm
states included); target index is restricted by the UI (Phase 3) to the 11
non-`_s1` indices, but the engine itself should not assume that — just sum
whatever range `[current+1..target]` it's given, same permissive contract as
`tomes-core.js`. Reaching a target rarity naturally sums through any
intervening `_s1` sub-costs in that range, so no special-casing is needed —
this was confirmed live: the source's Target `<select>` only exposes even
array indices (0,2,4,...,20), and the range-sum over the full 21-entry array
already produces the correct total for that.

## Related Code Files

- Create: `_data/lands_of_jail/hero_equipment.yml`
- Create: `assets/js/planners/hero-equipment-core.js`
- Reference (read, do not modify): `assets/js/planners/research-core.js`
  (closest existing cascade-engine shape), `assets/js/planners/tomes-core.js`
  (range-sum pattern), `assets/js/planners/planner-core.js` (`formatNumber`
  re-export convention)

## Implementation Steps

1. Write `_data/lands_of_jail/hero_equipment.yml` exactly as specified above
   (re-verify against a fresh live fetch if anything looks off).
2. Write `hero-equipment-core.js`: `createHeroEquipmentPlanner` (data
   validation + 12-cell structure) and `calculateHeroEquipment` (single-pass
   Rarity→Mastery bump + range sums), following the guard-clause style and
   `TypeError`/`RangeError` conventions used in `research-core.js`/
   `tomes-core.js`.
3. Sanity-check the engine manually (e.g. a throwaway Node script, deleted
   before commit — same verification habit used for Robots & Satellites'
   SSR bracket sums during brainstorming) against the sample from source:
   Gloves Legendary(maxed)→Legendary T1 = 400 Magnet + an auto-added Mastery
   Level 5→10 = 800 Precision Equipment + 220 Magnet (matches the live
   breakdown sample captured during brainstorming).

## Success Criteria

- [x] `_data/lands_of_jail/hero_equipment.yml` parses as valid YAML and
      matches every source number transcribed above.
- [x] `createHeroEquipmentPlanner`/`calculateHeroEquipment` handle: a cell
      with no target (0 cost, no breakdown rows), a cell whose Rarity target
      needs no Mastery bump, a cell whose Rarity target needs an auto-added
      Mastery bump (matches the source sample above), and a cell where the
      user's own Mastery target already satisfies the requirement (no
      auto-add).
- [x] No DOM/global references in `hero-equipment-core.js` — pure functions
      only, matching every sibling `*-core.js`.

## Risk Assessment

Main risk is a transcription error in the 21+21 cost rows (four earlier
migrations all hit at least one data-fidelity issue during brainstorming or
plan validation). Mitigated by: values captured programmatically from the
live site's own `localStorage` state rather than hand-read from rendered
text, and cross-checked identical across 4 tracks (2 troops × 2 slots)
before being treated as canonical. Re-verify against source once more before
commit if anything looks inconsistent (e.g. a jump that doesn't follow the
visible growth pattern).
