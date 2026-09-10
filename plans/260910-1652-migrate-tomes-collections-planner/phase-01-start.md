---
phase: 1
title: "Phase 1: Source data reference"
status: complete
priority: P1
effort: ""
dependencies: []
---

# Phase 1: Source data reference

## Overview

Not an implementation phase — a verified data appendix. Every number used in
Phases 2-5 comes from this capture, taken directly from
`https://www.lojcalc.com/tomes-collections.html`'s inline `<script>` block and
`https://www.lojcalc.com/shared.js` (the generic engine every lojcalc.com route
loads), retrieved 2026-09-10. Do not re-scrape; do not invent numbers not
listed here. If a later phase needs a value not captured here, re-fetch the
source and append it to this file rather than guessing.

## Requirements

- [x] Capture every resource key, cost table, cap, and structural rule needed
      by Phases 2-5, traceable to the source URL and retrieval date above.

## Source structure (`tomes-collections.html` inline script)

```js
const RESOURCES = ["SealOfWisdom","SealOfKnowledge","CommonCoin","RareCoin","PreciousCoin","LegendaryCoin"];
const PARTS = [
  { key:"tomes", labelKey:"partTomes", icon:"📖" },
  { key:"collection", labelKey:"partCollection", icon:"🏺" },
];
const CATEGORIES = [
  { key:"Tome", labelKey:"catTome", icon:"📖", grouped:false, part:"tomes", dynamic:{addLabelKey:"addTome", makeTrack:makeTomeTrack, max:18} },
  { key:"Collection", labelKey:"catCollection", icon:"🏺", grouped:false, part:"collection", dynamic:{addLabelKey:"addCollection", makeTrack:makeCollectionTrack, max:6} },
];
```

Two dynamic categories, each starting with 1 default instance
(`defaultData().counts = { Tome:1, Collection:1 }`), capped at `max` (18 / 6).
No `GROUP_ICONS` (neither category uses `grouped:true`), no `pairedTrackId`
usage, no `accent`/`newBadge` flags on any track — this tool is the simplest of
the 5 lojcalc.com routes structurally.

## Resources

| Key | EN label (source `I18N.en`) | Accent color (`RES_ACCENT`, reference only — site uses its own palette) |
|---|---|---|
| `SealOfWisdom` | Seal of Wisdom | `#ffd60a` |
| `SealOfKnowledge` | Seal of Knowledge | `#ffd60a` |
| `CommonCoin` | Common Trove Coin | `#8ec7ff` |
| `RareCoin` | Rare Trove Coin | `#ff8ecf` |
| `PreciousCoin` | Precious Trove Coin | `#ffb648` |
| `LegendaryCoin` | Legendary Trove Coin | `#ff5c72` |

Tomes only ever cost `SealOfWisdom`/`SealOfKnowledge`. Collections only ever
cost `CommonCoin`/`RareCoin`/`PreciousCoin`/`LegendaryCoin`. No level anywhere
costs both groups.

## Tomes: `TOME_COSTS` (12 levels, identical curve for every tome instance)

Level 0 is the free starting level (`{w:0,k:0}`), not in this table. Level
index `i` (1-12) costs `TOME_COSTS[i-1]` as the single-step jump from `i-1` to
`i` (levels are NOT cumulative in the source array — each entry is the cost of
that one step, matching `makeTomeTrack`'s `levels.push({..., cost, ...})` loop
which pushes one row per array entry with no running sum).

| Level | SealOfWisdom | SealOfKnowledge |
|---|---|---|
| 1 | 10 | 10 |
| 2 | 50 | 60 |
| 3 | 90 | 110 |
| 4 | 160 | 200 |
| 5 | 270 | 330 |
| 6 | 380 | 460 |
| 7 | 480 | 600 |
| 8 | 540 | 660 |
| 9 | 620 | 780 |
| 10 | 760 | 920 |
| 11 | 920 | 1040 |
| 12 | 1040 | 1240 |

`levelStyle:"numeric"`, `romanLevels:true` — displayed as "Level I".."Level
XII" (source's `toRoman()`). Track id pattern: `tome_<idx>` (1-based, idx =
instance number). Display name: `t("tomeLabel",{n:idx})` = "Tome {n}".

## Collections: `COLLECTION_TIERS` (11 tiers, identical curve for every
collection instance)

Level 0 (`id:"start"`) is free. Then 11 tiers in order; each tier's first row
uses the bare tier key as its level id, subsequent rows in the same tier use
`<tier>_s<n>` (n = 1-based index within the tier, "sub-level"/star). **Uncommon
has only 2 rows (1 base + 1 star); every other tier has 4 rows (1 base + 3
stars).** Cost fields: `c`=CommonCoin, `r`=RareCoin, `p`=PreciousCoin (omitted
= 0), `l`=LegendaryCoin (omitted = 0, only appears from `exotic` tier onward).

