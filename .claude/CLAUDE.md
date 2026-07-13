# CLAUDE.md

Guidance for working in this repository.

## What this is

A bilingual game-guides wiki served at `games.taka97it.com` (EN under `/en/`, VI
under `/vi/`, with `/` redirecting to `/en/`).
Stack: **Jekyll 4 + jekyll-TeXt-theme (gem 2.2.x)** with **TeXt-native i18n** for the
EN/VI bilingual site, deployed to GitHub Pages via GitHub Actions on push to `main`.

## Building / previewing

**Ruby is not installed locally** (neither Windows nor WSL). Build only via Docker
(Docker Desktop must be running). From Windows Git Bash:

```sh
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "E:/Cloud/GitHub/taka97.github.io:/site" \
  -v gh_pages_bundle:/usr/local/bundle \
  -w /site ruby:3.3 \
  bash -lc "bundle exec jekyll build"
```

`_site/` is written to disk for inspection. Add `-p 4000:4000` and
`jekyll serve --host 0.0.0.0` to preview. After changing the `Gemfile`, run
`rm -f Gemfile.lock && bundle install` inside the same container first.

## Content conventions

- Hierarchy is **game → season → guide**, expressed through the URL/directory tree
  and the TeXt sidebar nav groups in `_data/navigation.yml` — not front-matter parents.
- Content lives under `contents/`, one directory per language, sharing a `ref` slug:
  `contents/en/<path>.md` (`lang: en`) and `contents/vi/<path>.md` (`lang: vi`). Output
  URLs come from each page's explicit `permalink`, not the source path, so the `contents/`
  tree can move freely. The `ref` links the two as counterparts (switcher/hreflang).
- Each page sets an explicit `permalink` under `/en/…` or `/vi/…`, a `lang`, a `ref`,
  and (for guide pages) `sidebar: { nav: loj-en }` / `loj-vi` plus `aside: { toc: true }`.
- Page titles come from each page's body `# H1`; TeXt's own article `<h1>` is suppressed
  globally via `show_title: false` in `_config.yml` `defaults`.

## Theme customizations (do not break)

- `_config.yml` `defaults` — applies `layout: article` + wiki settings
  (`show_title: false`, no comments/sharing/pageview) to all pages; home pages
  override `layout: page`.
- `_data/locale.yml` — UI-string locales. TeXt does **not** ship Vietnamese, so a `vi`
  block is defined here; `get-locale-string` falls back to `en` for any missing key.
- `_data/navigation.yml` — header nav + `loj-en` / `loj-vi` sidebar groups. TeXt's
  sidebar navigator renders **only two levels** (a non-link group title + its link
  children), so the game/season/guide tree is flattened: each season is its own group.
- `_includes/header.html` — overrides the TeXt header to add the EN↔VI language switcher
  (matches the counterpart by shared `ref` + opposite `lang`).
- `_includes/head/favicon.html` — per-game favicon (default `game-console`, switches to
  `lands-of-jail` when the URL contains `/lands-of-jail`). Assets in `public/icons/`.
- `_includes/head/custom.html` — hreflang alternates (EN/VI/x-default) via the `ref` pair.
- `_includes/footer.html` — simple `© <year> <site.title>` copyright.
- `_sass/custom.scss` — overrides TeXt's empty custom-style hook (imported last by
  `assets/css/main.scss`): body line-height, stat/loot table header tint, switcher styling.

## Tab-title format

Titles use **TeXt's default** scheme: `<page title> - Game Guides` (home is just
`Game Guides`). The old Just-the-Docs bespoke `<title>` logic was dropped in the TeXt
migration.

## Deploy

Push to `main` → Actions builds (`bundle exec jekyll build`) and deploys. Pages source
must be **GitHub Actions** (Settings → Pages). `CNAME` binds the custom domain. Site is
live with HTTPS enforced. `/` redirects to `/en/`.

## Conventions

- Conventional Commits, no AI references in messages.
- Commit/push only when asked; branch first if on `main`.
- Plans live in `plans/`, project docs in `docs/`.
