---
phase: 1
title: "Phase 1: Data model and JS rename"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Data model and JS rename

## Overview
Rewrite `forticlad.yml` step ids to stable snake_case codes with an explicit
`label` per step, then update `planner-core.js`/`forticlad.js` to read
`label` for display while keeping `base` (the new short id) for all
storage/logic. Remove the now-dead `aliases` map/`resolveBase` indirection.

## Requirements
- Functional: dropdowns, totals table, and stored `currentBase`/`targetBase`
  values must render/behave identically to today after the rename — only the
  underlying id changes.
- Non-functional: no change to calculation results (`calculateBuildingRequirements`,
  `resolveRequirements`) — verify via the same inputs producing the same totals.

## Architecture
- `base` stays the stable identifier field (matches existing domain language:
  "Current Base" / "Target Base" UI labels); its *value* becomes a short
  snake_case code instead of display text.
- New `label` field per step carries today's exact display string (copied
  verbatim — zero visual change). Steps that were already short (`FC6`, etc.)
  get a `label` equal to their new id's uppercase form only where that matches
  today's rendered text (see table in brainstorm report — e.g. `fc6` → label
  `FC6`, `fc6_s1` → label `FC6-1`).
- **Label mechanism matches the existing in-file precedent exactly**:
  `buildings[key].label` (plain EN string in yml) + `BUILDING_TRANSLATIONS[key]`
  (JS dict, VI) is how this same file/planner already handles translatable
  text for building names. Steps get the same shape: plain `label:` string in
  yml (EN only, this pass), resolved via a `stepLabel(planner, base)` helper
  in `forticlad.js` structured so a future `STEP_LABEL_TRANSLATIONS[base]`
  VI dict slots in later exactly like `buildingName()` does today. Do **not**
  create an empty VI dict now — no content yet, would be premature (YAGNI).
  (Considered mirroring Robots & Satellites' `labelKey` yml field + JS dict
  instead — rejected: adds a field that's always identical to `base`, and
  diverges from Forticlad's own already-established `buildings[key].label`
  convention in the same file.)
- `requirements`/`max_base` entries in `forticlad.yml` already reference
  `FC1`..`FC10` shorthand — once `base` values are `fc1`..`fc10` (lowercase),
  update those references (`FC1`→`fc1` etc., ~50+ line touches, text-only) to
  match exactly (case must align) so they resolve natively without the alias
  layer. Rejected alternative: case-insensitive `.toLowerCase()` matching in
  JS — that reintroduces an indirection layer equivalent to the aliases map
  this phase removes.

## Related Code Files
- Modify: `_data/lands_of_jail/forticlad.yml`
- Modify: `assets/js/planners/planner-core.js`
- Modify: `assets/js/planners/forticlad.js`
- Modify: `assets/js/planners/research.js` (found during implementation, not in original
  scout — the FC Buildings/T11 Research planner reuses the same
  `createPlanner(forticladData)` and read `buildingsPlanner.aliases` in
  `fcLabCheckpoints()` to resolve `FC{level}` shorthand into the old verbose
  base string. Updated to build `fc${level}` directly and check
  `baseIndexes.has()`, since ids now match natively — no other change needed
  in this file, no base strings are rendered to the user there.)

## Implementation Steps
1. In `forticlad.yml`, rewrite every `steps[].base` value per the mapping
   table in [brainstorm report](../reports/brainstorm-260911-1832-forticlad-stable-step-ids.md#full-id-mapping-old-base--new-base-id-label--old-value-verbatim):
   `Level 30 (start)`→`level_30_start`, `30-1..4`→`level_30_s1..s4`,
   `Forticlad (N)`→`fcN`, `Forticlad (N)-1..4`→`fcN_s1..s4` (N=1..5),
   `FC5-1..4`→`fc5_s1..s4`, `FC6`..`FC10` and their `-1..4` sub-steps→
   `fc6`..`fc10`, `fc6_s1..s4`..`fc9_s1..s4` (FC10 has no sub-steps).
2. Add a `label:` key to every step in the same file, holding the exact old
   display string (`fc1` → `label: Forticlad (1)`, `fc6` → `label: FC6`,
   `fc6_s1` → `label: FC6-1`, `level_30_start` → `label: Level 30 (start)`, etc.).
3. Update `requirements` section's `targetBase`/`minimumBase` values from
   `FC1`..`FC10` to lowercase `fc1`..`fc10` to match the new step ids directly.
4. Update `buildings[key].max_base` values (`FC10`, `FC8`, `FC6`) to lowercase
   `fc10`, `fc8`, `fc6`.
5. In `planner-core.js`:
   - `normalizeStep`: capture and validate `label` (`typeof step.label === 'string'`,
     fallback `step.label || step.base` for safety, though every step will now
     have an explicit label).
   - Remove the `aliases` Map literal and the `['Level 30 (start)', ...]`/
     `['FC1', 'Forticlad (1)']` etc. entries — dead once ids match natively.
   - Simplify `resolveBase(planner, base)` to `planner.baseIndexes.has(base) ? base : undefined`
     (or inline this at call sites if it collapses to a one-liner used only
     twice) — remove `aliases` param/usage from `createPlanner`'s returned
     object and any function signature that threaded it through.
   - Update `normalizeRequirements` (drops the `aliases.get(...)` fallback
     since `baseIndexes.has(entry.minimumBase/targetBase)` now matches
     directly for the lowercase `fc1`..`fc10` values).
6. In `forticlad.js`:
   - `rangeLabel`: change `new Option(step.base, step.base)` to
     `new Option(step.label, step.base)`.
   - Add a small `stepLabel(planner, base)` helper:
     `planner.steps.find((step) => step.base === base)?.label ?? base`.
   - `renderTotals`: replace raw `range.currentBase`/`range.targetBase` in the
     row array with `stepLabel(planner, range.currentBase)` /
     `stepLabel(planner, range.targetBase)`.
   - Leave all other `step.base`/`.value` comparisons unchanged (they compare
     ids to ids and remain correct).

## Success Criteria
- [x] `forticlad.yml` has no step with `base` containing spaces, parentheses,
      or uppercase letters; every step has a `label`. (Verified via Ruby/Psych
      script: 51 steps, 0 duplicates, 0 missing labels.)
- [x] `requirements`/`max_base` references match `steps[].base` values exactly
      (no lookup miss). (Verified: 0 unresolved requirement entries, 0
      unresolved `max_base` refs.)
- [x] `aliases` map and `resolveBase` function removed from `planner-core.js`;
      the one other consumer (`research.js`'s `fcLabCheckpoints`) updated to
      build lowercase `fc${level}` ids directly instead of relying on aliasing.
- [x] Forticlad planner page renders identical dropdown text and totals-table
      text to before the change (confirmed via built page's embedded JSON:
      `base`/`label` pairs match the mapping table exactly).
- [x] `docker run ... bundle exec jekyll build` succeeds (4.552s, no errors —
      only pre-existing unrelated SASS deprecation warnings).

## Risk Assessment
- **Risk:** a typo in the mapping (e.g. missing a `-N` suffix) silently breaks
  one step's lookup, causing `rangeIndexes` to throw `RangeError` for that
  base only. **Mitigation:** cross-check every renamed id against the
  brainstorm report's full table line-by-line before moving to Phase 2;
  exercise every dropdown option manually (or via a quick console loop) after
  the yml build.
- **Risk:** case-sensitivity slip between `fc1` (id) and `FC1` (old
  requirements shorthand) reintroduces a lookup gap. **Mitigation:** step 3/4
  explicitly lowercases all requirement/max_base references in the same pass.
