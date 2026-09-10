---
phase: 3
title: "Per-Instance Status Badge"
status: complete
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 3: Per-Instance Status Badge

## Overview

Add a "target set" / "no target" badge to every `.loj-planner__instance-range`
row across all four instance groups (Forticlad buildings, Forticlad research
tracks, Tomes, Collections), matching lojcalc's per-card status badge. Pure
function of already-existing current/target state — no data-schema changes.

## Requirements

- Functional: every instance row shows a small badge reflecting whether a target
  is set, and the badge updates live on every `change` event (not just at initial
  render).
- Non-functional: reuse one shared render helper across all three JS engines (DRY).

## Architecture

**Critical: "no target" is not the same test in every engine — verify per engine,
do not assume one universal rule.**

| Engine | File | "no target" test | Why |
|---|---|---|---|
| Buildings | `forticlad.js` | `currentBase === targetBase` | No sentinel empty option exists for target Base (`rangeLabel` is called without an `emptyLabel` arg for `target-base`) — target defaults to current until the user picks a higher Base. |
| Research tracks | `research.js` | `targetLevel === 0` | `target-level` select has an explicit sentinel `0` option (`message.noTargetLabel`), decoupled from `currentLevel`'s value. |
| Tomes / Collections | `tomes.js` | `targetIndex === 0` | Same sentinel pattern as research tracks (`message.noTarget` zero-label override in `buildLevelOptions`). |

Using the buildings' `current === target` test on research tracks or
tomes/collections would be wrong: a track can have `currentLevel = 3` and an
explicit `targetLevel = 0` ("no target" sentinel) — `current !== target` there but
the correct badge is still "no target". Each engine already computes the correct
boolean inline in its existing `updateRangeWarnings` function (see call sites
below) — reuse that computation, don't reintroduce a second, possibly-inconsistent
one.

**Shared render helper** (new export in `table-helpers.js`):

```js
export function renderInstanceBadge(badgeElement, hasTarget, targetSetLabel, noTargetLabel) {
  if (!badgeElement) return;
  badgeElement.textContent = hasTarget ? targetSetLabel : noTargetLabel;
  badgeElement.classList.toggle('is-target-set', hasTarget);
  badgeElement.classList.toggle('is-no-target', !hasTarget);
}
```

**Update hook point**: each engine's `updateRangeWarnings` already runs on every
`change` event and already iterates every row computing `currentIndex`/`targetIndex`
(or `currentBase`/`targetBase`). Extend each of the three `updateRangeWarnings`
functions to also call `renderInstanceBadge` per row — this avoids adding a
second per-row iteration or a second event listener.

**Message keys** (add to each file's `MESSAGES.en`/`.vi`, reusing existing
strings where one already fits):

- `forticlad.js`: add new `targetSetLabel` / `noTargetLabel` (no existing
  equivalent — buildings has no sentinel-option wording today). Suggested EN:
  `'Target set'` / `'No target'`; VI: `'Đã đặt mục tiêu'` / `'Chưa đặt mục tiêu'`.
- `research.js`: add new `targetSetLabel`; reuse existing `noTargetLabel` as-is.
- `tomes.js`: add new `targetSetLabel`; reuse existing `noTarget` as-is (already
  `'No target'` / `'Chưa chọn'` — same string used today as the target select's
  zero-option label, semantically identical to the badge's "no target" state).

## Related Code Files

- Modify: `assets/js/planners/table-helpers.js` — add `renderInstanceBadge` export
- Modify: `assets/js/planners/forticlad.js` — badge in `renderBuildingRanges`
  (initial render) + `updateRangeWarnings` (live update); new message keys
- Modify: `assets/js/planners/research.js` — badge in `renderTrackRanges` +
  `updateRangeWarnings`; new message key
- Modify: `assets/js/planners/tomes.js` — badge in `renderInstanceList` +
  `updateRangeWarnings`; new message key
- Modify: `_sass/custom.scss` — add `.loj-planner__instance-badge` (+
  `.is-target-set` / `.is-no-target` modifiers) near the existing
  `.loj-planner__instance-range` block (`_sass/custom.scss:131-158`)
- No changes: `_data/lands_of_jail/*.yml`, `contents/**/*.md` (badge is
  JS-rendered into the existing `.loj-planner__instance-range` container, no new
  static markup needed)

## Implementation Steps

1. Add `renderInstanceBadge` to `table-helpers.js`.
2. Add `.loj-planner__instance-badge` SCSS: small inline pill (reuse
   `.loj-planner__missing-card-badge`'s sizing — `padding: 0.2rem 0.6rem;
   border-radius: 0.2rem; font-size: 0.8rem; font-weight: 700;`), placed right
   after each row's heading. Default/`.is-no-target` state: neutral gray
   (`background: #efeff2; color: #5d5d67;` — same as the existing
   `.loj-planner__missing-card-badge.is-unset`). `.is-target-set` state: amber
   accent consistent with the confirmed accent decision (`background: #fdf3ea;
   color: #c05621;` — same amber family as `.is-accent` at line 155-157, not the
   raw `#d97706` border color, since this is a filled badge not a left border).
3. `forticlad.js`: in `renderBuildingRanges`, add
   `<span class="loj-planner__instance-badge" data-role="instance-badge">` after
   the `<h3>` heading in each row; call `renderInstanceBadge` with
   `ranges[key].currentBase !== ranges[key].targetBase`. In `updateRangeWarnings`,
   after computing `currentIndex`/`targetIndex` per row, also call
   `renderInstanceBadge(row.querySelector('[data-role="instance-badge"]'),
   currentSelect.value !== targetSelect.value, message.targetSetLabel, message.noTargetLabel)`.
4. `research.js`: same pattern in `renderTrackRanges` (badge after `<h4>`, initial
   `ranges[key].targetLevel !== 0`) and `updateRangeWarnings` (`targetLevel !== 0`
   using the already-computed `targetLevel` variable).
5. `tomes.js`: same pattern in `renderInstanceList` (badge after `<h3>`, initial
   `instance.targetIndex !== 0`) and `updateRangeWarnings` (`targetIndex !== 0`
   using the already-computed `targetIndex` variable).
6. Manually exercise each of the four instance groups: default state shows "no
   target", picking a higher target flips to "target set", resetting back flips
   back — confirm live update with no extra page reload/re-render needed.

## Success Criteria

- [x] Every instance row in all four groups shows the correct badge on initial
      load (respecting restored profile state, not just the empty-profile default).
- [x] Badge updates immediately on `change`, without a full list re-render.
- [x] Buildings' `current === target` rule and research/tomes' `sentinel === 0`
      rule are each implemented distinctly, per the table above — not unified
      into one incorrect shared boolean.
- [x] EN and VI both show correctly localized badge text.
- [x] No regression to existing range-validation error messaging (badge is
      additive to `updateRangeWarnings`, not a replacement for its existing
      `is-invalid` class toggling).

## Risk Assessment

- **Risk**: conflating the two "no target" semantics (buildings vs.
  research/tomes) and shipping one wrong on the other's rows.
  **Mitigation**: the table above is authoritative; write a quick manual check
  for each of the four groups specifically probing the "current > 0, target
  reset to sentinel 0" case for research tracks and tomes (the case where a
  naive `current !== target` test would misfire).
- **Risk**: badge DOM node not found on some row if the `data-role` attribute is
  mistyped, silently no-oping via the `if (!badgeElement) return;` guard.
  **Mitigation**: manual visual check per group in Phase 4 catches a missing
  badge immediately (no error thrown, but visibly absent).
