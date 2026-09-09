# Project Roadmap — Game Guides

This is a content-driven wiki; most of the roadmap is adding games, seasons, and
guides, with a small browser-local tools track for Lands of Jail.

## Shipped (migration completed 2026-07-13)

- **Migration from Just the Docs + jekyll-polyglot to jekyll-text-theme + native i18n.**
  Content moved to `contents/en/` + `contents/vi/` dirs; navigation via `_data/navigation.yml` (replaces
  front-matter hierarchy). URL scheme changed: EN now under `/en/`, VI under `/vi/`,
  root redirects to `/en/`.
- Bilingual (EN/VI) pages linked by `ref` slug + per-language nav groups.
- game → season → guide hierarchy (two-level sidebar per TeXt limitation; seasons are
  top-level groups).
- Full-text search, per-language sidebar nav, in-header language switcher.
- Custom typography + component styling (see [DESIGN.md](DESIGN.md)).
- Per-game favicons with `game-console` default fallback.
- hreflang alternates (TeXt-native, no polyglot).
- GitHub Actions push-to-deploy to Pages, custom domain, HTTPS.
- First game live: **Lands of Jail** (satellite guide; events; Season 2: heroes, robots).

## Lands of Jail tools

- **Ready to release:** Forticlad is the first browser-local calculator module in the
  broader Lands of Jail tools roadmap. Its target-driven Core calculator is implemented
  and validated locally; it becomes a shipped roadmap item when the change is committed
  and deployed.
- **Verified boundary:** FC/AFC building data through FC10 is transcribed from the
  cited independent reference; Medical Station stops at FC8 and prerequisites are
  resolved from the checked-in requirement graph in
  [`_data/lands_of_jail/forticlad.yml`](../_data/lands_of_jail/forticlad.yml).
  FC Lab, research, and other resource calculators remain out of scope.

## Known gaps / enhancements

| Item | Notes | Priority |
| --- | --- | --- |
| VI search UI strings not localized | Theme renders search placeholder in EN only | Low |
| Dark mode | Deferred (YAGNI) — plan in [DESIGN.md](DESIGN.md) | Low |
| Teal/amber accents in palette | Reserved for future callouts/badges | Low |

## Content backlog

- Expand Lands of Jail guides (more seasons / mechanics).
- Add further games as top-level sections:
  - Create `en/<game>/index.md` + `vi/<game>/index.md` (with matching `ref`).
  - Add seasons + guides under each.
  - Update `_data/navigation.yml` with new season groups (EN + VI).
  - (Optional) Add per-game favicon.
  - See [code-standards.md](code-standards.md#adding-a-new-game) for detailed steps.

## Maintenance watch

- **Theme bump:** on any `jekyll-text-theme` upgrade, re-verify the four custom
  `_includes` (`head/favicon.html`, `head/custom.html`, `header.html`, `footer.html`)
  against the new theme version.
- Keep `text_skin` + `highlight_theme` settings in `_config.yml` intentional (affects
  all pages).
- Monitor TeXt changelog for sidebar navigator depth limits (currently 2-level max).

## Non-goals

- Dynamic backend, accounts, comments — the site and its tools stay fully static.

## References

- [Project overview & PDR](project-overview-pdr.md)
- Original spec/plan under `docs/superpowers/`.
