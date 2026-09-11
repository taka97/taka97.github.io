# Brainstorm: decouple Forticlad step ids from display text

## Problem
`_data/lands_of_jail/forticlad.yml` `steps[].base` is used simultaneously as: dropdown display text, `<option value>`, `baseIndexes`/`requirements` map key, and the value persisted per-profile in IndexedDB (`buildingBases[key].currentBase`/`.targetBase` in `storage.js`). 26 of 51 steps use verbose text as that id (`Level 30 (start)`, `Forticlad (1)`…`Forticlad (5)` and their `-1..-4` sub-steps). Changing that text (e.g. for translation) orphans existing users' saved current/target progress. The other 4 lojcalc-style planners (Tomes & Collections, Robots & Satellites, Hero Equipment, Hero Stars Exclusive Equipment) already avoid this — they use a stable snake_case `id` decoupled from display (`rare_s1`, `sat_r_laser`, `legendary_t1_s1`).

## Decision (confirmed with user)
- Scope: Forticlad Core Planner only, this round.
- Fix type: decouple only — no VI translation of tier text in this pass.
- Id scheme: snake_case, applied to **all 51 steps** (not just the 26 verbose ones) for one consistent scheme, matching the existing convention in the other 4 planners.
- Migration: no in-app migration code. User will run a manual browser-console script once.

## Full id mapping (old `base` → new `base`, `label` = old value verbatim)
| old base | new base (id) | label |
|---|---|---|
| Level 30 (start) | level_30_start | Level 30 (start) |
| 30-1 | level_30_s1 | 30-1 |
| 30-2 | level_30_s2 | 30-2 |
| 30-3 | level_30_s3 | 30-3 |
| 30-4 | level_30_s4 | 30-4 |
| Forticlad (1) | fc1 | Forticlad (1) |
| Forticlad (1)-1 | fc1_s1 | Forticlad (1)-1 |
| Forticlad (1)-2 | fc1_s2 | Forticlad (1)-2 |
| Forticlad (1)-3 | fc1_s3 | Forticlad (1)-3 |
| Forticlad (1)-4 | fc1_s4 | Forticlad (1)-4 |
| Forticlad (2) | fc2 | Forticlad (2) |
| Forticlad (2)-1..4 | fc2_s1..s4 | Forticlad (2)-1..4 |
| Forticlad (3) | fc3 | Forticlad (3) |
| Forticlad (3)-1..4 | fc3_s1..s4 | Forticlad (3)-1..4 |
| Forticlad (4) | fc4 | Forticlad (4) |
| Forticlad (4)-1..4 | fc4_s1..s4 | Forticlad (4)-1..4 |
| Forticlad (5) | fc5 | Forticlad (5) |
| FC5-1..4 | fc5_s1..s4 | FC5-1..4 |
| FC6 | fc6 | FC6 |
| FC6-1..4 | fc6_s1..s4 | FC6-1..4 |
| FC7 | fc7 | FC7 |
| FC7-1..4 | fc7_s1..s4 | FC7-1..4 |
| FC8 | fc8 | FC8 |
| FC8-1..4 | fc8_s1..s4 | FC8-1..4 |
| FC9 | fc9 | FC9 |
| FC9-1..4 | fc9_s1..s4 | FC9-1..4 |
| FC10 | fc10 | FC10 |

(FC10 has no `-1..4` sub-steps in source data — it's the max tier.)
Labels are copied verbatim from the current display text → **zero visible UI change**, only ids change.

## Touchpoints
1. `_data/lands_of_jail/forticlad.yml` — rewrite all `base:` values per table above; add `label:` per step (required field, mirrors `buildings[key].label` pattern already in same file). `requirements` entries already reference `FC1`..`FC10` shorthand — these now match `base` directly (see below), no change needed there. `max_base: FC10` etc already match directly too.
2. `assets/js/planners/planner-core.js`:
   - `normalizeStep`: also capture `label: step.label || step.base` (validate `typeof label === 'string'`).
   - Remove the `aliases` Map (`['Level 30 (start)', ...], ['FC1', 'Forticlad (1)'], ...`) — becomes dead/identity mapping once `base` values equal what `requirements`/`max_base` already reference (`FC1` etc). Remove `resolveBase` indirection accordingly, or simplify it to a no-op passthrough — confirm during implementation which is cleaner given remaining call sites (`rangeIndexes`, `normalizeRanges`).
3. `assets/js/planners/forticlad.js`:
   - `rangeLabel`: `new Option(step.base, step.base)` → `new Option(step.label, step.base)` (value stays the stable id, text becomes the label).
   - `renderTotals`: `range.currentBase`/`range.targetBase` are rendered raw in the From/To columns — resolve through a small `stepLabel(planner, base)` helper before display.
   - All other `step.base`/`.value` comparisons (`keepTargetAtOrAboveCurrent`, `updateRangeWarnings`, `selectedBuildingRanges`, `hasReachedBase`-style checks) are unaffected — they compare ids to ids, still correct after the rename.

## Manual migration (browser console, run once by user)
Script needs to:
1. Open IndexedDB `lands-of-jail-tools` → `profiles` object store, `getAll()`.
2. For each profile, if `profile.tools.forticlad.buildingBases` exists, remap every `currentBase`/`targetBase` value found in the mapping table above (old → new); leave anything not in the table untouched.
3. `put()` the updated profile back; log a summary of what changed.
4. User runs this once, in their own browser, before/at deploy time — no server-side or automated trigger.

(To be delivered as a standalone `.js` snippet at implementation time — not authored in this brainstorm per the "advisory only" gate.)

## Risks / non-issues
- Requirement-graph validation (`validateRequirementGraph`) and `normalizeRequirements` depend on `baseIndexes` built from the *new* `base` values — since `requirements`/`max_base` in the yml already use `FC1`..`FC10` shorthand, they now resolve natively without the alias layer. Verified by reading `forticlad.yml` requirements section (all entries reference `FC{n}` short tokens already).
- No other planner touched — Tomes & Collections, Robots & Satellites, Hero Equipment(s) already follow the stable-id pattern; out of scope this round per user's explicit "Forticlad Core Planner first" scope.
- Existing `migrateLegacyForticladProfiles`/`migrateBoomerBarrackKey` in `storage.js` are unrelated (different legacy-DB and building-key migrations) — not touched.

## Unresolved questions
- None — user confirmed scope, id scheme (snake_case, all 51 steps), and migration approach (manual console script) directly.
