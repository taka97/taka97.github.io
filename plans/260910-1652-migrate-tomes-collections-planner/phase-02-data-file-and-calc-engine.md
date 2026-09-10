---
phase: 2
title: "Phase 2: Data file and calc engine"
status: complete
priority: P1
effort: ""
dependencies: [1]
---

# Phase 2: Data file and calc engine

## Overview

Transcribe Phase 1's verified cost tables into a new YAML data file, and write
a minimal, pure calculation engine for repeatable, prerequisite-free instance
tracks. No UI/DOM work in this phase.

## Requirements

- Functional: `tomes-core.js` computes correct per-instance cost between any
  current/target level index, and correct combined totals across an arbitrary
  number of Tome and Collection instances.
- Functional: engine throws on structurally invalid data (missing cost rows,
  wrong array lengths) at construction time, mirroring `planner-core.js`'s
  `createPlanner()` validation style — fail fast, not silently wrong numbers.
- Non-functional: no cross-track requirement/cascade logic — Phase 1 confirmed
  none exists for this tool. Do not port `resolveRequirements()`-style code
  from `planner-core.js`; it would be dead code here (YAGNI).

## Architecture

Two independent, flat "level tables" (Tome: 13 rows incl. level 0; Collection:
43 rows incl. `start`), shared by every instance of that category. An
"instance" is just `{ currentIndex, targetIndex }` — no per-instance data other
than progress, since the cost curve is identical for every tome/every
collection (per Phase 1).

```js
// tomes-core.js shape (pure functions, no DOM/storage):
export function createTomesPlanner(data) {
  // data = { tomeLevels: [{wisdom,knowledge}, ...], collectionLevels: [{id,tier,common,rare,precious,legendary}, ...], caps:{tomes,collections} }
  // validates: tomeLevels.length === 13 (0..12), collectionLevels.length === 43 (start + 42 tier rows),
  // every cost field is a non-negative integer. Throws TypeError otherwise.
  return { tomeLevels, collectionLevels, caps };
}

export function calculateTomesRequirements(planner, tomeInstances, collectionInstances) {
  // tomeInstances/collectionInstances: [{ currentIndex, targetIndex }, ...]
  // Returns: { totals (per-resource sums across everything),
  //            tomeBreakdown: [{ index, from, to, cost }] (only entries with targetIndex > currentIndex),
  //            collectionBreakdown: [{ index, from, to, cost }] (same),
  //            grandTotal }
  // Mirrors source's computeCascade() minus the auto-bump step (nothing to bump).
}
```

Reuse `RESOURCES`-style totals shape from `planner-core.js` for consistency
(`{ SealOfWisdom, SealOfKnowledge, CommonCoin, RareCoin, PreciousCoin,
LegendaryCoin }` all-keys-present object, not a sparse map) — matches
`emptyResourceTotals`/`addCost` conventions already in `planner-core.js`.

## Related Code Files

- Create: `_data/lands_of_jail/tomes_collections.yml`
- Create: `assets/js/planners/tomes-core.js`
- Read (pattern reference, do not modify): `assets/js/planners/planner-core.js`,
  `assets/js/planners/research-core.js`

## Implementation Steps

1. Write `_data/lands_of_jail/tomes_collections.yml` transcribing Phase 1's
   `TOME_COSTS` (12 rows) and `COLLECTION_TIERS` (11 tiers, 43 rows) verbatim,
   plus `caps: { tomes: 18, collections: 6 }`. Use resource key names matching
   Phase 1 exactly (`SealOfWisdom`, `SealOfKnowledge`, `CommonCoin`, `RareCoin`,
   `PreciousCoin`, `LegendaryCoin`) so `tomes-core.js` and the eventual UI layer
   don't need a translation table between YAML keys and resource keys.
2. Write `tomes-core.js`: `createTomesPlanner(data)` validates and normalizes
   the two level tables (13 and 43 rows respectively, per Phase 1's exact
   counts); `calculateTomesRequirements(planner, tomeInstances,
   collectionInstances)` sums cost per instance between its current/target
   index and produces combined totals + per-instance breakdown rows, skipping
   instances where `targetIndex <= currentIndex` (nothing to do).
3. Add a `formatNumber` export (or reuse `planner-core.js`'s) for consistent
   thousands-separator formatting across all planner pages.
4. Write a standalone Node script (not committed, scratchpad-only) that loads
   the YAML via a quick parse, constructs a planner, and reproduces 2-3 costs
   hand-computed from Phase 1's tables (e.g. Tome 1: level 0->3 =
   10+50+90=150 SealOfWisdom, 10+60+110=180 SealOfKnowledge; Collection 1:
   start->rare = 3000+7500+13500=24000 Common, 30+75+135=240 Rare) to sanity
   check the engine before Phase 3 builds UI on top of it.

## Success Criteria

- [x] `_data/lands_of_jail/tomes_collections.yml` round-trips through Jekyll's
      `jsonify` filter without error (checked in Phase 6, but structure must be
      jsonify-safe: no anchors/aliases, plain scalars/lists/maps).
- [x] `createTomesPlanner()` throws on a level table with the wrong row count
      or a negative/non-integer cost field.
- [x] `calculateTomesRequirements()` matches all hand-computed spot checks from
      Implementation Step 4.
- [x] No `requires`/cascade code exists in `tomes-core.js` (confirms Phase 1's
      "no cross-track prerequisites" finding stayed true through implementation).

## Risk Assessment

Off-by-one in level indexing (source's level 0 is free, level 1 is
`TOME_COSTS[0]`) is the most likely transcription bug — the same class of bug
the prior Forticlad migration hit with FC6-FC10 sub-palier rows. Mitigate by
writing the Step 4 sanity script before Phase 3, using numbers computed by
hand directly from Phase 1's tables (not re-derived from the engine itself).
