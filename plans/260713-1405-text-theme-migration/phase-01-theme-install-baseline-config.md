---
phase: 1
title: "Theme install & baseline config"
status: done
effort: ""
---

# Phase 1: Theme install & baseline config

## Overview

Swap the gem-based theme from `just-the-docs` to `jekyll-text-theme`, reconcile the
`Gemfile`, and rewrite `_config.yml` for TeXt. Goal: a build that produces a
TeXt-themed (if not yet i18n-correct) site so later phases have a working baseline.

## Requirements

- Functional: `bundle exec jekyll build` succeeds and pages render with TeXt chrome.
- Non-functional: no residual JtD or polyglot config keys; keep the existing GitHub
  Actions build (`bundle exec jekyll build`) working unchanged.

## Architecture

TeXt is a gem theme like JtD, so the install pattern is identical (`theme:` key + gem in
`Gemfile`). The differences are the config surface (TeXt uses `text_skin`,
`highlight_theme`, `search.provider`, `lang`) and the required runtime plugins
(`jekyll-paginate`, `jekyll-sitemap`, `jekyll-feed`, `jemoji`).

## Related Code Files

- Modify: `Gemfile` — remove `just-the-docs`, `jekyll-polyglot`; add `jekyll-text-theme`,
  `~> 2.2`. Reconcile plugins (see steps). Keep the Windows `tzinfo`/`wdm` platform block.
- Delete: `Gemfile.lock` (regenerate via bundle to avoid stale resolution).
- Modify: `_config.yml` — full rewrite of theme/plugin/i18n sections (see steps).
- Note: `_sass/color_schemes/custom.scss` and `_includes/*` (JtD overrides) are left in
  place this phase; removed/replaced in Phases 4–5 once TeXt equivalents exist.

## Implementation Steps

1. **Gemfile**
   - Remove `gem "just-the-docs", "0.10.1"` and `gem "jekyll-polyglot", "~> 1.8"`.
   - Add `gem "jekyll-text-theme", "~> 2.2"`.
   - Plugins: TeXt requires `jekyll-paginate`, `jekyll-sitemap`, `jekyll-feed`, `jemoji`
     (pulled transitively by the gem, but declare `jekyll-sitemap` explicitly since the
     site ships a sitemap). Drop `jekyll-include-cache` (JtD-specific).
     **Drop `jekyll-seo-tag`** (Validation Session 1) — TeXt has its own head/SEO; custom
     hreflang is re-emitted in Phase 5.
     <!-- Updated: Validation Session 1 - drop jekyll-seo-tag (decided, not optional) -->
2. **Regenerate lockfile** via Docker (Ruby not local):
   ```sh
   MSYS_NO_PATHCONV=1 docker run --rm \
     -v "E:/Cloud/GitHub/taka97.github.io:/site" \
     -v gh_pages_bundle:/usr/local/bundle -w /site ruby:3.3 \
     bash -lc "rm -f Gemfile.lock && bundle install"
   ```
3. **_config.yml rewrite** (baseline; i18n specifics land in Phase 2):
   - `theme: jekyll-text-theme`
   - `text_skin: default` (final skin decided in Phase 4)
   - `highlight_theme: tomorrow-night-eighties` (or `default`)
   - `lang: en` (site default language)
   - `search: { provider: default }` (TeXt built-in search replaces JtD lunr search)
   - Keep `title`, `description`, `url`, `baseurl`, `CNAME` handling.
   - **Remove** JtD keys: `color_scheme`, `search_enabled`, `back_to_top*`, and the
     `defaults → layout: default` block (TeXt sets layout per page/front matter).
   - **Remove** polyglot keys: `languages`, `default_lang`, `exclude_from_localization`,
     `parallel_localization`, and the `sass: { sourcemap: never }` polyglot workaround
     (re-add only if a Jekyll-4 sass error recurs).
   - Keep `exclude:` list; add `plans/`, `docs/` stay excluded.
4. **Smoke build** via the Docker command in `CLAUDE.md`. Expect a TeXt-styled but
   i18n-broken site (all pages treated as one language, JtD front matter ignored). That
   is acceptable for this phase.
5. Commit: `chore: swap just-the-docs for jekyll-text-theme gem and rewrite config`.

## Success Criteria

- [ ] `bundle exec jekyll build` completes with exit 0 under Docker `ruby:3.3`.
- [ ] `_site/` output shows TeXt HTML structure/CSS (not JtD).
- [ ] No `just-the-docs`, `jekyll-polyglot`, or `polyglot` reference remains in `Gemfile`
      or `_config.yml`.
- [ ] `Gemfile.lock` regenerated and resolves `jekyll-text-theme`.

## Risk Assessment

- **Gem dependency conflict** (Jekyll 4.3 vs TeXt's `< 5.0`): compatible, but `jemoji`/
  `jekyll-feed` versions may need loosening. Mitigation: let bundler resolve; pin only on
  failure.
- **Build breaks because JtD front matter (`parent`, `has_children`) is now meaningless**:
  expected — pages may render flat/ugly until Phase 3. Not a blocker for this phase's gate.
- **`jekyll-seo-tag` double meta**: resolved — plugin dropped (Validation Session 1).
