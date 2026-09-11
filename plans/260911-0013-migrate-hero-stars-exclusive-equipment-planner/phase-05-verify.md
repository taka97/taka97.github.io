---
phase: 5
title: "Phase 5: Verify"
status: done
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

- `bundle exec jekyll build` (via the Docker command in `CLAUDE.md`)
  succeeds with no errors or warnings about the new data file/pages.
- Live interactive verification in Chrome (`claude-in-chrome` tools) of
  both `/en/` and `/vi/` pages.

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
   container) and open
   `/en/lands-of-jail/planners/hero-stars-exclusive-equipment/` in Chrome
   via `claude-in-chrome`.
3. Click-test: set a stock value for each of the 2 resources; add a second
   Hero Stars instance and set Current=`recruited`, Target=`star2` —
   confirm the breakdown table shows 50 HeroFragment for that row (matches
   the Phase 2 sanity-check math); add a second Exclusive Equipment
   instance and set Current=Level 0, Target=Level 3 — confirm 60 Exclusive
   Weapon Parts; confirm the sticky "missing" bar updates; confirm the
   Target `<select>` on a Hero Stars instance never lists a stage-checkpoint
   option (only Recruited + 5 whole star tiers).
4. Click each "+ Add Hero" button repeatedly — confirm it stops adding and
   disables at 6 instances, independently per list (adding to Hero Stars
   does not affect the Exclusive Equipment add button's state or count).
5. Reload the page — confirm all set values persist (profile round-trip).
6. Repeat a shortened version of step 3 on
   `/vi/lands-of-jail/planners/hero-stars-exclusive-equipment/` — confirm
   Vietnamese labels render (star-tier names, stage labels, resource
   labels, messages) and the EN↔VI language switcher correctly pairs the
   two pages via `ref`.
7. Confirm the nav entry appears correctly ordered (last planner entry) in
   both language sidebars.
8. Re-read the new `docs/system-architecture.md` section against the final
   shipped code and fix any drift before calling this phase complete.
9. Re-read the updated `docs/project-roadmap.md` "Lands of Jail tools"
   section for accuracy against what actually shipped.

## Related Code Files

- No new files — this phase validates Phases 2-4's output.

## Success Criteria

- [x] `bundle exec jekyll build` succeeds with zero errors.
- [x] EN page: both stock inputs, both addable lists (add up to cap of 6
      each, independently), breakdown table, sticky bar, reset control all
      work as click-tested; sample math (50 HeroFragment, 60 Exclusive
      Weapon Parts) matches.
- [x] VI page: same functional check, Vietnamese copy renders, language
      switcher round-trips correctly to/from the EN page.
- [x] Profile persistence confirmed live (values survive a reload).
- [x] Nav entries correctly positioned (last) in both sidebars.
- [x] `docs/system-architecture.md` and `docs/project-roadmap.md` sections
      are accurate to what was actually shipped.

## Risk Assessment

None beyond what's already covered — this is a verification-only phase. If
the build or manual check surfaces a defect, fix it in the relevant earlier
phase's files rather than patching around it here.
