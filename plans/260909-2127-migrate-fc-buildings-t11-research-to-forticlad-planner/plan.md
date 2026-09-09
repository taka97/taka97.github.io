---
title: "Migrate FC Buildings & T11 Research to Forticlad Planner"
description: "Complete the migration of lojcalc.com's 'FC Buildings & T11 Research' tool into the existing Forticlad FC / AFC Planner page: fix building-data fidelity bugs, add FC Lab and the full T11 Research tree, and extend the UI/i18n to match."
status: done
priority: P1
effort: ""
tags: [lands-of-jail, forticlad, planners]
created: 2026-09-09
---

# Migrate FC Buildings & T11 Research to Forticlad Planner

## Overview

`contents/{en,vi}/lands-of-jail/planners/forticlad.md` already migrates the **FC
Buildings** half of lojcalc.com's combined "FC Buildings & T11 Research" tool
(`https://www.lojcalc.com/index.html`). This plan finishes the migration:

1. Fixes two data-fidelity bugs found by re-reading the actual source data
   (a building-key mistranscription, and a ~5x undercount for FC6-FC10 targets).
2. Adds the missing **FC Lab** building (the gate for all research).
3. Adds the missing **T11 Research** tree (3 troop lines x 9 tracks, Hyperalloy
   resource) as a new section on the same page.
4. Reorders/extends the page to follow the source's information architecture
   (intro -> stock -> missing -> Buildings -> Research T11 grouped by troop),
   expressed in this repo's existing Markdown + vanilla-JS-planner pattern
   (not a copy of the source's own HTML/CSS).
5. Adds an explicit "automatically required" prerequisites list (currently only
   implicit) for both Buildings and Research, reusing already-defined-but-unused
   CSS (`.forticlad-planner__prerequisites`).

Source data for every number in this plan was captured directly from
`https://www.lojcalc.com/index.html`'s inline `<script>` (the block defining
`RESOURCES`, `CATEGORIES`, `PARTS`, `I18N`, `tierChain()`, `buildingTrack()`,
`fclabTrack()`, `defaultData()`), retrieved 2026-09-09. See
[Phase 1: Source data reference](./phase-01-start.md) for the full verified dump
— every later phase cites that phase instead of re-deriving numbers.

**Language:** English content is taken verbatim from the source's `I18N.en`
block (translated by us into natural Vietnamese for `loj-vi`, consistent with
existing VI content tone). The source's French (`I18N.fr`) block is not used at
all — this site is EN/VI only.

**Explicitly out of scope:** the other 4 lojcalc.com tools (Tomes & Collections,
Robots & Satellites, Hero Equipment, Hero Stars & Exclusive Equipment) — future
plans.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Fix `boomer-barrack` -> `bomber-barrack` mistranscription | P1 |
| 2 | Backfill missing FC5-FC10 sub-palier rows (fixes ~5x undercount) | P1 |
| 3 | Add FC Lab as an 8th building (gates all research) | P1 |
| 4 | Add full T11 Research data + calculation engine (Hyperalloy) | P1 |
| 5 | Add Research T11 UI section, reordered page layout, explicit prerequisites list | P1 |
| 6 | Verify via Docker Jekyll build + manual data spot-checks against source | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Source data reference](./phase-01-start.md) | Done |
| 2 | [Phase 2: Fix and extend building data](./phase-02-fix-and-extend-building-data-bomber-rename-fc6-10-subpalier-backfill-fc-lab.md) | Done |
| 3 | [Phase 3: Buildings JS — rename, FC Lab, storage migration](./phase-03-buildings-js-rename-fc-lab-wiring-storage-migration.md) | Done |
| 4 | [Phase 4: T11 Research data + calculation engine](./phase-04-t11-research-data-calculation-engine.md) | Done |
| 5 | [Phase 5: Research UI section, Hyperalloy stock, i18n](./phase-05-research-ui-section-hyperalloy-stock-i18n.md) | Done |
| 6 | [Phase 6: Verify](./phase-06-verify-docker-jekyll-build-manual-data-spot-checks.md) | Done |

## Key Decisions (confirmed with user, 2026-09-09)

- T11 Research lives as a **new section on the same page**, not a new nav entry.
- Rename `boomer-barrack` -> `bomber-barrack` now (source: "Bomber Barracks").
- Backfill the missing FC6-FC10 sub-palier rows now (same source/effort as the rest).
- Layout follows the source's section order/grouping, but stays this repo's
  existing pattern: Markdown content + the current JS-driven interactive
  calculator (dropdowns + computed tables) — not static reference tables, not a
  copy of the source's own card-based HTML/CSS.
