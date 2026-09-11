---
phase: 5
title: "Phase 5: Hero Equipment"
status: completed
priority: P2
effort: "10m"
dependencies: []
---

# Phase 5: Hero Equipment

## Overview
Apply the badge-stack heading wrapper to `hero-equipment.js`'s
`renderTrackRow` function (~line 410-456).

## Requirements
- Functional: badge renders stacked under each equipment track's name instead of inline; TOC no longer picks up badge text.
- Non-functional: zero change to level dropdowns or persisted equipment state — display-only.

## Architecture
Current code (confirmed via read, `hero-equipment.js` ~415-425, 454):
```js
const rowHeading = document.createElement('h5');
rowHeading.textContent = options.heading;
rowHeading.id = `he-${cellKey}-${track}`;
row.setAttribute('role', 'group');
row.setAttribute('aria-labelledby', rowHeading.id);

const badge = document.createElement('span');
badge.className = 'loj-planner__instance-badge';
badge.dataset.role = 'instance-badge';
renderInstanceBadge(badge, options.targetIndex !== 0, message.targetSetLabel, message.noTarget);
rowHeading.append(badge);
...
row.append(rowHeading, currentLabel, targetLabel, error);
```
Note the heading tag here is `<h5>` (deepest nesting level of the 4 planners
checked) and the variable is `rowHeading`, not `heading` — keep the `<h5>` tag
as-is, only change where the badge attaches.

Target shape:
```js
const headingRow = document.createElement('div');
headingRow.className = 'loj-planner__instance-heading';
const rowHeading = document.createElement('h5');
rowHeading.className = 'loj-planner__instance-label';
rowHeading.textContent = options.heading;
rowHeading.id = `he-${cellKey}-${track}`;
row.setAttribute('role', 'group');
row.setAttribute('aria-labelledby', rowHeading.id);

const badge = document.createElement('span');
badge.className = 'loj-planner__instance-badge';
badge.dataset.role = 'instance-badge';
renderInstanceBadge(badge, options.targetIndex !== 0, message.targetSetLabel, message.noTarget);
headingRow.append(rowHeading, badge);
...
row.append(headingRow, currentLabel, targetLabel, error);
```

## Related Code Files
- Modify: `assets/js/planners/hero-equipment.js` (`renderTrackRow`)

## Implementation Steps
1. Add `headingRow` wrapper + `.loj-planner__instance-label` class per Architecture above.
2. Replace `rowHeading` with `headingRow` in the final `row.append(...)` call only (keep `rowHeading` for `.id`/`aria-labelledby`).
3. Grep the file to confirm single call site (confirmed via earlier scout — one occurrence at line 425).

## Success Criteria
- [x] `headingRow` wrapper added; badge no longer appended inside `<h5>`.
- [x] `aria-labelledby` still points at the real heading element, not the wrapper.
- [x] Docker Jekyll build succeeds; visual check (browser DOM inspection) confirms badge is a sibling of the `<h5>` label, not nested inside it — "Rarity" track row verified.

## Risk Assessment
Low — identical mechanical pattern, single call site, single file.
