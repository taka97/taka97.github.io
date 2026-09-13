---
phase: 2
title: "Planner UI details link"
status: done
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 2: Planner UI details link

## Overview

Wire the `knowledgeBase`/`knowledgeAnchor` data from Phase 1 into the Robots &
Satellites planner UI: render a small "Details ↗" link (new tab) on each
satellite instance card that has a knowledge anchor.

## Requirements

- Functional: each of the 5 released satellite cards in the planner shows a
  "Details ↗" (`Chi tiết ↗` in VI) link that opens `satellite.md` at the
  correct language + anchor in a new tab. The 4 SSR satellite cards and all
  Robot cards show no such link (unchanged from today).
- Non-functional: no change to existing card behavior (current/target level
  selects, badge, error state) — purely additive.

## Architecture

- `renderSatelliteTierSection` (in `assets/js/planners/robots-satellites.js`,
  around the existing `cards = planner.satellites.filter(...).map(...)`
  block) adds a `knowledgeHref` field to each card entry:
  `satellite.knowledgeAnchor ? `/${language}${planner.knowledgeBase}#${satellite.knowledgeAnchor}` : undefined`.
  Robot cards (built elsewhere, from `robotInstances`) never set this field,
  so `renderInstanceCards` naturally skips the link for them.
- `renderInstanceCards` (shared render function, ~line 453): after building
  `headingRow` with `heading` + `badge`, if `entry.knowledgeHref` is set,
  create an `<a>` with `href = entry.knowledgeHref`, `target="_blank"`,
  `rel="noopener"`, `textContent = message.detailsLabel`, and append it into
  `headingRow` alongside the badge.
- New message keys in both `MESSAGES.en` and `MESSAGES.vi`: `detailsLabel:
  'Details ↗'` / `'Chi tiết ↗'`.
- `_sass/custom.scss`: add a rule for the new link inside the existing
  `.loj-planner__instance-heading` block (reuse its flex-column layout —
  the link becomes a third stacked item, small/muted text, matching the
  badge's existing sizing conventions).

## Related Code Files

- Modify: `assets/js/planners/robots-satellites.js`
- Modify: `_sass/custom.scss`

## Implementation Steps

1. In `MESSAGES.en` / `MESSAGES.vi`, add `detailsLabel: 'Details ↗'` /
   `'Chi tiết ↗'`.
2. In `renderSatelliteTierSection`, extend the `cards` mapping to include
   `knowledgeHref: satellite.knowledgeAnchor ? `/${language}${planner.knowledgeBase}#${satellite.knowledgeAnchor}` : undefined`.
3. In `renderInstanceCards`, after `headingRow.append(heading, badge)`, add:
   if `entry.knowledgeHref`, build the `<a>` link as described above and
   append it to `headingRow`.
4. In `_sass/custom.scss`, inside `.loj-planner__instance-range
   .loj-planner__instance-heading`, add a rule for the new link class (small
   font-size, muted color consistent with the existing badge/label palette,
   no extra top margin beyond the block's existing `gap`).
5. Run the Docker Jekyll build + serve (per CLAUDE.md), open the Robots &
   Satellites planner page (EN and VI) in a browser, and manually verify:
   the 5 released satellites show a working "Details ↗" link that opens the
   correct satellite.md anchor in a new tab (correct language); the 4 SSR
   satellites and all Robot cards show no link; existing planner
   functionality (level selects, totals, badges) still works.

## Success Criteria

- [ ] `detailsLabel` message keys added (en/vi).
- [ ] The 5 released satellite cards render a "Details ↗"/"Chi tiết ↗" link; the 4 SSR cards and Robot cards do not.
- [ ] Clicking the link opens `satellite.md` at the correct anchor, in the matching language, in a new tab.
- [ ] No regression in existing planner behavior (verified manually in browser, EN + VI).
- [ ] `_sass/custom.scss` change builds without Sass errors.

## Risk Assessment

- **Risk:** `renderInstanceCards` is shared with Robot cards — a mistake here
  could accidentally show a stray link on Robot cards too. **Mitigation:**
  the function only acts when `entry.knowledgeHref` is truthy, and Robot card
  entries (built elsewhere in the file) are never given that field — verify
  by reading the Robot card-building code before editing, not just the
  Satellite one.
- **Risk:** wrong anchor/language combination produces a dead link.
  **Mitigation:** manual click-through verification in the browser for all 5
  released satellites, both languages, as the last implementation step.

## Implementation Notes

- **Additional file modified beyond the "Related Code Files" list above:**
  `assets/js/planners/robots-satellites-core.js`. `createRobotsSatellitesPlanner`'s
  satellite-normalization mapping whitelisted fields down to
  `{ id, tier, label }`, silently dropping the yml's new `knowledgeAnchor`, and
  the returned planner object didn't expose `knowledgeBase` at all. Both are
  now passed through (additive-only, ~6 lines). Confirmed via code review:
  necessary for phase 3 to have any data to render, not scope creep — the
  plan's file list was just incomplete.
- Manual browser verification (EN + VI, Docker dev server) confirmed: all 5
  released satellite cards show the details link with correct
  language+anchor href; the 4 SSR cards and all Robot cards show no link;
  clicking opens the correct `satellite.md` heading (and TOC entry) in a new
  tab.
- Code review flagged two additional issues, both fixed: (a) `knowledgeHref`
  only guarded `satellite.knowledgeAnchor`, not `planner.knowledgeBase` —
  now guards both to avoid a malformed href if `knowledgeBase` were ever
  missing; (b) the link's accessible name (`Details ↗` / `Chi tiết ↗`) was
  ambiguous across the 5 identical links on a page — added
  `aria-describedby` pointing at the card's heading id.
