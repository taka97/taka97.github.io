---
phase: 5
title: "Content Pages and Navigation"
status: complete
priority: P1
effort: "1.5h"
dependencies: [3, 4]
---

# Phase 5: Content Pages and Navigation

## Overview

Ship `contents/{en,vi}/lands-of-jail/planners/robots-satellites.md` (Markdown +
planner skeleton, JSON data island, script tag) and a new nav entry in both
`loj-en`/`loj-vi` Tools groups in `_data/navigation.yml`, following
`tomes-collections.md`'s exact front-matter/structure pattern.

## Requirements

- Functional: EN page at `/en/lands-of-jail/planners/robots-satellites/`, VI page
  at `/vi/lands-of-jail/planners/robots-satellites/`, sharing `ref:
  loj-robots-satellites-planner`. Both pages render the full skeleton: profile
  context, stock inputs (5 resources), missing summary + sticky bar, Robot
  add-instance section, 3 Satellite rarity sections, reset button, status region.
- Non-functional (per brainstorm decision 5): VI page uses the same structure and
  the same EN names for the 5 resources and 9 satellites — only surrounding
  Vietnamese prose (intro paragraph, section headings, UI copy already handled by
  `robots-satellites.js`'s MESSAGES.vi from Phase 3) is translated. Do not
  translate resource/satellite proper nouns this round.

## Architecture

Mirrors `tomes-collections.md` 1:1 in section structure, substituting:
- 5 stock inputs (PrisonerArmorData, PowerModule, AdvancedPowerModule, DataDisk,
  PlanetCoin) instead of Tomes' 6.
- One "Robots" section (`data-role="robots-list"` + `data-role="add-robot"`)
  instead of Tomes' tome section.
- Three "Satellites — R/SR/SSR" subsections (`data-role="satellites-r-list"`,
  `-sr-list`, `-ssr-list`, no add buttons) instead of Tomes' collection section.
- `<script id="robots-satellites-data" type="application/json">{{
  site.data.lands_of_jail.robots_satellites | jsonify }}</script>` instead of
  Tomes' data island.
- `<script type="module" src="/assets/js/planners/robots-satellites.js"></script>`.

`data-role` attribute names here must match whatever `getElements()` in Phase 3's
`robots-satellites.js` actually queries for — implementer should finalize exact
`data-role` strings in Phase 3 first, then keep this page's markup in lockstep (or
adjust `getElements()` to match whichever set is written first; either order
works, they just must agree).

## Related Code Files

- Create: `contents/en/lands-of-jail/planners/robots-satellites.md`
- Create: `contents/vi/lands-of-jail/planners/robots-satellites.md`
- Modify: `_data/navigation.yml`

## Implementation Steps

1. Write `contents/en/lands-of-jail/planners/robots-satellites.md`:
   - Front matter: `title: Robots & Satellites Planner`, `lang: en`,
     `permalink: /en/lands-of-jail/planners/robots-satellites/`,
     `ref: loj-robots-satellites-planner`, `sidebar: { nav: loj-en }`,
     `aside: { toc: true }`.
   - Intro paragraph (adapt source's `introLead`/`introNote` — mention the
     estimated-cost caveat on R-tier level 50, matching source's own
     `introNote` text about the "≈" badge).
   - `<section class="loj-planner" data-robots-satellites-planner data-lang="en" ...>`
     with: profile-context, inventory (5 stock inputs), summary/results
     (missing-grid + totals), Robot section (list + add button), 3 Satellite
     sections (list only, headed by rarity), reset button, status, sticky bar —
     structurally identical to `tomes-collections.md`'s section nesting.
   - JSON data island + module script tag at the bottom.
2. Write `contents/vi/lands-of-jail/planners/robots-satellites.md` — same
   structure, `lang: vi`, `permalink: /vi/...`, same `ref`, `sidebar: { nav:
   loj-vi }`, `data-lang="vi"`, Vietnamese intro prose, EN resource/satellite
   names per the deferred-translation decision.
3. Add nav entries to `_data/navigation.yml`:
   - Under `loj-en`'s Tools group, after the Tomes & Collections entry:
     `{ title: Robots & Satellites, url: /en/lands-of-jail/planners/robots-satellites/ }`.
   - Under `loj-vi`'s Tools group, after its Tomes & Collections entry:
     `{ title: Công cụ tính Robots & Satellites, url:
     /vi/lands-of-jail/planners/robots-satellites/ }` — keeps the English proper
     noun untranslated, matching the existing VI "Công cụ tính Tomes &
     Collections" nav entry's pattern (confirmed in validation, 2026-09-10).
4. Cross-check `data-role`/`data-*` attribute names against Phase 3's
   `getElements()` once both are written — fix any mismatch before Phase 6.

## Todo

- [x] Write EN content page.
- [x] Write VI content page.
- [x] Add both nav entries.
- [x] Reconcile `data-role` attributes between the page and `robots-satellites.js`
      — verified via grep on the built HTML: all 16 `data-role` attributes queried
      by `getElements()` are present in the rendered output.

## Success Criteria

- [x] Both pages have correct, distinct `permalink`s and a shared `ref`
      (`loj-robots-satellites-planner`).
- [x] Nav shows "Robots & Satellites" (EN) / "Công cụ tính Robots & Satellites"
      (VI), positioned after Tomes & Collections, in both `loj-en` and `loj-vi`
      sidebar groups — confirmed via grep on the built Forticlad page's sidebar
      markup (renders the full Tools group) for both languages.
- [x] Language switcher (existing `header.html` logic, keyed by `ref`) correctly
      pairs the EN and VI robots-satellites pages once both exist — both pages
      share `ref: loj-robots-satellites-planner`.
