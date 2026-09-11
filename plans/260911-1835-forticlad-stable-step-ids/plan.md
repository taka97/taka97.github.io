---
title: "Forticlad stable step ids"
description: "Decouple Forticlad Core Planner's persisted step identifiers from display text so future translation/renaming doesn't orphan saved user progress."
status: completed
priority: P1
effort: "2-3h"
tags: [lands-of-jail, forticlad, data-model, i18n]
created: 2026-09-11
---

# Forticlad stable step ids

## Overview

`_data/lands_of_jail/forticlad.yml` `steps[].base` is used simultaneously as
display text, `<option value>`, the internal `baseIndexes`/`requirements` map
key, and the value persisted per-profile in IndexedDB
(`buildingBases[key].currentBase`/`.targetBase`). 26 of 51 steps use verbose
text as that id (`Level 30 (start)`, `Forticlad (1)`…`Forticlad (5)` and their
`-1..-4` sub-steps). Changing that text later (e.g. translation) would orphan
existing users' saved progress. This plan renames every step id to a stable
snake_case code, adds a separate `label` field for display, and updates the
JS layer accordingly — with zero visible UI change. Scope is the Forticlad
planner only; the other 4 lojcalc-style planners already use this pattern.

Full background, root-cause analysis, and the confirmed id-mapping table:
see [brainstorm report](../reports/brainstorm-260911-1832-forticlad-stable-step-ids.md).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Rename all 51 `forticlad.yml` step ids to stable snake_case codes; add `label` per step | P1 |
| 2 | Update `planner-core.js`/`forticlad.js` to use `label` for display, `base` (id) for storage/logic; remove the now-dead `aliases` map | P1 |
| 3 | Deliver a standalone browser-console script to remap existing users' saved `currentBase`/`targetBase` values | P1 |
| 4 | Reshape Forticlad's FC/AFC/Hyperalloy on-hand fields into a `stock: {}` object, matching the other 4 lojcalc-style planners | P2 |

## Non-Goals

- No VI translation of tier/base text in this pass (decouple only).
- No change to Tomes & Collections, Robots & Satellites, Hero Equipment, or Hero Stars Exclusive Equipment planners — they already use stable ids.
- No automated/in-app migration — user runs the console script manually, once.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Data model and JS rename](./phase-01-start.md) | Completed |
| 2 | [Phase 2: Migration script and verification](./phase-02-migration-script-and-verification.md) | Completed |
| 3 | [Phase 3: Unify FC AFC Hyperalloy stock storage](./phase-03-unify-fc-afc-hyperalloy-stock-storage.md) | Completed |

## Success Criteria

