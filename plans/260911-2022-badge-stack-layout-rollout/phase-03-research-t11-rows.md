---
phase: 3
title: "Phase 3: Research T11 rows"
status: completed
priority: P2
effort: "10m"
dependencies: []
---

# Phase 3: Research T11 rows

## Overview
Apply the badge-stack heading wrapper to Forticlad's companion T11 Research
planner's per-track rows (`research.js`, inside the troop-grouped `<details>`
loop, ~line 265-294).

## Requirements
- Functional: badge renders stacked under the track name instead of inline; TOC no longer picks up badge text for research track rows.
- Non-functional: zero change to level dropdowns, prerequisite validation, or persisted `researchLevels` data — display-only.

## Architecture
Current code (confirmed via read, `research.js` ~277-286):
```js
const rowHeading = document.createElement('h4');
rowHeading.textContent = trackName(track, language);
rowHeading.id = `research-track-${key}`;
row.setAttribute('role', 'group');
row.setAttribute('aria-labelledby', rowHeading.id);
const badge = document.createElement('span');
badge.className = 'loj-planner__instance-badge';
badge.dataset.role = 'instance-badge';
renderInstanceBadge(badge, ranges[key].targetLevel !== 0, message.targetSetLabel, message.noTargetLabel);
rowHeading.append(badge);
```
Note the variable is named `rowHeading` (not `heading`) and the tag is `<h4>`
(not `<h3>`) — this row already sits inside a `<details>`/`<summary>` troop
group, so `<h4>` is the correct existing heading level; keep it as-is.

Target shape (mirrors `tomes.js`'s `buildInstanceCard`):
```js
const headingRow = document.createElement('div');
headingRow.className = 'loj-planner__instance-heading';
const rowHeading = document.createElement('h4');
rowHeading.className = 'loj-planner__instance-label';
rowHeading.textContent = trackName(track, language);
rowHeading.id = `research-track-${key}`;
row.setAttribute('role', 'group');
row.setAttribute('aria-labelledby', rowHeading.id);
const badge = document.createElement('span');
badge.className = 'loj-planner__instance-badge';
badge.dataset.role = 'instance-badge';
renderInstanceBadge(badge, ranges[key].targetLevel !== 0, message.targetSetLabel, message.noTargetLabel);
headingRow.append(rowHeading, badge);
```
Then find the row's final `.append(...)` call (further down in the same
function) and use `headingRow` in place of `rowHeading`.

## Related Code Files
- Modify: `assets/js/planners/research.js`

## Implementation Steps
1. Re-read the current `renderTrackRanges`/track-row-building function in full (line numbers may have shifted) to find the exact final `row.append(...)` call using `rowHeading`.
2. Add the `headingRow` wrapper + `.loj-planner__instance-label` class per the Architecture section above.
3. Replace `rowHeading` with `headingRow` in the row's final append call only (keep using `rowHeading` for `.id`/`aria-labelledby` references — those stay pointed at the actual heading element, not the wrapper).
4. Grep `research.js` for any other `.append(badge)` into a heading (there should be none besides this one call site — confirmed via earlier scout).

## Success Criteria
- [x] `headingRow` wrapper added; badge no longer appended inside `<h4>`.
- [x] `aria-labelledby` still points at the actual heading element's id (not the wrapper div) — accessibility must not regress.
- [x] Docker Jekyll build succeeds; visual check (browser DOM inspection) confirms badge is a sibling of the `<h4>` label, not nested inside it — "Expedition Troops Capacity" row verified.

## Risk Assessment
Low — same mechanical pattern as Phase 1, one call site. Minor care needed:
`aria-labelledby` and any other reference to `rowHeading.id` must continue
targeting the real heading element, not the new wrapper div.
