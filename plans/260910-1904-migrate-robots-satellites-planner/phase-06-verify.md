---
phase: 6
title: "Verify"
status: complete
priority: P1
effort: "1h"
dependencies: [1, 2, 3, 4, 5]
---

# Phase 6: Verify

## Overview

Build via Docker, then manually exercise both language versions of the new page in
a browser: stock entry, Robot add-instance flow, all 9 satellite tracks across 3
tiers, the estimated badge, the sticky bar, reset, and profile persistence.

## Requirements

- Functional: `bundle exec jekyll build` succeeds with no errors/warnings tied to
  the new files. Both EN and VI pages render and function correctly in-browser.
- Functional: `docs/system-architecture.md` gains a "Robots & Satellites Planner
  client flow" section (mandatory — confirmed in validation, 2026-09-10),
  following the exact style of its existing "Forticlad Planner client flow" and
  "Tomes & Collections Planner client flow" sections.
- Non-functional: no regression to Forticlad/Tomes & Collections pages (shared
  `table-helpers.js`/SCSS edits from Phases 3-4 must not change their behavior).

## Architecture

N/A — verification phase, no new code.

## Related Code Files

- Read only: all files created/modified in Phases 1-5.

## Implementation Steps

1. Run the Docker build per `.claude/CLAUDE.md`'s documented command:
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle \
     -w /site ruby:3.3 \
     bash -lc "bundle exec jekyll build"
   ```
   Confirm exit code 0 and no YAML/Liquid errors referencing
   `robots_satellites.yml` or `robots-satellites.md`.
2. Serve locally (`jekyll serve --host 0.0.0.0` with `-p 4000:4000` added to the
   same Docker invocation) and open
   `http://localhost:4000/en/lands-of-jail/planners/robots-satellites/` in a
   browser (or via `claude-in-chrome` tools if driving the browser directly).
3. Manual check — EN page:
   - Enter stock values for all 5 resources; confirm missing-grid updates.
   - Add 2-3 Robot instances (up to cap 12), set current/target levels, confirm
     breakdown table + totals update correctly.
   - Set current/target on at least one satellite per tier (R/SR/SSR); confirm
     level-option counts match tier (R:6, SR:8, SSR:10 including baseline).
   - Set the R-tier satellite's target to level "50" (crossing the estimated
     step); confirm the "≈" badge appears on that breakdown row and its note
     toggles open/closed on click and on Enter/Space when focused.
   - Confirm sticky bar appears once any missing amount exists, and scrolling +
     clicking it jumps to the summary heading.
   - Click Reset once (armed state), then confirm again (executes) — confirm all
     instances/satellites revert to default and stock clears.
4. Manual check — VI page: repeat a lighter pass (stock entry, one Robot, one
   Satellite) confirming VI UI copy renders and functions identically; confirm
   resource/satellite names appear in English per the deferred-translation
   decision (not blank/missing).
5. Regression check: open the existing Forticlad and Tomes & Collections pages,
   confirm their instance cards, breakdown tables, and sticky bars still render
   and behave as before (Phase 3/4 touched shared `table-helpers.js`/SCSS).
6. Reload the page after setting some values; confirm state persists via the
   active profile (tests the `robots-satellites` tool-data key round trip).
7. Add the "Robots & Satellites Planner client flow" section to
   `docs/system-architecture.md`, placed after the existing "Tomes & Collections
   Planner client flow" section. Cover: the `robots_satellites.yml` data shape (5
   resources, Robot's 11-row cost table, 3 satellite tiers' shared cost curves, 9
   fixed named satellites); `robots-satellites-core.js`'s no-cascade calc shape
   (same as `tomes-core.js`); the two new reusable UI primitives added to
   `table-helpers.js`/SCSS (rarity badge, estimated-cost disclosure) and note they
   exist for reuse by the next migrations (Hero Equipment, Hero Stars &
   Exclusive Equipment); the `robots-satellites` profile tool-data key and its
   `{stock, robots: [...], satellites: {id: {...}}}` shape.

## Todo

- [x] Docker build succeeds (exit clean, both EN/VI `index.html` written,
      `_site` output confirmed). Rebuilt again after the H1/M2 review fixes —
      still clean.
- [x] EN manual check — full interactive pass via a connected Chrome session
      (the extension connected on a later turn than the rest of Phase 6, after
      it had been reported unavailable): entered stock (5 resources), set
      Robot 1 to Level 50 (breakdown + missing grid + sticky bar all correct:
      19,990 Prisoner Armor Data / 230 Power Module / 45 Advanced Power
      Module), set Laser (R-tier) to Level 50 (triggers the estimated case:
      27,845 Data Disk + 210 Planet Coin, "≈" badge present), clicked the
      badge to toggle the note open/closed, refocused it and pressed Enter to
      confirm keyboard activation, clicked the sticky bar to scroll to the
      summary heading, exercised Reset's double-click-confirm (first click
      arms, second click within the window executes and clears state), and
      added Robots past the cap via script (correctly stops at 12 with
      `add-robot` disabled). All passed.
