---
title: "Phase 1: Source data reference"
status: done
---

# Phase 1: Source data reference

## Overview

Not an implementation phase — a verified data appendix. Every number used in
Phases 2-5 comes from this capture, taken directly from
`https://www.lojcalc.com/index.html`'s inline `<script>` block (retrieved
2026-09-09), which defines the tool's real game data before loading its generic
rendering engine (`shared.js`). Do not re-scrape; do not invent numbers not
listed here. If a later phase needs a value not captured here, re-fetch the
source and append it to this file rather than guessing.

## Source structure

```js
const RESOURCES = ["FC","AFC","Hyperalloy"];
const PARTS = [
  { key:"buildings", labelKey:"partBuildings", icon:"🏠" },
  { key:"research", labelKey:"partResearch", icon:"🔬" },
];
const CATEGORIES = [
  { key:"Building", labelKey:"catBuilding", icon:"🏠", grouped:false, part:"buildings" },
  { key:"Research", labelKey:"catResearch", icon:"🔬", grouped:true, part:"research" },
];
const GROUP_ICONS = { shieldbearer:"🛡️", bomber:"💣", shooter:"🏹" };
```

`pageTitle: "FC Buildings & T11 Research"`. Page intro note (EN):
"Warden's Office progression is modeled from Level 30 all the way to FC10. Food,
Wood, Steel, Gasoline and Gold Card aren't tracked — only FC, AFC and Hyperalloy."

## I18N.en labels to reuse verbatim (do not use I18N.fr)

```
partBuildings: "Buildings", partResearch: "Research T11"
catBuilding: "Buildings", catResearch: "Research T11"
res_FC: "FC", res_AFC: "AFC", res_Hyperalloy: "Hyperalloy"
building_warden_office: "Warden's Office"
building_shieldbearer_barrack: "Shieldbearer Barracks"
building_bomber_barrack: "Bomber Barracks"        <!-- was mistranscribed as "boomer-barrack" in our data -->
building_shooter_barrack: "Shooter Barracks"
building_communication_center: "Communication Center"
building_command_center: "Command Center"
building_medical_station: "Medical Station"
building_fc_lab: "FC Lab"
troop_shieldbearer: "Shieldbearer"
troop_bomber: "Bomber"
troop_shooter: "Shooter"
research_expedition: "Expedition Troops Capacity"
research_lethality: "Increases Lethality"
research_atk: "Increases ATK"
research_def: "Increases DEF"
research_hp: "Increases HP"
research_rally: "Increase Rally Troop Capacity"
research_bastion: "Unlocks Troop Lv.11"
research_heal_lethality: "Reduce Resource Consumption for Healing and Increase Their Lethality"
research_train_hp: "Reduce Resource Consumption for Training and Increase Their HP"
```

## Buildings: cost curves (`tierChain(earlyFC, lateAfcFc, fc9Fc10)`)

`tierChain` produces one `{from, to, afc, fc}` entry per FC-tier transition
(30->FC1, FC1->FC2, ..., FC9->FC10). `buildingTrack()` then expands **every**
tier entry into **5 rows**: 4 identical sub-palier rows + 1 checkpoint row, all
costing the same `{fc, afc}` — i.e. total cost for one tier = `5 * cost`, not
`1 * cost`. This applies uniformly, including the late tiers (FC5-FC10) — our
current `forticlad.yml` only kept the checkpoint row for those, which is the
~5x undercount bug this plan fixes.

Per-building curves (`earlyFC` = 30->FC1..FC4->FC5 FC-only costs;
`lateAfcFc` = FC5->FC6, FC6->FC7, FC7->FC8 `{afc,fc}`; `fc9Fc10` = FC8->FC9,
FC9->FC10 `{afc,fc}`, omitted where the building caps at FC8):

| Building (id) | earlyFC (30-1..4-5) | lateAfcFc (5-6,6-7,7-8) | fc9Fc10 (8-9,9-10) | Gated by Warden Office? |
|---|---|---|---|---|
| `warden_office` (main/HQ) | 250,320,490,600,720 | {24,360},{36,400},{48,460} | {72,510},{168,630} | n/a (is the gate) |
| `shieldbearer_barrack` | 130,150,230,250,300 | {10,160},{15,180},{22,210} | {32,230},{75,290} | yes |
| `bomber_barrack` | 130,150,230,250,300 | {10,160},{15,180},{22,210} | {32,230},{75,290} | yes |
| `shooter_barrack` | 130,150,230,250,300 | {10,160},{15,180},{22,210} | {32,230},{75,290} | yes |
| `communication_center` | 50,60,80,110,130 | {5,90},{8,100},{12,110} | {17,130},{41,160} | yes |
| `command_center` | 50,60,80,110,130 | {5,70},{8,80},{12,90} | {14,100},{34,130} | yes |
| `medical_station` | 50,60,80,110,130 | {5,70},{8,80},{12,90} | *(none — caps at FC8)* | yes |

