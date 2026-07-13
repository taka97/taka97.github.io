---
phase: 3
title: "Navigation & content layout conversion"
status: done
effort: ""
---

# Phase 3: Navigation & content layout conversion

## Overview

Rebuild the game→season→guide hierarchy on TeXt's navigation model and convert every
page's front matter from Just-the-Docs keys to TeXt layouts. This is where the wiki's
core navigation UX is re-created: JtD's auto-sidebar (from `parent`/`grandparent`/
`has_children`) becomes TeXt named sidebar nav groups referenced per page.

## Requirements

- Functional: sidebar shows the game→season→guide tree on content pages, in both languages;
  header nav present; home page uses a sensible TeXt layout.
- Non-functional: no `parent`, `grandparent`, `has_children`, `nav_order` keys remain.

## Architecture

**JtD nav (removed):** hierarchy inferred from `parent`/`grandparent`/`has_children`/
`nav_order` on each page; sidebar auto-generated.

**TeXt nav (added):** explicit structures in `_data/navigation.yml`:
- `header:` — top nav (e.g. Home, Lands of Jail), with `titles: { en, vi }`.
- Named sidebar groups with nested `children`, one per language, e.g. `loj-en` / `loj-vi`:
  ```yaml
  loj-en:
    - title: Lands of Jail
      url: /en/lands-of-jail/
      children:
        - title: "Season 1"
          url: /en/lands-of-jail/season-1/
          children:
            - title: Satellite
              url: /en/lands-of-jail/season-1/satellite/
        - title: "Season 2"
          url: /en/lands-of-jail/season-2/
          children:
            - title: Heroes
              url: /en/lands-of-jail/season-2/heroes/
            - title: Robots
              url: /en/lands-of-jail/season-2/robots/
  ```
Pages opt in via front matter `sidebar: { nav: loj-en }` (or `loj-vi`).

Layout mapping:
- Home (`/en/`, `/vi/`) → `home` or `page` layout (decide: `home` is hero/list oriented;
  for a wiki landing, `page` with a curated index may read better).
- Game landing + season landing + guide pages → `article` layout with
  `sidebar: { nav: … }`, `key: page`, `aside: { toc: true }` for the on-page table of
  contents.

## Related Code Files

- Create: `_data/navigation.yml` — `header` + `loj-en` / `loj-vi` sidebar groups.
- Modify: every content page front matter (all files under `en/` and `vi/` from Phase 2):
  - Remove: `parent`, `grandparent`, `has_children`, `nav_order`.
  - Add: `layout` (`article`/`page`/`home`), `sidebar: { nav: loj-<lang> }`, `key`,
    `aside: { toc: true }` where a TOC helps (long guide pages like `satellite`).
  - Keep: `title`, `lang`, `permalink`, `ref` (from Phase 2).
- Reference: TeXt nav docs — header list + named groups + `sidebar.nav` front-matter key.

## Implementation Steps

1. **Author `_data/navigation.yml`**: header entries (Home, Lands of Jail) with bilingual
   `titles`; `loj-en` and `loj-vi` sidebar trees mirroring the season/guide structure.
2. **Convert home pages** (`en/index.md`, `vi/index.md`): choose `home` vs `page`; if
   `home`, populate its hero/list fields; if `page`, curate a manual game index. Wire the
   header nav.
3. **Convert game landing** (`en/lands-of-jail/index.md` + VI): `layout: article`,
   `sidebar: { nav: loj-en }`, TOC on. Preserve the existing tips/tactics content.
4. **Convert season & guide pages** similarly, pointing each at the correct language nav
   group and setting `aside.toc` for long pages.
5. **Place the language switcher** (`_includes/lang-switcher.html` from Phase 2): override
   the appropriate TeXt include hook (e.g. a custom `_includes/` header/aside partial, or
   TeXt's `custom` head/footer hook) so the switcher shows on every page. Confirm TeXt's
   override point — TeXt loads `_includes/` from the site before the gem.
6. **Build & verify** the full nav tree renders and highlights the active page in both
   languages; TOC appears on long guide pages.

## Success Criteria

- [ ] `_data/navigation.yml` defines header + `loj-en` + `loj-vi` with correct URLs.
- [ ] Every content page uses a TeXt layout and references its language nav group.
- [ ] Sidebar renders the game→season→guide tree and marks the current page active (EN & VI).
- [ ] No JtD nav front-matter keys (`parent`/`grandparent`/`has_children`/`nav_order`) remain.
- [ ] Language switcher visible on all pages and links to the correct counterpart.

## Risk Assessment

- **TeXt sidebar depth:** verify TeXt renders 3 levels (game → season → guide) of nested
  `children`. If it caps at 2, flatten seasons into headings or use per-season nav groups.
  Test early with the real tree.
- **Active-item highlighting** depends on exact `url` match incl. trailing slash — keep nav
  URLs identical to page `permalink`s.
- **Home layout choice** is a UX judgment; if `home` layout looks blog-like, fall back to
  `page`. Not a blocker — revisit in Phase 4 review.
