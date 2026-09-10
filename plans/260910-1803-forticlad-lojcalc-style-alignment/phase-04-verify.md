---
phase: 4
title: "Verify"
status: complete
priority: P1
effort: "1h"
dependencies: [2, 3]
---

# Phase 4: Verify

## Overview

Build and manually exercise both planners in both languages to confirm the two
new UI pieces work correctly and nothing existing regressed.

## Requirements

- Functional: sticky bars and badges behave correctly per Phases 2-3's success
  criteria, in a real rendered build (not just read-through).
- Non-functional: no build errors; no console errors in the browser.

## Architecture

N/A — verification only.

## Related Code Files

- Read/run only: all files touched in Phases 2-3.

## Implementation Steps

1. Build via Docker (per `.claude/CLAUDE.md`):
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle \
     -w /site ruby:3.3 \
     bash -lc "bundle exec jekyll build"
   ```
   Confirm zero errors/warnings introduced by this change.
2. Serve locally (`jekyll serve --host 0.0.0.0 -p 4000:4000` variant of the same
   Docker command) and open in the browser (claude-in-chrome or manual) — do not
   use an ad-hoc static file server for JS-driven pages; Jekyll's own serve (or
   the real deployed site) is required since ES module + JSON-embed pages need
   the actual Jekyll-rendered `<script>` tags to resolve correctly.
3. Forticlad EN (`/en/lands-of-jail/planners/forticlad/`):
   - Set a building target above current Base → the one combined sticky bar
     appears with an FC and/or AFC chip; click it → scrolls to
     `#forticlad-summary-heading`.
   - Reset that building back to its current Base (only target set, no research
     target) → sticky bar hides.
   - Set a research track target (no building target) → the same bar appears
     with a Hyperalloy chip, confirming `research.js`'s
     `forticlad:research-totals-changed` event correctly reaches `forticlad.js`.
   - Set both a building and a research target → bar shows all applicable chips
     together (FC/AFC/Hyperalloy).
   - Confirm every building row and every research track row shows the correct
     badge, including the research-track case where `currentLevel > 0` and
     `targetLevel` is reset to the sentinel `0` ("no target" — not "target set").
4. Repeat step 3 for Forticlad VI (`/vi/lands-of-jail/planners/forticlad/`) —
   confirm localized sticky-bar and badge text.
5. Tomes & Collections EN (`/en/lands-of-jail/planners/tomes-collections/`):
   - Confirm the sticky bar still works identically after the Phase 2 refactor
     into a shared `table-helpers.js` export (no behavior change expected).
   - Confirm every Tome and Collection row shows the correct badge, including the
     `currentIndex > 0`, `targetIndex` reset to sentinel `0` case.
6. Repeat step 5 for VI.
7. Check browser console on all four pages for errors during the above interactions.
8. `git status` / `git diff` — review the full changeset for anything
   unintentional before handing off for commit.

## Success Criteria

- [x] Jekyll build succeeds with no new errors/warnings.
- [x] All Phase 2 and Phase 3 success criteria confirmed in a real browser, both
      languages, all four instance groups.
- [x] No console errors (one pre-existing, unrelated `search.js` exception observed
      on all pages before and after this change — not introduced by this plan).
- [x] Diff reviewed and contains only the intended files.

## Risk Assessment

None beyond what Phases 2-3 already flagged — this phase exists specifically to
catch those risks (combined-bar event-timing flash, badge semantics mix-up,
sticky-bar refactor regression) before considering the work done.
