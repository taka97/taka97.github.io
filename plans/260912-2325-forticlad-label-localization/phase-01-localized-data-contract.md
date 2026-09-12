# Phase 1: shared label resolver

## Files

- Create: `assets/js/planners/localized-label.js`

## Steps

1. Add a focused resolver which selects the active-language value, then English,
   then the caller-supplied stable fallback ID.
2. Keep the helper UI-only; calculation cores continue to preserve raw data.

## Validation

- Inspect the helper's supported input paths and validate it through the built
  planner pages.

## Rollback

- Revert only the validation/normalization change; no persisted user data is
  modified.
