---
title: "Satellite Detailed Stats Restructure"
description: "Restructure each satellite's write-up on satellite.md into a consistent Role/Skills/Overclock Effect/Verdict template, with real per-satellite stat data."
status: in-progress
priority: P2
effort: "TBD"
tags: [lands-of-jail, content, satellite]
created: 2026-09-13
blockedBy: []
blocks: []
---

# Satellite Detailed Stats Restructure

## Overview

Follow-up to `plans/260913-1536-satellite-knowledge-tool-link/`. That plan
linked the Robots & Satellites planner to `satellite.md`; this one improves
`satellite.md` itself for readability by giving each of the 5 released
satellites a consistent structured section, and adding real stat/bonus data
(scope: knowledge page only — not the planner tool/yml).

## Process Note

This plan is filled in incrementally, satellite by satellite, as the user
supplies real data — it is not fully specified up front. When resuming this
plan (e.g. via `/ak:cook`):

- Do **not** invent, estimate, or guess stat/bonus numbers for any satellite
  still marked "Pending" below — leave it pending and ask the user for the
  real data instead.
- Implement one satellite's section only once its data is confirmed in this
  plan; update the plan doc itself as each satellite's data arrives (move it
  from "Pending" to "Done" with the data recorded), before or alongside
  editing `satellite.md`.
- The user may give UI feedback after seeing a satellite rendered (e.g. the
  Laser section) — apply that feedback and, if it changes the shared
  template, retrofit already-done satellites too.

## Template

Agreed with user via iterative refinement:

```
### <Name>: <tagline> <season-icon> {#sat-<slug>}

**Role:** one-line purpose
**Skills:** non-numeric mechanics (chest drops, troop training, etc.)
**Overclock Effect:** table (Overclock Tier | <stat column(s)>) if it scales,
                       or a bullet list if flat/qualitative
**Verdict:** priority recommendation
```

- Every Overclock Effect table (when it scales, i.e. a table not a bullet
  list) gets a trailing kramdown IAL `{: .overclock-table}` immediately after
  its last row, no blank line — the `.overclock-table` CSS class (added in
  `_sass/custom.scss` under `.js-article-content`) indents it (`margin-left`)
  to set it apart from the Role/Skills/Verdict lines. Scoped to this class
  only, so other tables on the site (e.g. planner tables) are unaffected.
- "Overclock Tier" is a separate progression axis from satellite level —
  named tiers, not numeric levels: `6 Stats Epic`, `2/4/6 Stats Legendary`,
  `2/4/6 Stats Exotic` (7 tiers total, ascending).
- Rarity tier names (`Epic`/`Legendary`/`Exotic`) stay in English in both EN
  and VI content, matching this repo's existing convention (see
  `assets/js/planners/hero-equipment.js`'s `RARITY_TIER_LABELS`, EN-only).
- Negative stat values get a `-` sign (e.g. `-6%`), no "Reduce" wording in
  the label — the table column header carries the stat name instead.

## Satellite Data

### Laser — Done {#sat-laser}

- **Role:** unchanged from before — "The engine of your progression — the
  only satellite that passively generates the resources needed to upgrade
  the others."
- **Skills:** unchanged from before (renamed from "Effect") — 6 chests/day,
  Space Parts + EXP Disks.
- **Overclock Effect:** Enemy Bomb HP reduction, by Overclock tier:

  | Overclock Tier | Enemy Bomb HP |
  | --- | --- |
  | 6 Stats Epic | -6% |
  | 2 Stats Legendary | -9% |
  | 4 Stats Legendary | -12% |
  | 6 Stats Legendary | -15% |
  | 2 Stats Exotic | -19% |
  | 4 Stats Exotic | -23% |
  | 6 Stats Exotic | -27% |

- **Verdict:** unchanged from before.
- Applied to both `contents/en/lands-of-jail/satellite.md` and
  `contents/vi/lands-of-jail/satellite.md` (VI: Role/Skills/Verdict prose
  unchanged from before this plan; table header translated to "Cấp
  Overclock" / "Máu Bom Địch", tier names kept in English per the convention
  above).
- UI feedback applied: table indented via `{: .overclock-table}` +
  `_sass/custom.scss` rule (see Template above).

### Watcher — Pending {#sat-watcher}

_Data not yet provided by user._

### Radiance — Pending {#sat-radiance}

_Data not yet provided by user._

### Sentinel — Pending {#sat-sentinel}

_Data not yet provided by user._

### Arbitrator — Pending {#sat-arbitrator}

_Data not yet provided by user._

## Success Criteria

- [x] Template agreed with user.
- [x] Laser section restructured in EN + VI, Overclock Effect table added.
- [ ] Watcher section restructured in EN + VI.
- [ ] Radiance section restructured in EN + VI.
- [ ] Sentinel section restructured in EN + VI.
- [ ] Arbitrator section restructured in EN + VI.
- [ ] User UI feedback (mentioned as likely) incorporated.
- [ ] Docker Jekyll build succeeds with no errors after all 5 are done.

## Non-Goals

- No changes to the Robots & Satellites planner tool or
  `robots_satellites.yml` — this data is knowledge-page only.
