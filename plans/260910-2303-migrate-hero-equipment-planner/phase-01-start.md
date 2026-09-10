---
phase: 1
title: "Phase 1: Start"
status: complete
priority: P1
effort: "15m"
dependencies: []
---

# Phase 1: Start

## Overview

Confirm the working branch and re-read the brainstorm report + this plan's
sibling phase files before touching code, per this repo's mandatory
generated-file read pass. No code changes in this phase.

## Requirements

- Branch is `feat/tomes-collections-planner` at session start per git status —
  Hero Equipment is a *new* tool, unrelated to Tomes & Collections scope, so
  create a fresh feature branch off `main` before starting Phase 2, matching
  how Robots & Satellites got its own branch rather than reusing Tomes &
  Collections' leftover branch.

## Implementation Steps

1. `git status` — confirm no uncommitted changes are sitting on the current
   branch that would be lost by switching.
2. `git checkout main && git pull` (or equivalent) then
   `git checkout -b feat/hero-equipment-planner`.
3. Re-read `plans/reports/brainstorm-260910-2300-migrate-hero-equipment-planner.md`
   and every `phase-*.md` in this plan directory (Phase 2 through 5) before
   writing any implementation code, per this repo's mandatory generated-file
   read pass.

## Success Criteria

- [x] On a clean `feat/hero-equipment-planner` branch, branched from current
      `main`.
- [x] Brainstorm report and all phase files in this plan directory have been
      read this session.
