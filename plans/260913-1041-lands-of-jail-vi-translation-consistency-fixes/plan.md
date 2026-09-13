---
title: "Lands of Jail VI Translation & Consistency Fixes"
description: "Vietnamese localization pass across the 5 Lands of Jail planner tools: yml data translations, a data-driven Current Stock refactor, and cross-tool wording/naming consistency fixes."
status: in-progress
priority: P2
effort: "1d"
tags: [lands-of-jail, i18n, vi]
created: 2026-09-13
---

# Lands of Jail VI Translation & Consistency Fixes

## Overview

Session-long VI localization pass on the 5 Lands of Jail browser-local planner
tools (Forticlad, Collections & Tomes, Robots & Satellites, Hero Equipment,
Hero Stars & Exclusive Equipment). Two commits already landed on
`feat/loj-vi-label-translations` (branched off `main` at `7d9fff6`); a further
batch of fixes is implemented in the working tree and not yet committed. This
plan documents both, and tracks what's still pending.

Branch/main state (checked 2026-09-13): local `main` has **no commits ahead**
of this branch's merge-base — nothing new to rebase onto. Could not reach
`origin` from this sandbox (SSH key not available) to check for remote-only
updates; if the user has pulled `main` elsewhere, re-check
`git log feat/loj-vi-label-translations..main --oneline` before merging.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Record the 2 already-committed VI localization commits | P2 |
| 2 | Commit the working-tree fixes (Liquid Current Stock refactor, TROOP_TRANSLATIONS dedup, ordering/wording fixes) | P1 |
| 3 | Track remaining untranslated data + stale disclaimer copy for a future pass | P3 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Branch & main state check](./phase-01-start.md) | Done |
| 2 | [Phase 2: Completed work this session](./phase-02-completed-work-this-session.md) | Done |
| 3 | [Phase 3: Commit outstanding changes & remaining translations](./phase-03-commit-and-remaining-translations.md) | Pending |

## Success Criteria

- [ ] All working-tree changes committed to `feat/loj-vi-label-translations` with conventional-commit messages
- [ ] `node --test tests/*.test.mjs` passes after the commit
- [ ] Remaining untranslated yml fields (4 exotic tiers, 4 SSR satellites, PotentialCoil) and the 2 stale VI disclaimer sentences are tracked, not silently dropped

## Validation Log

### Verification Results
- Claims checked: 3 (branch commit list, working-tree file list, test suite result)
- Verified: 3 | Failed: 0 | Unverified: 0
- Tier: Light (self-verified via direct `git`/`node --test` re-run — see Phase 1/Phase 2 for original evidence; re-checked identical results at validation time)
- Failures: none

### Interview (2026-09-13, 3 questions)
1. **Commit split** → Single commit for all 13 modified files + 1 new file. Rationale: the Liquid Current Stock refactor and the TROOP_TRANSLATIONS dedup + hero-equipment polish fixes are all one cohesive yml-driven-localization effort from this session.
2. **Push after commit** → No — commit only, matching this branch's pattern so far (every prior commit was made without pushing).
3. **Stale VI disclaimer sentences** (collections-tomes.md, robots-satellites.md intro paragraphs) → Leave as-is; address once the remaining translations (4 exotic tiers, 4 SSR satellites) are filled in, so the copy update happens in one accurate pass instead of two.

### Whole-Plan Consistency Sweep
Re-read `plan.md` and all 3 phase files after the interview. No stale terms,
renamed fields, or contradicted claims found — Phase 3's "single commit or
split?" open question is now resolved and reflected below; no other phase
referenced the old open question. No unresolved contradictions remain.

**Recommendation:** proceed — Phase 3 is ready to execute (single commit, no push, disclaimers deferred).

<!-- slug: lands-of-jail-vi-translation-consistency-fixes -->
