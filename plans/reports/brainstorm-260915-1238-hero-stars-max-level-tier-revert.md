# Brainstorm: Hero Stars max_level revert + new sink level

## Problem
Hero Stars & Exclusive Equipment planner (`assets/js/planners/hero-stars-exclusive-equipment*.js`,
`_data/lands_of_jail/hero_stars_exclusive_equipment.yml`). Commits `f8ddc93`/`412be18` (this session,
just before this brainstorm) special-cased `star5_s5` to display "Max level" instead of its normal
"5 stars · tier 5" label. User wants:
1. Revert that special case — `star5_s5` shows "5 stars · tier 5" again (old format).
2. Add a real, separate `max_level` data entry after tier 5 so "Max level" is a distinct target,
   not tier 5 itself.

## Requirement (confirmed w/ user via AskUserQuestion)
Current level = 5 stars (`star5`, checkpoint). Target level = `max_level` (new entry). Total Redeem
(HeroFragment) cost for that full range = 600.
Breakdown: tier1..tier5 (`star5_s1`..`star5_s5`) already cost 100 each in data (500 total, unchanged).
New `max_level` entry costs 100 more → 500 + 100 = 600. Matches user's "final 5 star - tier 5 need
100 redeem to reach max_level" (tier5 → max_level = 100).

## Approach (single approach — mechanical fix, no real alternatives)
1. `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`: append
   `{ id: max_level, cost: { HeroFragment: 100 } }` after `star5_s5`. Update header comment
   (currently says "32 entries" / describes `star5_s5` as terminal) to reflect 33 entries + the
   trailing `max_level` sink level.
2. `assets/js/planners/hero-stars-exclusive-equipment-core.js`: `HERO_STARS_LEVEL_COUNT` 32 → 33.
3. `assets/js/planners/hero-stars-exclusive-equipment.js`:
   - Remove `if (id === 'star5_s5') return message.maxLevelLabel;`.
   - Add `if (id === 'max_level') return message.maxLevelLabel;`.
   - `maxLevelLabel` message keys (en/vi) already exist from the reverted commit — reuse, no new
     translation needed.
4. `docs/system-architecture.md` (line ~190-192): bump "32-entry Hero Stars level table" to 33,
   mention the trailing `max_level` sink entry.

## Not touched
- `caps.heroStars: 6` (instance cap, unrelated to level-table size).
- Exclusive Equipment track (11 entries, untouched).
- `sanitizeInstances` clamping, storage/persist logic, reset — all index-driven off
  `levels.length - 1`, so the 33rd level slots in without further code changes.

## Validation
Docker Jekyll build (`bundle exec jekyll build`). Manual check in browser: Current = `star5` ("5
stars"), Target = `max_level` ("Max level") → breakdown shows 600 Redeem total; tier 5 option in
both selects reads "5 stars · tier 5" (not "Max level").

## Risks
None significant — additive data entry + index-count bump + label swap. No schema/migration
concerns (client-side static data, no persisted-state shape change: existing saved
`currentIndex`/`targetIndex` values stay valid since they're numeric indices below the old max,
now just below the new max instead).

## Decision
User approved design, chose plan mode (default, not --tdd) for implementation.