- Add an **explicit** "automatically required" list (reusing the unused
  `.forticlad-planner__prerequisites` CSS) for both Buildings and Research —
  today this is only implicit (an `automatic` flag inside the breakdown table).
- EN copy comes from the source's `I18N.en`; VI is hand-written by us; French is
  dropped entirely.

## Success Criteria

- [x] `_data/lands_of_jail/forticlad.yml` has no `boomer-barrack` key; `bomber-barrack` used everywhere (data, JS, translations).
- [x] Every building's `steps` cost rows include the 4 sub-palier rows for FC6, FC7, FC8, FC9, FC10 (not just the checkpoint), matching source `tierChain()`/`buildingTrack()` output.
- [x] FC Lab exists as an 8th building, gated by Warden Office, gating the research tree.
- [x] T11 Research (3 troops x 9 tracks) is calculable end-to-end with correct Hyperalloy totals and cascading cross-track prerequisites.
- [x] Forticlad planner page (EN + VI) shows: stock (FC/AFC/Hyperalloy) -> missing summary -> Buildings (incl. FC Lab) -> Research T11 grouped by troop; both sections' auto-added prerequisites are tagged inline in their requirements table (see Post-Implementation Review, no separate auto-required list in either section) -> breakdown/totals.
- [x] Docker Jekyll build succeeds with no errors for both languages.
- [x] Manual spot-checks (Phase 6) confirm at least 3 computed totals match hand-calculated source numbers.

## Post-Implementation Review

A `code-reviewer` subagent audited the diff after initial implementation. It found one
critical bug (fixed): both `forticlad.js` and `research.js` independently held a
page-load snapshot of the shared `forticlad` profile blob, so whichever script saved
last would silently drop the other's fields (e.g. entering FC on-hand after setting a
research target would delete `researchLevels`). Fixed by having both scripts re-fetch
the current profile from storage immediately before merging their own change in
(read-modify-write against live storage, not a stale snapshot).

It also found two real calculation bugs in `research-core.js` (both fixed): the
FC Lab prerequisite gate was checked against every level up to the target, including
levels already completed in-game (a player already past a gate could be blocked from
planning further); and the cross-track cascade ignored a prerequisite track's own
`currentLevel`, so an already-maxed stat could show a phantom "automatically required"
entry below its actual current level. Both are now `currentLevel`-aware.

A pre-existing bug (not introduced by this plan, present since the prior commit) was
also found and fixed while touching that code: the Buildings "FC/AFC totals by
building" table's per-building Total column rendered `NaN` because it passed a
`{fc, afc}` object straight to a number formatter.

Two lower-severity findings were addressed: engine errors are now localized (EN/VI)
instead of leaking raw English text, and duplicated resource-summary/status helpers
between `forticlad.js` and `research.js` were extracted into `table-helpers.js`.

Not addressed (flagged, not silently fixed) at review time: the Buildings section's
donut-chart rendering (`renderCoreChart`/`renderCoverageChart`) was pre-existing dead
code — see the follow-up UI session below, which removed it entirely. No live-browser
QA was possible in the implementing session (no Chrome extension connected);
verification relied on Docker Jekyll build success, Node syntax checks, and standalone
engine-logic scripts reproducing the plan's own hand-verified totals.

### Follow-up UI session (same day, user-directed, Buildings section only)

After the code review, the user iterated live on the Buildings section's layout across
several small requests, all applied and Docker-build-verified:

- "What you're missing" redesigned as a 3-card grid (FC/AFC/Hyperalloy, icon + big
  "needed" value + colored "Missing"/"Covered"/"Surplus" badge) — briefly styled as a
  dark HUD-style panel matching a reference image, then reverted to the site's
  original light palette per follow-up feedback, keeping only the badge as a solid
  colored pill (kept per explicit request) against an otherwise light card.
- "Upgrade breakdown" (the per-building x per-level cost matrix) removed outright: it
  only iterated `selectedBuildingKeys`, silently omitting any auto-added prerequisite
  building while the grand total still counted its cost — a real data-consistency bug,
  not just a preference.
- "FC / AFC totals by building" reworked into "Upgrade requirements": a single
  Target/From/To/Cost table over `effectiveBuildingKeys` (selected + auto-added), so
  every building contributing to the total now has a row. Auto-added rows carry an
  inline `(auto-added — prerequisite)` tag (own `<span>`, italic + purple) — this is
  what made the old separate "Automatically required" list redundant, so that section
  (markup, `renderAutoRequired`, its messages) was removed for Buildings only. Cost
  formats as `"18,000 FC, 540 AFC"`, omitting zero-valued resources.
