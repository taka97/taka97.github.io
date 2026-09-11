---
title: "Migrate Hero Stars & Exclusive Equipment Planner"
description: "Migrate lojcalc.com's 'Hero Stars & Exclusive Equipment' tool — the 5th and last tool in this site's lojcalc.com migration series — into a new planner page, following the established Forticlad/Tomes & Collections/Robots & Satellites/Hero Equipment Markdown + vanilla-JS pattern. Two independent addable, capped-at-6 instance lists (Hero Stars: keyed 32-level track with stage checkpoints; Exclusive Equipment: numeric 11-level track), no cross-track prerequisite (simpler than Hero Equipment) — a straight combination of Robots & Satellites' addable-flat-sum engine shape and Hero Equipment's keyed-level Target-list filtering, no new UI primitive needed."
status: done
priority: P1
effort: "1d"
tags: [lands-of-jail, planners, hero-stars-exclusive-equipment]
created: 2026-09-11
---

# Migrate Hero Stars & Exclusive Equipment Planner

## Overview

`contents/{en,vi}/lands-of-jail/planners/{forticlad,tomes-collections,robots-satellites,hero-equipment}.md`
already establish this site's planner pattern: `_data/lands_of_jail/*.yml`
(game data) → `assets/js/planners/*-core.js` (pure calc engine) + `*.js` (UI
wiring, ES module) + shared `table-helpers.js` + shared `.loj-planner__*`
SCSS block → a Markdown page with a JSON data island + nav entry.

This plan migrates the 5th and **last** lojcalc.com tool —
`hero-stars-exclusive-equipment.html` — closing out the "Lands of Jail
tools" migration series named in
[project-roadmap.md](../../docs/project-roadmap.md). Unlike Hero Equipment
(fixed 3×4 grid, cross-track Rarity→Mastery prerequisite), this tool has
**two independent addable instance lists** — "+ Add Hero" under Hero Stars,
a separate "+ Add Hero" under Exclusive Equipment, each capped at 6
instances (empirically verified live — clicking each add button 20x stops
incrementing at 6, `disabled` set on the button) — and **no cross-track
requirement** (every level's `requires: []` is empty on both tracks,
confirmed via live `trackById()` dump). Architecturally this is Robots &
Satellites' addable-flat-sum engine shape (two categories, no
prerequisite resolution) combined with Hero Equipment's keyed-level
Target-dropdown filtering (excluding stage-checkpoint level ids from the
Target `<select>`, generalized from `_s1`-only to any `_s\d+` suffix since
this track has 5 stage checkpoints per star tier, not 1).

Full source data (32-entry Hero Stars level table, 11-entry Exclusive
Equipment level table, both fully transcribed; 2 resources; caps) was
captured and verified live during brainstorming — see
[brainstorm report](../reports/brainstorm-260911-0000-migrate-hero-stars-exclusive-equipment-planner.md).
All source numbers needed for implementation are transcribed directly into
Phase 2 below. No new UI primitives are needed — this tool reuses the
existing `.loj-planner__*` SCSS block, `table-helpers.js`'s add/remove
instance helpers (as used by Tomes & Collections/Robots & Satellites), and
does **not** need `renderEstimatedBadge` (no `estimated` flags exist on
either track — confirmed live, unlike the other 4 tools).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Transcribe Hero Stars & Exclusive Equipment source data into `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` (32-entry Hero Stars table, 11-entry Exclusive Equipment table, 2 resources, caps of 6 each) | P1 |
| 2 | Build a pure calc engine (`hero-stars-exclusive-equipment-core.js`) — two independent addable instance lists, flat range-sum per instance, no cascade/prerequisite resolution | P1 |
| 3 | Wire the full UI (`hero-stars-exclusive-equipment.js`) — addable Hero Stars instances + addable Exclusive Equipment instances, each current/target dropdown pair, Hero Stars' Target list excluding `_s\d+` stage ids, one combined breakdown table | P1 |
| 4 | Ship EN + VI content pages and a new "Hero Stars & Exclusive Equipment" nav entry (last item in Tools group) | P1 |
| 5 | Verify: Docker Jekyll build, manual browser check of both languages, the add/remove cap-at-6 behavior, sticky bar; update `docs/project-roadmap.md`'s "Lands of Jail tools" section to reflect the migration series is now complete | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Start](./phase-01-start.md) | Done |
| 2 | [Phase 2: Data File and Calc Engine](./phase-02-data-file-and-calc-engine.md) | Done |
| 3 | [Phase 3: UI Wiring and Storage](./phase-03-ui-wiring-and-storage.md) | Done |
| 4 | [Phase 4: Content Pages and Navigation](./phase-04-content-pages-and-navigation.md) | Done |
| 5 | [Phase 5: Verify](./phase-05-verify.md) | Done |

