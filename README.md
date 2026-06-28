# Game Guides

Bilingual game-guides wiki hosted at **[games.taka97it.com](https://games.taka97it.com)**.

- English at the root, Vietnamese under `/vi/`.
- Built with [Jekyll](https://jekyllrb.com/) + the [Just the Docs](https://just-the-docs.com/) theme.
- Bilingual via [jekyll-polyglot](https://github.com/untra/polyglot).
- Auto-deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Content structure

Three levels: **game → season → guide**. Each game is a top-level section; related
content nests beneath it.

```
index.md                              Home portal
lands-of-jail/
  index.md                            Game landing (has_children)
  season-1/
    index.md                          Season (parent: Lands of Jail)
    satellite.md                      Guide (parent: Season 1, grandparent: Lands of Jail)
  season-2/
    index.md
    heroes.md
    robots.md
```

Every page exists twice, sharing one `permalink`, distinguished by `lang` front matter:
`foo.md` (`lang: en`) and `foo.vi.md` (`lang: vi`). A page with no `.vi.md` falls back
to English.

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

1. Create `<game>/index.md` (+ `<game>/index.vi.md`) with `title`, `nav_order`,
   `has_children: true`, `lang`, and `permalink: /<game>/`.
2. Add guide pages beneath it with `parent` / `grandparent` referencing the
   titles **in the same language** as the file.
3. Push to `main` — the sidebar, search, and language switcher update automatically.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs `bundle exec jekyll build` and
deploys to GitHub Pages. Repo **Settings → Pages → Source** must be **GitHub Actions**.
The `CNAME` file binds the custom domain `games.taka97it.com`.

## Project docs

- Design spec: `docs/superpowers/specs/2026-06-28-games-wiki-bilingual-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-28-games-wiki-bilingual.md`
