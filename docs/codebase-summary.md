# Codebase Summary — Game Guides

Static Jekyll site. No application code — content is Markdown, behavior is theme +
config + small Liquid include overrides.

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

_includes/
  head/
    favicon.html             Per-game favicon selection (default game-console)
    custom.html              hreflang alternates + language pair linking
  header.html                Language switcher (EN · VI in main header)
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
      season-1/
        index.md             Season (lang: en, ref: loj-s1)
        satellite.md         Guide (lang: en, ref: loj-s1-satellite)
      season-2/
        index.md, heroes.md, robots.md
  vi/                        Vietnamese content (same structure, lang: vi)

docs/                        Project documentation (this set + DESIGN.md + superpowers/)
```

## Content model

- **Two languages per page**, in separate directories (`contents/en/`, `contents/vi/`), linked by `ref`
  slug. Each file has `lang` (en/vi), `permalink` (unique per language), and `ref`
  (shared pair identifier).
- **Hierarchy** from `_data/navigation.yml` (not front matter). Sidebar groups are
  defined as `loj-en` / `loj-vi`; pages opt in with `sidebar: { nav: loj-en }`.
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
| Typography + components | `_sass/custom.scss` |

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
