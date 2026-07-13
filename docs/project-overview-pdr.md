# Project Overview & PDR — Game Guides

## What it is

A bilingual (English / Vietnamese) game-guides wiki published at
**[games.taka97it.com](https://games.taka97it.com)**. Static site built with Jekyll 4
and jekyll-text-theme (gem ~> 2.2), with native i18n, auto-deployed to GitHub Pages.

## Problem & goal

Game strategy content (stats, loot tables, walkthroughs) is easier to maintain and
read as a structured, searchable wiki than as scattered posts. Goal: a fast, calm,
searchable reference that serves the same content in two languages from one source
tree, with zero-ops publishing (push to `main`).

## Audience

- **Readers:** players looking up guides in EN or VI.
- **Maintainer:** single author adding games/seasons/guides as Markdown.

## Scope

**In scope**
- Content hierarchy: **game → season → guide** (expressed as two-level sidebar groups
  per [DESIGN.md](DESIGN.md)).
- Two languages per page (`contents/en/<path>.md` / `contents/vi/<path>.md`) linked by shared `ref` slug;
  EN under `/en/`, VI under `/vi/`, root redirects to `/en/`.
- Full-text search, sidebar navigation (per-language), in-header language switcher,
  per-game favicons.
- Custom typography and component styling (see [DESIGN.md](DESIGN.md)).

**Out of scope (current)**
- Dark mode (documented as deferred in [DESIGN.md](DESIGN.md)).
- User accounts, comments, dynamic backend — the site is fully static.
- Localized search UI strings for VI (theme limitation; noted in DESIGN.md).

## Key requirements

| # | Requirement | Status |
| --- | --- | --- |
| R1 | Bilingual pages (EN + VI) with language pair linking via ref slug | Done |
| R2 | game → season → guide hierarchy in per-language sidebars | Done |
| R3 | Language switcher finding correct counterpart page | Done |
| R4 | Custom, accessible (WCAG AA) typography and components | Done |
| R5 | Per-game favicon with `game-console` default fallback | Done |
| R6 | Push-to-deploy via GitHub Actions to Pages + custom domain + HTTPS | Done |
| R7 | Correct hreflang alternates per page/language | Done |
| R8 | Root `/` redirects to `/en/` (initial language choice) | Done |

## Constraints

- **No local Ruby** (Windows/WSL): all local builds run in Docker `ruby:3.3`.
- **Theme pinned:** `jekyll-text-theme ~> 2.2`. Custom `_includes` hooks (`head/`,
  `header`, `footer`) target that version — re-verify on theme bump.
- **Two-level sidebar limitation:** TeXt's navigator renders only groups + children
  (not nested groups). Three-level game→season→guide is flattened: seasons are
  top-level groups.

## Success criteria

- Every guide reachable in both languages; switcher never 404s a translated page.
- Build is green on GitHub Actions; site served over HTTPS at the custom domain.
- Adding a game/guide is pure Markdown + front matter, no code changes.

## Related docs

- [System architecture](system-architecture.md)
- [Codebase summary](codebase-summary.md)
- [Code standards](code-standards.md)
- [Deployment guide](deployment-guide.md)
- [Design system](DESIGN.md)
- [Roadmap](project-roadmap.md)
- Original spec: `docs/superpowers/specs/2026-06-28-games-wiki-bilingual-design.md`
- Original plan: `docs/superpowers/plans/2026-06-28-games-wiki-bilingual.md`
