---
title: "Migrate site from Just the Docs to jekyll-TeXt-theme"
description: "Full theme swap from Just the Docs to jekyll-TeXt-theme (gem), replacing jekyll-polyglot with TeXt-native i18n for EN/VI."
status: done
priority: P2
branch: "feat/text-theme-migration"
tags: []
blockedBy: []
blocks: []
created: "2026-07-13T07:17:32.690Z"
createdBy: "ck:plan"
source: skill
---

# Migrate site from Just the Docs to jekyll-TeXt-theme

## Overview

Replace the current **Just the Docs 0.10.1** theme with **jekyll-TeXt-theme 2.2.x**
(installed via the `jekyll-text-theme` gem), and replace **jekyll-polyglot** with
**TeXt's native i18n** for the EN/VI bilingual site. This is a full theme swap: TeXt
layouts, TeXt navigation model (`_data/navigation.yml` header + named sidebar groups),
and TeXt skin-based styling replace JtD's auto-sidebar and custom color scheme.

Scope decisions (confirmed with user 2026-07-13):
- **Migration depth:** Full theme swap.
- **i18n:** Switch to TeXt-native i18n (drop polyglot).
- **Install:** `jekyll-text-theme` gem.

The content set is small — one game (`lands-of-jail`), ~11 EN/VI page pairs — so the
migration cost is concentrated in config, i18n plumbing, and navigation, not bulk
content rewriting.

### Key facts driving the plan

- **TeXt gem** `jekyll-text-theme ~> 2.2`; Jekyll `>= 3.6, < 5.0` (repo uses Jekyll 4.3 — OK).
  Runtime deps: `jekyll-paginate`, `jekyll-sitemap`, `jekyll-feed`, `jemoji`.
- **TeXt layouts:** `home`, `article`, `page`, `archive`, `articles`, `landing`, `base`, `none`, `404`.
- **TeXt navigation:** header list + named sidebar groups with nested `children`, referenced
  per page via `sidebar: { nav: <group-key> }`. This is how the game→season→guide hierarchy
  is preserved.
- **TeXt i18n:** UI strings in `_data/locale.yml`; per-page `lang`; per-language nav groups
  (e.g. `docs-en`, `docs-vi`); `titles:` maps in nav for multilingual labels.
- **CRITICAL:** TeXt ships locales for en/zh/ko/fr/tr — **Vietnamese (`vi`) is NOT built in**.
  We must add a `vi` block to `_data/locale.yml` and verify TeXt's language-code handling
  accepts `vi`.
- **CRITICAL:** TeXt has **no polyglot-style automatic URL routing or auto language switcher**.
  Per-language pages and the EN↔VI switcher are built manually (directory-per-language +
  a custom switcher include).

### URL scheme decision

Adopt an explicit **language-directory** scheme (TeXt-idiomatic): EN under `/en/…`, VI under
`/vi/…`, with a root `/` redirect/home. This is a deliberate change from today's "EN at root,
VI under /vi/". Rationale: TeXt i18n has no root-language special-casing, and symmetric
language dirs make the switcher and nav groups uniform. Old EN root URLs (e.g.
`/lands-of-jail/`) change to `/en/lands-of-jail/` — see Phase 6 for redirect/SEO handling.

> **Resolved (Validation Session 1):** symmetric `/en/` + `/vi/` confirmed; EN-at-root not
> required. Old EN URLs get redirects (Phase 6).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Theme install & baseline config](./phase-01-theme-install-baseline-config.md) | Done |
| 2 | [i18n restructure (polyglot to TeXt)](./phase-02-i18n-restructure-polyglot-to-text.md) | Done |
| 3 | [Navigation & content layout conversion](./phase-03-navigation-content-layout-conversion.md) | Done |
| 4 | [Theming (skin & visual style)](./phase-04-theming.md) | Done |
| 5 | [Overrides & branding (head, favicon, title, footer)](./phase-05-overrides-branding.md) | Done |
| 6 | [Deploy verification & cleanup](./phase-06-deploy-verification-cleanup.md) | Done |

Phases are sequential: 1 → 2 → 3 → (4, 5 can overlap) → 6. Phase 4 (skin/theming) and
Phase 5 (overrides & branding) both depend on 1–3 but are independent of each other.

## Acceptance criteria (whole plan)

- [x] `bundle exec jekyll build` (via Docker `ruby:3.3`) succeeds with no polyglot/JtD residue.
- [x] Site renders with a TeXt skin; no Just-the-Docs CSS/layout remains.
- [x] EN and VI versions of every existing page exist, are reachable, and cross-link via a
      working language switcher.
