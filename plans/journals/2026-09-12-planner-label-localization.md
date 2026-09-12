---
title: Planner label localization
date: 2026-09-12
summary: Added mixed scalar-or-locale-map planner label support with English fallback.
---

# Planner label localization

## What happened

- Added a shared label resolver and renderer-local resource localization.
- Replaced confirmed JavaScript translation maps with data-owned maps.
- Replaced satellite labelKey values with data-owned labels.

## Decision

Non-empty scalar labels render unchanged in every locale; only confirmed translations use `{ en, vi }` maps.

## Verification

- Resolver tests passed (6/6).
- Docker Jekyll build and core validation of generated planner data passed.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
