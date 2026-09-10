---
phase: 4
title: "SCSS Additions"
status: complete
priority: P2
effort: "1h"
dependencies: [3]
---

# Phase 4: SCSS Additions

## Overview

Extend the shared `.loj-planner__*` block in `_sass/custom.scss` with two small,
narrowly-scoped additions: a rarity badge (for Satellite tier headings) and an
estimated-cost disclosure toggle/note (for Phase 3's `renderEstimatedBadge`). No
restructuring of existing selectors — purely additive, following this file's
existing dark-panel/`#23232b`/`#3a3a45` palette used by `.loj-planner__sticky-bar`
and `.loj-planner__sticky-chip`.

## Requirements

- Functional: new selectors style `.loj-planner__rarity-badge` (colored pill using
  a `--badge-color` custom property, matching source's `.rarity-badge
  {style="--badge-color:..."}` approach) and `.loj-planner__estimated-tag` /
  `.loj-planner__estimated-note` (small inline toggle button + disclosure text).
- Non-functional: no existing `.loj-planner__*` selector's rules are changed;
  additions only. Reuse existing color tokens already used in this block (don't
  invent a new palette for two small elements).

## Architecture

```scss
.loj-planner__rarity-badge {
  // inline-block pill, background from --badge-color at low opacity or as a
  // left border accent (implementer's call — match source's visual intent:
  // colored badge naming a tier), text color contrasting against panel bg
}

.loj-planner__estimated-tag {
  // small inline button, "≈" glyph, subtle border, cursor:pointer,
  // aria-expanded-aware focus-visible outline (reuse the same outline treatment
  // as .loj-planner__sticky-bar:focus-visible for consistency)
}

.loj-planner__estimated-note {
  // small muted text, shown inline or as a small popover-like block when not
  // [hidden]; simplest correct approach: inline text directly after the tag,
  // no absolute positioning needed (matches this file's general preference for
  // simple in-flow layout over floating UI)
}
```

## Related Code Files

- Modify: `_sass/custom.scss`

## Implementation Steps

1. Add `.loj-planner__rarity-badge` near the other section-heading-adjacent
   selectors (e.g. after `.loj-planner__auto-tag`, since both are small inline
   annotation elements) — accepts `--badge-color` as a CSS custom property set
   inline by `robots-satellites.js`.
2. Add `.loj-planner__estimated-tag` and `.loj-planner__estimated-note`
   immediately after, following the same block placement logic.
3. Add a `&[hidden] { display: none; }` rule on `.loj-planner__estimated-note`
   (matches the `.loj-planner__sticky-bar` pattern for hidden elements in this
   file, so JS just toggles the `hidden` attribute — no class-based show/hide
   needed).
4. Verify no duplicate/conflicting selector names against a grep for
   `rarity-badge|estimated-tag|estimated-note` across the file before adding
   (confirm these are genuinely new, not partially present from an earlier
   Forticlad/Tomes round).

## Todo

- [x] Add the 3 new selector blocks to `_sass/custom.scss`.
- [x] Confirm existing `.loj-planner__*` rules are byte-for-byte unchanged (diff
      the file before/after, only additions expected) — additions inserted between
      `.loj-planner__auto-tag` and `.loj-planner__sticky-bar`, no existing rule
      touched.

## Success Criteria

- [x] Rarity badge renders with a visibly distinct color per tier (R/SR/SSR use
      different `--badge-color` values from the yml) — JS sets the custom property
      per tier from `satelliteTiers[tier].badge` (`#5b8cff`/`#9b6bff`/`#ffd60a`).
- [x] Estimated tag/note is legible, keyboard-focusable, and toggles visibility
      correctly — logic verified by code reading (native `<button>` +
      `hidden`-toggle); full visual/interactive check deferred, see Phase 6 note on
      the unavailable Chrome extension.
- [x] `bundle exec jekyll build`'s Sass compile step succeeds with no warnings
      introduced by these additions (only pre-existing theme deprecation warnings
      appeared, unrelated to this change).

## Risk Assessment

- Low risk — purely additive CSS, no cascade/specificity conflicts expected since
  class names are new and scoped under the existing `.loj-planner` block nesting.
