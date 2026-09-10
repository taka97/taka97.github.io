---
phase: 2
title: "Sticky Missing Bar for Forticlad"
status: complete
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Sticky Missing Bar for Forticlad

<!-- Updated: Validation Session 1 - switched from two independent sticky bars to one combined bar -->

## Overview

Port the sticky bottom "Missing" bar — already shipped for Tomes & Collections —
into the Forticlad planner as **one combined bar** covering FC, AFC, and
Hyperalloy together, matching lojcalc's own single-bar-per-tool UX and our
existing single shared `.loj-planner__summary` section.

## Requirements

- Functional: a sticky bar pinned to the viewport bottom shows live "Missing: …"
  chips for whichever of FC/AFC/Hyperalloy are currently short, and
  clicking/Enter/Space on it scrolls to `#forticlad-summary-heading` — same
  interaction as Tomes & Collections, but combining both engines' totals.
- Non-functional: no new SCSS (reuse `.loj-planner__sticky-bar` /
  `.loj-planner__sticky-chip`, already generic in `_sass/custom.scss:338-370`); no
  data-schema changes.

## Architecture

**Verified**: `forticlad.md` has exactly one `.loj-planner__summary` section
(`#forticlad-summary-heading`, lines 38-73) holding all three missing cards (FC,
AFC, Hyperalloy) — `forticlad.js` writes the FC/AFC cards
(`summary-fc-needed`/`summary-fc-missing`/`summary-afc-*`), `research.js` writes
the Hyperalloy card (`summary-hyperalloy-*`) into the *same* section. There is no
second summary heading for research — confirmed via `Grep` during validation, an
earlier draft of this phase wrongly assumed one. lojcalc.com's own sticky bar is
also one bar per tool (its "FC Buildings & T11 Research" screenshot shows a
single "FC 2,167" bar covering the combined tool), not one per section —
matching a single combined bar here is the more faithful port, not less.

**Cross-script coordination**: `forticlad.js` and `research.js` are independent
engines that already coordinate one direction via a CustomEvent
(`forticlad:building-data-changed`, dispatched by `forticlad.js` when building
data changes, consumed by `research.js` to recompute FC-Lab-gated prerequisites).
This phase adds the reverse channel using the same established pattern:

- `forticlad.js` **owns** the combined sticky bar element and the merge logic
  (it already renders first in `forticlad.md`'s script order, and buildings is
  the primary tool).
