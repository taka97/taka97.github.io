# System Architecture — Game Guides

Static-site architecture: Markdown + Jekyll theme → static HTML on GitHub Pages. No
runtime server, database, or API.

## Stack

| Layer | Choice |
| --- | --- |
| Generator | Jekyll 4 (`~> 4.3`) |
| Theme | jekyll-text-theme (gem `~> 2.2`) |
| i18n | TeXt-native (no polyglot); UI strings in `_data/locale.yml` |
| Plugins | jekyll-feed, jekyll-paginate, jekyll-sitemap, jemoji |
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
   │     └─ Renders EN (/en/) + VI (/vi/) + root redirect to /en/
   ├─ upload-pages-artifact  (_site)
   └─ deploy-pages  → GitHub Pages (HTTPS, custom domain)
```

- Trigger: push to `main` (or manual `workflow_dispatch`).
- Concurrency `group: pages`, `cancel-in-progress: true` — one live deploy.
- Pages **Source must be "GitHub Actions"** (not legacy branch build).

## Rendering pipeline (per build)

1. Jekyll reads `_config.yml`; `defaults` apply `layout: article` + `show_title: false`
   to every page (home pages override `layout: page`).
2. Content in `contents/en/` and `contents/vi/` directories; each page has a `lang` and `ref` (slug)
   linking its language counterpart. TeXt navigates by `ref`, not by file path.
3. TeXt theme renders navigation from `_data/navigation.yml` (header nav + per-language
   sidebar groups `loj-en` / `loj-vi`). Sidebar navigator renders two levels only (group
   title + children); game→season→guide hierarchy is flattened (each season is a group).
4. `_includes` hooks (`header.html`, `head/favicon.html`, `head/custom.html`, `footer.html`)
   inject the language switcher, per-game favicons, hreflang tags, and copyright.
5. Sass compiles `_sass/custom.scss` (typography + component tweaks); theme skin
   (`text_skin: default`) and highlight theme applied from `_config.yml`.

## Component map

```
                 ┌──────────────────────────┐
  Content .md ──▶│  Jekyll + TeXt-theme     │──▶ _site/
  (en/, vi/      └────────────┬─────────────┘
   dirs, ref-linked)          │
             ┌────────────────┼──────────────────┐
             ▼                ▼                  ▼
      _data/navigation   _includes/*         _sass/custom.scss
      (sidebar groups,    (switcher,          (typography,
       header nav)        favicon, hreflang)  tables, layout)
```

## Key architectural decisions

- **Two content directories, native language routing.** `contents/en/<path>.md` and
  `contents/vi/<path>.md` with shared `ref` slug. TeXt's i18n handles language detection; no
  polyglot needed. Cleaner than one source tree + plugin overhead.
- **Navigation as data.** `_data/navigation.yml` defines sidebar groups and header nav;
  no front matter hierarchy keys needed. Easier to reorganize, no broken references.
- **Theme hooks for branding.** Custom behavior lives in a few `_includes` + one Sass
  file layered on the gem — upgrades stay tractable (re-verify hooks on theme bump).
- **Two-level sidebar, flattened hierarchy.** TeXt's navigator renders only two levels.
  The game→season→guide tree is expressed as: season-level groups, each with guide
  children. Game title is a non-link section header.
- **Zero-ops publishing.** Push-to-deploy; no build step for the author beyond writing
  Markdown.
- **Local builds in Docker** because Ruby isn't installed on the dev machine.

## Data flow at request time

None — every URL is a pre-rendered static file served by GitHub Pages CDN. Root `/`
redirects to `/en/` via a meta-refresh `index.html`. Search runs client-side (Lunr-like
index shipped with the theme).

## Related

- [Deployment guide](deployment-guide.md) · [Codebase summary](codebase-summary.md) ·
  [Design system](DESIGN.md)
