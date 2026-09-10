---
phase: 6
title: "Phase 6: Verify"
status: complete
priority: P1
effort: ""
dependencies: [5]
---

# Phase 6: Verify

## Overview

Build the site via Docker, confirm no regressions on the Forticlad page from
the Phase 4 rename, and hand-verify computed totals on the new page against
Phase 1's source data.

## Requirements

- Functional: Docker Jekyll build succeeds for both languages with no errors.
- Functional: at least 3 hand-computed totals (mix of Tomes and Collections,
  at least one combining both) match the new page's engine output exactly.
- Non-functional: JS module files pass a syntax check as `type="module"` would
  parse them (not just as loose CommonJS scripts) — the prior Forticlad
  migration shipped a duplicate-declaration `SyntaxError` that `node --check`
  on a plain `.js` file missed (Node parses `.js` as CommonJS, where sloppy-
  mode redeclaration is legal; browsers load these as ES modules, where it's a
  hard parse error).

## Related Code Files

- Read only: all files created/modified in Phases 2-5.

## Implementation Steps

1. Run the Docker Jekyll build:
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle \
     -w /site ruby:3.3 \
     bash -lc "bundle exec jekyll build"
   ```
   Confirm zero errors/warnings for both `/en/lands-of-jail/planners/
   tomes-collections/` and `/vi/lands-of-jail/planners/tomes-collections/`.
2. Copy each new/modified `.js` file to `.mjs` and run `node --check` on the
   copy (catches ES-module-only syntax errors, e.g. duplicate top-level
   declarations, that plain `.js` `node --check` misses) — apply to
   `tomes-core.js`, `tomes.js`, and the modified `forticlad.js`/`research.js`/
   `table-helpers.js`.
3. Hand-compute at least 3 totals directly from Phase 1's tables (not from the
   engine) and compare against the built page's behavior or a standalone
   script driving `tomes-core.js`:
   - Tome level 0->5: SealOfWisdom = 10+50+90+160+270 = 580, SealOfKnowledge =
     10+60+110+200+330 = 710.
   - Collection level start->epic (i.e. through all of uncommon+rare+epic's
     base row): sum CommonCoin across `uncommon`(3000)+`uncommon_s1`(7500)+
     `rare`(13500)+`rare_s1`(20000)+`rare_s2`(5000)+`rare_s3`(6000)+
     `epic`(7000) = 62000; RareCoin = 30+75+135+200+50+60+70 = 620; PreciousCoin
     = 0+0+0+0+70+80+90 = 240.
   - Combined: 2 tomes at level 0->2 + 1 collection at start->uncommon_s1,
     confirm the page's combined breakdown table lists 3 rows and the grand
     total sums correctly across both categories and both resource groups.
4. Verify the Phase 4 rename didn't regress Forticlad: load
   `/en/lands-of-jail/planners/forticlad/` in the build output, confirm
   `.loj-planner__*` classes are present in the rendered HTML and no
   `forticlad-planner` string remains anywhere in `_site/`.
5. If a Chrome browser tool is connected, do a live-browser pass: add a tome,
   add a collection, set targets, confirm the sticky bar appears/disappears
   correctly, confirm Reset works with the double-click-confirm pattern. If no
   browser tool is available, state that explicitly rather than claiming
   verified UI behavior (matches the prior migration's own documented
   limitation).

## Success Criteria

- [x] Docker build succeeds, zero errors, both languages.
- [x] `node --check` on `.mjs` copies of every new/modified JS file passes.
- [x] All 3+ hand-computed totals match.
- [x] Zero `forticlad-planner` strings remain in `_site/` output.
- [x] Live-browser QA either completed and documented, or explicitly flagged
      as not possible in this session (never silently skipped without saying so).

## Risk Assessment

None beyond what's already covered by the implementation steps — this phase
exists specifically to catch the two bug classes ((1) module-only syntax
errors, (2) incomplete class-rename) that bit the prior migration.