- [x] Game→season→guide hierarchy is navigable via TeXt sidebar nav groups in both languages.
- [x] Vietnamese UI strings render (no raw English theme chrome on VI pages).
- [x] Per-game favicon preserved; `<title>` consciously changed to TeXt default & documented.
- [ ] GitHub Actions deploy builds green; custom domain + HTTPS intact. *(pending push — Docker
      build green locally; Actions/domain verified after merge to `main`.)*
- [x] `docs/` and `CLAUDE.md` updated to describe the TeXt stack; polyglot gotchas removed.

## Rollback

All work is on branch `feat/text-theme-migration`. Rollback = do not merge / `git checkout main`.
No destructive ops on `main`. `_site/` and `.jekyll-cache/` are build artifacts.

## Dependencies

No cross-plan dependencies (no other unfinished plans in `./plans/`).

## Open questions

None — all resolved in Validation Session 1 (see Validation Log).

## Validation Log

### Validation Session 1 (2026-07-13)

Interview outcomes (4 decisions confirmed):

1. **URL scheme (Phase 2/6):** Symmetric `/en/` + `/vi/`; root `/` redirects to `/en/`.
   Old EN URLs (`/lands-of-jail/…`) get redirects (Phase 6). *Accepted the SEO churn.*
2. **Skin (Phase 4):** Use TeXt built-in **`default`** skin only. **No custom brand skin**
   and **no light/dark switching plumbing now** — user will implement a theme switcher in
   future work. Phase 4 reduced to setting `text_skin: default` + migrating the two
   readability tweaks (line-height, table header tint). The indigo/teal brand palette is
   **not** reproduced in this migration.
3. **SEO plugin (Phase 1):** **Drop `jekyll-seo-tag`.** Rely on TeXt's built-in head/SEO
   plus custom hreflang (Phase 5).
4. **`<title>` scheme (Phase 5):** **Accept TeXt default titles.** Drop the custom bespoke
   `<title>` logic. Document the tab-title format change in `CLAUDE.md`. Favicon, footer,
   and hreflang are still ported.

### Verification Results
- Claims checked: plan file paths, TeXt gem name/version/deps, TeXt layouts, TeXt locale
  language list — all verified against the live repo/source during planning.
- Verified: all sampled | Failed: 0 | Unverified: 0
- Tier: Full (6 phases), but claims were source-verified at authoring time.

### Whole-Plan Consistency Sweep
- Reconciled Phase 4 (skin) and Phase 5 (title) down-scopes across `plan.md`, phase files,
  and success criteria. No custom-skin or custom-title references remain as required work.
- No contradictions outstanding. Plan is implementation-ready.

## Execution Log (2026-07-13)

All 6 phases implemented and verified via Docker `ruby:3.3` builds (exit 0, no
conflicts/Liquid errors). Notable implementation facts:

- **TeXt gem 2.2.6** installed; the gem ships no `_config.yml`, so config was modelled
  from the gem's `_data/variables.yml` + `assets/css/main.scss` (skin/highlight loaded
  from `text_skin`/`highlight_theme`; custom SCSS hook is `_sass/custom.scss`, custom head
  hook is `_includes/head/custom.html`, favicon hook `_includes/head/favicon.html`).
- **Sidebar depth confirmed 2-level** (`_includes/sidebar/toc.html`): a non-link group
  title + link children only, no 3rd-level recursion. Seasons were therefore flattened
  into their own nav groups (the plan's Phase 3 risk mitigation).
- **`vi` locale** works: `get-locale-string` keys off `page.lang` and falls back to `en`
  for missing keys, so `lang: vi` needs only a `vi` block in `_data/locale.yml`.
- **DRY choice:** shared page settings (`layout: article`, `show_title: false`, no blog
  chrome) live in `_config.yml` `defaults` rather than per-page front matter; home pages
  override `layout: page`. Titles come from each body `# H1`.
- **Code review** (DONE_WITH_CONCERNS): all acceptance criteria PASS; refless root
  redirect safe. Fixed the one Medium finding — header "Home" now routes to the current
  language's home (`/en/` or `/vi/`) and highlights active. Low findings (hidden home
  schema headline; hardcoded `/en//vi/` links under empty baseurl; unused
  `COPYRIGHT_DATES` key) accepted as by-design/cosmetic.
- **Remaining:** deploy verification (Actions build green + custom domain/HTTPS) happens
  after the branch is pushed/merged; Pages source must stay "GitHub Actions".
