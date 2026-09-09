---
title: "Phase 5: Research UI section, Hyperalloy stock, i18n"
status: done
---

# Phase 5: Research UI section, Hyperalloy stock, i18n

## Overview

Wire Phase 4's research engine into the page: reorder `forticlad.md` (EN+VI)
to follow the source's information architecture, add the Research T11 section
grouped by troop, add Hyperalloy to the stock/summary UI, add the explicit
auto-required list for research (mirroring Phase 3's building version), and
write all EN/VI copy. New JS controller module, not a rewrite of `forticlad.js`.

## Requirements

- [x] `forticlad.md` (EN+VI) section order matches: intro -> active profile -> current stock (FC/AFC/Hyperalloy) -> what's missing summary -> Buildings (incl. FC Lab, explicit auto-required list) -> Research T11 (grouped by troop: Shieldbearer/Bomber/Shooter, explicit auto-required list) -> breakdown/totals/charts.
- [x] Hyperalloy on-hand input added; summary/missing calculation covers all 3 resources.
- [x] New `research.js` UI controller renders troop-grouped track selectors, breakdown table, totals table, and an auto-required list — following `forticlad.js`'s existing rendering patterns (table/chart helpers), not a divergent style.
- [x] `research.js` persists to the **same `forticlad` profile tool-data key** `forticlad.js` uses (Validation Session 1) — new fields (e.g. `researchLevels: {trackId: {currentLevel, targetLevel}}`, `hyperalloyOnHand`) alongside the existing `buildingBases`/`fcOnHand`/`afcOnHand`, using the identical read-spread-write pattern as `forticlad.js`'s `saveForticladData()` (`{...getToolData(profile,'forticlad'), ...changes}`) so neither script clobbers the other's fields.
- [x] EN copy taken verbatim from Phase 1's `I18N.en` reference; VI copy hand-written (not machine-translated from the source's French), consistent with existing `loj-vi` tone in `_data/navigation.yml`/`forticlad.js` `MESSAGES.vi`. `res_Hyperalloy` VI = "Hyperalloy" (kept as loanword, Validation Session 1 — matches FC/AFC staying untranslated).
- [x] Page title / subtitle updated if needed to reflect the tool now covering Research T11 too (check current `# Forticlad FC / AFC Planner` H1 and intro paragraph still read correctly with research added).

<!-- Updated: Validation Session 1 - research persists into the existing 'forticlad' tool-data key, not a new one; Hyperalloy VI label locked -->

## Related Code Files