- "Upgrade requirements" (and its table's Grand total, now the table's own `colspan="3"`
  footer row) is hidden entirely (`hidden` attribute) whenever there's nothing to show,
  rather than rendering placeholder/dash content.
- "Core distribution by building" / "Core coverage" (the dead donut-chart code flagged
  above) removed entirely — markup, JS, and CSS.
- The whole section was moved to sit inside "What you're missing" (as its final
  subsection, heading demoted h2→h3), so Buildings itself is now just the range form.

**Research T11 parity (requested explicitly after being flagged twice):** the same
fix was then applied to Research. `research.js`'s "Research breakdown" table had the
identical bug (iterated `selectedTrackKeys` only, so an auto-cascaded track like
`shieldbearer-lethality` from a `bastion` selection never appeared even though its cost
was in the grand total) — confirmed and reproduced via a standalone script before the
fix, re-run after: selecting `shieldbearer-bastion` Lv.1 now lists all 7 effective
tracks (6 auto-added + the explicit selection) with correct Lv.-range and Hyperalloy
cost per row, grand total still 25,510. "Research breakdown" and the separate
"Automatically required" list were removed the same way as Buildings' equivalents;
"Hyperalloy totals by track" became "Research requirements" (Target/From/To/Cost,
`effectiveTrackKeys`, inline auto-added tag, `colspan="3"` grand-total footer row,
hidden when empty). The identical "target + auto-tag" and "grand-total footer row"
DOM builders were extracted into `table-helpers.js` (`targetCell`, `grandTotalFooter`)
so `forticlad.js` and `research.js` share one implementation instead of two copies.
`.forticlad-planner__prerequisites` and `.forticlad-planner__grand-total` CSS were
removed once both files' markup stopped using them.

Deferred by the user (not done): live-browser QA of either section — no Chrome
extension was available in the implementing session for either round of changes.

A second duplicate-declaration bug (`formatCost` declared twice in `forticlad.js`,
from an imprecise edit) reached the user's browser as a `SyntaxError` — `node --check`
on a plain `.js` file didn't catch it because Node parses `.js` as a CommonJS script
(sloppy-mode redeclaration is legal there), while the browser loads these files as
`<script type="module">`, where duplicate top-level declarations are a hard parse
error. Fixed, and verification going forward copies each file to `.mjs` before
`node --check` to catch this class of bug pre-emptively.

## Validation Log

### Session 1 — 2026-09-09
**Trigger:** `/ak:plan validate` after initial plan creation.
**Questions asked:** 4