- `research.js` dispatches a new `forticlad:research-totals-changed` CustomEvent
  after every `renderResult()`, with `detail: { totals: { hyperalloy: number } | null, stock: { hyperalloy: number } | null }`
  (`null` when the profile is invalid, tracks are unset, or an error occurred —
  mirroring how `updateStickyBar` already treats a `null` totals argument as "no
  chips").
- `forticlad.js` listens for `forticlad:research-totals-changed`, stores the
  latest `detail` in a closure variable (starts as `{ totals: null, stock: null }`
  before research.js's first render), and recomputes the combined bar by merging
  its own FC/AFC slice with the stored Hyperalloy slice on every render of
  *either* script.

**DRY**: generalize `tomes.js`'s local `updateStickyBar` (lines 486-511) into a
shared export in `table-helpers.js`, since the logic (filter resources with known
stock, compute `max(needed - stock, 0)`, render chips, toggle `hidden`, set
`aria-label`) is identical across engines — only the resource list and totals
shape differ.

```js
// table-helpers.js
export function updateStickyBar(container, resources, totals, stock, stickyBarLabel, formatNumber) {
  const chips = totals
    ? resources
        .filter((resource) => Number.isInteger(stock[resource.key]))
        .map((resource) => ({ resource, missing: Math.max(totals[resource.key] - stock[resource.key], 0) }))
        .filter((entry) => entry.missing > 0)
    : [];
  if (chips.length === 0) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }
  const fragment = document.createDocumentFragment();
  const summaryParts = [];
  chips.forEach(({ resource, missing }) => {
    const chip = document.createElement('span');
    chip.className = 'loj-planner__sticky-chip';
    const text = `${resource.label}: ${formatNumber(missing)}`;
    chip.textContent = text;
    summaryParts.push(text);
    fragment.append(chip);
  });
  container.replaceChildren(fragment);
  container.hidden = false;
  container.setAttribute('aria-label', `${stickyBarLabel} ${summaryParts.join(', ')}`);
}
```

`resources`/`totals`/`stock` are merged buildings+research shape, e.g.
`resources = [{key:'fc',label:'FC'},{key:'afc',label:'AFC'},{key:'hyperalloy',label:'Hyperalloy'}]`,
`totals = { fc, afc, hyperalloy }` (any missing key simply won't produce a chip
since `Number.isInteger(stock[key])` guards it), `stock = { fc, afc, hyperalloy }`.

## Related Code Files

- Modify: `assets/js/planners/table-helpers.js` — add shared `updateStickyBar` export
- Modify: `assets/js/planners/tomes.js` — replace local `updateStickyBar` with the
  shared import; remove the now-dead local copy
- Modify: `assets/js/planners/forticlad.js` — add sticky bar element, own the
  merge state and click/keydown wiring, call shared `updateStickyBar` with the
  combined FC+AFC+Hyperalloy shape after each `renderResult()` and after each
  `forticlad:research-totals-changed` event
- Modify: `assets/js/planners/research.js` — dispatch
  `forticlad:research-totals-changed` after each `renderResult()` (no sticky bar
  element or rendering of its own — its totals feed forticlad.js's combined bar)
- Modify: `contents/en/lands-of-jail/planners/forticlad.md`,
  `contents/vi/lands-of-jail/planners/forticlad.md` — add one
  `<div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>`
  right after `</section>` that closes the `data-forticlad-planner` root's last
  child, mirroring `tomes-collections.md`'s existing single `data-role="sticky-bar"` placement
- No changes: `_sass/custom.scss` (styles already generic), `_data/lands_of_jail/*.yml`

## Implementation Steps

1. In `table-helpers.js`, add the shared `updateStickyBar` export shown above.
2. In `tomes.js`, delete the local `updateStickyBar` function; import the shared
   one from `table-helpers.js`. Verify the three existing call sites (lines 253,
   268, 274) still pass matching args (`planner.resources`, `result.totals`,
   `stock`, `message.stickyBarLabel`, `formatNumber`) — no behavior change expected.
3. In `forticlad.md` (EN + VI), add the single `sticky-bar` div described above.
4. In `forticlad.js`:
   - Add `stickyBar: find('sticky-bar')`, `summaryHeading: container.querySelector('#forticlad-summary-heading')` to `getElements`.
   - Add module-level (per-`initializePlanner`-closure) state:
     `let researchSlice = { totals: null, stock: null };`.
   - Add `document.addEventListener('forticlad:research-totals-changed', (event) => { researchSlice = event.detail; updateCombinedStickyBar(); })`.
   - Add a `updateCombinedStickyBar()` helper that builds the merged
     `resources`/`totals`/`stock` (buildings' own FC/AFC from the last computed
     `result`, plus `researchSlice`) and calls the shared `updateStickyBar`.
   - Call `updateCombinedStickyBar()` at the same three points `renderResult()`
     currently calls `renderSummary`/`clearSummary` (success, invalid-range, and
     error paths) — store the last buildings totals/stock in closure state so
     `updateCombinedStickyBar()` can be called from the event listener too,
     independent of `renderResult()`.
   - Wire `elements.stickyBar` click/keydown exactly like `tomes.js` does today
     (Enter/Space triggers the same `scrollToSummary`), scrolling to
     `elements.summaryHeading`.
   - Add `stickyBarLabel` to `MESSAGES.en`/`.vi` (reuse `tomes.js`'s existing EN/VI
     strings: `'Missing:'` / `'Còn thiếu:'`).
5. In `research.js`: after each `renderResult()`'s three branches, dispatch
   `document.dispatchEvent(new CustomEvent('forticlad:research-totals-changed', { detail: { totals: hasValidResult ? { hyperalloy: result.grandTotal } : null, stock: hasValidResult ? { hyperalloy: inventory } : null } }))`.
   No new sticky-bar DOM, no new message keys needed here.
6. Confirm combined behavior: setting only a building target shows the bar with
   only FC/AFC chips; setting only a research target shows the bar with only the
   Hyperalloy chip (even though `forticlad.js` never directly computed it); setting
   both shows all applicable chips together; clicking always scrolls to the one
   shared summary heading.

## Success Criteria

- [x] One sticky bar, combining FC/AFC/Hyperalloy missing chips correctly
      regardless of which section (buildings, research, or both) currently has
      targets set.
- [x] Click, Enter, and Space all scroll to `#forticlad-summary-heading`.
- [x] `research.js` changes are additive (dispatch only) — no change to its own
      rendering, calculation, or persistence behavior.
- [x] `tomes.js` still works identically after switching to the shared helper (no
      behavior change, only reuse of moved code).
- [x] EN and VI both show correctly localized `stickyBarLabel` text.

## Risk Assessment

- **Risk**: `forticlad.js`'s bar renders before `research.js`'s first
  `renderResult()` has run (module execution order + async profile loading means
  timing isn't guaranteed), showing a bar without the Hyperalloy chip briefly
  even if one should be missing. **Mitigation**: acceptable — the bar re-renders
  the instant `research.js` dispatches its first event (typically within the same
  frame or two, since both start their async profile fetch immediately at module
  load); no user-visible flash in practice since the sticky bar only appears once
  something is missing, and `research.js`'s own `renderResult()` runs synchronously
  after its `await store...` resolves, same as `forticlad.js`'s.
- **Risk**: refactoring `tomes.js`'s `updateStickyBar` into a shared helper could
  regress its existing behavior. **Mitigation**: keep the function body identical,
  only lift it out and parameterize the label string; manually re-test Tomes &
  Collections in Phase 4.
- **Risk**: `forticlad.js` needs to retain its last-computed FC/AFC totals/stock
  in closure state solely so the event listener can recombine on a
  research-only update — a new small piece of mutable state that didn't exist
  before. **Mitigation**: scope it tightly (two variables, set only where
  `renderResult()` already computes the same values today) — no broader
  refactor of `renderResult()`'s control flow.
