---
phase: 2
title: "Completed work this session"
status: completed
priority: P2
effort: "n/a (retroactive record)"
dependencies: []
---

# Phase 2: Completed work this session

## Overview
Record of everything implemented and verified this session, split into what's
already committed vs. what's sitting in the working tree.

## Requirements
- Functional: every VI-facing resource/tier/satellite name added to the yml
  data files resolves through the shared `resolveLocalizedLabel`/
  `localizeResources` helpers (`assets/js/planners/localized-label.js`), never
  hardcoded per-language text.
- Non-functional: no regression in existing EN rendering or JS test suite.

## Architecture
Two localization layers, both already established patterns in this codebase
before this session:
- **yml data → JS render**: `_data/lands_of_jail/*.yml` `label: {en, vi}` →
  `resolveLocalizedLabel`/`localizeResources` → DOM text, for anything the
  planner's own JS renders (missing-summary cards, breakdown tables, sticky
  bar, dropdown options).
- **yml data → Liquid render (new this session)**: the "Current Stock" section
  in each planner's `.md` page used to hardcode the same resource names
  separately per language. Replaced with a Liquid `for` loop reading directly
  from `site.data.lands_of_jail.<tool>.resources`, resolving
  `resource.label[page.lang] | default: resource.label.en | default: resource.label`.
  This one-liner safely handles a `{en, vi}` hash, a hash with only `en`, or a
  legacy plain string (verified: Liquid's Hash-only `key?`/`fetch` dot/bracket
  lookup guard means a plain-string `String#[]` substring match never
  triggers — confirmed in the built `_site` output for `PotentialCoil`, still
  a bare string, rendering unchanged on both language pages).

## Related Code Files (already committed — `83cc498`, `3bd0f0f`)
- Modify: `_data/lands_of_jail/forticlad.yml` — all 51 `steps[].label` → `{en, vi}`.
- Modify: `_data/lands_of_jail/tomes_collections.yml` — `collectionSlots` (6), `resources` (6), `collectionTiers` (7 of 11).
- Modify: `_data/lands_of_jail/robots_satellites.yml` — `resources` (5), `satellites` (5 of 9).
- Modify: `_data/lands_of_jail/hero_equipment.yml` — `resources` (3 of 4).
- Modify: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` — `resources` (2 of 2, complete).
- Modify: `assets/js/planners/forticlad.js` — "Current Base"/"Target Base" → "Current level"/"Target level" (EN), "Cấp hiện tại"/"Cấp mục tiêu" (VI); `data-role="current-base"`/`"target-base"` → `"current-level"`/`"target-level"` (8 occurrences, purely internal query-selector attribute).
- Modify: `tests/forticlad-range-label.test.mjs` — regex assertions updated to match the renamed `data-role`.

## Related Code Files (working tree — not yet committed)
- Modify: `contents/en/lands-of-jail/planners/collections-tomes.md`, `contents/vi/lands-of-jail/planners/collections-tomes.md` — Current Stock section replaced with an explicit-order Liquid loop (display order differs from yml array order: Coins before Seals).
- Modify: `contents/{en,vi}/lands-of-jail/planners/robots-satellites.md`, `hero-equipment.md`, `hero-stars-exclusive-equipment.md` — Current Stock replaced with a plain Liquid loop (order already matches yml).
- Create: `assets/js/planners/troop-name.js` — extracted `TROOP_TRANSLATIONS` dict + `troopName()`, previously byte-identical copies in 3 files. User has since edited the VI values directly in this file (`Lính khiên` / `Lính ném bom` / `Lính súng`).
- Modify: `assets/js/planners/hero-equipment.js`, `research.js`, `tomes.js` — removed the local `TROOP_TRANSLATIONS` dict + `troopName()`, import from `./troop-name.js` instead.
- Modify: `_data/lands_of_jail/hero_equipment.yml` — `resources` order changed so `Magnet` sorts before `PrecisionEquipment` (Current Stock, missing-summary, and breakdown table all read this same array, so the reorder applies consistently everywhere).
- Modify: `assets/js/planners/hero-equipment.js` — `levelsMaxedSuffix` (`' (levels maxed)'` / `' (đã tối đa cấp độ)'`) renamed to `maxedSuffix` (`' (maxed)'` / `' (đã tối đa)'`) to match Robots & Satellites' existing wording exactly.

## Implementation Steps
_(Already executed — this phase is a record, not a to-do list.)_
1. Built and inspected the CSV-driven yml translations, applied user-provided VI text.
2. Audited every `resolveLocalizedLabel`/`localizeResources` call site vs. every yml `label` field to find wiring gaps — found `satelliteTiers[].label` is dead data (R/SR/SSR text is hardcoded directly in both language `.md` pages, never read by JS) and Hero Equipment's `RARITY_TIER_LABELS` is a hardcoded EN-only JS dict with no yml backing (tracked in memory, user said review later — see Phase 3).
3. Found and fixed the Current Stock hardcoding bug via the Liquid-loop refactor (user request: "for hardcore string inside md file, let create some file like it _data\locale.yml" — resolved by pointing Liquid at the existing per-tool yml instead of adding a new data file, since the yml is already the single source of truth).
4. Deduped `TROOP_TRANSLATIONS` on user request ("should be consistence for all tools").
5. Applied 2 follow-up polish requests: Hero Equipment resource order, and `maxedSuffix` wording match.

## Success Criteria
- [x] Docker Jekyll build (`bundle exec jekyll build`) succeeds after every batch of changes.
- [x] `node --test tests/*.test.mjs` — 10/10 passing after every batch.
- [x] Live Chrome verification (screenshots) on every affected page, both languages, after every batch — Current Stock names, missing-summary, sticky bar, Forticlad dropdowns, troop headings, resource order, and the `(maxed)` suffix all confirmed rendering correctly.

## Risk Assessment
None outstanding for the work actually done — already verified via build + tests
+ live browser. Residual risk lives in what's *not yet* done (Phase 3).
