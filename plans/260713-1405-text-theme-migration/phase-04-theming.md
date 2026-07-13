---
phase: 4
title: "Theming"
status: done
effort: ""
---

# Phase 4: Theming (skin & readability tweaks)

<!-- Updated: Validation Session 1 - built-in `default` skin only; no custom brand skin, no light/dark switching now -->

## Overview

Use TeXt's built-in **`default`** skin. **No custom brand skin** and **no light/dark
switching** are built in this migration — the user will add a theme switcher in future work.
The only styling work here is migrating the two theme-agnostic readability tweaks from the
old `_sass/custom/custom.scss` (article line-height, stat/loot table header tint). Depends
on Phases 1–3; independent of Phase 5.

## Requirements

- Functional: `text_skin: default` applied site-wide; long guide pages readable; stat/loot
  tables have a header tint.
- Non-functional: tweaks done via a TeXt-supported custom style hook, not `!important`
  overrides; keep the door open for a future custom skin / switcher (don't hardcode away
  the skin system).

## Architecture

TeXt skins live in `_sass/skins/_<name>.scss`, selected via `text_skin:` in `_config.yml`.
This migration selects the stock `default` (light) skin — no new skin file is authored.

The current indigo/teal brand palette (`_sass/color_schemes/custom.scss`) is **deliberately
not reproduced** (Validation Session 1). That file is JtD-only and is removed in Phase 6.

Readability tweaks migrate into a small site SCSS override loaded after the skin (TeXt's
documented custom-style hook — confirm exact path from the installed gem, e.g. a
`_sass/` partial or the main `assets/css` entry). Only the two theme-agnostic rules carry
over; all JtD-specific selectors (`.nav-list*`, `.main-content`, `.site-footer`,
`.lang-switcher`) do not apply to TeXt markup and are re-created only where still needed
(switcher styling lives with Phase 5).

## Related Code Files

- Modify: `_config.yml` — `text_skin: default`.
- Create: a small site SCSS override (TeXt custom-style hook) for:
  - article body `p, li` line-height ~1.6
  - table header background tint for stat/loot tables
- Delete (Phase 6 cleanup): `_sass/color_schemes/custom.scss` and JtD `_sass/custom/custom.scss`.

## Implementation Steps

1. **Set `text_skin: default`** in `_config.yml`; rebuild and confirm the stock light skin
   renders.
2. **Confirm TeXt's custom-style hook path** from the installed gem before writing overrides
   (don't guess).
3. **Migrate the two readability tweaks** into that hook — line-height and table header tint
   only. Skip every JtD-specific selector.
4. **Rebuild** and verify readability on long guide pages (e.g. `satellite`) in EN and VI.

## Success Criteria

- [ ] Site renders with the stock `default` skin (`text_skin: default` in `_config.yml`).
- [ ] Long guide pages have comfortable line-height; stat/loot tables have header styling.
- [ ] No JtD SCSS variables or selectors referenced in active stylesheets.
- [ ] Skin system left intact/extensible for a future custom skin + switcher.

## Risk Assessment

- **Scope creep:** the brand palette and switcher are explicitly out of scope (Validation
  Session 1). Resist re-adding them. Skin selection + two tweaks is the whole phase.
- **Wrong custom-style hook path:** guessing silently no-ops. Mitigation: read the gem's
  style entry before adding overrides.