- Modify: `contents/en/lands-of-jail/planners/forticlad.md`
- Modify: `contents/vi/lands-of-jail/planners/forticlad.md`
- Create: `assets/js/planners/research.js`
- Modify: `assets/js/planners/forticlad.js` (only if the combined-summary rendering needs a shared helper; the Hyperalloy input itself is owned by `research.js`, writing into the same `forticlad` tool-data blob per the storage decision above — avoid duplicating the FC/AFC summary logic that already exists in `forticlad.js`)
- Modify: `_sass/custom.scss` (troop-group headings/icons if the existing `.forticlad-planner__building-range` card style doesn't already fit research tracks; reuse existing classes wherever they fit rather than inventing parallel ones)

## Implementation Steps

1. **Reorder the page markup** in both `forticlad.md` files to match the
   source's section order (see plan.md Key Decisions). Keep it Markdown +
   this repo's existing `<section data-role="...">` shell pattern — do not
   copy the source's own card-grid HTML/CSS.

2. **Add FC Lab** to the Buildings section — it renders automatically once
   Phase 2/3's data includes it (`planner.buildingKeys` already drives
   `renderBuildingRanges()` generically), so this is mostly verification, not
   new markup, unless FC Lab needs a distinct heading/grouping (source doesn't
   group it specially — it's just another building card).

3. **Add the Research T11 section**, grouped by troop
   (`troop_shieldbearer`/`troop_bomber`/`troop_shooter` headings, per Phase 1),
   each showing its 9 tracks as current/target level selects (mirroring
   `renderBuildingRanges()`'s current/target `<select>` pattern from
   `forticlad.js`, adapted for numeric levels instead of base labels).
   `bastion` gets visual emphasis (matches source's `accent` treatment for the
   troop's "end goal", same idea as `warden_office.accent` today).

4. **Hyperalloy stock + summary.** Add a Hyperalloy on-hand input next to the
   existing FC/AFC inputs (or in the Research section, whichever placement
   testing shows reads better — source keeps all 3 resources in one "Current
   stock" block, so default to that). Extend the missing/surplus summary to
   report all 3 resources per Phase 1's `res_FC`/`res_AFC`/`res_Hyperalloy`
   labels.

5. **Explicit auto-required list for research**, same shape as Phase 3's
   building version: render `result.automaticTrackKeys` (from
   `calculateResearchRequirements()`) into a
   `.forticlad-planner__prerequisites` list scoped to the Research section.

6. **Write `research.js`**, structured like `forticlad.js`: read the research
   data script tag, build the planner via `createResearchPlanner`, wire
   inputs, call `calculateResearchRequirements` on change, render breakdown
   table / totals table / auto-required list / Hyperalloy coverage chart
   (reuse `forticlad.js`'s `createTable`/chart-drawing helpers by extracting
   them to a shared module if duplicating them would be non-trivial — check
   actual duplication size before deciding whether to extract; don't
   preemptively extract a shared UI-helpers module if it's only 1-2 small
   functions).

7. **i18n pass.** Add EN strings (verbatim from Phase 1) and hand-written VI
   strings to wherever this repo keeps UI-string translations for planners
   (currently inline `MESSAGES`/`BUILDING_TRANSLATIONS` objects in
   `forticlad.js` — follow the same pattern in `research.js`, plus whatever
   Jekyll-level locale additions `_data/locale.yml` needs, if any, for
   headings written directly in the Markdown content rather than JS-rendered).

8. **CSS.** Reuse `.forticlad-planner__building-range`-style cards for troop
   track rows wherever the shape matches; only add new SCSS for genuinely new
   layout needs (troop group headings/icons, `bastion` accent treatment).

## Todo

- [x] Reorder `forticlad.md` (EN+VI) sections
- [x] Verify FC Lab renders correctly in Buildings section
- [x] Add Research T11 section (troop-grouped, per-track selects)
- [x] Add Hyperalloy stock input + 3-resource summary
- [x] Add explicit auto-required list for research
- [x] Write `research.js`
- [x] EN (verbatim) + VI (hand-written) copy for all new strings
- [x] SCSS additions only where existing classes don't fit

## Success Criteria

- Page (EN) renders: stock (FC/AFC/Hyperalloy inputs) -> missing summary (3 resources) -> Buildings incl. FC Lab with visible auto-required list -> Research T11 grouped by 3 troops with visible auto-required list -> totals/charts.
- VI page mirrors the same structure with hand-written VI copy (no French leftover anywhere, no machine-translated-sounding VI).
- Selecting a research target cascades correctly and the Hyperalloy total updates live, matching Phase 4's engine output.
- No duplicated FC/AFC-vs-Hyperalloy summary logic that drifts out of sync (single source of truth for "how do we render a resource missing/surplus line").

## Risk Assessment

Page is already fairly information-dense (7 buildings x current/target
selects). Adding 27 research tracks (grouped into 3 troops x 9) risks an
overwhelming page. Since layout must follow the source (which itself renders
all of this on one page, just with heavier card-based visual grouping), lean
on clear `<h3>`/`<h4>` troop headings and the existing collapsible/grouped
card patterns already in `_sass/custom.scss` rather than introducing pagination
or tabs (out of scope unless the plan is revisited after seeing it rendered).
