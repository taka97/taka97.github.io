---
title: "Migrate Robots & Satellites Planner"
description: "Migrate lojcalc.com's 'Robots & Satellites' tool into a new planner page on this site, following the Forticlad/Tomes & Collections Markdown + vanilla-JS pattern, adding two new small reusable UI primitives (rarity badge groups, estimated-cost disclosure) for future tool migrations."
status: complete
priority: P1
effort: "1d"
tags: [lands-of-jail, planners, robots-satellites]
created: 2026-09-10
---

# Migrate Robots & Satellites Planner

## Overview

`contents/{en,vi}/lands-of-jail/planners/{forticlad,tomes-collections}.md` already
establish this site's planner pattern: `_data/lands_of_jail/*.yml` (game data) →
`assets/js/planners/*-core.js` (pure calc engine) + `*.js` (UI wiring, ES module) +
shared `table-helpers.js` + shared `.loj-planner__*` SCSS block → a Markdown page
with a JSON data island + nav entry.

This plan migrates the next lojcalc.com tool — `robots-satellites.html` — into
`contents/{en,vi}/lands-of-jail/planners/robots-satellites.md`. Unlike Forticlad,
this tool has no cross-track prerequisites (same as Tomes & Collections — flat
per-instance cost summing only). It introduces two small pieces of new, reusable UI
not yet on this site: rarity-tier badge grouping (for Satellites' R/SR/SSR tiers)
and an "estimated cost" disclosure badge (for one unconfirmed source number), both
added generically enough for later tool migrations (Hero Equipment, Hero Stars &
Exclusive Equipment) to reuse.

Full source data (5 resources, Robot's 11-level cost table, 3 satellite tiers'
shared cost curves, 9 named satellites) was captured and verified during
brainstorming — see
[brainstorm report](../reports/brainstorm-260910-1858-migrate-robots-satellites-planner.md).
All source numbers needed for implementation are transcribed directly into Phase 2
below (no re-fetch needed), including the SSR tier's bracket sums which were
independently recomputed via script during brainstorming to catch transcription
errors before they reach the data file.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Transcribe Robots & Satellites source data into `_data/lands_of_jail/robots_satellites.yml` | P1 |
| 2 | Build a pure calc engine (`robots-satellites-core.js`) — dynamic Robot instances + fixed-by-id Satellite instances, no requirement graph | P1 |
| 3 | Add a reusable "estimated cost" disclosure helper to `table-helpers.js`; wire the full UI (`robots-satellites.js`) — Robot add-instance section + 3 rarity-tier Satellite sections | P1 |
| 4 | Extend `.loj-planner__*` SCSS with rarity-badge and estimated-tag/note styling | P2 |
| 5 | Ship EN + VI content pages and a new "Robots & Satellites" nav entry | P1 |
| 6 | Verify: Docker Jekyll build, manual browser check of both languages, both categories, estimated badge, sticky bar | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Data File](./phase-01-start.md) | Complete |
| 2 | [Phase 2: Calc Engine](./phase-02-data-file-and-calc-engine.md) | Complete |
| 3 | [Phase 3: Table Helper and UI Wiring](./phase-03-table-helper-and-ui-wiring.md) | Complete |
| 4 | [Phase 4: SCSS Additions](./phase-04-scss-additions.md) | Complete |
| 5 | [Phase 5: Content Pages and Navigation](./phase-05-content-pages-and-navigation.md) | Complete |
| 6 | [Phase 6: Verify](./phase-06-verify.md) | Complete (full interactive Chrome check done — see phase file) |

## Dependencies

None — all prior planner plans (`260909-2127-migrate-fc-buildings-t11-research-to-forticlad-planner`,
`260910-1652-migrate-tomes-collections-planner`, `260910-1803-forticlad-lojcalc-style-alignment`)
are `status: complete`/`done`. No blocking relationship in either direction.

## Success Criteria

- [x] `_data/lands_of_jail/robots_satellites.yml` holds all 5 resources, Robot's 11
      cost rows, and all 3 satellite tiers' cost curves (R: 6 rows, SR: 8 rows, SSR:
      10 rows) plus the 9 named satellites, matching source exactly.