- [x] All 51 `forticlad.yml` steps use snake_case `base` ids per the mapping table in the brainstorm report; every step has an explicit `label`.
- [x] Forticlad dropdowns and totals table render identical text to before the change (labels copied verbatim).
- [x] `aliases`/`resolveBase` indirection removed from `planner-core.js` with no behavior change (requirements/max_base already resolve natively against the new short ids). Verified regression-free via 23,808-case differential test.
- [x] `docker run ... bundle exec jekyll build` succeeds with no errors.
- [x] Manual browser check: existing saved current/target base selections still resolve correctly after running the console migration script against pre-change IndexedDB data. Confirmed directly during Phase 3's live browser verification — user's real profile's `buildingBases` already held new-format ids (`fc1`, `fc2`, `level_30_start`). User has also since run the Phase 3 stock-fields cleanup script (`forticlad-migrate-stock-fields.js`), folding legacy `fcOnHand`/`afcOnHand`/`hyperalloyOnHand`/`coreOnHand` into `stock`.
- [x] Standalone console migration script delivered (not wired into the app), widened to all 51 ids during the code-review gate (see plan's Post-Phase-1 Code Review note).
- [x] `tools.forticlad.stock` replaces the flat `fcOnHand`/`afcOnHand`/`hyperalloyOnHand`/`coreOnHand` fields, matching the other 4 planners' storage shape, with old saved profiles migrated automatically on read (no manual script needed for this reshape).

## Validation Log

### Verification Results
- Claims checked: 8 (file/symbol existence, FC10-no-substeps, storage.js constants)
- Verified: 8 | Failed: 0 | Unverified: 0
- Tier: Light (2 phases, Fact Checker only)
- Grep confirmed only `planner-core.js` and `forticlad.yml` reference the old base strings anywhere in live source (`assets/`, `_data/`, `_includes/`, `_sass/`, `contents/`) — no other file needs touching.

### Interview
1. **Label shape** → plain `label:` string per step in yml (not an inline `{en, vi}` object). Matches `buildings[key].label` (same file) + a future `STEP_LABEL_TRANSLATIONS[base]` JS dict mirroring `BUILDING_TRANSLATIONS[key]`. No VI dict created this pass (no content yet — YAGNI). Superseded an initial "{en, vi} object now" answer after surfacing the closer in-file precedent; user deferred to this reasoning ("no preference").
2. **Case handling** → lowercase `requirements`/`max_base` refs in `forticlad.yml` (`FC1`→`fc1`, etc.) rather than adding case-insensitive matching in JS — keeps zero indirection after removing `aliases`.
3. **Migration script safety** → dry-run by default (diff table logged, no writes); explicit `RUN = true` flag required to commit via `put()`.
4. **Scope reconfirmed** → Forticlad tool only; other 4 planners (including Robots & Satellites, referenced only as a precedent check) are untouched, future work.

### Whole-Plan Consistency Sweep
Re-read `plan.md` + both phase files after propagation. No stale references to the earlier "{en, vi} object" idea remain; both phase files now agree on: plain-string `label`, lowercase yml refs, dry-run-first script. No unresolved contradictions.

**Recommendation: proceed to implementation.**

## Post-Phase-1 Code Review (mandatory gate)

`code-reviewer` subagent ran a 23,808-case differential test (old engine + old yml vs new engine + new yml across all building × current × target combinations) — zero diffs in totals, effective ranges, or thrown errors. Rename confirmed regression-free. Also found and fixed during this gate: `research.js`'s `fcLabCheckpoints()` depended on the removed `aliases` map (not in original scout — same `createPlanner` instance is shared cross-planner); fixed to build lowercase `fc${level}` directly. Also fixed: `normalizeStep`'s `label` validation was a hard-throw instead of the plan-specified `step.label || step.base` fallback — corrected to match spec (resilience against theoretical stale-cache/label-less data).

**Flagged risk, resolved with user:** Phase 1 alone causes `forticlad.js`'s `validBase()` to silently reset unresolvable saved bases to defaults on load, and the next dropdown `change` auto-saves that reset — permanently overwriting pre-rename data before Phase 2's script runs. User confirmed (2026-09-11) Forticlad profile data is their own testing data only, no real external users at risk — so the manual-script-only approach stands. User must run the Phase 2 script against their own browser's IndexedDB **before** interacting with the deployed page's dropdowns, to avoid self-inflicted data loss. Phase 2 additionally widened to cover the legacy top-level `tools.forticlad.currentBase` field (from the old `forticlad-planner` DB migration in `storage.js`) — cheap to include, protects the user's own data more completely.

## Post-Phase-3 Code Review and Live Verification

`code-reviewer` subagent found one **critical** regression in Phase 3's initial implementation: `forticlad.js` and `research.js` share the same `tools.forticlad` storage slot, and making `stock` a single shared top-level key (replacing the old disjoint `fcOnHand`/`afcOnHand`/`hyperalloyOnHand` fields) meant each script's save function rebuilt the *whole* `stock` object from its own stale in-memory copy — editing one resource then the other (no reload in between) silently reverted the first edit. Fixed by merging `changes.stock` against a freshly-read `current.stock` inside each save function rather than the closure-level copy at the call site. See `phase-03-unify-fc-afc-hyperalloy-stock-storage.md`'s "Post-Implementation Code Review" section for full detail.

This fix was then verified live in the browser (via `claude-in-chrome`, local Jekyll preview) against the **user's real production profile** ("422 — Taka") — not synthetic test data. This incidentally confirmed the user had already run the Phase 2 migration script themselves (their `buildingBases` already held new-format ids). The exact clobber sequence (edit Hyperalloy, then edit FC) was reproduced pre-fix logically and re-tested post-fix live: both values now survive. The user's real data was fully restored to its original values afterward and confirmed byte-identical on reload.

<!-- slug: forticlad-stable-step-ids -->
