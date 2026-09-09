---
title: "Phase 6: Verify: Docker Jekyll build + manual data spot-checks"
status: done
---

# Phase 6: Verify: Docker Jekyll build + manual data spot-checks

## Overview

This repo has no JS/Ruby test suite (static Jekyll site, no `package.json`) —
verification is a real Docker Jekyll build plus manual data spot-checks against
Phase 1's source reference, per this repo's `CLAUDE.md` build instructions and
the user's global rule against fake/placeholder verification.

## Requirements

- [x] `bundle exec jekyll build` succeeds inside the project's Docker Ruby container for both EN and VI output, no errors/warnings about the new/changed data or content files.
- [x] At least 3 computed totals (mix of Buildings and Research) hand-verified against Phase 1's source tables.
- [x] Both language pages visually reviewed (via `jekyll serve` in the same container) for the new section order, FC Lab, Research T11, Hyperalloy stock, and the explicit auto-required lists.
- [x] No leftover `boomer-barrack` or French strings anywhere in the touched files.

## Related Code Files

- Verify only (no changes expected unless the build surfaces a bug): everything touched in Phases 2-5.

## Implementation Steps

1. **Build.** From Windows Git Bash, per `CLAUDE.md`:
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle \
     -w /site ruby:3.3 \
     bash -lc "bundle exec jekyll build"
   ```
   Confirm `_site/en/lands-of-jail/planners/forticlad/index.html` and the `vi`
   equivalent exist and contain the new markup (grep for `fc_lab`,
   `research-planner` or equivalent data-role markers, `Hyperalloy`/`Hyperalloy`
   VI translation).

2. **Manual spot-checks** (pick numbers directly from Phase 1's tables, hand-sum, compare to the planner's rendered total — do not trust the code's own output as its own verification):
   - **Buildings, post-fix regression check:** Warden Office 30 -> FC1 total should
     still be `5 x 250 = 1250 FC` (this range was already correct before Phase 2 —
     confirms the backfill didn't break early tiers).
   - **Buildings, the actual bug fix:** Warden Office FC5 -> FC6 total should be
     `5 x {afc:24, fc:360} = {afc:120, fc:1800}` (previously this would have
     computed `{afc:24, fc:360}` — 1 row instead of 5 — confirming the fix).
   - **FC Lab:** FC Lab level 0 -> level 6 total should be
     `5 x (150+200+250+300+350) + 5 x {afc:10,fc:160}` =
     `5x1250 fc (levels 1-5) + 5x160 fc + 5x10 afc` = `7050 fc, 50 afc`.
   - **Research, single track:** `lethality` level 1 -> 10 (any troop) should sum
     to `80+100+140+180+240+300+380+480+600+800 = 3300 Hyperalloy`.
   - **Research, cascade:** `bastion` level 1 (any troop) should report a total
     of `4500` (bastion itself) `+ rally 1->12` (160+200+240+290+360+430+530+
     650+810+1010+1260+1580 = 7520) `+` the 4 combat stats each 1->10 (3300
     each, since `lethality`'s curve is shared with `atk`/`def`/`hp` per Phase
     1: `rally`'s own level-7 gate requires all 4 at level 10, which subsumes
     its level-1 gate requiring them at level 5, so the full 1->10 climb is
     the correct cascade target) `+` `expedition` 1->4 (30+50+80+130 = 290,
     required once — every one of the 4 combat stats' level-5 gate requires
     `expedition:4`, but it's the same shared track so its cost counts once,
     not 4x) `= 4500 + 7520 + 4*3300 + 290 = 25,510 Hyperalloy`. If the
     rendered total is `25,220` (missing the `expedition` contribution) or
     `26,380`-ish (double/quadruple-counting `expedition`), that's a cascade
     bug — fix before marking this phase done.

3. **Visual QA** via `jekyll serve --host 0.0.0.0` (add `-p 4000:4000` to the
   Docker command) on both `/en/lands-of-jail/planners/forticlad/` and
   `/vi/lands-of-jail/planners/forticlad/`: confirm section order, FC Lab card,
   Research T11 troop groups, Hyperalloy input, both auto-required lists appear
   and update live when a target is set. If browser automation tooling is
   available in the session running this phase, use it; otherwise this step is
   a manual checklist for the user to confirm and report back — don't claim
   visual verification without actually having rendered and looked at the page.

4. **Grep sweep** for regressions: `grep -rn "boomer-barrack" .` (expect zero
   hits outside this plan's own history/changelog references),
   `grep -rn "I18N.fr\|Recherches T11\|Hyperalliage" assets/ contents/ _data/`
   (expect zero — confirms no French leaked in).

## Todo

- [x] Run Docker Jekyll build, confirm clean output for EN + VI
- [x] Hand-verify the 5 spot-check totals above against rendered output
- [x] Visual QA both language pages (or hand off as an explicit manual-check request if no browser tooling available)
- [x] Grep sweep for `boomer-barrack` and French leftovers

## Success Criteria

- [x] Docker build clean.
- [x] All 5 spot-checks match.
- [x] Grep sweep clean.
- [x] Visual QA done (or explicitly handed off with a clear checklist if not possible in this session).

## Risk Assessment

If the Docker daemon isn't running or the image pull fails, don't fall back to
"looks fine in the diff" as a substitute for a real build — report the build
failure/blocker plainly rather than marking this phase done.
