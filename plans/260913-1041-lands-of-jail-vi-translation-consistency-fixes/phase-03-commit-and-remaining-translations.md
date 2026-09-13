---
phase: 3
title: "Commit outstanding changes & remaining translations"
status: completed
priority: P1
effort: "30m commit + variable for remaining translations"
dependencies: [2]
---

# Phase 3: Commit outstanding changes & remaining translations

## Overview
Get the working-tree changes from Phase 2 into a commit, and track the
translation/copy items intentionally left pending during this session.

## Requirements
- Functional: working tree changes committed on `feat/loj-vi-label-translations`
  with conventional-commit messages; no unrelated files swept in.
- Non-functional: secret scan passes; tests still green after commit.

## Architecture
N/A — git operations + data-only follow-ups, no new architecture.

## Related Code Files
- Commit (working tree, listed in Phase 2): 4 `.js` files, 8 `.md` files, 1 new `.js` file, 1 more `.yml` file.
- Genuinely blocked, not just deferred — see memory `pending-vi-translations-in-game-data`:
  <!-- Updated: Session 2 (post-merge) - confirmed with user this is an indefinite block, not a queued task -->
  - `_data/lands_of_jail/tomes_collections.yml` — `collectionTiers`: `exotic`, `exotic_t1`, `exotic_t2`, `exotic_t3` still plain-string (no `vi`). User confirmed (2026-09-13): blocked on not having real in-game VI text.
  - `_data/lands_of_jail/robots_satellites.yml` — `satellites`: `sat_ssr_domaine_omniscient`, `sat_ssr_nexus_celeste`, `sat_ssr_argus`, `sat_ssr_polaris` still plain-string. Same block.
  - `_data/lands_of_jail/hero_equipment.yml` — `resources`: `PotentialCoil` still plain-string. Reason unconfirmed — don't assume the same in-game-data block without asking.
  - `contents/vi/lands-of-jail/planners/collections-tomes.md` and `robots-satellites.md` — intro-paragraph disclaimer sentences were narrowed in Phase 4 (resource-name clause dropped since resources are fully translated; tier/satellite-name clause kept since that part is still accurate). This is now the stable wording, not an interim one — see plan.md Validation Log's "Superseded" note.
  - `assets/js/planners/hero-equipment.js` `RARITY_TIER_LABELS` — hardcoded EN-only, not yml-driven; tracked in memory `pending-hero-equipment-rarity-labels`, user said review later.

## Implementation Steps
<!-- Updated: Validation Session 1 - commit split, push, and disclaimer-timing decisions confirmed -->
1. `git status` / `git diff --stat` — confirm the file list matches Phase 2's
   "working tree" list exactly (13 modified + 1 new file), nothing stray staged.
2. Secret scan the diff (per `~/.claude/rules/development-rules.md` — never
   commit secrets/tokens/credentials).
3. **Single commit** for all 13 modified files + `troop-name.js` — validated
   decision: this is one cohesive yml-driven-localization effort, not split.
4. Conventional commit message, e.g.
   `refactor(lands-of-jail): render Current Stock from yml data and dedupe troop translations`.
   End with the attribution lines from this session's system reminder.
5. Re-run `node --test tests/*.test.mjs` post-commit as a final sanity check.
6. **Do not push** — validated decision: commit only, matching this branch's
   pattern so far. Push later, manually, when the user asks.
7. When ready to resume translations: reuse `/tmp/loj-vi-translations.csv`
   (outside the repo, not committed) — it already has the row structure for
   the 4 remaining items; fill in `vietnamese` and hand back for the same
   yml-edit-and-verify loop used earlier this session.
8. **Stale disclaimer sentences** — validated decision: leave as-is for now.
   Update/remove them in `contents/vi/.../collections-tomes.md` and
   `robots-satellites.md` only after their respective remaining translations
   (exotic tiers / SSR satellites, step 7) are filled in — not before.

## Outcome
<!-- Updated: Session 2 (post-merge) - phase executed, recording actual result -->
Executed as 2 commits instead of the single commit originally planned — a
code-reviewer subagent gate (mandatory in the `/ak:cook` flow this ran under)
found the working tree also contained the new plan directory, which doesn't
belong in a code commit:
- `95836b7` — `refactor(lands-of-jail): consolidate resource labels, dedup troop names, standardize wording` (14 files: the 13 planned + `troop-name.js`)
- `2005d8a` — `docs(plans): add VI translation consistency plan` (this plan's own files)

Both merged into `main` via `ab911fc` (branch `feat/loj-vi-label-translations`
deleted after). The code-reviewer pass also caught 2 real bugs this phase's
own earlier edits had introduced (stale quoted wording + stale resource order
in `hero-equipment.md`'s intro, from the Phase 2 `maxedSuffix`/reorder work) —
fixed before committing. See `git log --oneline -6` on `main` for the full sequence.

## Success Criteria
- [x] `git log --oneline -6` shows the new commits with correct messages/attribution (`95836b7`, `2005d8a`, then merge `ab911fc`).
- [x] `git status --porcelain=v1` was clean immediately after this phase (Phase 4's changes came later, on `main`).
- [x] `node --test tests/*.test.mjs` passed post-commit (10/10).
- [x] Remaining translation items and stale-copy items are still tracked (this
      file + memory `pending-vi-translations-in-game-data`, `pending-hero-equipment-rarity-labels`) — not silently forgotten once the commit landed.

## Risk Assessment
Low. The only real risk is scope creep — sweeping in unrelated changes with
`git add -A`. Mitigation: stage the exact file list from Phase 2, not a
blanket add. No schema/migration risk (pure yml/JS/Liquid presentation
changes, no storage-key or data-shape changes).
