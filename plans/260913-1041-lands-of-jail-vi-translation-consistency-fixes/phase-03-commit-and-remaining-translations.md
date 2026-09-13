---
phase: 3
title: "Commit outstanding changes & remaining translations"
status: pending
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
- Future, not in this phase's scope — fill in when ready:
  - `_data/lands_of_jail/tomes_collections.yml` — `collectionTiers`: `exotic`, `exotic_t1`, `exotic_t2`, `exotic_t3` still plain-string (no `vi`).
  - `_data/lands_of_jail/robots_satellites.yml` — `satellites`: `sat_ssr_domaine_omniscient`, `sat_ssr_nexus_celeste`, `sat_ssr_argus`, `sat_ssr_polaris` still plain-string.
  - `_data/lands_of_jail/hero_equipment.yml` — `resources`: `PotentialCoil` still plain-string.
  - `contents/vi/lands-of-jail/planners/collections-tomes.md` and `robots-satellites.md` — stale intro-paragraph disclaimer sentences ("Tên tài nguyên và tên bậc/Satellite hiện đang hiển thị bằng tiếng Anh") — now partially inaccurate since most names are translated; user has not yet decided whether to update now or wait until the above translations are complete.
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

## Success Criteria
- [ ] `git log --oneline -3` shows the new commit(s) with correct messages/attribution.
- [ ] `git status --porcelain=v1` is clean (or only shows files the user explicitly wants left uncommitted).
- [ ] `node --test tests/*.test.mjs` passes post-commit.
- [ ] Remaining translation items and stale-copy items are still tracked (this
      file + existing memory notes) — not silently forgotten once the commit lands.

## Risk Assessment
Low. The only real risk is scope creep — sweeping in unrelated changes with
`git add -A`. Mitigation: stage the exact file list from Phase 2, not a
blanket add. No schema/migration risk (pure yml/JS/Liquid presentation
changes, no storage-key or data-shape changes).
