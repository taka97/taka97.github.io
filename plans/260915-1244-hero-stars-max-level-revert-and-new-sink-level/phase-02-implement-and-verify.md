---
phase: 2
title: "Docs update and verification"
status: pending
priority: P2
effort: "20m"
dependencies: [1]
---

# Phase 2: Docs update and verification

## Overview

Bring `docs/system-architecture.md` in line with the new 33-entry table, then verify the
build and the in-browser behavior.

## Requirements

- Functional: docs no longer say "32-entry Hero Stars level table"; browser shows correct
  labels and a 600 Redeem total for 5★ → Max level.
- Non-functional: no regression in Exclusive Equipment track or other planners.

## Related Code Files

- Modify: `docs/system-architecture.md` (~lines 190-192, "Hero Stars & Exclusive Equipment
  Planner client flow" section)

## Implementation Steps

1. In `docs/system-architecture.md`, change "32-entry Hero Stars level table" to "33-entry Hero
   Stars level table" and add a short clause noting the trailing `max_level` sink level reached
   only from `star5_s5`.
2. Build via Docker (per `CLAUDE.md`):
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle \
     -w /site ruby:3.3 \
     bash -lc "bundle exec jekyll build"
   ```
3. Serve locally (`jekyll serve --host 0.0.0.0` with `-p 4000:4000`) and open the Hero Stars &
   Exclusive Equipment planner (EN and VI).
4. Manually verify: Hero Stars Current = "5 stars", Target = "Max level" → breakdown row cost
   reads 600 Redeem; the Target dropdown's 5th tier option reads "5 stars · tier 5" (not "Max
   level"); "Max level" now appears as its own, later option.

## Success Criteria

- [x] Docs updated, no stale "32-entry" mention remains.
- [x] Jekyll build succeeds with no errors.
- [x] Manual browser check confirms 600 Redeem total and correct tier-5 vs max-level labels in
      both EN and VI.

## Risk Assessment

Low — doc + verification only, no further code changes. Rollback is a straight revert of
Phase 1's 3 file edits if verification fails.
