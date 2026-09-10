---
title: "Forticlad lojcalc Style Alignment"
description: "Close the two verified gaps between our shared .loj-planner tools and lojcalc.com's per-instance UI: port the sticky 'Missing' bar to Forticlad, and add a target-set/no-target badge to every instance row across Forticlad, Tomes, and Collections."
status: complete
priority: P2
effort: "1d"
tags: [lands-of-jail, forticlad, tomes-collections, planners, ui]
created: 2026-09-10
---

# Forticlad lojcalc Style Alignment

## Overview

Brainstorm report:
[brainstorm-260910-1747-forticlad-lojcalc-style-alignment.md](../reports/brainstorm-260910-1747-forticlad-lojcalc-style-alignment.md)

User referenced lojcalc.com (the source site) when building the Forticlad planner
and wanted to confirm the design rule: keep the source site's layout/interaction
patterns, but colors/style follow our own TeXt-based framework. A live comparison
(lojcalc.com vs. our production Forticlad page and the unmerged Tomes & Collections
branch) found most patterns already carried over correctly (light theme, amber
accent, dropdown Current/Target selects, missing-summary cards). Two real gaps
remain, both scoped to the whole shared `.loj-planner` component family (Forticlad
buildings + research, Tomes, Collections, and future migrations):

1. Forticlad has no sticky bottom "Missing" bar — Tomes & Collections already
   ships one (`.loj-planner__sticky-bar`, `updateStickyBar`/`scrollToSummary` in
   `tomes.js`) but it was never ported to `forticlad.js`/`research.js`.
2. No planner shows a per-instance "target set" / "no target" badge on each
   building/research-track/tome/collection row, unlike lojcalc's card badges.

Explicitly out of scope (declined during brainstorm): a `NEW` badge (would need a
new data field with no defined editorial rule — YAGNI), bracket-style `[ SECTION ]`
headings, a dark "calculator" surface, and a lojcalc-style top tab bar (structurally
incompatible with TeXt's two-level sidebar).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Port the existing sticky "Missing" bar pattern to Forticlad (buildings + research) | P1 |
| 2 | Add a target-set/no-target badge to every `.loj-planner__instance-range` row across Forticlad buildings, Forticlad research tracks, Tomes, and Collections | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Start](./phase-01-start.md) | Complete |
| 2 | [Phase 2: Sticky Missing Bar for Forticlad](./phase-02-sticky-missing-bar-for-forticlad.md) | Complete |
| 3 | [Phase 3: Per-Instance Status Badge](./phase-03-per-instance-status-badge.md) | Complete |
| 4 | [Phase 4: Verify](./phase-04-verify.md) | Complete |

## Key files

- `contents/{en,vi}/lands-of-jail/planners/forticlad.md` — add sticky-bar markup
- `assets/js/planners/forticlad.js`, `assets/js/planners/research.js` — wire sticky bar + badges
- `assets/js/planners/tomes.js` — add badges (sticky bar already exists here)
- `assets/js/planners/table-helpers.js` — shared badge render helper
- `_sass/custom.scss` — `.loj-planner__instance-badge` styles (sticky-bar styles already exist and are reused as-is)

## Success Criteria

- [x] Forticlad (buildings + research) shows a sticky bottom bar mirroring Tomes &
      Collections' pattern, with correct combined missing totals across both
      independently-initializing scripts.
- [x] Every instance row (Forticlad buildings, Forticlad research tracks, Tomes,
      Collections) shows an accurate "target set" / "no target" badge that updates
      live on every change, in both EN and VI.
- [x] No regression to existing calculation, persistence, or i18n behavior in any
      of the three planner engines.
- [x] `bundle exec jekyll build` succeeds in the Docker toolchain; manual check in
      browser confirms both planners on both languages.

## Validation Log

### Session 1 (2026-09-10)

**Verification Results**
- Claims checked: ~12 (file:line references for `table-helpers.js`,
  `tomes.js`, `forticlad.js`, `research.js`, `_sass/custom.scss`, and both
  `forticlad.md`/`tomes-collections.md` markup) — verified directly against
  source during plan authoring (full-file reads, not sampling), then spot-checked
  again via `Grep` for the two summary-heading ids during this validation pass.
- Verified: 12 | Failed: 1 | Unverified: 0
- Tier: Standard (4 phases)
- **Failure found and corrected**: Phase 2 originally assumed Forticlad had two
  separate missing-summary sections (buildings, research) and proposed two
  independent sticky bars. `Grep` confirmed `forticlad.md` has exactly **one**
  `.loj-planner__summary` section (`#forticlad-summary-heading`) holding FC, AFC,
  and Hyperalloy cards together — there is no second heading. Phase 2 rewritten
  to a single combined sticky bar (see decisions below).

**Questions asked**: 3

1. **Sticky bar architecture** — single combined bar vs. two separate bars, given
   the verification finding above and that lojcalc.com itself shows one sticky
   bar per tool (not one per section).
   → **Decision: single combined bar.** `research.js` dispatches a new
   `forticlad:research-totals-changed` CustomEvent (mirroring the existing
   `forticlad:building-data-changed` precedent); `forticlad.js` owns the bar and
   merges both engines' totals. Phase 2 rewritten accordingly.
2. **Badge placement** — inline after heading text vs. right-aligned flex wrapper.
   → **Decision: inline after heading text.** Simplest DOM change, no new layout
   CSS, accepted minor visual difference from lojcalc's exact right-aligned card
   layout. Already how Phase 3 was drafted — no change needed.
3. **Badge color for "target set"** — reuse existing amber family vs. neutral gray.
   → **Decision: reuse existing amber family** (`#fdf3ea` / `#c05621`, same as
   `.is-accent` rows). No new color introduced. Already how Phase 3 was drafted —
   no change needed.

### Whole-Plan Consistency Sweep

Re-read `plan.md` and all four `phase-*.md` files after propagating the Session 1
decisions. Findings:
- `phase-02-*.md` rewritten in full to the combined-bar architecture — no stale
  "two bars" language remains in that file.
- `phase-04-verify.md` step 3 and its Risk Assessment updated to match (single
  bar, event-driven Hyperalloy chip, dropped the now-inapplicable bar-stacking
  risk).
- `plan.md`'s Overview/Goals/Success Criteria already described the outcome in
  terms compatible with either architecture ("combined missing totals across
  both independently-initializing scripts") — no edit needed there.
- `phase-01-start.md` and `phase-03-per-instance-status-badge.md` reviewed —
  no references to the sticky-bar section count; no changes needed.
- No unresolved contradictions remain.

**Recommendation**: proceed to implementation.

<!-- slug: forticlad-lojcalc-style-alignment -->
