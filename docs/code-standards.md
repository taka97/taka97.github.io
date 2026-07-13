# Code Standards — Game Guides

Conventions for content and the small amount of theme/config code.

## Content pages

- **Two directories, one per language:** `contents/en/<path>.md` and `contents/vi/<path>.md`, each with
  `lang: en` / `lang: vi`.
- **Linking language pairs** via `ref:` (a slug shared by EN + VI versions). Example:
  `contents/en/lands-of-jail/index.md` and `contents/vi/lands-of-jail/index.md` both have `ref: loj-home`.
- **Required front matter:** `title`, `lang`, `permalink`, `ref`. Additional:
  - `layout: page` for home pages; `layout: article` for content (article is the default).
  - `sidebar: { nav: loj-en }` / `loj-vi` to opt into navigation.
  - `aside: { toc: true }` for long guides (adds table of contents sidebar).
  - `show_title: false` is set globally (page titles come from H1 in the body).
  - `comment: false`, `sharing: false`, `pageview: false` (wiki mode).
- Keep permalinks unique per language and stable — they are the public URL.

### Adding a new game

1. Create `en/<game>/index.md` + `vi/<game>/index.md` with:
   ```yaml
   ---
   title: <Game Name>  (EN/VI, same title or localized)
   lang: en / vi
   permalink: /en/<game>/ / /vi/<game>/
   ref: <game>-home
   sidebar: { nav: loj-en / loj-vi }
   aside: { toc: true }
   ---
   # <Game Name>
   ...
   ```
2. Add seasons & guides beneath, each with their own `en/<game>/season-X/<guide>.md`
   + `vi/<game>/season-X/<guide>.md`, sharing a `ref`.
3. Update `_data/navigation.yml`:
   - Add a season group under `loj-en` with guide children.
   - Mirror in `loj-vi` with Vietnamese titles.
4. (Optional) Per-game favicon: add `<game>.ico` + `<game>-180.png` to `public/icons/`
   and ensure `_includes/head/favicon.html` detects it (current logic checks URL path).
5. Push to `main`; sidebar, hreflang, and switcher update automatically.

## Liquid includes (TeXt theme hooks)

- Files in `_includes/` **hook into jekyll-text-theme** (`~> 2.2`). Check theme's default
  `_includes/` before adding/modifying.
- `header.html` — injects language switcher (EN · VI) in main nav right of search.
- `head/favicon.html` — per-game favicon selection (URL detection). Falls back to
  `game-console.ico` if no match.
- `head/custom.html` — hreflang alternates (linked by `ref` + opposite language).
- `footer.html` — copyright line with year from `_data/locale.yml`.

## Styling (Sass)

- **All custom styles** → `_sass/custom.scss` (TeXt's custom hook; loaded last, so it
  wins). Includes typography (body line-height), table styling (header tint), and
  language switcher CSS.
- Use theme mixins like `@include mq(md)` for breakpoints; mobile-first.
- Full palette/typography rationale: [DESIGN.md](DESIGN.md). Update it when component
  styles or spacing rules change.

## Config

- Do not remove `layout: article` + `show_title: false` under `defaults` — pages render
  unstyled or with automatic titles without them.
- Keep `docs/`, `plans/`, `README.md`, `Gemfile*`, `.text-gem-inspect/`, `vendor` in
  `_config.yml` `exclude`.
- Do not change `text_skin: default` or `highlight_theme: tomorrow-night-eighties`
  casually (affects all page styling).

## Git / commits

- Conventional Commits; **no AI references** in messages.
- Commit/push only when asked; branch first if on `main`.
- Never commit secrets or build artifacts (`_site/`, `.jekyll-cache/` are gitignored).

## File naming

- Content: lowercase kebab slugs matching the permalink segment (`satellite.md`).
- EN files live in `contents/en/<path>/` and VI files in `contents/vi/<path>/` (same name, different dir).
- Icons: `<game-slug>.ico` / `<game-slug>-180.png` in `public/icons/`.