## Dependencies

None — all prior planner plans (`260909-2127-migrate-fc-buildings-t11-research-to-forticlad-planner`,
`260910-1652-migrate-tomes-collections-planner`, `260910-1803-forticlad-lojcalc-style-alignment`,
`260910-1904-migrate-robots-satellites-planner`, `260910-2303-migrate-hero-equipment-planner`)
are `status: done`/`complete`. No blocking relationship in either direction.
This plan closes the lojcalc.com migration series — no further tool
migrations are planned after this one.

## Success Criteria

- [x] `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` holds the
      32-entry Hero Stars level table, the 11-entry Exclusive Equipment
      level table, the 2 resources (`HeroFragment`/"Redeem",
      `ExclusiveEquipPart`/"Exclusive Weapon Parts"), and
      `caps: { heroStars: 6, exclusiveEquipment: 6 }`, matching source
      exactly.
- [x] `hero-stars-exclusive-equipment-core.js` computes correct
      totals/breakdown for both instance lists independently (add/remove up
      to the cap, flat range-sum per instance, no cross-track resolution).
- [x] `/en/lands-of-jail/planners/hero-stars-exclusive-equipment/` and its
      `/vi/` counterpart render: stock inputs (2 resources), missing
      summary + sticky bar, addable Hero Stars instances (current/target
      pair, Target list restricted to `recruited`+5 star tiers, excluding
      all `_s\d+` stage ids), addable Exclusive Equipment instances
      (current/target pair, 0-10), one combined breakdown table, add
      buttons disabling at the 6-instance cap on each list independently.
      Fully click-tested in Chrome, both languages (see Phase 5).
- [x] Nav entry present in both `loj-en` and `loj-vi` Tools groups,
      positioned after Hero Equipment (last item before Settings).
- [x] `bundle exec jekyll build` (via Docker) succeeds with no errors;
      profile persistence via existing `storage.js` tool-data key
      `hero-stars-exclusive-equipment` confirmed live (stock + both
      instance lists' current/target state survive a page reload; state
      shares correctly across the EN/VI language pair).
- [x] `docs/system-architecture.md` gets a new "Hero Stars & Exclusive
      Equipment Planner client flow" section (mandatory per the Robots &
      Satellites/Hero Equipment precedent).
- [x] `docs/project-roadmap.md`'s "Lands of Jail tools" section updated:
      this was the last tool named as out-of-scope — reflect that the
      lojcalc.com migration series is now complete.

## Validation Log

### Session 1 — 2026-09-11
**Trigger:** `/ak:plan validate` run after initial plan authoring.
**Questions asked:** 3

#### Questions & Answers

1. **[Architecture]** Phase 2 (Data File and Calc Engine) currently has the
   core engine throw/refuse if given more instances than the cap allows.
   Verified against the actual precedent: `robots-satellites-core.js`'s
   calculate function does NOT check instance-array length at all — the
   cap is enforced only in the UI (disabled add button at 6). Which should
   Phase 2 do?
   - Options: UI-only, match precedent exactly (Recommended) | Keep the
     core-engine guard
   - **Answer:** UI-only, match precedent exactly
   - **Rationale:** `robots-satellites-core.js:45,72` confirms
     `calculateRobotsSatellitesRequirements` never checks `instances.length`
     against `planner.caps.robots` — only the UI's `handleAddRobot`
     (`robots-satellites.js:209`) enforces it. Adding a core-engine guard
     would be a new defensive pattern no sibling engine has — dropped for
     KISS/consistency.

2. **[Tradeoff]** The "Redeem" resource label (source's own English copy
   for HeroFragment) has no existing VI translation precedent in this
   repo. How should Phase 4 handle it?
   - Options: Keep literal, transliterate for VI (Recommended) | Clarify
     the EN label
   - **Answer:** Keep literal, transliterate for VI
   - **Rationale:** Matches this repo's consistent practice of mirroring
     lojcalc.com's own resource names 1:1 rather than inventing clearer
     terms.

