# Codebase Summary — Game Guides

Static Jekyll site. Most behavior is content, theme configuration, and small Liquid
include overrides; the Lands of Jail planners (Forticlad, Tomes & Collections,
Robots & Satellites, Hero Equipment) add browser-only ES modules and IndexedDB profile
storage.

## Layout

```
_config.yml                 Site + TeXt-theme config
Gemfile / Gemfile.lock       Ruby deps (jekyll ~> 4.3, jekyll-text-theme ~> 2.2,
                             plus jekyll-feed/sitemap/paginate, jemoji)
CNAME                        Custom domain (games.taka97it.com)
favicon.ico                  Root favicon

.github/workflows/deploy.yml GitHub Actions: build + deploy to Pages

_data/
  navigation.yml             Header nav + per-language sidebar groups (loj-en, loj-vi)
  locale.yml                 UI strings for en + vi (TeXt native i18n)
  terms.yml                  Shared game terms rendered by `_includes/term.html`
  lands_of_jail/
    forticlad.yml            Verified Base-step/Core costs for the 8 planner buildings
    forticlad_research.yml   Verified T11 Research tree (3 troops x 9 tracks, Hyperalloy)
    tomes_collections.yml    Verified Tome (13 levels) + Collection (43 levels) cost tables, caps
    robots_satellites.yml    Verified Robot (11 levels) + Satellite R/SR/SSR tier cost curves, caps
    hero_equipment.yml       Verified shared Rarity (21) + Mastery (21) cost tables, 3 troops x 4 slots

_includes/
  head/
    favicon.html             Per-game favicon selection (default game-console)
    custom.html              hreflang alternates + language pair linking
  header.html                Language switcher (EN · VI in main header)
  term.html                  Renders shared terms from `_data/terms.yml`
  footer.html                Copyright + year

_sass/
  custom.scss                Typography + component CSS (body line-height,
                             table header tint, switcher styling)

public/icons/                Favicons per game + default (.ico + -180.png)

index.html                   Root redirect (meta-refresh to /en/)

contents/                    Bilingual content (source path only; URLs come from permalink)
  en/                        English content
    index.md                 Home portal (lang: en, ref: home, layout: page)
    lands-of-jail/
      index.md               Game landing (lang: en, ref: loj-home)
      planners/forticlad.md  Forticlad Core Planner (matched EN/VI page)
      planners/tomes-collections.md  Tomes & Collections Planner (matched EN/VI page)
      planners/robots-satellites.md  Robots & Satellites Planner (matched EN/VI page)
      planners/hero-equipment.md  Hero Equipment Planner (matched EN/VI page)
      tools/settings.md      Shared browser-local profile settings (matched EN/VI page)
      satellite.md           Game-level guide (lang: en, ref: loj-satellite)
      events/
        migration-operation.md  Event guide (lang: en, ref: loj-event-migration-operation)
      season-1/
        index.md             Season (lang: en, ref: loj-s1)
      season-2/
        index.md, heroes.md, robots.md
  vi/                        Vietnamese content (same structure, lang: vi)

assets/                      Static assets
  js/planners/               Browser-only calculation, storage, planner, and settings modules
  images/
    lands-of-jail/
      events/
        migration-operation/   Screenshots used by the event guide

docs/                        Project documentation (this set + DESIGN.md + superpowers/)
```

## Content model

- **Two languages per page**, in separate directories (`contents/en/`, `contents/vi/`), linked by `ref`
  slug. Each file has `lang` (en/vi), `permalink` (unique per language), and `ref`
  (shared pair identifier).
- **Hierarchy** from `_data/navigation.yml` (not front matter). Sidebar groups are
  defined as `loj-en` / `loj-vi`; pages opt in with `sidebar: { nav: loj-en }`.
  Guides can live at the game level or under a season depending on where they fit.
- **Layout** applied globally via `defaults` in `_config.yml` (`layout: article` +
  `show_title: false`); home pages override to `layout: page`.
- **No language fallback needed** — VI and EN maintain separate nav + content.

## Where behavior lives

| Concern | Location |
| --- | --- |
| Sidebar nav structure | `_data/navigation.yml` (two-level groups per language) |
| Header nav | `_data/navigation.yml` (`header` section) |
| Language routing & linking | `contents/en/` + `contents/vi/` dirs + `ref` slug pairing |
| Language pair detection | `_includes/head/custom.html` + `_includes/header.html` |
| Language switcher UI | `_includes/header.html` + `.lang-switcher` in `custom.scss` |
| hreflang alternates | `_includes/head/custom.html` (fetches pair by ref + lang) |
| Favicon per game | `_includes/head/favicon.html` + `public/icons/` |
| UI strings (en/vi) | `_data/locale.yml` (TeXt native) |
| Shared game terms | `_data/terms.yml` + `_includes/term.html` |
| Typography + components | `_sass/custom.scss` |
| Forticlad building calculation + rendering | `assets/js/planners/planner-core.js`, `forticlad.js` |
| Forticlad T11 research calculation + rendering | `assets/js/planners/research-core.js`, `research.js` |
| Tomes & Collections calculation + rendering | `assets/js/planners/tomes-core.js`, `tomes.js` |
| Robots & Satellites calculation + rendering | `assets/js/planners/robots-satellites-core.js`, `robots-satellites.js` |
| Hero Equipment calculation + rendering | `assets/js/planners/hero-equipment-core.js`, `hero-equipment.js` |
| Shared planner table rendering | `assets/js/planners/table-helpers.js` |
| Shared planner block styling (`.loj-planner__*`) | `_sass/custom.scss` (shared by Forticlad, Tomes & Collections, Robots & Satellites, and Hero Equipment; reuse for future tool migrations) |
| Shared browser-local profiles | `assets/js/planners/storage.js`, `profile-settings.js` |
| Forticlad source data | `_data/lands_of_jail/forticlad.yml`, `forticlad_research.yml` |
| Tomes & Collections source data | `_data/lands_of_jail/tomes_collections.yml` |
| Robots & Satellites source data | `_data/lands_of_jail/robots_satellites.yml` |
| Hero Equipment source data | `_data/lands_of_jail/hero_equipment.yml` |

## Build artifacts (not committed)

`_site/`, `.jekyll-cache/`, `.text-gem-inspect/`, `vendor/` — gitignored.

## Notable gotchas

- Content must use `ref:` + language pair linking (no fallback to EN). Every page has
  both EN and VI versions (or the VI switcher will 404).
- TeXt's sidebar navigator renders only **two levels** (group title + children), so the
  three-level game→season→guide hierarchy is flattened: seasons are top-level groups
  with guides as children. Game overview is the group title (non-link).
- `_config.yml` excludes `docs/`, `plans/`, `README.md`, `Gemfile*`, `.text-gem-inspect/`,
  `vendor` from the build so project docs never publish.
- Per-game favicon selection in `_includes/head/favicon.html` reads the request URL to
  detect the game (e.g., `/lands-of-jail` → loads `lands-of-jail.ico`).
- See [code-standards.md](code-standards.md) for conventions and
  [system-architecture.md](system-architecture.md) for the build/deploy flow.
