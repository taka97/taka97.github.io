# Project Overview & PDR — Game Guides

## What it is

A bilingual (English / Vietnamese) game-guides wiki published at
**[games.taka97it.com](https://games.taka97it.com)**. Static site built with Jekyll 4
and the Just the Docs theme, made bilingual with jekyll-polyglot, auto-deployed to
GitHub Pages.

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
- Content hierarchy: **game → season → guide** via Just the Docs nav front matter.
- Two languages per page (`foo.md` / `foo.vi.md`) sharing one `permalink`; EN at root,
  VI under `/vi/`. Missing VI page falls back to EN.
- Full-text search, sidebar navigation, in-header language switcher, per-game favicons.
- Custom color scheme / typography (see [DESIGN.md](DESIGN.md)).

**Out of scope (current)**
- Dark mode (documented as deferred in [DESIGN.md](DESIGN.md)).
- User accounts, comments, dynamic backend — the site is fully static.
- Localized search placeholder for VI (known gap).

## Key requirements

| # | Requirement | Status |
| --- | --- | --- |
| R1 | Bilingual pages from one source tree, shared permalink | Done |
| R2 | game → season → guide hierarchy in sidebar + search | Done |
| R3 | Language switcher preserving current page URL | Done |
| R4 | Custom, accessible (WCAG AA) color scheme | Done |
| R5 | Per-game favicon with a default fallback | Done |
| R6 | Push-to-deploy via GitHub Actions to Pages + custom domain | Done |
| R7 | Correct `<title>` and hreflang per page/language | Done |

## Constraints

- **No local Ruby** (Windows/WSL): all local builds run in Docker `ruby:3.3`.
- **Polyglot on Windows:** `parallel_localization: false` (avoids `fork`).
- **Jekyll 4 + Polyglot:** `sass.sourcemap: never` to avoid a build issue.
- Theme is pinned: `just-the-docs 0.10.1`. Head/favicon includes override that exact
  version — re-verify overrides on any theme bump.

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