- [x] `robots-satellites-core.js` computes correct totals/breakdown for a mix of
      Robot instances (dynamic, capped at 12) and all 9 fixed Satellites, with no
      cross-track prerequisite logic (none needed).
- [x] Breakdown rows carry an `estimated` flag when SAT_R's level-50 cost is in
      range; `table-helpers.js`'s new disclosure helper renders it without touching
      any existing caller (Forticlad/Research/Tomes stay unaffected).
- [x] `/en/lands-of-jail/planners/robots-satellites/` and its `/vi/` counterpart
      render: stock inputs (5 resources), missing summary + sticky bar, Robot
      add-instance section, 3 rarity-badge Satellite sections (R/SR/SSR, fixed
      cards, no add/remove), reset-to-default. Fully click-tested in Chrome,
      both languages (see Phase 6).
- [x] Nav entry present in both `loj-en` and `loj-vi` Tools groups, positioned
      after Tomes & Collections.
- [x] `bundle exec jekyll build` (via Docker) succeeds with no errors; profile
      persistence via existing `storage.js` tool-data key `robots-satellites`
      confirmed live (stock + satellite target survive a page reload; state
      shares correctly across the EN/VI language pair). Estimated badge
      manually toggled by click and by keyboard (Enter) in Chrome (see Phase
      6).

## Validation Log

### Verification Results
- **Tier:** Full (6 phases)
- **Claims checked:** 9 (Fact Checker + Contract Verifier sample across all phases)
- **Verified:** 9 | **Failed:** 0 | **Unverified:** 0
- Verified: `storage.js` exports `createProfileStore`/`getToolData`/`updateToolData`
  (storage.js:5,65,82); `planner-core.js` exports `formatNumber` (line 44);
  `table-helpers.js`'s existing exports (createTable, clearElement, setStatus,
  targetCell, grandTotalFooter, toRoman, updateStickyBar, renderInstanceBadge,
  renderMissingCard) all present; no existing `rarity-badge`/`estimated-tag`/
  `estimated-note`/`renderEstimatedBadge` symbols in `assets/js` or `_sass`
  (confirms Phase 3/4's new additions don't collide with anything); prior planner
  file/page patterns (`tomes-core.js`, `tomes.js`, `tomes_collections.yml`,
  `tomes-collections.md`, `navigation.yml` Tools group shape) all read directly
  and match what Phases 1-5 assume; SSR tier's bracket-sum data independently
  recomputed via a Node script during brainstorming (matches hand transcription
  exactly).

### Decisions confirmed (2026-09-10)
1. Satellite progress stored as an object keyed by satellite id (not an array) —
   confirmed as written in Phase 2; matches fixed/named-entity semantics without
   index-stability assumptions.
2. One combined breakdown table (Robot rows + all 9 Satellite rows) — confirmed as
   written in Phase 3; matches source behavior and the Tomes & Collections
   precedent.
3. Phase 6 now **mandatorily** adds a "Robots & Satellites Planner client flow"
   section to `docs/system-architecture.md` (previously written as optional) —
   updated below and in `phase-06-verify.md`.

### Whole-Plan Consistency Sweep
- Files reread: `plan.md`, `phase-01-start.md`, `phase-02-data-file-and-calc-engine.md`,
  `phase-03-table-helper-and-ui-wiring.md`, `phase-04-scss-additions.md`,
  `phase-05-content-pages-and-navigation.md`, `phase-06-verify.md`.
- Decision deltas checked: 3 (storage shape, breakdown layout, docs mandate).
- Reconciled stale references: 1 (`phase-06-verify.md`'s optional docs step made
  mandatory; `phase-05-content-pages-and-navigation.md`'s placeholder VI nav
  phrasing resolved to a concrete string, matching the existing Tomes &
  Collections VI nav entry's pattern of keeping the English proper noun).
- Unresolved contradictions: 0.

## Recommendation

Proceed to implementation. All verification claims passed, all validation
decisions confirmed as originally written (no phase-file architecture changes
needed except making the Phase 6 docs step mandatory and finalizing Phase 5's VI
nav string).

<!-- slug: migrate-robots-satellites-planner -->
