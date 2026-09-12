---
phase: 1
title: "Shared label resolver"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Shared label resolver

## Overview

Add a small UI-layer helper that resolves a locale map without coupling the
calculation engines to a chosen language.

## Requirements

- Functional: return a non-empty scalar label unchanged; for locale maps, choose
  a non-empty value for the requested language, otherwise use non-empty English,
  otherwise use a caller-supplied stable fallback.
- Non-functional: preserve a single, importable helper with no DOM or storage
  dependency.

## Architecture

`localized-label.js` receives a scalar string or `{ en, vi, ... }`, an active
language, and the stable ID used only as a defensive last fallback. Planner data
remains embedded by Jekyll exactly as before; the helper is invoked during DOM
rendering only.

## Related Code Files

- Create: `assets/js/planners/localized-label.js`

## Risks and rollback

If a renderer misses the helper, it may stringify an object. Search for all
direct `.label` reads in Phase 3 before removing old maps. Roll back by
reverting the helper and renderer/data commits together.

## Implementation Steps

1. Define the locale-map input and fallback behavior in a focused exported
   function.
2. Treat missing, non-string, and whitespace-only locale values as absent.
3. Keep the return value always suitable for `textContent` and option labels.

## Success Criteria

- [x] The helper returns scalar labels unchanged, resolves `vi` maps, falls back
  to `en`, and finally returns the supplied stable ID.
