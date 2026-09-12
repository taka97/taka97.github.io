---
phase: 2
title: "Localized data contract"
status: completed
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Localized data contract

## Overview

Allow game-data display labels to be locale maps only when translations are
confirmed, otherwise retain non-empty English strings, while preserving the
calculators' numeric and identity contracts.

## Requirements

- Functional: accept non-empty scalar labels or non-empty `{ en, vi }` maps.
- Functional: replace Robot & Satellites' Satellite `labelKey` records with
  data-owned labels; use locale maps only where translations are confirmed.
- Safety: do not change IDs, keys, order, costs, caps, resources, or
  prerequisite records.

## Architecture

The affected YAML is release-controlled and is embedded into planner pages as
JSON. Each calculator already persists stable identifiers rather than display
labels, so localization changes cannot reinterpret saved player progress.

## Related Code Files

- Modify: `_data/lands_of_jail/forticlad.yml`
- Modify: `_data/lands_of_jail/forticlad_research.yml`
- Modify: `_data/lands_of_jail/tomes_collections.yml`
- Modify: `_data/lands_of_jail/robots_satellites.yml`
- Modify: `_data/lands_of_jail/hero_equipment.yml`
- Modify: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`

## Risks and rollback

YAML inline-map quoting can make terms parse incorrectly. Validate with Jekyll's
JSON output and review the diff for only label-shaped changes. Revert the six
data files together if malformed source data prevents planner initialization.

## Implementation Steps

1. Convert Forticlad building and Base-step labels, reusing the current
   Vietnamese building terms and making step translations explicit data.
2. Convert T11 Research tracks, Tomes collection slots/tiers/resources, and
   Robots resources/tier/Satellite names.
3. Convert Hero Equipment and Hero Stars & Exclusive Equipment resource labels.
4. Retain generic labels computed from numbers (for example level and star
   formatting) in their existing message dictionaries.

## Success Criteria

- [x] Every data-owned label is a non-empty string or a locale map with populated
  `en` and `vi` values.
- [x] Satellite names no longer require `labelKey`.
- [x] Every saved identifier and numerical calculation input is byte-for-byte
  unchanged outside label records.
