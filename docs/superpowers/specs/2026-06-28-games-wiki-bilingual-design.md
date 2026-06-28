# Games Wiki (Bilingual) — Design Spec

Date: 2026-06-28
Status: Approved

## Purpose

A GitHub Pages site at `games.taka97it.com` hosting hierarchical game guides.
Each game is a top-level section; related content nests beneath it. The site is
bilingual: English at the root, Vietnamese mirrored under `/vi/`.

Initial content is a Notion export for one game, **Lands of Jail**, with guides
organized by season.

## Tech & Hosting

- **Generator:** Jekyll + **Just the Docs** theme via `remote_theme`
  (`just-the-docs/just-the-docs`). No theme files vendored.
- **i18n:** `jekyll-polyglot` plugin. Because Polyglot is not on the GitHub Pages
  plugin whitelist, the site is built with a **GitHub Actions** workflow rather
  than the classic branch build.
- **Build/deploy:** `.github/workflows/deploy.yml` runs `bundle exec jekyll build`
  (so Polyglot executes) and deploys to GitHub Pages. Pages source = "GitHub
  Actions".
- **Custom domain:** `CNAME` file = `games.taka97it.com`. A DNS `CNAME` record
  `games` → `taka97.github.io` is added at the registrar (one-time manual step,
  outside the repo).
- Repo `taka97.github.io` serves at the subdomain root, so games live at the root
  (no `/games/` prefix): `games.taka97it.com/lands-of-jail/`.

## Content Hierarchy

Three levels — the depth Just the Docs supports natively (page → child → grandchild):

```
Home                       (portal: links/cards to each game)
└─ Lands of Jail           (game landing: Gorilla ratios, builds, notes)
   ├─ Season 1
   │  └─ Satellite
   └─ Season 2
      ├─ Heroes
      └─ Robots
```

- Game = top-level page (`has_children`).
- Season = child of the game.
- Guide = grandchild (`parent: <Season>`, `grandparent: <Game>`).
- The game landing page holds its own content *and* its season children.

## Repo / File Layout

```
/
├── _config.yml
├── CNAME                       # games.taka97it.com
├── Gemfile                     # local preview only
├── .github/workflows/deploy.yml
├── _includes/                  # language switcher include (custom)
├── index.md / index.vi.md      # Home portal
└── lands-of-jail/
    ├── index.md / index.vi.md          # game landing
    ├── season-1/
    │   ├── index.md / index.vi.md
    │   └── satellite.md / satellite.vi.md
    └── season-2/
        ├── index.md / index.vi.md
        ├── heroes.md / heroes.vi.md
        └── robots.md / robots.vi.md
```

Resulting URLs (EN at root, VI under `/vi/`):

- `/` and `/vi/`
- `/lands-of-jail/` and `/vi/lands-of-jail/`
- `/lands-of-jail/season-1/satellite/` and `/vi/lands-of-jail/season-1/satellite/`
- `/lands-of-jail/season-2/heroes/`, `.../robots/` (+ `/vi/` mirrors)

## i18n Mechanics (Polyglot)

`_config.yml` additions:

```yaml
languages: ["en", "vi"]
default_lang: "en"
exclude_from_localization: ["CNAME", "assets", ".nojekyll"]
```

- Each page is **two files sharing one `permalink`**, distinguished by `lang`
  front matter: `foo.md` (`lang: en`) and `foo.vi.md` (`lang: vi`). Polyglot
  routes the `vi` build under `/vi/`.
- Pages lacking a `.vi.md` fall back to English — a missing translation never 404s.
- **Nav front matter** (`parent`/`grandparent` referenced by title) must be
  internally consistent **within each language**: EN files reference EN titles,
  VI files reference VI titles.
- **Language switcher:** Just the Docs has no built-in switcher. Add a small
  custom include (header snippet) that links the current page to its
  other-language URL using Polyglot helpers. This is the primary implementation
  risk; everything else is standard.

## Theme Config

- `title: "Game Guides"` (site name in sidebar header), a `description`.
- `remote_theme: just-the-docs/just-the-docs`.
- Enable: search, light/dark color scheme, back-to-top, footer.
- No plugins beyond `jekyll-polyglot` (+ what Just the Docs needs).

### Custom HTML `<title>`

Override the theme's default `PageTitle - SiteTitle` with a custom title include
(`_includes/head_custom.html` or an overridden title include) using Liquid logic
derived from the existing nav hierarchy:

| Page type | Identified by | `<title>` |
|-----------|---------------|-----------|
| Home | root index, `title_override` set | `Game Guides` |
| Game landing | top-level, `has_children`, no `parent` | `<Game> - <Guides-suffix>` |
| Season / Guide | has `parent`; game = `grandparent` else `parent` | `<Game> - <page title>` |

- Game name = `page.grandparent` if present, else `page.parent`.
- Only the home page needs extra front matter: `title_override: "Game Guides"`
  (and its VI equivalent).
- **Guides-suffix is localized:** EN `"Guides"`, VI `"Hướng dẫn"`.
- jekyll-seo-tag title is set to match (or disabled) so the computed title is not
  overridden.

Examples: `Lands of Jail - Guides`, `Lands of Jail - Season 1`,
`Lands of Jail - Satellite`.

## Content Migration

- Convert the 4 Notion `.md` exports into Jekyll pages: strip UUID filenames, add
  Just-the-Docs front matter (`title`, `parent`/`grandparent`, `nav_order`,
  `has_children`, `lang`, `permalink`).
- **Rewrite Notion `app.notion.com` links** (in the game page's "Guides" section)
  to internal site links, e.g. `/lands-of-jail/season-1/satellite/`.
- Drop Notion property cruft (`Trạng Thái: Đang Chơi`, `Season: ...`).
- **English files** = guides cleaned up in English. **`.vi.md` files** = Vietnamese
  translations. Mixed VN/EN bits in the source are sorted into the correct
  language version. Content volume is small (4 pages), translated during
  implementation.

Source data: `D:\working\*.zip` (nested Notion ExportBlock zips → markdown).

## "Add a New Game" Workflow

1. Create `/<new-game>/index.md` (+ `index.vi.md`) with `title`, `has_children`,
   `nav_order`.
2. Drop guide `.md` (+ `.vi.md`) files beneath it with `parent`/`grandparent`.
3. Push. Sidebar, search, and language switcher update automatically.

## Out of Scope (YAGNI)

- Custom branding/logo/favicon beyond theme defaults.
- More than two languages.
- Comments, analytics, or per-game custom layouts.

## Decisions Baked In

- Seasons kept as a nav level (Game → Season → Guide), matching source structure.
- Notion status/property lines dropped.
- English is the default/root language; Vietnamese under `/vi/`.