(`{afc,fc}` tuples above are written `{afc,fc}`, matching source order.)

**FC Lab** (new 8th building, `makeFcLabTrack()`) is a different, simpler shape:
6 tiers only (no AFC until tier 6), same 4-sub-palier+checkpoint expansion,
gated by Warden Office reaching the matching FC tier:

| FC Lab level | fc | afc | Gate (Warden Office tier) |
|---|---|---|---|
| 1 | 150 | 0 | FC1 |
| 2 | 200 | 0 | FC2 |
| 3 | 250 | 0 | FC3 |
| 4 | 300 | 0 | FC4 |
| 5 | 350 | 0 | FC5 |
| 6 | 160 | 10 | FC6 |

FC Lab does not progress past level 6 (levels 7-8 explicitly "not confirmed" in
source comments — do not invent them).

## Warden Office <-> support-building cross-gates (already correctly modeled in our yml — verify, don't change)

Every support building (Shieldbearer/Bomber/Shooter Barrack, Communication
Center, Command Center, Medical Station, FC Lab) requires Warden Office to have
already reached the same FC tier before it can progress into that tier (and
through its 4 sub-paliers). Conversely, Warden Office's own climb into FC2-FC10
requires two specific support buildings at the *previous* tier:

```
FC2 <- bomber_barrack:FC1, communication_center:FC1
FC3 <- shieldbearer_barrack:FC2, communication_center:FC2
FC4 <- shooter_barrack:FC3, communication_center:FC3
FC5 <- bomber_barrack:FC4, communication_center:FC4
FC6 <- shieldbearer_barrack:FC5, communication_center:FC5
FC7 <- shooter_barrack:FC6, communication_center:FC6
FC8 <- bomber_barrack:FC7, communication_center:FC7
FC9 <- shieldbearer_barrack:FC8
FC10 <- shooter_barrack:FC9
```
(FC1 has no gate — the 30->FC1 climb's real prerequisite, Communication Center
+ Shooter Barrack at Lv.29, is outside our tracked range which starts at 30.)

This matches what's already in `_data/lands_of_jail/forticlad.yml`
`requirements:` — Phase 2 should only need to add the FC Lab side of the
Warden-Office-gates-support-building direction (FC Lab requires Warden Office
per tier above), not touch the existing Warden-Office-requires-support-building
entries.

## T11 Research tree

3 independent troop lines — `shieldbearer`, `bomber`, `shooter` — **identical
cost curves and structure across all three** (confirmed in source comments).
Each line has 9 tracks, all Hyperalloy-only, `levelStyle:"numeric"`:

| Track (statKey) | Levels | Hyperalloy cost per level | Cross-track requires |
|---|---|---|---|
| `expedition` | 1-5 | 30,50,80,130,220 | Lv.4 needs FC Lab Lv.2 |
| `lethality` | 1-10 | 80,100,140,180,240,300,380,480,600,800 | Lv.4 needs FC Lab Lv.2; Lv.5 needs own `expedition` Lv.4; Lv.8 needs FC Lab Lv.3 |
| `atk` | 1-10 | *(same curve as lethality)* | *(same pattern as lethality)* |
| `def` | 1-10 | *(same curve as lethality)* | *(same pattern as lethality)* |
| `hp` | 1-10 | *(same curve as lethality)* | *(same pattern as lethality)* |
| `rally` | 1-12 | 160,200,240,290,360,430,530,650,810,1010,1260,1580 | Lv.1 needs lethality+atk+def+hp all Lv.5, and FC Lab Lv.4; Lv.7 needs lethality+atk+def+hp all Lv.10 |
| `bastion` (T11 unlock) | 1 only | 4500 | Lv.1 needs `rally` Lv.12 (maxed) + FC Lab Lv.5 |
| `heal_lethality` | 1-10 | 200,260,340,440,590,800,1120,1570,2360,3530 | Lv.1 needs `bastion` Lv.1 |
| `train_hp` | 1-10 | *(same curve as heal_lethality)* | Lv.1 needs `bastion` Lv.1 |

`lethality`/`atk`/`def`/`hp` each independently reference the *same troop's*
`expedition` and are each independently referenced by that troop's `rally` —
i.e. this is per-troop (27 tracks total = 3 troops x 9 tracks), no cross-troop
requirements. `bastion` is the visually-accented "end goal" of each line
(equivalent to Warden Office's `accent` treatment for buildings).

Total Hyperalloy to fully max one troop line: 9,780 (5-level tracks) is wrong
to hand-derive here — **do not hand-sum in this reference file**; Phase 6 will
compute and spot-check specific totals against these per-level tables directly.

## Explicitly not modeled (per source's own note)

Food, Wood, Steel, Gasoline, Gold Card — the source itself doesn't track these
for this tool. Don't add them.

## Success Criteria

- [x] This file contains every cost/requirement number Phases 2-5 need, traceable to the source URL and retrieval date above.
