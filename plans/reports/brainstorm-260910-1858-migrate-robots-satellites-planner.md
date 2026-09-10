---
title: "Brainstorm: Migrate Robots & Satellites to a new planner page"
date: 2026-09-10
status: approved
tags: [lands-of-jail, planners, brainstorm]
---

# Brainstorm: Migrate Robots & Satellites planner

## Problem statement

Continue migrating lojcalc.com tools into this site's own planner pattern. Previous
rounds migrated "FC Buildings & T11 Research" (`forticlad.md`) and "Tomes &
Collections" (`tomes-collections.md`). This round migrates the next tool:
`https://www.lojcalc.com/robots-satellites.html`.

## Source data (captured 2026-09-10)

From `robots-satellites.html`'s inline `<script>` + `shared.js` (the generic engine
every lojcalc.com route loads). Verbatim source (HTML + `shared.js` + CSS) saved to
session scratchpad during this session; re-fetch
`https://www.lojcalc.com/robots-satellites.html` and
`https://www.lojcalc.com/shared.js` if implementation needs to re-verify a number.

- **Resources (5, all new to this site):** `PrisonerArmorData`, `PowerModule`,
  `AdvancedPowerModule`, `DataDisk`, `PlanetCoin`.
- **Robot:** dynamic category, add-up-to-12, default 1. Numeric levels `1` (baseline,
  zero cost) then `10,20,...,100` (10 cost steps) — 11 levels total. Cost per step:
  `{PrisonerArmorData, PowerModule, AdvancedPowerModule}`, identical curve for every
  robot instance.
