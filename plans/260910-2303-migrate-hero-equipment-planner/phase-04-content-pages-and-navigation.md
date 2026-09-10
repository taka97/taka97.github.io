---
phase: 4
title: "Phase 4: Content Pages and Navigation"
status: complete
priority: P1
effort: "1.5h"
dependencies: [3]
---

# Phase 4: Content Pages and Navigation

## Overview

Ship the EN + VI Markdown pages (JSON data island + `hero-equipment.js`
script tag + `.loj-planner` markup for the 12 sections), add nav entries in
both `loj-en`/`loj-vi` Tools groups, and add the mandatory "Hero Equipment
Planner client flow" section to `docs/system-architecture.md`.

## Requirements

- Functional: `contents/en/lands-of-jail/planners/hero-equipment.md` and
  `contents/vi/lands-of-jail/planners/hero-equipment.md`, same frontmatter
  shape as `robots-satellites.md` (`title`, `lang`, `permalink`, `ref:
  loj-hero-equipment-planner`, `sidebar: { nav: loj-en|loj-vi }`, `aside: {
  toc: true }`).
- Functional: nav entries in `_data/navigation.yml`'s `loj-en`/`loj-vi`
  Tools groups, positioned after Robots & Satellites, before Settings — EN
  title "Hero Equipment", VI title "Công cụ tính Hero Equipment" (same
  "Công cụ tính <English proper noun>" pattern as the 3 existing entries).
- Documentation: mandatory `docs/system-architecture.md` "Hero Equipment
  Planner client flow" section (the Robots & Satellites migration made this
  non-optional during plan validation — carrying that forward, not
  re-litigating it).

## Related Code Files

- Create: `contents/en/lands-of-jail/planners/hero-equipment.md`
- Create: `contents/vi/lands-of-jail/planners/hero-equipment.md`
- Modify: `_data/navigation.yml` (both `loj-en` and `loj-vi` Tools groups,
  navigation.yml:39-48 and :73-82 in the pre-migration file)
- Modify: `docs/system-architecture.md` (new section after "Robots &
  Satellites Planner client flow", docs/system-architecture.md:126-148 in
  the pre-migration file)

## Implementation Steps

1. Write the EN page: intro paragraph (mirror `robots-satellites.md`'s
   style — plain-language summary of what it calculates, note the estimated
   badge), profile-context section, stock inputs (4 resources), missing
   summary section, 3 troop groups × 4 slot sections markup (or a
   JS-templated container the script fills — match whichever approach
   `robots-satellites.md` uses for its repeated Robot/Satellite sections),
   breakdown table container, reset control, closing `<script
   id="hero-equipment-data" type="application/json">{{
   site.data.lands_of_jail.hero_equipment | jsonify }}</script>` +
   `<script type="module" src="/assets/js/planners/hero-equipment.js">`.
2. Write the VI page — same structure, Vietnamese copy for headings/labels
   (reuse `TROOP_TRANSLATIONS` from Phase 3, plus slot/resource labels
   authored this phase).
3. Add nav entries to `_data/navigation.yml`.
4. Add the `docs/system-architecture.md` section, matching the depth/style
   of the existing "Robots & Satellites Planner client flow" section:
   describe the data file shape, the engine's single-pass Rarity→Mastery
   bump (and how it differs from `research-core.js`'s iterative graph), the
   fixed-grid state shape, and the `hero-equipment` profile tool-data key.

## Success Criteria

- [x] Both pages render at `/en/lands-of-jail/planners/hero-equipment/` and
      `/vi/lands-of-jail/planners/hero-equipment/` with correct hreflang
      pairing via the shared `ref`.
- [x] Nav entries appear in both language sidebars, correctly ordered.
- [x] `docs/system-architecture.md` documents this planner's client flow at
      the same depth as its 3 existing planner sections.

## Risk Assessment

Low — this phase is templating against 3 already-working precedents, no new
mechanisms. Main risk is copy/label inconsistency (EN "Outerwear" vs. source
subtitle's "Jacket") — resolved above by picking the source's actual field
label over its looser subtitle copy.
