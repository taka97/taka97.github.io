---
phase: 4
title: "Phase 4: SCSS generalization"
status: complete
priority: P1
effort: ""
dependencies: [3]
---

# Phase 4: SCSS generalization

## Overview

Rename the `.forticlad-planner__*` BEM block in `_sass/custom.scss` to a
generic `.loj-planner__*` block, and update every JS/content reference to
match, so Forticlad's page and the new Tomes & Collections page (and future
tool migrations) share one CSS implementation instead of duplicating it.

## Requirements

- Functional: Forticlad's page (EN + VI) renders pixel-identical to before
  this rename — this is a pure rename, zero visual change to the existing page.
- Functional: `tomes.js`/`tomes-collections.md` (Phase 3/5) use `.loj-planner__*`
  class names from the start — no `.forticlad-planner__*` reference anywhere
  in the new files.
- Non-functional: the rename touches CSS selectors AND JS class-name strings
  AND Markdown `class="..."` attributes — all three must move together in one
  commit-worth of change, or the page breaks (unstyled) between them.

## Architecture

Confirmed by grep (2026-09-10): `.forticlad-planner` + 24 distinct
`.forticlad-planner__*` element selectors exist in `_sass/custom.scss` (43
total occurrences). The class prefix string appears in exactly 5 other files:

- `assets/js/planners/forticlad.js`
- `assets/js/planners/research.js`
- `assets/js/planners/table-helpers.js` (hardcoded in `targetCell()`'s
  `'forticlad-planner__auto-tag'` and `grandTotalFooter()`'s
  `'forticlad-planner__grand-total-label'`)
- `contents/en/lands-of-jail/planners/forticlad.md`
- `contents/vi/lands-of-jail/planners/forticlad.md`

Most element names stay as-is under the new prefix (e.g.
`.forticlad-planner__missing-card` -> `.loj-planner__missing-card`) — a
mechanical, low-risk change. **Exception (per Validation Session 1):** two
element names read Forticlad/Research-specific and are generalized in this
same pass, not just prefix-renamed:
- `.forticlad-planner__building-range` -> `.loj-planner__instance-range`
- `.forticlad-planner__building-ranges` -> `.loj-planner__instance-ranges`
- `.forticlad-planner__troop-group` -> `.loj-planner__group`

These three need their JS call sites updated too (not just the SCSS
selector), since `forticlad.js`/`research.js` reference these specific class
names directly (`element.className = 'forticlad-planner__building-range'` or
similar), separately from the generic prefix substitution in Step 2 below.

## Related Code Files

- Modify: `_sass/custom.scss`
- Modify: `assets/js/planners/forticlad.js`
- Modify: `assets/js/planners/research.js`
- Modify: `assets/js/planners/table-helpers.js`
- Modify: `contents/en/lands-of-jail/planners/forticlad.md`
- Modify: `contents/vi/lands-of-jail/planners/forticlad.md`

## Implementation Steps

1. Re-run `grep -oE '\.?forticlad-planner[a-zA-Z0-9_-]*' -r _sass assets/js contents` to get the exact current list before editing (confirm nothing changed since this plan was written).
2. In each of the 6 files above, replace `forticlad-planner` with
   `loj-planner` as a literal string (class selectors in SCSS, `className`/
   template-literal strings in JS, `class="..."` attributes in Markdown) —
   every occurrence, since the prefix is always followed by `__element` or is
   the bare block class.
3. Additionally rename the three specific elements called out in Architecture
   above (`__building-range(s)` -> `__instance-range(s)`, `__troop-group` ->
   `__group`) in `_sass/custom.scss` AND every JS reference to those exact
   class-name strings in `forticlad.js`/`research.js` (grep each old name
   individually — they won't be caught by the blanket prefix substitution in
   Step 2 since the element name itself changes, not just the prefix).
4. Grep for `forticlad-planner` across the whole repo after the edit — zero
   remaining matches confirms the rename is complete (a leftover reference is
   an unstyled element, not a build error, so this can't rely on the Jekyll
   build catching it).

## Success Criteria

- [x] Zero occurrences of the literal string `forticlad-planner` remain
      anywhere in the repo (`grep -r forticlad-planner .` after excluding
      `_site/` and `plans/`).
- [x] Zero occurrences of `__building-range`, `__building-ranges`, or
      `__troop-group` remain anywhere in the repo (superseded by
      `__instance-range(s)` / `__group`).
- [x] Docker Jekyll build (Phase 6) renders Forticlad's page (EN + VI) with no
      visual regression — spot-check by diffing key class names present in
      the built HTML against the pre-rename build, or a manual screenshot
      comparison if browser tooling is available.

## Risk Assessment

The main risk is an incomplete rename leaving the Forticlad page partially
unstyled (SCSS renamed but a JS string missed, or vice versa) — silent at
build time, only visible in the browser. Mitigate with the whole-repo grep in
Step 4 as a hard gate before Phase 6's build verification, not a suggestion.