3. **[Scope]** Phase 4 currently bundles the `docs/project-roadmap.md`
   update (marking the lojcalc.com migration series complete) into this
   same plan/PR. Keep it there, or split it out?
   - Options: Keep bundled in this plan (Recommended) | Split into a
     separate follow-up
   - **Answer:** Keep bundled in this plan
   - **Rationale:** Avoids a dangling stale roadmap claim ("Hero Stars &
     Exclusive Equipment" listed as still out-of-scope) sitting in `main`
     between merges.

#### Confirmed Decisions
- Cap enforcement: UI-only (Phase 3's add-button disable), core engine
  (Phase 2) does not re-check instance count.
- "Redeem" label: kept literal in EN, transliterated for VI.
- `docs/project-roadmap.md` update: stays in this plan's Phase 4.

#### Action Items
- [x] Phase 2: drop the core-engine cap guard from
      `calculateHeroStarsEquipment`'s spec.
- [x] Phase 3: note that the add-button disable is the only cap
      enforcement point.
- [x] Phase 4: record the "Redeem" labeling decision in the implementation
      steps and risk assessment.

#### Impact on Phases
- Phase 2: `calculateHeroStarsEquipment` pseudocode updated, success
  criteria updated to remove the "refuse a selections array longer than
  cap" bullet.
- Phase 3: added a cross-reference note confirming UI-only cap
  enforcement.
- Phase 4: implementation steps + risk assessment updated with the
  "Redeem" labeling decision.

### Verification Results
- **Tier:** Full (5 phases)
- **Claims checked:** 15
- **Verified:** 14 | **Failed:** 0 | **Unverified:** 1 (resolved via
  interview question 1 above — not a factual failure, a genuine
  architecture decision point the verification pass surfaced)

#### Verified claims (Fact Checker)
- `robots-satellites-core.js`: `buildBreakdown`, `clampIndex`,
  `sumCostRange`, `addCost`, `emptyResourceTotals`, `positiveInteger`
  (line 45), `instances.forEach` (line 72) — all present as cited.
- `robots-satellites.js:206-219` (`handleAddRobot`/`updateAddButtonState`),
  `:209` (cap check), `:100-149` (load flow: `createProfileStore` →
  `getToolData` → render → event listeners), `:184`
  (`commitStateFromDom`) — all present as cited.
- `hero-equipment.js:105` (`!id.endsWith('_s1')` Target-list filter) —
  present as cited, confirmed the basis for this plan's generalized
  `/_s\d+$/` filter.
- `storage.js`: `createProfileStore` (line 5, `export async function`),
  `getToolData` (line 65), `updateToolData` (line 82) — all present.
- `table-helpers.js`: all 8 cited exports present (`createTable`,
  `clearElement`, `setStatus`, `renderMissingCard`, `grandTotalFooter`,
  `updateStickyBar`, `renderInstanceBadge`, `renderEstimatedBadge`).
- `planner-core.js:44` (`formatNumber`) — present.
- `_data/navigation.yml:47,83` (Hero Equipment nav entries, last item
  before Settings) — confirmed current position, unchanged since
  brainstorming.
- `hero-equipment.md:68` (JSON data island pattern) — confirmed exact
  `<script id="..." type="application/json">{{ site.data... | jsonify
  }}</script>` shape to replicate.
- Tool-data key convention: confirmed kebab-case slug matching the file/URL
  slug (`robots-satellites.js:120,298-299` uses `'robots-satellites'`) —
  this plan's `'hero-stars-exclusive-equipment'` key follows the same
  pattern.
- Scope Auditor: confirmed no central tool registry exists anywhere
  (`storage.js`, `profile-settings.js` both grepped clean for other tools'
  slugs) — no missed file for Phase 3/4 to touch.
- Flow Tracer: confirmed `robots-satellites.js`'s actual load →
  render → event-listener → `commitStateFromDom` → persist cycle matches
  this plan's Phase 3 "Module structure" description.

#### Failures
None.

### Whole-Plan Consistency Sweep
- Files reread: `plan.md`, `phase-01-start.md`, `phase-02-data-file-and-calc-engine.md`,
  `phase-03-ui-wiring-and-storage.md`, `phase-04-content-pages-and-navigation.md`,
  `phase-05-verify.md`.
- Decision deltas checked: 3 (cap enforcement scope, Redeem labeling,
  roadmap-doc bundling).
- Reconciled stale references: 1 (Phase 2's "refuse instances beyond cap"
  success-criteria bullet, removed).
- Unresolved contradictions: 0.

## Recommendation

Proceed to implementation. All verification claims confirmed against the
live codebase (0 failures), all 3 validation questions resolved with no
open decision points remaining, whole-plan consistency sweep clean.

<!-- slug: migrate-hero-stars-exclusive-equipment-planner -->
