---
phase: 1
title: "Phase 1: Forticlad building rows"
status: completed
priority: P2
effort: "10m"
dependencies: []
---

# Phase 1: Forticlad building rows

## Overview
Apply the badge-stack heading wrapper to Forticlad Core Planner's per-building
rows (`renderBuildingRanges` in `forticlad.js`).

## Requirements
- Functional: badge renders stacked under the building name instead of inline; TOC no longer picks up badge text for this planner.
- Non-functional: zero change to dropdown behavior, range validation, or persisted data — display-only change.

## Architecture
Mirrors `tomes.js`'s `buildInstanceCard` exactly: wrap the `<h3>` heading and
the badge `<span>` in a `.loj-planner__instance-heading` div, give the
heading its own `.loj-planner__instance-label` class, and append both into
that wrapper instead of appending the badge inside the heading. CSS already
generically applies (`.loj-planner__instance-range .loj-planner__instance-heading`
in `_sass/custom.scss`) since Forticlad's rows already use the shared
`.loj-planner__instance-range` class.

## Related Code Files
- Modify: `assets/js/planners/forticlad.js` (`renderBuildingRanges`)

## Implementation Steps
1. Create a `headingRow` div (`.loj-planner__instance-heading`) before the heading.
2. Add `.loj-planner__instance-label` class to the existing `<h3>` heading.
3. Append badge into `headingRow` alongside the heading, instead of into the heading itself.
4. Use `headingRow` (not `heading`) in the row's final `.append(...)` call.

## Success Criteria
- [x] `headingRow` wrapper added, heading gets `.loj-planner__instance-label`, badge no longer appended inside the `<h3>`.
- [x] No other reference to the old `heading`-only append pattern remains in `forticlad.js` (grep verified).
- [x] CSS requires no changes (confirmed already generically scoped).

## Risk Assessment
Low — single-file, display-only change mirroring an already-shipped reference
implementation exactly. No data model, calculation, or storage impact.
