# CLAUDE.md

Guidance for working in this repository.

## What this is

A bilingual game-guides wiki served at `games.taka97it.com` (EN at root, VI under `/vi/`).
Stack: **Jekyll 4 + Just the Docs (gem 0.10.1) + jekyll-polyglot**, deployed to GitHub
Pages via GitHub Actions on push to `main`.

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
`jekyll serve --host 0.0.0.0` to preview.

## Content conventions

- Hierarchy is **game → season → guide** using Just the Docs nav front matter
  (`parent`, `grandparent`, `has_children`, `nav_order`).
- Every page is two files sharing one `permalink`, distinguished by `lang`:
  `foo.md` (`lang: en`) and `foo.vi.md` (`lang: vi`).
- `parent`/`grandparent` reference page **titles in the same language** as the file.
- The site layout applies via `defaults` in `_config.yml` (`layout: default`) — do not
  remove it, or pages render without the theme.

## Theme customizations (do not break)

- `_includes/head.html` — overrides the theme's head: custom `<title>` scheme
  (Home → `Game Guides`; game landing → `<Game> - Guides` / VI `Hướng dẫn`;
  season/guide → `<Game> - <page title>`), plus hreflang tags. Uses `{% seo title=false %}`.
- `_includes/nav_footer_custom.html` — sidebar language switcher.
- Switcher and hreflang URLs are wrapped in Polyglot's `{% static_href %}` to bypass
  its automatic href rewriting.

## Polyglot gotchas

- `parallel_localization: false` is required (Windows; uses `fork` otherwise).
- `sass.sourcemap: never` avoids a Jekyll 4 + Polyglot issue.

## Deploy

Push to `main` → Actions builds and deploys. Pages source must be **GitHub Actions**
(Settings → Pages). `CNAME` binds the custom domain. Site is live with HTTPS enforced.

## Conventions

- Conventional Commits, no AI references in messages.
- Commit/push only when asked; branch first if on `main`.
- Plans live in `docs/superpowers/plans/`, specs in `docs/superpowers/specs/`.
