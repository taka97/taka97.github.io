# Phase 2: data migration

## Files

- Modify: `_data/lands_of_jail/forticlad.yml`
- Modify: `_data/lands_of_jail/forticlad_research.yml`
- Modify: `_data/lands_of_jail/tomes_collections.yml`
- Modify: `_data/lands_of_jail/robots_satellites.yml`
- Modify: `_data/lands_of_jail/hero_equipment.yml`
- Modify: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`

## Steps

1. Convert existing game-data labels to `{ en, vi }` maps, preserving all IDs,
   cost tables, levels, prerequisites, and caps exactly.
2. Replace Satellite `labelKey` with an owned locale map while preserving its
   stable `id` and tier.

## Validation

- Check the data diff for no ID or numerical-cost changes.

## Rollback

- Revert the data migration as one unit; no profile data changes are involved.
