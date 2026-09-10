---
phase: 5
title: "Phase 5: Verify"
status: complete
priority: P1
effort: "1.5h"
dependencies: [4]
---

# Phase 5: Verify

## Overview

Build via Docker Jekyll, then manually click-test both language pages in
Chrome — same verification bar as every prior planner migration (this repo
has no automated test suite for these client-side calculators; correctness
is verified by build success + live interactive check).

## Requirements

- `bundle exec jekyll build` (via the Docker command in
  `CLAUDE.md`/development docs) succeeds with no errors or warnings about
  the new data file/pages.
- Live interactive verification in Chrome (`claude-in-chrome` tools) of both
  `/en/` and `/vi/` pages.

## Implementation Steps

1. Run the Docker Jekyll build per `CLAUDE.md`:
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle \
     -w /site ruby:3.3 \
     bash -lc "bundle exec jekyll build"
   ```
   Fix any build errors before proceeding — do not skip past them.
2. Serve locally (`jekyll serve --host 0.0.0.0 -p 4000` in the same
   container) and open `/en/lands-of-jail/planners/hero-equipment/` in
   Chrome via `claude-in-chrome`.
3. Click-test: set a stock value for each of the 4 resources; set a Rarity
   Current + Target on one slot that crosses into Legendary T1+ without
   first setting a sufficient Mastery target — confirm the breakdown table
   shows the auto-added Mastery row tagged "(auto-added — prerequisite)";
   confirm the sticky "missing" bar updates; confirm the `common_s1`
   estimated-cost "≈" badge appears and toggles its note on click and on
   Enter (keyboard).
4. Reload the page — confirm all set values persist (profile round-trip).
5. Repeat a shortened version of step 3 on `/vi/lands-of-jail/planners/hero-equipment/`
   — confirm Vietnamese labels render (troop names, slot names, messages)
   and the EN↔VI language switcher correctly pairs the two pages via `ref`.
6. Confirm the nav entry appears correctly ordered in both language
   sidebars.

## Related Code Files

- No new files — this phase validates Phases 2-4's output.

## Success Criteria

- [x] `bundle exec jekyll build` succeeds with zero errors.
- [x] EN page: all 4 stock inputs, all 12 sections' 4 selects, breakdown
      table, sticky bar, estimated badge, reset control all work as
      click-tested.
- [x] VI page: same functional check, Vietnamese copy renders, language
      switcher round-trips correctly to/from the EN page.
- [x] Profile persistence confirmed live (values survive a reload).
- [x] Nav entries correctly positioned in both sidebars.
- [x] `docs/system-architecture.md`'s new section is accurate to what was
      actually shipped (re-read it against the final code once
      implementation is done, fix any drift before calling this phase
      complete).

## Risk Assessment

None beyond what's already covered — this is a verification-only phase. If
the build or manual check surfaces a defect, fix it in the relevant earlier
phase's files rather than patching around it here.