#### Verification Results
- **Tier:** Full (6 phases) — scoped to load-bearing claims given effort budget, not exhaustive 15-claims/phase.
- **Claims checked:** 9 | **Verified:** 9 | **Failed:** 0 | **Unverified:** 0
- `normalizeStep()` requires a cost entry for every building key or throws — VERIFIED (`assets/js/planners/planner-core.js:51`).
- `calculateBuildingRequirements()` returns `automaticBuildingKeys` and `effectiveRanges` — VERIFIED (`assets/js/planners/planner-core.js:40`).
- `storage.js` `getToolData()` special-cases `tool === 'forticlad'` — VERIFIED (`assets/js/planners/storage.js:65-73`); only consumer of `'forticlad'` tool data anywhere in `assets/js` is `forticlad.js` — VERIFIED (grep, 6 call sites, all in `forticlad.js`/`storage.js`'s own legacy migration).
- `.forticlad-planner__prerequisites` CSS class is defined (`_sass/custom.scss:61-69`) but has zero references anywhere in `assets/js` — VERIFIED (Phase 3's "currently unused" premise confirmed).
- `resolveRequirements()`'s fixed-point `while(changed)` cascade (`planner-core.js:105-128`) is real and generalizable to `{trackId, level}` pairs as Phase 4 proposes — VERIFIED by reading the function in full.
- `profile-settings.js` export/import (`assets/js/planners/profile-settings.js`) has zero per-tool special-casing — VERIFIED; confirms Phase 5's assumption that adding research fields to profile data needs no changes there.
- `schema_version` in `forticlad.yml` is a provenance comment only, never read by any JS (`profile-settings.js`'s own unrelated `schemaVersion:1` backup-format constant is a different concept) — VERIFIED; bumping it in Phase 2 is documentation-only, zero functional/build risk.
- Existing VI content already uses "Bomber" as an English loanword for this troop type (`contents/vi/lands-of-jail/season-2/heroes.md:27`: "Bomber phòng thủ") — VERIFIED; confirms the Phase 3 rename should read `Doanh trại Bomber` (loanword, matching site convention), not a translated term.
- No existing VI precedent found anywhere on the site for "FC Lab" or "Hyperalloy" (`contents/vi` grep, zero matches) — VERIFIED; both needed a genuine decision (asked below).

#### Questions & Answers

1. **[Architecture]** Where should Research T11 track selections (current/target level per track) and Hyperalloy on-hand be persisted per profile?
   - Options: New tool key `forticlad-research` (Recommended) | Merge into existing `forticlad` tool key
   - **Answer:** Merge into existing `forticlad` tool key.
   - **Rationale:** One profile blob for the whole planner page (buildings + research), matching the "one page, two parts" layout decision. `forticlad.js`'s existing `saveForticladData()` pattern (`{...getToolData(profile,'forticlad'), ...changes}`) already avoids clobbering unrelated fields on save — `research.js` must follow the identical spread pattern so the two scripts don't stomp each other's fields.

2. **[Architecture]** How should `research-core.js` get FC Lab's current level to check research prerequisites against?
   - Options: Pass as a plain number input (Recommended) | Import/call into `planner-core.js` directly
   - **Answer:** Pass as a plain number input.
   - **Rationale:** Keeps `research-core.js` decoupled from `planner-core.js` internals — reinforced by decision 1: since both now live in the same `forticlad` tool-data blob, `research.js` can read `buildingBases['fc_lab'].currentBase` directly off the already-loaded profile data (no cross-engine call needed at all).

3. **[Scope]** Vietnamese label for "FC Lab"?
   - Options: Phòng Lab FC (Recommended) | Phòng thí nghiệm FC | Something else
   - **Answer:** Phòng Lab FC.

4. **[Scope]** Vietnamese label for "Hyperalloy"?
   - Options: Siêu hợp kim (Recommended) | Hyperalloy (keep as loanword) | Something else
   - **Answer:** Hyperalloy (keep as loanword) — matches FC/AFC staying untranslated in this same tool.

#### Confirmed Decisions
- Research selections + Hyperalloy on-hand live in the existing `forticlad` profile tool-data key, not a new one.
- `research-core.js` takes FC Lab's current level as a plain number (read from the same merged profile blob), no dependency on `planner-core.js`.
- VI: `bomber-barrack` → "Doanh trại Bomber" (loanword, per existing site convention). `fc_lab` → "Phòng Lab FC". "Hyperalloy" stays untranslated in VI copy (`res_Hyperalloy` VI = "Hyperalloy").

#### Action Items
- [x] Propagate storage-key decision to Phase 4 and Phase 5.
- [x] Propagate FC-Lab-input decision to Phase 4.
- [x] Propagate VI labels to Phase 3 (`bomber-barrack`, `fc_lab`) and Phase 5 (`res_Hyperalloy` VI).

#### Impact on Phases
- Phase 3: `BUILDING_TRANSLATIONS['bomber-barrack']` = "Doanh trại Bomber"; `BUILDING_TRANSLATIONS['fc_lab']` = "Phòng Lab FC" (no longer a stub).
- Phase 4: research engine's `calculateResearchRequirements()` signature takes `fcLabLevel` as a plain number; data file's `fc_lab` requirement entries resolve against that number, not a cross-engine call.
- Phase 5: `research.js` persists via the existing `forticlad` tool-data key (`researchLevels`/`hyperalloyOnHand` fields alongside `buildingBases`/`fcOnHand`/`afcOnHand`), following the same read-spread-write pattern as `forticlad.js`'s `saveForticladData()`; VI `res_Hyperalloy` = "Hyperalloy" (unchanged from EN).

### Whole-Plan Consistency Sweep
- Files reread: `plan.md`, `phase-01-start.md` through `phase-06-verify-docker-jekyll-build-manual-data-spot-checks.md`.
- Decision deltas checked: 4 (storage key, FC Lab input mechanism, 2 VI labels).
- Reconciled stale references: 3 (Phase 4's "new tool key e.g. 'forticlad-research'" language, Phase 4's undecided FC-Lab-input placeholder, Phase 3's stubbed `fc_lab`/`bomber-barrack` VI text).
- Unresolved contradictions: 0.

<!-- slug: migrate-fc-buildings-t11-research-to-forticlad-planner -->
