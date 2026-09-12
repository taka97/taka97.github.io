# Phase 3: renderer migration and verification

## Files

- Modify: `assets/js/planners/forticlad.js`
- Modify: `assets/js/planners/research.js`
- Modify: `assets/js/planners/tomes.js`
- Modify: `assets/js/planners/robots-satellites.js`
- Modify: `assets/js/planners/hero-equipment.js`
- Modify: `assets/js/planners/hero-stars-exclusive-equipment.js`

## Steps

1. Replace data-label translation maps and `labelKey` lookups with the shared
   resolver while keeping generic UI message dictionaries unchanged.
2. Run the documented
   Jekyll/Docker build command after checking `README.md`.
3. Verify generated EN and VI pages contain matching data labels, and check
   unknown-language resolution returns English.
4. Review `git diff` to ensure only the agreed localization files and plan/
   design records changed; preserve the user's unrelated working-tree changes.

## Rollback

- Revert this change set as one unit. Browser-local saved data remains valid.
