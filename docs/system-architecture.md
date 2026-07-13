# System Architecture — Game Guides

Static-site architecture: Markdown + Jekyll theme + Polyglot → static HTML on GitHub
Pages. No runtime server, database, or API.

## Stack

| Layer | Choice |
| --- | --- |
| Generator | Jekyll 4 (`~> 4.3`) |
| Theme | Just the Docs (gem `0.10.1`) |
| i18n | jekyll-polyglot (`~> 1.8`) |
| SEO / meta | jekyll-seo-tag |
| Include cache | jekyll-include-cache |
| Host | GitHub Pages (custom domain via `CNAME`) |
| CI/CD | GitHub Actions |
| Local build | Docker `ruby:3.3` (no local Ruby) |

## Build & deploy flow

```
push to main
   │
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   ├─ actions/checkout
   ├─ ruby/setup-ruby (3.3, bundler-cache)
   ├─ bundle exec jekyll build   (JEKYLL_ENV=production)
   │     └─ Polyglot renders EN (root) + VI (/vi/) from one source tree
   ├─ upload-pages-artifact  (_site)
   └─ deploy-pages  → GitHub Pages (HTTPS, custom domain)
```

- Trigger: push to `main` (or manual `workflow_dispatch`).
- Concurrency `group: pages`, `cancel-in-progress: true` — one live deploy.
- Pages **Source must be "GitHub Actions"** (not legacy branch build).

## Rendering pipeline (per build)

1. Jekyll reads `_config.yml`; `defaults` apply `layout: default` to every page.
2. Polyglot iterates `languages: [en, vi]`, building each language pass. `default_lang`
   (en) publishes at root; others under `/<lang>/`. `parallel_localization: false`
   (no `fork` on Windows).
3. Just the Docs builds the sidebar from `parent`/`grandparent`/`nav_order` front
   matter and generates the Lunr search index.
4. `_includes` overrides inject custom `<title>`, hreflang, favicon, and the language
   switcher. `static_href` blocks stop Polyglot rewriting those specific URLs.
5. Sass compiles `custom` color scheme + `custom/custom.scss` (`sourcemap: never`).

## Component map

```
                 ┌─────────────────────────┐
  Content .md ──▶│  Jekyll + Polyglot core │──▶ _site/  (EN at /, VI at /vi/)
  (game/season/  └───────────┬─────────────┘
   guide, x2 lang)           │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
      Just the Docs    _includes/*      _sass/*
      (nav, search,    (title, hreflang, (colors, layout
       layout)          favicon, switcher) tweaks)
```

## Key architectural decisions

- **One source tree, two languages.** Shared `permalink` is the join key; VI missing ⇒
  EN fallback. Avoids duplicated trees and broken cross-links.
- **Theme by override, not fork.** Custom behavior lives in a few `_includes` + two
  Sass files layered on the pinned gem — upgrades stay tractable (re-verify overrides
  against the new theme version on bump).
- **Zero-ops publishing.** Push-to-deploy; no build step for the author beyond writing
  Markdown.
- **Local builds in Docker** because Ruby isn't installed on the dev machine.

## Data flow at request time

None — every URL is a pre-rendered static file served by GitHub Pages CDN. Search runs
client-side (Lunr index shipped with the site).

## Related

- [Deployment guide](deployment-guide.md) · [Codebase summary](codebase-summary.md) ·
  [Design system](DESIGN.md)
