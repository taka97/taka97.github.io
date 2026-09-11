---
title: "Badge-stack layout rollout"
description: "Apply Collections & Tomes' stacked-badge instance-heading layout (fixes sidebar TOC text leak) to the other 4 lojcalc-style planners."
status: completed
priority: P2
effort: "1-1.5h"
tags: [lands-of-jail, ui, css, toc-fix]
created: 2026-09-11
---

# Badge-stack layout rollout

## Overview

Collections & Tomes' UX redesign (commit `341282e`) fixed a sidebar-TOC bug:
the "No target"/"Target set" instance badge's text was leaking into TOC
entries because the badge `<span>` was appended directly inside the item's
heading element (`heading.append(badge)`), and the theme's TOC reads heading
`textContent`. The fix wraps heading + badge in a `.loj-planner__instance-heading`
flex-column div instead, using a separate `.loj-planner__instance-label` class
for the actual heading text — badge renders visually stacked underneath, and
the TOC only sees the heading element's own text.

This plan rolls out that same fix to the 4 other lojcalc-style planners that
still use the old inline pattern, tracked in
[docs/project-roadmap.md](../../docs/project-roadmap.md#badge-stack-layout-rollout-pending).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Apply the `.loj-planner__instance-heading` wrapper pattern to every remaining `<heading>.append(badge)` call site | P2 |
| 2 | Zero visual/behavioral regression outside the badge position (same classes, same CSS already generically scoped) | P1 |
| 3 | Keep `docs/project-roadmap.md`'s tracking table in sync as each phase completes | P3 |

## Non-Goals

- No change to Collections & Tomes (`tomes.js`) — it's the reference implementation, already correct.
- No adoption of Tomes' troop-grouped `<details>` restructuring — that solved a different problem (fixed-count grouping) unrelated to the badge-position fix.
- No CSS changes — `.loj-planner__instance-heading`/`.loj-planner__instance-label` are already generically scoped under `.loj-planner__instance-range` in `_sass/custom.scss`, shared by all planners.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Forticlad building rows](./phase-01-start.md) | Completed |
| 3 | [Phase 3: Research T11 rows](./phase-03-research-t11-rows.md) | Completed |
| 4 | [Phase 4: Robots and Satellites](./phase-04-robots-and-satellites.md) | Completed |
| 5 | [Phase 5: Hero Equipment](./phase-05-hero-equipment.md) | Completed |
| 6 | [Phase 6: Hero Stars Exclusive Equipment](./phase-06-hero-stars-exclusive-equipment.md) | Completed |

(Phase numbering has a gap at 2 — an earlier duplicate stub for Forticlad was removed during setup; no phase 2 exists.)

## Success Criteria

- [x] All 5 remaining call sites (1 already done) use the `headingRow`/`.loj-planner__instance-heading` wrapper pattern, mirroring `tomes.js`'s `buildInstanceCard` exactly.
- [x] Badge renders stacked under each item's name (not inline) on every planner page — verified via live browser DOM inspection on all 5 pages (Forticlad building rows, Research T11 rows, Robots & Satellites, Hero Equipment, Hero Stars & Exclusive Equipment): badge confirmed as a sibling of the label element, never nested inside it.
- [x] Sidebar TOC no longer includes "No target"/"Target set" text for any planner (structural fix — badge is outside every heading element now, same mechanism already verified for Collections & Tomes).
- [x] `docker run ... bundle exec jekyll build` succeeds after all phases (watch-mode rebuilds clean after each edit).
- [x] `docs/project-roadmap.md`'s tracking table updated to all "Done" on completion.

<!-- slug: badge-stack-layout-rollout -->