- **Satellites: 9 fixed, named, non-addable units** (unlike Robot/Tomes/Collections,
  count never changes), grouped into 3 rarity tiers sharing one cost curve per tier:
  - **R** (3 units — Laser, Watcher, Radiance): levels `1,10,20,30,40,50` (6 total,
    5 cost steps). Level 50's `DataDisk` cost is flagged `estimated:true` in source
    (not confirmed; derived from SR's growth rate) — `PlanetCoin` at that level IS
    confirmed.
  - **SR** (2 units — Arbitrator, Sentinel): levels `1,10,...,70` (8 total, 7 steps).
  - **SSR** (4 units — Omniscient Domain, Sky Nexus, Argus, Polaris): levels
    `1,10,...,90` (10 total, 9 steps).
  - Cost per step: `{DataDisk, PlanetCoin}`.
- **No cross-track prerequisites anywhere** (`requires:[]` everywhere, same as Tomes
  & Collections) — flat per-instance cost summing, no requirement-cascade engine
  needed (unlike Forticlad).
- **New UI patterns not yet used on this site:**
  - Source groups categories under two "PARTS" headers (Robots / Satellites), and
    within Satellites, three rarity-colored badge groups (R/SR/SSR).
  - One cost cell (SAT_R level 50's Data Disk) is marked `estimated`, rendered with
    a "≈" toggle badge + disclosure note in source.
- Add-only UX for Robot: "+ Add Robot" button capped at 12, no per-instance remove;
  shrinks only via full Reset. Satellites have no add/remove UI at all (fixed set).
- Layout order: intro -> current stock -> what's missing (summary cards + breakdown
  table) -> Robots part -> Satellites part (R/SR/SSR sub-groups) -> reset. Sticky
  bottom bar mirrors missing totals while scrolling (same as Tomes & Collections).

## Decisions (confirmed with user, 2026-09-10)

1. **New standalone page**, following the established pattern: nav entry "Tools ->
   Robots & Satellites" at `/en|vi/lands-of-jail/planners/robots-satellites/`.
2. **Satellite rarity groups render as flat cards under a rarity heading** (not
   collapsible troop-style groups like Forticlad's research) — each tier gets a
   subheading + colored badge, all satellites in it always visible as instance-range
   cards (same visual pattern as Tomes' instance cards). Simpler than a collapsible
   widget, appropriate for 2-4 items per tier.
3. **Build the "≈" estimated-cost badge as a new small reusable feature** — mark the
   affected cost row, add a disclosure note explaining the estimate. Preserves the
   real signal from source data (no silently-invented precision) and is added as a
   shared `table-helpers.js` addition so later tool migrations (Hero Equipment, Hero
   Stars & Exclusive Equipment) can reuse it.
4. **Levels start at index "1" (baseline unit already exists), not "0"** — matches
   source semantics exactly, for both Robot and all Satellite tracks.
5. **VI content**: create the VI page/content now with the full structure, but leave
   the 5 new resource names + 9 satellite names identical to the EN text for this
   round — translate in a follow-up pass (same deferred-translation decision as the
   Tomes & Collections round).
6. **Styling**: reuse the shared `.loj-planner__*` SCSS block; add narrowly-scoped
   new selectors only for the rarity badge and the estimated-tag disclosure widget.

## Proposed architecture (new files, following existing pattern)

- `_data/lands_of_jail/robots_satellites.yml` — resources (5), `robotLevels` (11 rows,
  baseline + 10 steps), `satelliteTiers` with each tier's shared cost curve (R: 6
  rows/5 steps, SR: 8 rows/7 steps, SSR: 10 rows/9 steps, R's last step's DataDisk
  cost flagged `estimated: true`), the fixed list of 9 satellite ids/labels/tier
  membership, and Robot's add cap (12). Transcribed verbatim from source.
- `assets/js/planners/robots-satellites-core.js` — pure calc engine, same shape as
  `tomes-core.js`: no requirement graph needed. `createRobotsSatellitesPlanner(data)`
  validates/normalizes; `calculateRobotsSatellitesRequirements(planner, robotInstances,
  satelliteInstances)` sums robot's dynamic list + satellites' fixed-by-id list into
  totals + breakdown rows, carrying an `estimated` flag per row when any summed level
  was estimated.
- `assets/js/planners/robots-satellites.js` — UI wiring: Robot section reuses the
  Tomes add-instance pattern (capped at 12); Satellites section renders 3 rarity
  sub-sections (R/SR/SSR), each a heading + badge + fixed (non-addable) instance-range
  cards keyed by satellite id. Breakdown table reuses `createTable`/`grandTotalFooter`
  plus the new estimated-badge helper.
- `assets/js/planners/table-helpers.js` — add one new exported helper for the "≈"
  disclosure badge (click-to-toggle note), so it's reusable by future tool migrations
  that also carry unconfirmed numbers.
- `contents/{en,vi}/lands-of-jail/planners/robots-satellites.md` — Markdown + planner
  skeleton (profile context, stock inputs for 5 resources, missing summary, Robot
  section, Satellites R/SR/SSR sections, reset, status, sticky bar), JSON data island
  via `{{ site.data.lands_of_jail.robots_satellites | jsonify }}`, same pattern as
  `tomes-collections.md`.
- `_data/navigation.yml` — new "Robots & Satellites" entry in `loj-en`/`loj-vi` Tools
  groups, positioned after Tomes & Collections (source nav order).
- `_sass/custom.scss` — extend `.loj-planner__*` block with rarity-badge and
  estimated-tag/note styling only (no restructuring of existing selectors needed).
- Storage: new tool key `robots-satellites` in the existing generic
  `profile.tools[...]` blob via `storage.js`'s `getToolData`/`updateToolData` — same
  read-latest-then-merge-then-write pattern as prior planners, no `storage.js`
  changes needed.

## Explicitly out of scope

Hero Equipment, Hero Stars & Exclusive Equipment (the remaining 2 lojcalc.com tools)
— future migration rounds, one at a time, same pattern as this one.

## Risks / things to verify during implementation

- Satellite level-count-per-tier (R=5 steps, SR=7, SSR=9, all +1 baseline) must be
  transcribed exactly — an off-by-one breaks both the level dropdown and cost sum for
  every satellite in that tier.
- SSR's per-level Data Disk breakdown in source is a 90-entry table summed into 9
  brackets of 10 plus a breakthrough Planet Coin cost — transcribe the *bracket sums*
  into the yml (not the raw 90-entry table), matching source's own `SAT_SSR_COSTS`
  derivation exactly.
- The estimated flag lives on one specific cost row (R tier, level 50, DataDisk only)
  — the yml/engine should preserve that it's the DataDisk portion specifically, even
  though source's UI marks the whole row estimated (matching source's own
  granularity, not inventing finer-grained partial-row estimation UI).
- New estimated-badge helper in `table-helpers.js` must not alter existing callers
  (Forticlad/Research/Tomes) — purely additive export.

## Next steps

Hand off to `/ak:plan` for phased implementation planning (data transcription, core
engine, UI wiring incl. new estimated-badge helper + rarity grouping, i18n,
verification), following the same phase structure as the prior Tomes & Collections
migration plan.

## Unresolved questions

None outstanding — all decisions confirmed above.
