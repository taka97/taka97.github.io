---
phase: 2
title: "Phase 2: Data File and Calc Engine"
status: done
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Data File and Calc Engine

## Overview

Create `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` (game data)
and `assets/js/planners/hero-stars-exclusive-equipment-core.js` (pure calc
engine, no DOM). The engine computes cost totals/breakdown for **two
independent addable instance lists** — Hero Stars (keyed levels, capped at
6 instances) and Exclusive Equipment (numeric levels, capped at 6
instances) — each a flat per-instance range-sum with no cross-track
resolution (unlike Hero Equipment's single-pass Rarity→Mastery bump; this
tool's `requires` arrays are empty on every level of both tracks,
confirmed live).

## Requirements

- Functional: data file holds the full 32-entry Hero Stars level table and
  full 11-entry Exclusive Equipment level table — verified via live
  `trackById('herostar_1')`/`trackById('exclusiveequip_1')` dumps during
  brainstorming (`resource-calc-herostars-state-v1`, schemaVersion 2) —
  plus the 2 resources and `caps: { heroStars: 6, exclusiveEquipment: 6 }`
  (empirically verified: both `[data-add-item]` buttons stop incrementing
  and go `disabled` at 6 clicks).
- Functional: `hero-stars-exclusive-equipment-core.js` exposes a
  `createHeroStarsEquipmentPlanner` (build/validate the level tables +
  caps from data) and a `calculateHeroStarsEquipment` (given two arrays of
  per-instance current/target selections, return totals/breakdown for
  both lists), mirroring `robots-satellites-core.js`'s
  `createRobotsSatellitesPlanner`/`calculateRobotsSatellitesRequirements`
  shape (its `buildBreakdown()` helper is the direct template — this tool
  needs that same function applied twice, once per track, no satellite-tier
  lookup complexity since there's only one shared level table per track).
- Non-functional: pure functions, no DOM/global access (matches every
  existing `*-core.js`).

## Architecture

**Data shape** (`_data/lands_of_jail/hero_stars_exclusive_equipment.yml`),
source: `https://www.lojcalc.com/hero-stars-exclusive-equipment.html`,
retrieved 2026-09-11 via live browser (`window.trackById()`,
`window.resourceLabel()` — page-global functions leaked from an inline
non-module script — plus a `localStorage` state dump):

```yaml
schema_version: 1
source:
  url: https://www.lojcalc.com/hero-stars-exclusive-equipment.html
  retrieved: 2026-09-11
  note: >
    Cost is identical across all heroes (source's own "What this does"
    copy) — one shared Hero Stars level table and one shared Exclusive
    Equipment level table apply to every added instance. The two "+ Add
    Hero" buttons are independent (separate counters, separate caps).
    No cross-track prerequisite exists (every level's requires is empty on
    both tracks, verified via live trackById() dump) — unlike Hero
    Equipment's Rarity→Mastery pairing, this tool needs no cascade
    resolution.
resources: [HeroFragment, ExclusiveEquipPart]
caps: { heroStars: 6, exclusiveEquipment: 6 }
heroStars:
  # 32 entries. id suffix _s1.._s5 = stage sub-level within a star tier
  # ("K stars · stage N" in source UI); plain starK id = the tier's "whole"
  # checkpoint. Current select offers all 32; Target select must exclude
  # `start` and every _s\d+ stage id (UI-layer filter, Phase 3) — leaves
  # exactly 6 Target options: recruited, star1, star2, star3, star4, star5,
  # matching the live page's Target dropdown exactly. All costs are
  # HeroFragment only (ExclusiveEquipPart is 0 on every entry, omitted
  # here for brevity — normalize to 0 in the engine like every other
  # planner's normalizeCost).
  levels:
    - { id: start,       cost: { HeroFragment: 0 } }
    - { id: recruited,   cost: { HeroFragment: 10 } }
    - { id: star1_s1,    cost: { HeroFragment: 1 } }
    - { id: star1_s2,    cost: { HeroFragment: 1 } }
    - { id: star1_s3,    cost: { HeroFragment: 2 } }
    - { id: star1_s4,    cost: { HeroFragment: 2 } }
    - { id: star1_s5,    cost: { HeroFragment: 2 } }
    - { id: star1,       cost: { HeroFragment: 2 } }
    - { id: star2_s1,    cost: { HeroFragment: 5 } }
    - { id: star2_s2,    cost: { HeroFragment: 5 } }
    - { id: star2_s3,    cost: { HeroFragment: 5 } }
    - { id: star2_s4,    cost: { HeroFragment: 5 } }
    - { id: star2_s5,    cost: { HeroFragment: 5 } }
    - { id: star2,       cost: { HeroFragment: 15 } }
    - { id: star3_s1,    cost: { HeroFragment: 15 } }
    - { id: star3_s2,    cost: { HeroFragment: 15 } }
    - { id: star3_s3,    cost: { HeroFragment: 15 } }
    - { id: star3_s4,    cost: { HeroFragment: 15 } }
    - { id: star3_s5,    cost: { HeroFragment: 15 } }
    - { id: star3,       cost: { HeroFragment: 40 } }
    - { id: star4_s1,    cost: { HeroFragment: 40 } }
    - { id: star4_s2,    cost: { HeroFragment: 40 } }
    - { id: star4_s3,    cost: { HeroFragment: 40 } }
    - { id: star4_s4,    cost: { HeroFragment: 40 } }
    - { id: star4_s5,    cost: { HeroFragment: 40 } }
    - { id: star4,       cost: { HeroFragment: 100 } }
    - { id: star5_s1,    cost: { HeroFragment: 100 } }
    - { id: star5_s2,    cost: { HeroFragment: 100 } }
    - { id: star5_s3,    cost: { HeroFragment: 100 } }
    - { id: star5_s4,    cost: { HeroFragment: 100 } }
    - { id: star5_s5,    cost: { HeroFragment: 100 } }
    - { id: star5,       cost: { HeroFragment: 100 } }
exclusiveEquipment:
  # 11 entries, Level 0-10 (id = numeric level as a string). All costs are
  # ExclusiveEquipPart only (HeroFragment is 0 on every entry). Current and
  # Target selects both offer all 11 — no checkpoint filtering needed on
  # this track (numeric levelStyle, no stage sub-levels).
  levels:
    - { id: "0",  cost: { ExclusiveEquipPart: 0 } }
    - { id: "1",  cost: { ExclusiveEquipPart: 10 } }
    - { id: "2",  cost: { ExclusiveEquipPart: 25 } }
    - { id: "3",  cost: { ExclusiveEquipPart: 25 } }
    - { id: "4",  cost: { ExclusiveEquipPart: 45 } }
    - { id: "5",  cost: { ExclusiveEquipPart: 45 } }
    - { id: "6",  cost: { ExclusiveEquipPart: 65 } }
    - { id: "7",  cost: { ExclusiveEquipPart: 65 } }
    - { id: "8",  cost: { ExclusiveEquipPart: 85 } }
    - { id: "9",  cost: { ExclusiveEquipPart: 85 } }
    - { id: "10", cost: { ExclusiveEquipPart: 100 } }
```

Double-check every number above against the raw JSON captured during
brainstorming before committing (`window.trackById('herostar_1').levels`
and `window.trackById('exclusiveequip_1').levels`, dumped in 3 slices to
avoid the browser tool's output truncation) — re-fetch from
`https://www.lojcalc.com/hero-stars-exclusive-equipment.html` if any figure
looks suspicious rather than trusting transcription alone, this repo's
established convention.

**Engine shape** (`hero-stars-exclusive-equipment-core.js`), modeled
directly on `robots-satellites-core.js`'s `buildBreakdown()` +
`calculateRobotsSatellitesRequirements()` shape — no fixed-point/cascade
logic needed (all `requires` arrays are empty):

```js
import { formatNumber } from './planner-core.js';
export { formatNumber };

const RESOURCE_KEYS = ['HeroFragment', 'ExclusiveEquipPart'];

export function createHeroStarsEquipmentPlanner(data) {
  // Validate data.resources/heroStars.levels (32)/exclusiveEquipment.levels
  // (11)/data.caps.{heroStars,exclusiveEquipment} shapes — same guard-clause
  // style as createRobotsSatellitesPlanner. normalizeCost() each level row
  // against RESOURCE_KEYS (defaulting missing keys to 0, same as every
  // sibling *-core.js). Return { heroStarsLevels, exclusiveEquipmentLevels,
  // resources, caps }.
}

export function calculateHeroStarsEquipment(planner, heroStarsInstances, exclusiveEquipmentInstances) {
  // Two independent calls to the same buildBreakdown(levels, instances, totals)
  // helper robots-satellites-core.js already has (copy verbatim — clampIndex,
  // sumCostRange, addCost, emptyResourceTotals are all reusable as-is, no
  // Hero-Equipment-style requiresMastery bump needed here). No instance-count
  // cap check in this function — matches robots-satellites-core.js's
  // calculateRobotsSatellitesRequirements exactly (it never checks
  // instances.length against planner.caps.robots; the cap is UI-only, see
  // Phase 3). caps is still validated as a positive integer at data-load
  // time in createHeroStarsEquipmentPlanner (mirrors positiveInteger() at
  // robots-satellites-core.js:45), just never re-checked here.
  // Return { totals, heroStarsBreakdown: [{index, currentIndex, targetIndex,
  //   cost}], exclusiveEquipmentBreakdown: [{index, currentIndex,
  //   targetIndex, cost}] } — same general shape as
  //   calculateRobotsSatellitesRequirements's { totals, robotBreakdown,
  //   satelliteBreakdown }.
}
```

<!-- Updated: Validation Session 1 - dropped core-engine cap guard, UI-only enforcement matching robots-satellites-core.js precedent -->

No `estimated` handling anywhere in this engine — confirmed live that
neither track has any `estimated`-flagged level (unlike all 4 prior tools).
`sumCostRange`/`addCost`/`emptyResourceTotals` can drop the `estimated`
bookkeeping entirely rather than carrying an always-empty array, keeping
this the simplest of the 5 engines.

## Related Code Files

- Create: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`
- Create: `assets/js/planners/hero-stars-exclusive-equipment-core.js`
- Reference (read, do not modify): `assets/js/planners/robots-satellites-core.js`
  (direct template — `buildBreakdown`, `clampIndex`, `sumCostRange`,
  `addCost`, `emptyResourceTotals`, cap-guard pattern),
  `assets/js/planners/planner-core.js` (`formatNumber` re-export convention)

## Implementation Steps

1. Write `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` exactly
   as specified above (re-verify against a fresh live fetch if anything
   looks off).
2. Write `hero-stars-exclusive-equipment-core.js`: `createHeroStarsEquipmentPlanner`
   (data validation) and `calculateHeroStarsEquipment` (two independent
   `buildBreakdown` calls, cap enforcement), following the guard-clause
   style and `TypeError`/`RangeError` conventions used in
   `robots-satellites-core.js`.
3. Sanity-check the engine manually (throwaway Node script, deleted before
   commit) against the sample from source: one Hero Stars instance
   current=`recruited`(index1)→target=`star2`(index13) should sum
   `star1_s1..star1_s5, star1, star2_s1..star2_s5, star2` =
   1+1+2+2+2+2+5+5+5+5+5+15 = 50 HeroFragment; one Exclusive Equipment
   instance current=Level 0→target=Level 3 should sum 10+25+25 = 60
   ExclusiveEquipPart (matches the live breakdown sample captured during
   brainstorming: "Hero 1 ... 60 Exclusive Weapon Parts").

## Success Criteria

- [x] `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` parses as
      valid YAML and matches every source number transcribed above.
- [x] `createHeroStarsEquipmentPlanner`/`calculateHeroStarsEquipment`
      handle: an instance with no target (0 cost, no breakdown row) and a
      normal range-sum on each track independently. `calculateHeroStarsEquipment`
      does not itself enforce the cap (UI-only, per Validation Session 1) —
      only `createHeroStarsEquipmentPlanner` validates `data.caps.*` are
      positive integers at load time.
- [x] No DOM/global references in `hero-stars-exclusive-equipment-core.js`
      — pure functions only, matching every sibling `*-core.js`.

## Risk Assessment

Main risk is a transcription error in the 32+11 cost rows (every prior
migration hit at least one data-fidelity issue during brainstorming or plan
validation). Mitigated by: values captured programmatically from the live
site's own `trackById()`/`localStorage` state rather than hand-read from
rendered text, and the manual sanity-check step above cross-verifies two
independent sample calculations against the live page's own displayed
breakdown numbers before this phase is considered done.
