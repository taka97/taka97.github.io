---
phase: 1
title: "Start"
status: complete
priority: P1
effort: "15m"
dependencies: []
---

# Phase 1: Start

## Overview

Confirm the working baseline before touching shared planner code: current branch,
clean working tree, and the exact current shape of the three files this plan
extends (`forticlad.md`, `forticlad.js`/`research.js`, `tomes.js`). No functional
changes in this phase.

## Requirements

- Functional: none — this is a verification-only phase.
- Non-functional: confirm no uncommitted changes are silently overwritten by later
  phases.

## Architecture

N/A — no code changes.

## Related Code Files

- Read only: `contents/en/lands-of-jail/planners/forticlad.md`,
  `contents/vi/lands-of-jail/planners/forticlad.md`,
  `contents/en/lands-of-jail/planners/tomes-collections.md`,
  `assets/js/planners/forticlad.js`, `assets/js/planners/research.js`,
  `assets/js/planners/tomes.js`, `assets/js/planners/table-helpers.js`,
  `_sass/custom.scss`

## Implementation Steps

1. `git status` — confirm branch `feat/tomes-collections-planner` and a clean tree
   (or note what's already in flight before Phase 2 starts editing the same files).
2. Re-confirm the two target gaps still hold by re-reading the three JS engines and
   `_sass/custom.scss` (`.loj-planner__sticky-bar` exists only in `tomes.js`'s
   markup path; no `.loj-planner__instance-badge` exists anywhere). This plan was
   authored against that exact state on 2026-09-10 — if the branch has moved since,
   re-verify before proceeding.

## Success Criteria

- [x] Branch and working-tree state confirmed clean.
- [x] Both gaps (sticky bar, badges) reconfirmed present in the current codebase.

## Risk Assessment

None — read-only phase.
