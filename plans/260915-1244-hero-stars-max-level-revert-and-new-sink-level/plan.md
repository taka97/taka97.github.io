---
title: "Hero Stars max_level revert and new sink level"
description: "Revert the star5_s5 'Max level' special-case label and add a real max_level data entry after tier 5 in the Hero Stars & Exclusive Equipment planner."
status: completed
priority: P1
effort: "1h"
tags: [lands-of-jail, hero-stars, planner]
created: 2026-09-15
---

# Hero Stars max_level revert and new sink level

## Overview

Commits `f8ddc93`/`412be18` (earlier this session) special-cased `star5_s5` to display
"Max level" instead of its normal "5 stars · tier 5" label. The user wants that reverted, and a
genuine new `max_level` data entry added after tier 5 so "Max level" is a distinct, reachable
target with its own cost. See brainstorm report:
`plans/reports/brainstorm-260915-1238-hero-stars-max-level-tier-revert.md`.

Confirmed requirement: Current = `star5` ("5 stars") → Target = `max_level` totals **600
Redeem** (HeroFragment). Tiers 1-5 already cost 100 each (500 total, unchanged data). New
`max_level` entry costs 100 more (500 + 100 = 600).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | `star5_s5` displays "5 stars · tier 5" again (old format) | P1 |
| 2 | New `max_level` entry exists, costs 100 Redeem, displays "Max level" | P1 |
| 3 | `HERO_STARS_LEVEL_COUNT` and docs reflect the new 33-entry table | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Data and label changes](./phase-01-start.md) | Pending |
| 2 | [Phase 2: Docs update and verification](./phase-02-implement-and-verify.md) | Pending |

## Non-Goals

- No change to `caps.heroStars` (instance cap) or the Exclusive Equipment track (confirmed:
  stays fully untouched — no max_level concept applies there).
- No change to storage/persist logic — index-driven, adapts to the new level automatically.
- No new translation keys — `maxLevelLabel` (en/vi) already exists from the reverted commit.

## Validation Log

**2026-09-15 — Validate interview:**
- Q: Rewrite the yml header comment fully, or append a note about `max_level`? → **Append only**,
  leave existing checkpoint/stage-order prose untouched. Propagated to Phase 1 step 2.
- Q: Does Exclusive Equipment need a `max_level` too? → **No**, stays fully untouched.

### Whole-Plan Consistency Sweep
Re-read `plan.md` + both phase files after propagation. No stale terms, no contradictions
between plan.md Non-Goals and Phase 1 implementation steps. Clean.

### Verification Results (Light tier, 2 phases)
- Claims checked: 6 (file paths ×3, `HERO_STARS_LEVEL_COUNT` current value, `star5_s5` special
  case existence, `docs/system-architecture.md` "32-entry" line) — all verified by direct Read
  earlier in this session (see brainstorm report for evidence).
- Verified: 6 | Failed: 0 | Unverified: 0

## Implementation Log

- Implemented Phase 1 + Phase 2 directly. Docker Jekyll build passed. Manual browser check (EN +
  VI, via claude-in-chrome) confirmed: Current="5 stars", Target="Max level" → 600 Redeem;
  tier-5 dropdown option reads "5 stars · tier 5" (not "Max level"); "Max level" is a separate,
  later option.
- Mandatory code-reviewer subagent: DONE_WITH_CONCERNS — logic/data/clamping/i18n all correct;
  found one Medium issue (stale "32 entries" comment left uncorrected alongside the new "33
  entries" comment in the yml header — plan step said update, not append). Fixed by consolidating
  into a single accurate comment block. Re-verified page still serves 200 after the fix.
- Reviewer also flagged a pre-existing, out-of-scope issue: EN/VI content-page prose ("Target
  list only offers Recruited and each whole star tier") already understated which targets are
  selectable before this change, and understates it slightly more now (doesn't mention Max
  level). Not fixed — out of scope, flagged to user only.

## Success Criteria

- [ ] `_data/lands_of_jail/hero_stars_exclusive_equipment.yml` has 33 Hero Stars levels, last one `id: max_level`, cost `{ HeroFragment: 100 }`.
- [ ] `HERO_STARS_LEVEL_COUNT` in `hero-stars-exclusive-equipment-core.js` is `33`.
- [ ] `heroStarsLevelLabel` in `hero-stars-exclusive-equipment.js` labels `star5_s5` as tier 5 (not "Max level") and `max_level` as "Max level".
- [ ] `docs/system-architecture.md` Hero Stars section says 33 entries and mentions the `max_level` sink.
- [ ] Docker Jekyll build succeeds.
- [ ] Manual check: Current="5 stars", Target="Max level" → breakdown shows 600 Redeem total.

<!-- slug: hero-stars-max-level-revert-and-new-sink-level -->
