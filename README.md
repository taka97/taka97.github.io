# Game Guides

Bilingual game-guides wiki hosted at **[games.taka97it.com](https://games.taka97it.com)**.

- English under `/en/`, Vietnamese under `/vi/`; `/` redirects to `/en/`.
- Built with [Jekyll](https://jekyllrb.com/) + the
  [TeXt theme](https://github.com/kitian616/jekyll-TeXt-theme).
- Bilingual via TeXt's native i18n (`_data/locale.yml` + per-language directories).
- Auto-deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Content structure

Three levels: **game → season → guide**. Content lives under `contents/`, one directory
per language; the game/season/guide tree is expressed by each page's `permalink` and the
TeXt sidebar nav groups in `_data/navigation.yml` (not the source path).

```
index.html                              Root redirect -> /en/
contents/
  en/
    index.md                            Home portal (EN)
    lands-of-jail/
      index.md                          Game landing
      season-1/
        index.md                        Season
        satellite.md                    Guide
      season-2/
        index.md
        heroes.md
        robots.md
  vi/                                   Same tree, Vietnamese
    index.md
    lands-of-jail/…
```

Every page exists twice — once per language directory — sharing a `ref` slug that links
the two as language counterparts (used by the switcher and hreflang). Each page sets an
explicit `permalink`, a `lang`, and a `ref`. Because URLs come from `permalink`, the
`contents/` source tree can be reorganized without changing any URLs.

## Building locally

Ruby is **not** required locally — builds run in Docker (Docker Desktop must be running):

```sh
# Build into _site/
docker run --rm \
  -v "$PWD:/site" -v gh_pages_bundle:/usr/local/bundle \
  -w /site ruby:3.3 \
  bash -lc "bundle install && bundle exec jekyll build"

# Live preview at http://localhost:4000
docker run --rm -it -p 4000:4000 \
  -v "$PWD:/site" -v gh_pages_bundle:/usr/local/bundle \
  -w /site ruby:3.3 \
  bash -lc "bundle install && bundle exec jekyll serve --host 0.0.0.0"
```

> On Windows Git Bash, prefix the command with `MSYS_NO_PATHCONV=1` and use the
> absolute path (e.g. `-v "E:/Cloud/GitHub/taka97.github.io:/site"`).

## Adding a new game

1. Create `contents/en/<game>/index.md` and `contents/vi/<game>/index.md` with `title`,
   `lang`, `permalink: /en/<game>/` (resp. `/vi/<game>/`), and a shared `ref`.
2. Add guide pages beneath each, setting `sidebar: { nav: <game>-en }` /
   `<game>-vi` and (for long pages) `aside: { toc: true }`.
3. Define the `<game>-en` / `<game>-vi` sidebar groups in `_data/navigation.yml`
   (flatten seasons into their own groups — the TeXt sidebar renders two levels only).
4. Add a per-game favicon branch in `_includes/head/favicon.html` and drop
   `<slug>.ico` / `<slug>-180.png` into `public/icons/`.
5. Push to `main` — the sidebar, search, and language switcher update automatically.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs `bundle exec jekyll build` and
deploys to GitHub Pages. Repo **Settings → Pages → Source** must be **GitHub Actions**.
The `CNAME` file binds the custom domain `games.taka97it.com`.

## Project docs

- Working guide: `.claude/CLAUDE.md`
- Architecture: `docs/system-architecture.md`
