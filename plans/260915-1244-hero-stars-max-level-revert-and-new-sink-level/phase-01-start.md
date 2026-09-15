---
phase: 1
title: "Data and label changes"
status: pending
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Data and label changes

## Overview

Add the `max_level` data entry to the Hero Stars track, bump the level-count constant, and swap
which id triggers the "Max level" label.

## Requirements

- Functional: `max_level` is a real, selectable level (index 32) costing 100 HeroFragment on top
  of `star5_s5`. `star5_s5` returns to its normal tier-5 label.
- Non-functional: no change to Exclusive Equipment track, caps, or storage/persist code — all
  index-driven off `levels.length - 1`.

## Related Code Files

- Modify: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`
- Modify: `assets/js/planners/hero-stars-exclusive-equipment-core.js`
- Modify: `assets/js/planners/hero-stars-exclusive-equipment.js`

## Implementation Steps

1. In `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`, append after `star5_s5`:
   `- { id: max_level, cost: { HeroFragment: 100 } }`.
2. Append (do not rewrite) a short note to the existing header comment block above `heroStars:`
   stating there are now 33 entries and that `max_level` is a trailing sink level reached only
   from `star5_s5` — leave the existing checkpoint/stage-order prose untouched.
3. In `hero-stars-exclusive-equipment-core.js`, change `const HERO_STARS_LEVEL_COUNT = 32;` to `33`.
4. In `hero-stars-exclusive-equipment.js`'s `heroStarsLevelLabel`:
   - Remove `if (id === 'star5_s5') return message.maxLevelLabel;`.
   - Add `if (id === 'max_level') return message.maxLevelLabel;` (place before the `stageMatch`
     regex check, since `max_level` won't match either regex anyway — order only matters for
     clarity).

## Success Criteria

- [x] yml has 33 `heroStars.levels` entries ending in `max_level` (cost 100 HeroFragment).
- [x] `HERO_STARS_LEVEL_COUNT === 33`.
- [x] `star5_s5` label resolves to "5 stars · tier 5" / "5 sao · bậc 5".
- [x] `max_level` label resolves to "Max level" / "Cấp tối đa".

## Risk Assessment

Low. Additive data entry; existing saved `currentIndex`/`targetIndex` profile data stays valid
(numeric indices below the old max, now also below the new max). No schema/migration needed.