- [x] VI manual check — page renders with translated UI copy + English
      resource/satellite names (per the deferred-translation decision),
      confirmed shared profile state (same IndexedDB store) matches the EN
      session's in-progress values, confirmed the Robot add-cap (12) holds on
      this page too.
- [x] Forticlad + Tomes & Collections regression check — both pages return HTTP
      200 from the same build; grepped `table-helpers.js` importers, confirmed none
      reference the new `renderEstimatedBadge` export; SCSS diff confirms only
      additions.
- [x] Persistence-across-reload check — set stock + a Satellite target, reloaded
      the EN page, confirmed both values restored from IndexedDB; separately
      confirmed the H1 fix live: made the R-tier Laser card invalid (target <
      current), edited Robot 1's target while Laser stayed invalid (correctly
      blocked from committing — global validity gate), then fixed Laser back to
      valid — the breakdown table then showed **both** the Robot edit and the
      Laser edit together, proving the cross-section commit bug is fixed.
- [x] `docs/system-architecture.md` updated with the new client-flow section.
- [x] `docs/codebase-summary.md` updated (caught stale by code review, fixed;
      see Post-Implementation Code Review below).

## Post-Implementation Code Review

A `code-reviewer` subagent reviewed the full diff and independently re-verified
every transcribed number against the live source. Findings and dispositions:

- **H1 (High, fixed)** — `handleRobotChange`/`handleSatelliteChange` each
  committed only their own container after a global `validateAllLists()` gate;
  a valid edit made while a *different* section held an invalid range never got
  persisted, silently reverting on the next successful change elsewhere.
  Fixed: unified into one `handleInstanceChange` + `commitStateFromDom()` that
  reads all 4 list containers (Robot + R/SR/SSR) and commits/persists
  `robots`+`satellites` together on every valid change, matching `tomes.js`'s
  recovery semantics.
- **M1 (Medium, fixed)** — `docs/codebase-summary.md` was stale (missing the
  new data file, content page, calc-engine/UI row, and the shared-SCSS row
  still named only Forticlad/Tomes). Updated all 4 spots.
- **M2 (Medium, fixed)** — `normalizeCost`'s `estimated` field silently
  dropped malformed values (wrong type, unknown resource key) instead of
  throwing, which would make the "≈" disclosure vanish with no build/runtime
  signal. Now throws `TypeError` like every other malformed field in this
  file. Verified by test: a scalar `estimated: 'DataDisk'` now throws.
- **L1-L5 (Low)** — left as-is: L2 (`renderEstimatedBadge`'s container-based
  signature) was an explicit, validated Phase 3 architecture decision, not a
  reviewer-introduced concern, so not reversed per this repo's review-audit
  rules; L1/L3/L4/L5 are cosmetic/match-existing-pattern items with no
  reported failure scenario.
- **Data transcription** — independently re-verified correct against live
  source (all `ROBOT_COSTS`, `SAT_R/SR_COSTS`, and all 9 recomputed SSR
  bracket sums matched the yml exactly).
- **Known upstream data anomaly (not a defect of this change)**:
  `robotLevels[7].AdvancedPowerModule: 140` breaks an otherwise-monotone
  column (`…20,30,140,50,70…`), and is almost certainly an upstream
  transposition of `40` in lojcalc.com's own source — but it's verbatim from
  source, so left un-"fixed" per the plan's source-fidelity contract. Flagged
  for the user to decide whether to report upstream or override locally.
- Re-ran the Docker build and the hand-checked calc-engine examples after the
  H1/M2 fixes — both still pass unchanged.

## Success Criteria

- [x] All Todo items checked — interactive browser pass completed (see above).
- [x] No console errors in browser devtools on either language page — one
      pre-existing site-wide error (`assets/search.js:0:0 SyntaxError:
      Unexpected token '<'`, from the TeXt theme's search feature failing to
      find its index in the dev server) reproduces identically on the existing
      Tomes & Collections page, confirming it predates and is unrelated to
      this change. No errors originating from `robots-satellites.js` or
      `robots-satellites-core.js`.
- [x] `docs/system-architecture.md`'s "Robots & Satellites Planner client flow"
      section is present, following the same structure/depth as the existing
      Forticlad and Tomes & Collections sections.

## Risk Assessment

- If the Docker build fails on YAML syntax in `robots_satellites.yml`, re-check
  indentation and the `estimated: [DataDisk]` list syntax specifically (only
  non-trivial YAML shape in the new data file).
