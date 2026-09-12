---
title: "Planner label localization"
description: "Allow release-controlled game-data labels to be English/Vietnamese maps or language-neutral strings, with English fallback for unsupported UI languages."
status: completed
priority: P1
effort: "1d"
tags: [lands-of-jail, planners, i18n, data-contract]
created: 2026-09-12
---

# Planner label localization

## Overview

All five browser-local planners currently split display vocabulary between YAML
data and JavaScript translation maps. This plan allows data-owned labels to be
locale maps (`{ en, vi }`) when translations are confirmed, or non-empty strings
when they are language-neutral or not yet translated. A single renderer helper
uses strings unchanged and falls back to English for unsupported or blank map
values. Browser-local progress continues to use stable IDs and is not migrated.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Put every release-controlled game-data label next to its translations. | P1 |
| 2 | Keep calculator inputs, costs, prerequisites, and saved profile IDs unchanged. | P1 |
| 3 | Render English for unsupported locales. | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Shared label resolver](./phase-01-start.md) | Complete |
| 2 | [Localized data contract](./phase-02-data-contract.md) | Complete |
| 3 | [Renderer migration](./phase-03-renderer-migration.md) | Complete |
| 4 | [Build and behavioral verification](./phase-04-verification.md) | Complete |

## Success Criteria

- [x] Every data-owned label is either a non-empty string or has non-empty `en`
  and `vi` values.
- [x] EN and VI pages resolve matching labels; any unsupported locale resolves
  the English label.
- [x] No persisted ID, cost, cap, or prerequisite value changes.
- [x] The documented Docker Jekyll build succeeds.

## Validation Log

### Session 1 — 2026-09-12

**Trigger:** User invoked `ak-plan validate`.

**Questions asked:** 1

#### Questions & Answers

1. **[Architecture]** `table-helpers.js` currently consumes `resource.label` as
   a string. Which compatibility boundary should resolve localized resource
   labels?
   - Options: renderer-local resolved resources (recommended) | teach
     `table-helpers.js` about locale maps | keep resource labels scalar
   - **Answer:** renderer-local resolved resources.
   - **Rationale:** keeps the shared DOM helper language-agnostic and preserves
     its existing string-label contract.

#### Confirmed Decisions

- Every renderer resolves a language-specific resource list before calling
  `updateStickyBar`; `table-helpers.js` remains unchanged.

#### Impact on Phases

- Phase 3: add resolved resource lists for all renderer calls that pass planner
  resources into shared helpers.

### Verification Results

- **Tier:** Standard
- **Claims checked:** 40
- **Verified:** 40 | **Failed:** 0 | **Unverified:** 0

The static verification confirmed all six data files, six renderer files, the
shared `table-helpers.js` contract, and the existing translation-map/
`labelKey` consumers named by the plan. The renderer-local resource-list
decision accounts for every `updateStickyBar` call that currently receives
`planner.resources`.

### Whole-Plan Consistency Sweep

- Files reread: `plan.md`, `phase-01-start.md`, `phase-02-data-contract.md`,
  `phase-03-renderer-migration.md`, `phase-04-verification.md`
- Decision deltas checked: 1
- Reconciled stale references: 1
- Unresolved contradictions: 0

<!-- slug: planner-label-localization -->
