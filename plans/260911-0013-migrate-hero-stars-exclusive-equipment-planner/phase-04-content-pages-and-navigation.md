---
phase: 4
title: "Phase 4: Content Pages and Navigation"
status: done
priority: P1
effort: "2h"
dependencies: [3]
---

# Phase 4: Content Pages and Navigation

## Overview

Ship the EN + VI Markdown pages (JSON data island + `hero-stars-exclusive-equipment.js`
script tag + `.loj-planner` markup for the 2 addable sections), add nav
entries as the last item in both `loj-en`/`loj-vi` Tools groups, add the
mandatory "Hero Stars & Exclusive Equipment Planner client flow" section to
`docs/system-architecture.md`, and update `docs/project-roadmap.md`'s
"Lands of Jail tools" section to reflect that this was the last tool in the
migration series.

## Requirements

- Functional: `contents/en/lands-of-jail/planners/hero-stars-exclusive-equipment.md`
  and `contents/vi/lands-of-jail/planners/hero-stars-exclusive-equipment.md`,
  same frontmatter shape as `hero-equipment.md` (`title`, `lang`,
  `permalink`, `ref: loj-hero-stars-exclusive-equipment-planner`, `sidebar:
  { nav: loj-en|loj-vi }`, `aside: { toc: true }`).
- Functional: nav entries in `_data/navigation.yml`'s `loj-en`/`loj-vi`
  Tools groups, positioned after Hero Equipment (last planner entry, before
  Settings) — EN title "Hero Stars & Exclusive Equipment", VI title "Công
  cụ tính Hero Stars & Exclusive Equipment" (same "Công cụ tính <English
  proper noun>" pattern as all 4 existing entries).
- Documentation: mandatory `docs/system-architecture.md` "Hero Stars &
  Exclusive Equipment Planner client flow" section (non-optional per the
  Robots & Satellites/Hero Equipment precedent — carrying that forward).
- Documentation: `docs/project-roadmap.md`'s "Lands of Jail tools" section
  (lines ~24-35 pre-migration) currently lists "Hero Stars & Exclusive
  Equipment" as the last remaining out-of-scope lojcalc.com tool — update
  it to reflect the migration series is complete (all 5 tools now shipped),
  keeping the existing "Verified boundary" data-provenance framing for
  consistency.

## Related Code Files

- Create: `contents/en/lands-of-jail/planners/hero-stars-exclusive-equipment.md`
- Create: `contents/vi/lands-of-jail/planners/hero-stars-exclusive-equipment.md`
- Modify: `_data/navigation.yml` (both `loj-en` and `loj-vi` Tools groups,
  after the existing Hero Equipment entries)
- Modify: `docs/system-architecture.md` (new section after "Hero Equipment
  Planner client flow")
- Modify: `docs/project-roadmap.md` ("Lands of Jail tools" section)

## Implementation Steps

1. Write the EN page: intro paragraph (mirror `hero-equipment.md`'s style
   — plain-language summary of what it calculates; no estimated-badge
   callout needed here, unlike the other 4 pages, since this tool has no
   unconfirmed figures), profile-context section, stock inputs (2
   resources: "Redeem", "Exclusive Weapon Parts"), missing summary section,
   2 addable-instance sections (Hero Stars, Exclusive Equipment) with their
   "+ Add Hero" controls, breakdown table container, reset control, closing
   `<script id="hero-stars-exclusive-equipment-data"
   type="application/json">{{ site.data.lands_of_jail.hero_stars_exclusive_equipment
   | jsonify }}</script>` + `<script type="module"
   src="/assets/js/planners/hero-stars-exclusive-equipment.js">`.
2. Write the VI page — same structure, Vietnamese copy for headings/labels
   (star-tier names, stage labels, resource labels). Per Validation Session
   1: keep "Redeem" as the literal EN label (matches source fidelity, same
   as every other resource name in this repo) and use a direct VI
   transliteration/equivalent (e.g. "Chuộc"/"Đổi") rather than inventing a
   clearer EN term — author the VI copy fresh, consistent in tone with the
   other 4 pages' VI copy.
3. Add nav entries to `_data/navigation.yml`.
4. Add the `docs/system-architecture.md` section, matching the depth/style
   of the existing "Hero Equipment Planner client flow" section: describe
   the data file shape, the engine's flat independent-track range-sum (no
   cascade, unlike Hero Equipment), the two-addable-list state shape with
   caps, and the `hero-stars-exclusive-equipment` profile tool-data key.
5. Update `docs/project-roadmap.md`'s "Lands of Jail tools" section: this
   plan ships the last named out-of-scope tool — rewrite the "remain out of
   scope" line to state the lojcalc.com migration series is complete, all
   5 tools shipped.

## Success Criteria

- [x] Both pages render at
      `/en/lands-of-jail/planners/hero-stars-exclusive-equipment/` and
      `/vi/lands-of-jail/planners/hero-stars-exclusive-equipment/` with
      correct hreflang pairing via the shared `ref`.
- [x] Nav entries appear in both language sidebars, correctly ordered as
      the last planner entry.
- [x] `docs/system-architecture.md` documents this planner's client flow at
      the same depth as its 4 existing planner sections.
- [x] `docs/project-roadmap.md` no longer lists Hero Stars & Exclusive
      Equipment as an out-of-scope tool; the "Lands of Jail tools" section
      reflects the completed migration series.

## Risk Assessment

Low — this phase is templating against 4 already-working precedents, no
new mechanisms. Main risk is VI copy quality for "Redeem" (no existing
translation precedent in this repo, per Validation Session 1) — flag it for
a native-speaker pass if uncertain, don't guess silently.

<!-- Updated: Validation Session 1 - keep literal "Redeem" label (transliterate for VI, don't clarify the EN term); roadmap doc update stays bundled in this plan's Phase 4 (both confirmed) -->
