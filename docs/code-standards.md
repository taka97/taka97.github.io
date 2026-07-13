# Code Standards — Game Guides

Conventions for content and the small amount of theme/config code.

## Content pages

- **Two files per page**, one `permalink`, distinguished by `lang`:
  `foo.md` (`lang: en`) and `foo.vi.md` (`lang: vi`). EN publishes at the permalink;
  VI publishes under `/vi/` + permalink.
- **Front matter** for hierarchy uses Just the Docs keys:
  `title`, `nav_order`, `parent`, `grandparent`, `has_children`, `lang`, `permalink`.
- `parent` / `grandparent` reference **titles in the same language as the file**
  (VI files point at VI titles).
- A game landing sets `has_children: true` and `permalink: /<game>/`.
- Keep permalinks stable — they are the shared key between EN/VI and the public URL.

### Adding a new game

1. Create `<game>/index.md` + `<game>/index.vi.md` with `title`, `nav_order`,
   `has_children: true`, `lang`, `permalink: /<game>/`.
2. Add guides beneath with `parent` / `grandparent` referencing same-language titles.
3. (Optional) per-game favicon: add a branch in `_includes/favicon.html` and drop
   `<slug>.ico` + `<slug>-180.png` into `public/icons/`.
4. Push to `main`; sidebar, search, and switcher update automatically.

## Liquid includes (theme overrides)

- Files in `_includes/` **override just-the-docs 0.10.1** includes of the same name.
  Keep the override header comment noting what changed and the theme version.
- Wrap any language-specific or asset URL that must **not** be rewritten by Polyglot in
  `{% static_href %}…{% endstatic_href %}` (switcher, hreflang, favicon paths).
- `head.html` disables the theme SEO title with `{% seo title=false %}`; custom `<title>`
  logic lives directly in that include — don't reintroduce the theme title.

## Styling (Sass)

- **Color variables** → `_sass/color_schemes/custom.scss` (only overridden vars; builds
  on the light base; activated by `color_scheme: custom`).
- **Everything else** → `_sass/custom/custom.scss` (loaded last, so it wins). Use theme
  mixins like `@include mq(md)` for breakpoints; mobile-first.
- Full palette/typography rules and rationale: [DESIGN.md](DESIGN.md). Update it when
  palette roles or components change.

## Config

- Do not remove `layout: default` under `defaults` — pages render unstyled without it.
- Windows/Polyglot invariants: `parallel_localization: false`, `sass.sourcemap: never`.
- Keep `docs/`, `plans/`, `README.md`, `Gemfile*`, `vendor` in `_config.yml` `exclude`.

## Git / commits

- Conventional Commits; **no AI references** in messages.
- Commit/push only when asked; branch first if on `main`.
- Never commit secrets or build artifacts (`_site/`, `.jekyll-cache/` are gitignored).

## File naming

- Content: lowercase kebab slugs matching the permalink (`satellite.md`).
- VI counterpart adds `.vi` before the extension (`satellite.vi.md`).
- Icons: `<game-slug>.ico` / `<game-slug>-180.png` in `public/icons/`.