| Tier key (`levelKeyPrefix` = `coltier_`) | EN label | Row IDs | Costs (Common / Rare / Precious / Legendary) |
|---|---|---|---|
| `uncommon` | Uncommon | `uncommon`, `uncommon_s1` | {3000,30,0,0} / {7500,75,0,0} |
| `rare` | Rare | `rare`, `rare_s1..3` | {13500,135,0,0} / {20000,200,0,0} / {5000,50,70,0} / {6000,60,80,0} |
| `epic` | Epic | `epic`, `epic_s1..3` | {7000,70,90,0} / {8000,80,100,0} / {9000,90,110,0} / {10000,100,120,0} |
| `epic_t1` | Epic T1 | `epic_t1`, `epic_t1_s1..3` | {15000,150,140,0} / {20000,200,150,0} / {25000,250,170,0} / {30000,300,210,0} |
| `legendary` | Legendary | `legendary`, `legendary_s1..3` | {41000,410,90,0} / {43000,430,90,0} / {47000,470,100,0} / {49000,490,100,0} |
| `legendary_t1` | Legendary T1 | `legendary_t1`, `..._s1..3` | {53000,530,100,0} / {57000,570,120,0} / {61000,610,120,0} / {66000,660,120,0} |
| `legendary_t2` | Legendary T2 | `legendary_t2`, `..._s1..3` | {71000,710,120,0} / {83000,830,160,0} / {88000,880,170,0} / {95000,950,180,0} |
| `exotic` | Exotic | `exotic`, `exotic_s1..3` | {100000,1000,180,15} / {105000,1050,190,20} / {110000,1100,200,20} / {115000,1150,210,25} |
| `exotic_t1` | Exotic T1 | `exotic_t1`, `..._s1..3` | {120000,1200,245,25} / {125000,1250,255,30} / {130000,1300,265,30} / {135000,1350,275,35} |
| `exotic_t2` | Exotic T2 | `exotic_t2`, `..._s1..3` | {140000,1400,310,35} / {145000,1450,315,40} / {150000,1500,325,40} / {160000,1600,335,45} |
| `exotic_t3` | Exotic T3 | `exotic_t3`, `..._s1..3` | {165000,1650,350,45} / {170000,1700,365,50} / {175000,1750,385,50} / {180000,1800,410,55} |

Total rows per collection: 1 (start) + 2 (uncommon) + 4×10 (rare..exotic_t3) =
**43 rows**. `levelStyle:"keyed"`, `levelKeyPrefix:"coltier_"`,
`stageWordKey:"starWord"` ("star") — a sub-level renders as e.g. "Rare · star
2". Track id pattern: `collection_<idx>`. Display name: `t("collectionLabel",
{n:idx})` = "Collection {n}".

## Structural rules (from `shared.js`, apply to both categories)

- **No `requires` anywhere** — every level's `requires` array is `[]` for both
  Tomes and Collections. `computeCascade()`'s auto-bump logic is therefore a
  no-op for this tool; Phase 2's engine does not need a requirement graph at
  all (unlike Forticlad's `planner-core.js`).
- **One shared stock pool, one combined breakdown**: `computeCascade()` and
  `renderBreakdown()` iterate `state.tracks` flatly across both categories —
  there is exactly one "what you're missing" summary and one breakdown table
  for the whole tool, not one per category.
- **Dynamic add, no remove UI**: `categoryHtml()` renders only a "+ Add" button
  (disabled at `max`); `syncDynamicCategory()`'s shrink path (`while
  (existing.length > want)`) is only ever reached by `defaultData()` on Reset,
  never by a user-facing decrement control.
- **`summaryResourceKeys` default**: not overridden by this route, so the
  summary grid shows exactly `RESOURCES.filter(r => totals[r] > 0)` — only
  resources actually needed by current targets.
- Source's sticky bar (`renderStickyBar`) shows one chip per resource with
  `missing > 0`, hidden entirely when `breakdown` is empty or nothing is
  missing; clicking/Enter/Space scrolls to the "what you're missing" heading.

## Explicitly not modeled

French (`I18N.fr`) — this site is EN/VI only. `RES_ACCENT` hex values — this
site restyles with its own palette per the approved design (Phase 4/5), not a
copy of source colors.

## Success Criteria

- [x] This file contains every cost/requirement/cap number Phases 2-5 need,
      traceable to the source URLs and retrieval date above.
- [x] Confirmed no cross-track `requires` exist for this tool (verified by
      reading `makeTomeTrack`/`makeCollectionTrack` in full — every `requires`
      is a literal `[]`).
