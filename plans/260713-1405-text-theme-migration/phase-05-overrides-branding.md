---
phase: 5
title: "overrides & branding"
status: done
effort: ""
---

# Phase 5: Overrides & branding (head, favicon, footer)

<!-- Updated: Validation Session 1 - drop custom <title> scheme; accept TeXt default titles -->

## Overview

Re-implement the bespoke behaviors that lived in the JtD `_includes/` overrides on TeXt's
include/hook system: **per-game favicon**, the **footer**, and **hreflang** alternates. The
custom `<title>` scheme is **dropped** (Validation Session 1) — TeXt's default titles are
accepted; the tab-title format change is documented in `CLAUDE.md`. Depends on Phases 1–3;
independent of Phase 4.

## Requirements

- Functional: per-game favicon still switches by URL; footer copyright present; hreflang
  alternates emitted for EN/VI counterparts. (Tab titles: TeXt default — no custom logic.)
- Non-functional: implemented via TeXt's supported custom hooks, not by editing gem files.

## Architecture

TeXt exposes custom hooks (custom head/footer includes and overridable `_includes/`
partials — the site's `_includes/` shadows the gem's). The JtD-specific override files
(`_includes/head.html`, `header_custom.html`, `favicon.html`, `nav_footer_custom.html`) are
JtD hook names and do **not** apply to TeXt; their *logic* is ported to TeXt's equivalents.

Behaviors to port:
- **Per-game favicon** (`_includes/favicon.html` today): default `game-console`, switch to
  `lands-of-jail` when `page.url contains "/lands-of-jail"`. Assets already exist in
  `public/icons/`. Re-express against TeXt's head hook.
- **Custom `<title>` scheme:** **DROPPED** (Validation Session 1). Accept TeXt's default
  title generation; no custom head-title liquid. Record the tab-title format change in
  `CLAUDE.md` (Phase 6).
- **Footer** (`nav_footer_custom.html`): `© <year> <site.title>` → TeXt footer hook.
- **hreflang alternates** (were in JtD head.html): re-emit `<link rel="alternate"
  hreflang>` for EN/VI using the `ref`-based counterpart URLs (pairs with Phase 6 SEO).

## Related Code Files

- Create: TeXt custom head include (per TeXt docs — e.g. `_includes/head/custom.html` or the
  documented `custom` hook) — favicon links, optional custom `<title>`, hreflang tags.
- Create: TeXt custom footer include — copyright line.
- Delete (superseded, do in Phase 6 or once ported): `_includes/head.html`,
  `_includes/header_custom.html`, `_includes/favicon.html`,
  `_includes/nav_footer_custom.html` (all JtD hook names).
- Keep: `public/icons/*` favicon assets; `favicon.ico`.
- Style pairing: language-switcher CSS (switcher markup from Phase 2/3) added to the custom
  stylesheet from Phase 4.

## Implementation Steps

1. **Confirm TeXt's custom head/footer hook names** from the gem's `_layouts/base.html` /
   `_includes` (read the installed gem or repo source) — do not guess the include path.
2. **Port favicon logic** into the custom head hook; verify the `lands-of-jail` icon loads
   on game pages and `game-console` elsewhere, in both `/en/` and `/vi/` trees (URL contains
   check still works since both language paths include `/lands-of-jail`).
3. **Title scheme: none.** Accept TeXt default titles — no custom head-title include. Note
   the format change for `CLAUDE.md` (Phase 6).
4. **Port footer** copyright into the footer hook.
5. **Re-emit hreflang** for the EN/VI counterpart (reuse the `ref` lookup from the switcher).
6. **Remove dead JtD includes** once TeXt equivalents verified.
7. Build & verify favicons, footer, and `<link rel="alternate">` output.

## Success Criteria

- [ ] `lands-of-jail` favicon shows on game pages; `game-console` default elsewhere (EN & VI).
- [ ] `<title>` uses TeXt default generation (no custom title include); format change noted
      in `CLAUDE.md`.
- [ ] Footer copyright renders on all pages.
- [ ] `<link rel="alternate" hreflang="en|vi">` present and points to correct counterparts.
- [ ] No JtD-named override includes remain in `_includes/`.

## Risk Assessment

- **Wrong hook name:** guessing TeXt's custom head/footer include path silently no-ops.
  Mitigation: read the installed gem's `_layouts/base.html` to find the exact `include`
  calls before writing.
- **Title scheme:** de-scoped (Validation Session 1) — TeXt default titles accepted, so the
  fiddly VI-word/per-level liquid is not built. Only remaining action is documenting the
  tab-title format change in `CLAUDE.md`.
