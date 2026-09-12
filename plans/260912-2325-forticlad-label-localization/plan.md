# Planner label localization plan

Status: approved design; ready to implement.

## Phases

1. Add a shared label resolver with English fallback.
2. Convert game-data labels across all five planners to locale maps.
3. Update each renderer to consume localized data labels.
4. Build the site and verify EN, VI, and unknown-locale fallback behavior.

## Dependencies

- All persisted IDs remain stable.
- No browser-profile data migration is required.

## Acceptance criteria

- See [the approved design](../../docs/superpowers/specs/2026-09-12-forticlad-label-localization-design.md).

## Phase detail

- [Phase 1: shared label resolver](phase-01-localized-data-contract.md)
- [Phase 2: data migration](phase-02-renderer-and-data-migration.md)
- [Phase 3: renderer migration and verification](phase-03-verification.md)
