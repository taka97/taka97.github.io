---
title: "Migrate Hero Equipment Planner"
description: "Migrate lojcalc.com's 'Hero Equipment' tool into a new planner page on this site, following the Forticlad/Tomes & Collections/Robots & Satellites Markdown + vanilla-JS pattern. Introduces a new cascade calc engine (Rarity requires paired Mastery past Legendary) — simpler than Forticlad's N:M requirement graph since it's 12 independent 1:1 pairs — with no new UI primitives needed."
status: complete
priority: P1
effort: "1d"
tags: [lands-of-jail, planners, hero-equipment]
created: 2026-09-10
---

# Migrate Hero Equipment Planner

## Overview

`contents/{en,vi}/lands-of-jail/planners/{forticlad,tomes-collections,robots-satellites}.md`
already establish this site's planner pattern: `_data/lands_of_jail/*.yml` (game
data) → `assets/js/planners/*-core.js` (pure calc engine) + `*.js` (UI wiring, ES
module) + shared `table-helpers.js` + shared `.loj-planner__*` SCSS block → a
Markdown page with a JSON data island + nav entry.

This plan migrates the 4th lojcalc.com tool — `hero-equipment.html` — into
`contents/{en,vi}/lands-of-jail/planners/hero-equipment.md`. Unlike Tomes &
Collections / Robots & Satellites (flat sum, no cross-track logic), this tool
has a real cross-track prerequisite: past Legendary, a piece's Rarity level
requires its own paired Mastery track at a matching level (auto-bumped when
insufficient, same "(auto-added — prerequisite)" UX as Forticlad's research
cascade). It's simpler than Forticlad's `planner-core.js`/`research-core.js`
graph, though: exactly 12 independent 1:1 pairs (each of 3 troops × 4 slots'
Rarity track has exactly one paired Mastery track), never N:M, never
multi-hop — so a single-pass bump is sufficient, no fixed-point loop needed.

Full source data (one shared 21-entry Rarity cost table, one shared 21-entry
Mastery cost table — verified byte-identical across all 3 troops and all 4
slots via live `localStorage` state dump) was captured and verified during
brainstorming — see
[brainstorm report](../reports/brainstorm-260910-2300-migrate-hero-equipment-planner.md).
All source numbers needed for implementation are transcribed directly into
Phase 2 below (no re-fetch needed). No new UI primitives are needed — this
tool reuses `table-helpers.js`'s existing `renderEstimatedBadge` (added
during the Robots & Satellites migration for exactly this kind of
unconfirmed-cost case) and the existing `.loj-planner__*` SCSS block as-is.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Transcribe Hero Equipment source data into `_data/lands_of_jail/hero_equipment.yml` (one shared Rarity table, one shared Mastery table, troops/slots lists, Rarity→Mastery requirement rule) | P1 |
| 2 | Build a pure calc engine (`hero-equipment-core.js`) — fixed 3×4 grid (not addable), single-pass Rarity→Mastery prerequisite bump, no fixed-point loop | P1 |
| 3 | Wire the full UI (`hero-equipment.js`) — 12 (troop, slot) sections each with Rarity current/target + Mastery current/target dropdowns, one combined breakdown table, estimated-cost badge reused as-is | P1 |
| 4 | Ship EN + VI content pages and a new "Hero Equipment" nav entry | P1 |
| 5 | Verify: Docker Jekyll build, manual browser check of both languages, the Rarity→Mastery auto-add cascade, the estimated badge, sticky bar | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Start](./phase-01-start.md) | Complete |
| 2 | [Phase 2: Data File and Calc Engine](./phase-02-data-file-and-calc-engine.md) | Complete |
| 3 | [Phase 3: UI Wiring and Storage](./phase-03-ui-wiring-and-storage.md) | Complete |
| 4 | [Phase 4: Content Pages and Navigation](./phase-04-content-pages-and-navigation.md) | Complete |
| 5 | [Phase 5: Verify](./phase-05-verify.md) | Complete |

## Dependencies

None — all prior planner plans (`260909-2127-migrate-fc-buildings-t11-research-to-forticlad-planner`,
`260910-1652-migrate-tomes-collections-planner`, `260910-1803-forticlad-lojcalc-style-alignment`,
`260910-1904-migrate-robots-satellites-planner`) are `status: complete`/`done`.
No blocking relationship in either direction.

## Success Criteria

- [x] `_data/lands_of_jail/hero_equipment.yml` holds the shared 21-entry Rarity
      table, shared 21-entry Mastery table, `troops: [shieldbearer, bomber,
      shooter]`, `slots: [gloves, helmet, chest, boots]`, and the
      Rarity→Mastery requirement levels (legendary_t1→10, legendary_t2→11,
      exotic→12, exotic_t1→13, exotic_t2→14, exotic_t3→15), matching source
      exactly.
- [x] `hero-equipment-core.js` computes correct totals/breakdown for all 12
      fixed (troop, slot) cells, each with independent Rarity + Mastery
      current/target, auto-bumping a cell's Mastery target when its Rarity
      target needs a higher Mastery level than currently targeted, tagging
      those rows as auto-added.
- [x] Breakdown rows carry an `estimated` flag for the `common_s1` Rarity step
      (2,620 Equipment EXP, same value on all 12 cells); `renderEstimatedBadge`
      renders it with zero changes to `table-helpers.js`.
- [x] `/en/lands-of-jail/planners/hero-equipment/` and its `/vi/` counterpart
      render: stock inputs (4 resources), missing summary + sticky bar, 3
      troop groups × 4 slot sections (fixed, no add/remove), each with
      Rarity current/target + Mastery current/target dropdowns, one combined
      breakdown table. Fully click-tested in Chrome, both languages (see
      Phase 5).
- [x] Nav entry present in both `loj-en` and `loj-vi` Tools groups, positioned
      after Robots & Satellites, before Settings.
- [x] `bundle exec jekyll build` (via Docker) succeeds with no errors; profile
      persistence via existing `storage.js` tool-data key `hero-equipment`
      confirmed live (stock + all 12 cells' targets survive a page reload;
      state shares correctly across the EN/VI language pair). Mastery
      auto-add cascade manually triggered and verified in Chrome (see
      Phase 5).
- [x] `docs/system-architecture.md` gets a new "Hero Equipment Planner
      client flow" section (mandatory per the Robots & Satellites precedent).

<!-- slug: migrate-hero-equipment-planner -->
