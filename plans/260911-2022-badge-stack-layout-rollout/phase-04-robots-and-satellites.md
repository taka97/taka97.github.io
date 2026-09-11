---
phase: 4
title: "Phase 4: Robots and Satellites"
status: completed
priority: P2
effort: "10m"
dependencies: []
---

# Phase 4: Robots and Satellites

## Overview
Apply the badge-stack heading wrapper to `robots-satellites.js`'s
`renderInstanceCards` function (~line 421-470).

## Requirements
- Functional: badge renders stacked under each robot/satellite instance name instead of inline; TOC no longer picks up badge text.
- Non-functional: zero change to level dropdowns or persisted `robots`/`satellites` state — display-only.

## Architecture
Current code (confirmed via read, `robots-satellites.js` ~427-437, 466):
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
- Modify: `assets/js/planners/robots-satellites.js` (`renderInstanceCards`)

## Implementation Steps
1. Add `headingRow` wrapper + `.loj-planner__instance-label` class per Architecture above.
2. Replace `heading` with `headingRow` in the final `card.append(...)` call only.
3. Grep the file to confirm this is the only `heading.append(badge)` call site (confirmed via earlier scout — single occurrence at line 437).

## Success Criteria
- [x] `headingRow` wrapper added; badge no longer appended inside `<h3>`.
- [x] Docker Jekyll build succeeds; visual check (browser DOM inspection) confirms badge is a sibling of the `<h3>` label, not nested inside it — "Robot 1" card verified.

## Risk Assessment
Low — identical mechanical pattern to Phase 1, single call site, single file.
