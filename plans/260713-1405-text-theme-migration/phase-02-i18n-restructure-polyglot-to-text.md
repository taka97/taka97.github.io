---
phase: 2
title: "i18n restructure (polyglot to TeXt)"
status: done
effort: ""
---

# Phase 2: i18n restructure (polyglot to TeXt)

## Overview

Replace polyglot's automatic per-language routing with TeXt's manual i18n: a
language-directory URL scheme (`/en/…`, `/vi/…`), a Vietnamese locale added to
`_data/locale.yml`, per-page `lang` front matter, and a hand-built EN↔VI language
switcher. This phase moves/renames content files and fixes permalinks; the TeXt
layout/nav front matter is applied in Phase 3.

## Requirements

- Functional: every existing page has an EN and a VI URL under its language directory;
  VI theme chrome (search placeholder, TOC label, etc.) renders in Vietnamese.
- Non-functional: no polyglot liquid tags (`{% static_href %}`, `site.active_lang`) remain.

## Architecture

**Today (polyglot):** `foo.md` (`lang: en`) + `foo.vi.md` (`lang: vi`) share one
`permalink`; polyglot serves EN at `/foo/` and VI at `/vi/foo/`, rewriting hrefs and
providing `site.active_lang`.

**Target (TeXt):** no auto-routing. Each page is a distinct file with an explicit
`permalink` under `/en/` or `/vi/`. `lang` front matter selects the locale block in
`_data/locale.yml`. The switcher is a custom include that links a page to its counterpart
in the other language via a shared front-matter key (e.g. `alt_lang_url` or a `ref` slug).

Language-code note: TeXt's language handling recognizes en/zh/ko/fr/tr. `vi` must be added
to `_data/locale.yml`; verify the theme's `get-locale-string` snippet falls back gracefully
and that `lang: vi` does not break its language-family lookup (test early).

## Related Code Files

- Create: `_data/locale.yml` (override the gem's) with `en` and a new **`vi`** block —
  translate UI keys: `LAYOUT` labels, `SEARCH`, `TOC`, `PAGINATION` (`PREVIOUS`/`NEXT`),
  `SOURCE`, `DATE_FORMAT`, `WEEK_START`, etc. Copy the gem's `en` block as the template.
- Create: `_includes/lang-switcher.html` — custom EN↔VI switcher (renders in the header or
  page aside; see Phase 3 for placement/override hook).
- Move/rename content into language dirs:
  - `index.md` → `en/index.md`; `index.vi.md` → `vi/index.md`
  - `lands-of-jail/index.md` → `en/lands-of-jail/index.md`;
    `lands-of-jail/index.vi.md` → `vi/lands-of-jail/index.md`
  - `lands-of-jail/season-1/satellite.md` → `en/lands-of-jail/season-1/satellite.md`;
    `.vi.md` → `vi/lands-of-jail/season-1/satellite.md`
  - Same pattern for `season-2/{heroes,robots,index}` and `season-1/index`.
- Modify: each moved file's front matter — set `lang`, explicit `permalink`
  (`/en/lands-of-jail/season-1/satellite/`), and a shared `ref:` slug used by the switcher.

## Implementation Steps

1. **Decide switcher linkage.** Add a `ref:` slug to each page pair (same value for the EN
   and VI file, e.g. `ref: lands-of-jail-satellite`). Switcher finds the sibling by matching
   `ref` with the opposite `lang`.
2. **Add `_data/locale.yml`** with `en` (copied from gem) + `vi` translations. Keep keys
   identical; translate values. Do not omit keys — missing keys render blank chrome.
3. **Restructure content** into `en/` and `vi/` trees (moves above). Preserve markdown
   bodies unchanged; only front matter changes here (layouts/nav in Phase 3).
4. **Set permalinks** on every page to its language-prefixed path. Add a root `index.html`
   (or `en/index.md` with `permalink: /`) strategy — decide root behavior: redirect `/` to
   `/en/` or serve EN home at `/`. Recommend a tiny root redirect page to `/en/`.
5. **Build the switcher include** (`_includes/lang-switcher.html`): iterate `site.pages`,
   select the page whose `ref == page.ref and lang != page.lang`, output a link to its
   `url`; render `EN · VI` with the current one marked active. No `{% static_href %}`.
6. **Purge polyglot constructs** from `_includes/*` created in the old theme (head.html,
   header_custom.html) — these are replaced in Phase 3/5, but ensure no `active_lang` or
   `static_href` survives into TeXt overrides.
7. **Build & spot-check:** `/en/` and `/vi/` both resolve; a VI page shows Vietnamese TOC/
   search labels; switcher jumps between counterparts.

## Success Criteria

- [ ] `_data/locale.yml` has complete `en` and `vi` blocks (no missing keys vs gem default).
- [ ] Every content page exists under `/en/…` and `/vi/…` with an explicit `permalink`.
- [ ] `lang: vi` pages render Vietnamese theme chrome (verify TOC/search/pagination labels).
- [ ] Language switcher links each page to its opposite-language counterpart and back.
- [ ] No `polyglot`, `static_href`, or `active_lang` tokens remain in the source tree.

## Risk Assessment

- **`vi` not a recognized TeXt language code** → chrome falls back to English or errors.
  Mitigation: test a single `lang: vi` page immediately after step 2; if the
  `get-locale-string` lookup fails, add a `vi`-family mapping or override the snippet in
  `_includes/snippets/`.
- **Broken internal links:** existing markdown bodies contain absolute links like
  `/lands-of-jail/season-1/satellite/` — these must be updated to `/en/…` (and VI bodies to
  `/vi/…`). Grep and fix; this is easy to miss. Track as a checklist item per page.
- **Root URL / SEO churn:** EN moves off root. Coordinated with Phase 6 redirects/hreflang.
