---
phase: 6
title: "Phase 6: Hero Stars Exclusive Equipment"
status: completed
priority: P2
effort: "10m"
dependencies: []
---

# Phase 6: Hero Stars Exclusive Equipment

## Overview
Apply the badge-stack heading wrapper to
`hero-stars-exclusive-equipment.js`'s `renderInstanceCards` function
(~line 402-450).

## Requirements
- Functional: badge renders stacked under each hero-star/exclusive-equipment instance name instead of inline; TOC no longer picks up badge text.
- Non-functional: zero change to level dropdowns or persisted `heroStars`/`exclusiveEquipment` state — display-only.

## Architecture
Current code (confirmed via read, `hero-stars-exclusive-equipment.js`
~408-418, 447) — identical structure to Phase 4 (Robots and Satellites):
```js
const heading = document.createElement('h3');
heading.textContent = entry.headingText;
heading.id = `${keyPrefix}-instance-${entry.key}`;
card.setAttribute('role', 'group');
card.setAttribute('aria-labelledby', heading.id);

const badge = document.createElement('span');
badge.className = 'loj-planner__instance-badge';
badge.dataset.role = 'instance-badge';
renderInstanceBadge(badge, entry.targetIndex !== 0, message.targetSetLabel, message.noTarget);
heading.append(badge);
...
card.append(heading, currentLabel, targetLabel, error);
```
Target shape:
```js
const headingRow = document.createElement('div');
headingRow.className = 'loj-planner__instance-heading';
const heading = document.createElement('h3');
heading.className = 'loj-planner__instance-label';
heading.textContent = entry.headingText;
heading.id = `${keyPrefix}-instance-${entry.key}`;
card.setAttribute('role', 'group');
card.setAttribute('aria-labelledby', heading.id);

const badge = document.createElement('span');
badge.className = 'loj-planner__instance-badge';
badge.dataset.role = 'instance-badge';
renderInstanceBadge(badge, entry.targetIndex !== 0, message.targetSetLabel, message.noTarget);
headingRow.append(heading, badge);
...
card.append(headingRow, currentLabel, targetLabel, error);
```

## Related Code Files
- Modify: `assets/js/planners/hero-stars-exclusive-equipment.js` (`renderInstanceCards`)

## Implementation Steps
1. Add `headingRow` wrapper + `.loj-planner__instance-label` class per Architecture above.
2. Replace `heading` with `headingRow` in the final `card.append(...)` call only.
3. Grep the file to confirm single call site (confirmed via earlier scout — one occurrence at line 418).

## Success Criteria
- [x] `headingRow` wrapper added; badge no longer appended inside `<h3>`.
- [x] Docker Jekyll build succeeds; visual check (browser DOM inspection) confirms badge is a sibling of the `<h3>` label, not nested inside it — "Hero 1" card verified.

## Risk Assessment
Low — identical mechanical pattern to Phase 4, single call site, single file.
