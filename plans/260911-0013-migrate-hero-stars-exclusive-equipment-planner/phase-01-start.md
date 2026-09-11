---
phase: 1
title: "Phase 1: Start"
status: done
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

- Current branch is `main` (Hero Equipment already merged — see commit
  `dd8908c`). Hero Stars & Exclusive Equipment is a *new* tool, so create a
  fresh feature branch off `main` before starting Phase 2, matching how
  every prior tool migration got its own branch.

## Implementation Steps

1. `git status` — confirm no uncommitted changes are sitting on `main` that
   would be lost by switching (the two untracked plan/report files from
   this planning session are expected and will be committed with the
   implementation, not lost).
2. `git pull` (ensure `main` is current) then
   `git checkout -b feat/hero-stars-exclusive-equipment-planner`.
3. Re-read `plans/reports/brainstorm-260911-0000-migrate-hero-stars-exclusive-equipment-planner.md`
   and every `phase-*.md` in this plan directory (Phase 2 through 5) before
   writing any implementation code, per this repo's mandatory generated-file
   read pass.

## Success Criteria

- [x] On a clean `feat/hero-stars-exclusive-equipment-planner` branch,
      branched from current `main`.
- [x] Brainstorm report and all phase files in this plan directory have been
      read this session.
