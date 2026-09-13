---
title: "Satellite Knowledge Tool Link"
description: "Center Satellite name/knowledge data in one place and add a Details link from each Robots & Satellites planner satellite card to its write-up on satellite.md."
status: done
priority: P2
effort: "3h"
tags: [lands-of-jail, planners, robots-satellites, i18n]
created: 2026-09-13
blockedBy: []
blocks: []
---

# Satellite Knowledge Tool Link

## Overview

Satellite names/data currently live in 2 places: `_data/terms.yml` (5 name
terms — laser, radiance, watcher, sentinel, arbitrator — used only inside
`satellite.md`) and `_data/lands_of_jail/robots_satellites.yml`'s
`satellites:` list (used by the Robots & Satellites planner). VI casing has
already drifted between the two copies. The planner has no link to
`satellite.md`'s per-satellite knowledge (role/effect/verdict/priority), so a
user configuring the planner can't jump to the write-up.

This plan: consolidates satellite names into the one place already read at
runtime (the tool's yml), gives the knowledge page's per-satellite headings
stable anchors, and adds a "Details ↗" link (new tab) on each satellite card
in the planner pointing at its anchor. Scope is Satellites only — Robots is
explicitly deferred (see roadmap).

Brainstorm report:
[`plans/reports/brainstorm-260913-1531-satellite-knowledge-tool-link.md`](../reports/brainstorm-260913-1531-satellite-knowledge-tool-link.md).

## Related / concurrent work

`plans/260913-1041-lands-of-jail-vi-translation-consistency-fixes/` is
`in-progress` and touches VI text across the same 5 planners' yml files,
including `robots_satellites.yml`. No direct file-content conflict expected
(that plan doesn't touch `satellites:` labels or `terms.yml`'s satellite
keys), but re-check that plan's status before editing `robots_satellites.yml`
here, in case it's mid-edit on the same file.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | One source of truth for satellite id/name/tier (tool's yml); remove the redundant `terms.yml` copies | P1 |
| 2 | Stable per-satellite anchors on `satellite.md` (EN+VI) for the 5 released satellites | P1 |
| 3 | Planner renders a "Details ↗" link per satellite card when a knowledge anchor exists | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Data and knowledge page anchors](./phase-02-data-and-knowledge-page-anchors.md) | Done |
| 2 | [Phase 2: Planner UI details link](./phase-03-planner-ui-details-link.md) | Done |

## Success Criteria

- [x] `_data/terms.yml` no longer has `laser`/`radiance`/`watcher`/`sentinel`/`arbitrator` keys; `satellite` term kept.
- [x] `robots_satellites.yml` has `knowledgeBase` and `knowledgeAnchor` (5 released satellites only).
- [x] `satellite.md` (EN+VI) renders satellite names via the new include, sourced from the yml; 5 per-satellite headings have matching `{#anchor}` ids in both languages.
- [x] Robots & Satellites planner shows a "Details ↗" link (opens new tab) on the 5 released satellite cards, linking to the correct language + anchor; no link on the 4 unreleased SSR satellites.
- [x] `bundle exec jekyll build` (Docker) succeeds with no Liquid errors; built pages manually spot-checked for correct anchors/links.

## Non-Goals

- Robots (`season-2/robots.md` ↔ planner robot slots) — deferred, tracked in `docs/project-roadmap.md`.
- Reverse links (knowledge page → tool).
- Stub write-ups for the 4 unreleased SSR satellites.

## Validation Log

### Verification Results
- **Tier:** Light (2 phases, Fact Checker only)
- **Claims checked:** 10 (5/phase)
- **Verified:** 10 | **Failed:** 0 | **Unverified:** 0

All claims were confirmed via direct Read/Grep during the brainstorm/plan
session (not carried over from a stale scout), so no re-verification was
needed:
- `_data/terms.yml` has `laser`/`radiance`/`watcher`/`sentinel`/`arbitrator` keys, used nowhere outside `satellite.md` (grep, both files).
- `_data/lands_of_jail/robots_satellites.yml`'s `satellites:` list ids match the plan exactly (`sat_r_laser`, `sat_r_observateur`, `sat_r_radiance`, `sat_sr_arbitre`, `sat_sr_sentinelle`, 4 SSR ids).
- `_includes/term.html` pattern (assign lang → lookup → fallback) confirmed as the model for the new include.
- `satellite.md` (EN+VI) per-satellite heading order and existing `{#season-2-release-update}` anchor pattern confirmed in both files.
- `assets/js/planners/robots-satellites.js`: `renderSatelliteTierSection` (~L219-231), `renderInstanceCards` (~L453-505, `headingRow.append(heading, badge)` at L472), `MESSAGES.en`/`MESSAGES.vi` (L8-58), and `language` derivation from `container.dataset.lang` (L66) all confirmed present at the cited locations.
- `_sass/custom.scss` `.loj-planner__instance-heading` block confirmed at L171-204.

### Interview
3 questions asked (link style, wording, anchor slug convention) — all
recommended options confirmed as-is; no plan changes required.

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-02-data-and-knowledge-page-anchors.md, phase-03-planner-ui-details-link.md
- Decision deltas checked: 0 (all recommended options accepted unchanged)
- Reconciled stale references: 0
- Unresolved contradictions: 0

**Recommendation:** proceed to implementation.

## Completion Notes

Both phases implemented and code-reviewed (`code-reviewer` subagent,
DONE_WITH_CONCERNS → all concerns fixed):
- `robots-satellites-core.js` needed a small additive extension (pass through
  `knowledgeBase`/`knowledgeAnchor`) not listed in phase 2's file list —
  reviewer confirmed necessary, not scope creep. See phase-03's
  Implementation Notes.
- Fixed: `loj-satellite-name.html` scalar-label fallback (latent blank output
  for the 4 unreleased SSR satellites), `knowledgeHref`'s missing
  `knowledgeBase` guard, details-link `aria-describedby`, and
  `docs/code-standards.md` + `docs/codebase-summary.md` updated to document
  the new tool-owns-its-names exception (previously would have steered a
  future contributor back into duplicating names in `terms.yml`).
- Docker Jekyll build clean (no Liquid/Sass errors); manually verified in
  browser (EN + VI): anchors, rendered names, and Details links all correct;
  no link leakage onto Robot cards or the 4 SSR satellites.

<!-- slug: satellite-knowledge-tool-link -->
