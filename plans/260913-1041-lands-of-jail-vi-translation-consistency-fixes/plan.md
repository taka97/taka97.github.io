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
Hero Stars & Exclusive Equipment). Phase 3's commit landed and was merged to
`main` (`ab911fc`); a second, uncommitted batch of VI title renames and prose
consistency fixes followed on `main` directly (Phase 4). This plan documents
all of it and tracks what's still pending.

Branch state (updated 2026-09-13, post-merge): `feat/loj-vi-label-translations`
was merged into local `main` via merge commit `ab911fc` and deleted. All work
now happens directly on `main`. `origin/main` is still behind (this sandbox
has no SSH access to push) — someone with push access needs to run
`git push origin main` from a machine that has it.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Record the 2 already-committed VI localization commits | P2 |
| 2 | Commit the working-tree fixes (Liquid Current Stock refactor, TROOP_TRANSLATIONS dedup, ordering/wording fixes) | P1 |
| 3 | Track remaining untranslated data + stale disclaimer copy for a future pass | P3 |
| 4 | Rename all 4 remaining VI tool titles for consistency and fix the stale prose this surfaced | P2 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Branch & main state check](./phase-01-start.md) | Done |
| 2 | [Phase 2: Completed work this session](./phase-02-completed-work-this-session.md) | Done |
| 3 | [Phase 3: Commit outstanding changes & remaining translations](./phase-03-commit-and-remaining-translations.md) | Done |
| 4 | [Phase 4: VI title rename and prose consistency pass](./phase-04-vi-title-rename-and-prose-consistency-pass.md) | In progress (implemented, uncommitted) |

## Success Criteria

- [x] All Phase 2/3 working-tree changes committed (`95836b7`, `2005d8a`) and merged to `main` (`ab911fc`)
- [x] `node --test tests/*.test.mjs` passes after every batch of changes (still 10/10 as of the latest edit)
- [x] Remaining untranslated yml fields (4 exotic tiers, 4 SSR satellites) confirmed genuinely blocked on the user having real in-game VI text, not just unfinished — see memory `pending-vi-translations-in-game-data`; `PotentialCoil`'s reason is unconfirmed, don't assume the same block
- [ ] Phase 4's 9 modified files committed to `main`
- [ ] The 2 VI disclaimer sentences (collections-tomes.md, robots-satellites.md) stay accurate — re-check wording whenever more of the 8 blocked items get real translations

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

  <!-- Updated: Session 2 (post-merge) - decision #3 superseded, see below -->
  **Superseded (2026-09-13, later same day):** turned out resource names
  finished translating before the tier/satellite names did, so the
  "one pass instead of two" plan wasn't achievable — the disclaimers were
  narrowed immediately (resource-name clause dropped, tier/satellite-name
  clause kept) rather than waiting. User then confirmed the remaining 8 items
  (4 exotic tiers, 4 SSR satellites) are blocked indefinitely on real in-game
  VI text, not just queued — so the narrowed disclaimer wording is now the
  stable end state, not an interim one. See memory `pending-vi-translations-in-game-data`.

### Whole-Plan Consistency Sweep
Re-read `plan.md` and all 3 phase files after the interview. No stale terms,
renamed fields, or contradicted claims found — Phase 3's "single commit or
split?" open question is now resolved and reflected below; no other phase
referenced the old open question. No unresolved contradictions remain.

**Recommendation:** proceed — Phase 3 is ready to execute (single commit, no push, disclaimers deferred).

### Whole-Plan Consistency Sweep (Session 2, post-merge update)
Re-read `plan.md` and all 4 phase files while adding Phase 4. Found and
reconciled: decision #3 above (disclaimer timing) was stale — superseded note
added rather than rewritten in place, so the original interview record stays
intact. Phase 3's file list, commit message, and outcome updated to match
what actually landed (`95836b7`/`2005d8a`/`ab911fc`) rather than the
pre-commit plan text. No other contradictions found.

**Recommendation:** proceed — Phase 4 just needs a commit; nothing else blocks it.

<!-- slug: lands-of-jail-vi-translation-consistency-fixes -->
