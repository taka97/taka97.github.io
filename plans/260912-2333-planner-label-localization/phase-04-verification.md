---
phase: 4
title: "Build and behavioral verification"
status: completed
priority: P1
effort: "1h"
dependencies: [2, 3]
---

# Phase 4: Build and behavioral verification

## Overview

Confirm the generated site accepts the localized data and each planner retains
its English/Vietnamese behavior with the agreed fallback.

## Requirements

- Functional: EN and VI output resolves locale maps to matching values and
  renders scalar labels unchanged.
- Functional: an unsupported language returns English through the shared
  resolver.
- Non-functional: Jekyll completes its documented Docker build.

## Architecture

Jekyll YAML parsing and JSON serialization are the primary structural gate.
Rendered EN/VI planner pages then exercise the data embedding path. Browser
storage is intentionally excluded because labels never participate in persisted
state.

## Related Code Files

- Verify: all files from Phases 1–3
- Verify: `README.md` build command

## Risks and rollback

Docker may be unavailable on the host. If so, report the unavailable validation
gate explicitly after static data and JavaScript checks; do not claim a full
build passed. Roll back the complete localization change set if Jekyll fails on
localized YAML.

## Implementation Steps

1. Search for scalar-label assumptions and removed translation maps.
2. Run the Docker Jekyll build documented in `README.md`.
3. Inspect generated EN and VI planner pages for representative labels from
   every tool.
4. Call the resolver with an unsupported language and confirm it returns `en`.
5. Review the final diff to ensure unrelated working-tree edits are untouched.

## Success Criteria

- [x] The build exits successfully.
- [x] All five planners render localized data labels in both language variants.
- [x] Unsupported-language data-label resolution is English.
