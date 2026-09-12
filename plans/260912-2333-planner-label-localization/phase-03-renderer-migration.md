---
phase: 3
title: "Renderer migration"
status: completed
priority: P1
effort: "2h"
dependencies: [1, 2]
---

# Phase 3: Renderer migration

## Overview

Update each planner's display layer to resolve data-owned scalar labels or locale
maps and remove obsolete JavaScript translation maps for confirmed translations.

## Requirements

- Functional: every direct data-label render goes through the shared resolver.
- Functional: Forticlad building/step and Research-track maps, plus Robot &
  Satellites' message-owned satellite labels, are removed after replacement.
- Compatibility: retain per-page `MESSAGES` for generic UI sentences and
  dynamically formatted numeric labels.

## Architecture

The core calculators keep receiving the same data records and continue to
calculate from IDs and numeric costs. Only DOM output paths resolve labels with
the page language. Each renderer derives a language-specific resource list
before passing it to `updateStickyBar`, preserving `table-helpers.js`'s existing
string-label contract. This prevents label text from crossing into persisted
state.

## Related Code Files

- Modify: `assets/js/planners/forticlad.js`
- Modify: `assets/js/planners/research.js`
- Modify: `assets/js/planners/tomes.js`
- Modify: `assets/js/planners/robots-satellites.js`
- Modify: `assets/js/planners/hero-equipment.js`
- Modify: `assets/js/planners/hero-stars-exclusive-equipment.js`
- Modify only if their string guards reject maps: `assets/js/planners/*-core.js`

## Risks and rollback

A missed direct `.label` use will render `[object Object]`. Use a repository
search after migration and inspect all planner headings, select options, cost
strings, summary cards, and breakdown tables. Revert renderer changes with the
localized data if any page fails to initialize.

## Implementation Steps

1. Import the shared resolver in each renderer.
2. Derive locale-resolved resources before calling `updateStickyBar`; do not
   change `table-helpers.js`.
3. Replace direct data-label reads in headings, selects, tables, cost strings,
   and resource cards.
4. Remove superseded map/regex and Satellite label-key code only when every
   caller consumes the data map.
5. Update core normalization only where existing scalar-label validation would
   otherwise reject the new map shape.

## Success Criteria

- [x] No locale-map data label is assigned directly to a DOM text node or string
  interpolation without resolution.
- [x] No obsolete game-data translation map remains in a renderer.
