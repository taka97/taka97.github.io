# Codebase Summary — Game Guides

Static Jekyll site. No application code — content is Markdown, behavior is theme +
config + small Liquid include overrides.

## Layout

```
_config.yml                 Site + Polyglot + Just the Docs config
Gemfile / Gemfile.lock       Ruby deps (jekyll, just-the-docs 0.10.1, polyglot, seo-tag, include-cache)
CNAME                        Custom domain (games.taka97it.com)
favicon.ico                  Root favicon

.github/workflows/deploy.yml GitHub Actions: build + deploy to Pages

_includes/                   Liquid overrides of just-the-docs 0.10.1 includes
  head.html                  Custom <title> logic + hreflang + {% seo title=false %}
  favicon.html               Per-game favicon selection (default game-console)
  header_custom.html         Language switcher (in main header)
  nav_footer_custom.html     Sidebar footer (copyright)

_sass/
  color_schemes/custom.scss  Theme color-variable overrides (activated by color_scheme: custom)
  custom/custom.scss         Non-variable CSS tweaks (loaded last, wins)

public/icons/                Favicons per game + default (.ico + -180.png)

index.md / index.vi.md       Home portal (EN / VI)
lands-of-jail/               A game section
  index.md(.vi)              Game landing (has_children)
  season-1/
    index.md(.vi)            Season (parent: Lands of Jail)
    satellite.md(.vi)        Guide (parent: Season 1, grandparent: Lands of Jail)
  season-2/
    index.md(.vi), heroes, robots

docs/                        Project documentation (this set + DESIGN.md + superpowers/)
```

## Content model

- **Hierarchy** = Just the Docs nav front matter: `parent`, `grandparent`,
  `has_children`, `nav_order`. Three levels: game → season → guide.
- **Bilingual** = two files per page sharing one `permalink`, distinguished by `lang`
  (`en` / `vi`). `parent`/`grandparent` reference page **titles in the same language**
  as the file. No `.vi.md` ⇒ falls back to English.
- **Layout** applied globally via `defaults` in `_config.yml` (`layout: default`).

## Where behavior lives

| Concern | Location |
| --- | --- |
| Nav order & hierarchy | Front matter on each `index.md`/guide |
| Language routing (`/vi/` prefix) | jekyll-polyglot + `_config.yml` `languages` |
| `<title>` per page/lang | `_includes/head.html` |
| hreflang alternates | `_includes/head.html` (wrapped in `static_href`) |
| Language switcher UI | `_includes/header_custom.html` + `.lang-switcher` in `custom.scss` |
| Favicon per game | `_includes/favicon.html` + `public/icons/` |
| Colors / typography | `_sass/color_schemes/custom.scss`, `_sass/custom/custom.scss` |

## Build artifacts (not committed)

`_site/`, `.jekyll-cache/`, `vendor/`, `node_modules/` — gitignored.

## Notable gotchas

- Switcher & hreflang URLs are wrapped in Polyglot `{% static_href %}` to bypass its
  automatic href language-rewriting.
- `_config.yml` excludes `docs/`, `plans/`, `README.md`, `Gemfile*`, `vendor` from the
  build so project docs never publish.
- See [code-standards.md](code-standards.md) for conventions and
  [system-architecture.md](system-architecture.md) for the build/deploy flow.
