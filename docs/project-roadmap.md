# Project Roadmap — Game Guides

Status snapshot as of 2026-07-13. This is a content-driven wiki; most "roadmap" is
adding games/seasons/guides, with a few known technical enhancements.

## Shipped

- Bilingual (EN/VI) site from one source tree, shared permalinks, EN→ fallback.
- game → season → guide hierarchy (Just the Docs nav front matter).
- Full-text search, sidebar nav, in-header language switcher.
- Custom color scheme + typography ([DESIGN.md](DESIGN.md)).
- Per-game favicons with `game-console` default fallback.
- Correct per-page/per-language `<title>` + hreflang alternates.
- GitHub Actions push-to-deploy to Pages, custom domain, HTTPS.
- First game live: **Lands of Jail** (Season 1: satellite; Season 2: heroes, robots).

## Known gaps / enhancements

| Item | Notes | Priority |
| --- | --- | --- |
| VI search placeholder not localized | Shows "Search Game Guides" on VI side | Low |
| Dark mode | Deferred (YAGNI) — plan in [DESIGN.md](DESIGN.md) | Low |
| Teal/amber accents unused | Reserved for future callouts/badges | Low |

## Content backlog

- Expand Lands of Jail guides (more seasons / mechanics).
- Add further games as top-level sections (each: `<game>/index.md` + `.vi.md`,
  optional favicon). See [code-standards.md](code-standards.md#adding-a-new-game).

## Maintenance watch

- **Theme bump:** on any `just-the-docs` upgrade past `0.10.1`, re-verify the four
  `_includes` overrides (`head`, `favicon`, `header_custom`, `nav_footer_custom`)
  against the new theme version.
- Keep Windows/Polyglot invariants intact (`parallel_localization`, `sass.sourcemap`).

## Non-goals

- Dynamic backend, accounts, comments — the site stays fully static.

## References

- [Project overview & PDR](project-overview-pdr.md)
- Original spec/plan under `docs/superpowers/`.
