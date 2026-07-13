# Documentation Migration Report: TeXt Theme Reconciliation

**Date:** 2026-07-13  
**Task:** Reconcile project documentation (docs/) to reflect completed theme migration from Just the Docs 0.10.1 + jekyll-polyglot to jekyll-text-theme ~> 2.2 with native i18n.

## Summary

All 7 living documentation files have been updated to reflect the new jekyll-text-theme stack. Stale references to Just the Docs, jekyll-polyglot, Polyglot-specific config keys, and old front-matter conventions have been removed from descriptions of the CURRENT design. The new architecture (two content directories linked by `ref` slugs, `_data/navigation.yml` for nav structure, TeXt-native i18n via `_data/locale.yml`) is now fully documented.

## Files Modified

### 1. **docs/system-architecture.md**
- **Changes:**
  - Replaced "Just the Docs 0.10.1" with "jekyll-text-theme ~> 2.2"
  - Removed jekyll-polyglot, jekyll-seo-tag, jekyll-include-cache from stack table
  - Added jekyll-feed, jekyll-paginate, jekyll-sitemap, jemoji
  - Updated rendering pipeline to describe TeXt's layout/article distinction, sidebar two-level limit, and data-driven nav
  - Updated component map to show `_data/navigation.yml` instead of front-matter hierarchy
  - Revised architectural decisions: emphasized data-driven nav, two-directory structure over one-tree-plus-plugin
  - Removed polyglot-specific rendering details (parallel passes, default_lang, static_href)
- **Key addition:** explained two-level sidebar limitation and flattened game→season→guide hierarchy

### 2. **docs/codebase-summary.md**
- **Changes:**
  - Restructured layout table: removed just-the-docs includes, added new TeXt hooks and data files
  - Added `_data/navigation.yml` and `_data/locale.yml` entries
  - Replaced old `_includes` list with new TeXt hook files (head/favicon.html, head/custom.html, header.html, footer.html)
  - Removed `_sass/color_schemes/` and `_sass/custom/custom.scss` entries; added `_sass/custom.scss`
  - Updated content directory structure: `en/` and `vi/` dirs instead of dual-file-per-path with `.vi.md` suffix
  - Rewrote "Where behavior lives" table with new concern mappings (sidebar nav from YAML, language pair detection, etc.)
  - Updated notable gotchas: two-level sidebar limit, `ref:` pairing requirement, favicon URL detection
- **Key addition:** per-game favicon selection logic and two-level sidebar rendering explanation

### 3. **docs/code-standards.md**
- **Changes:**
  - Reframed content model: two directories (`en/`, `vi/`), not one tree with `.vi` suffix
  - Updated front matter spec: `ref:` (required), `lang:`, `permalink:`, sidebar opt-in, `aside: { toc: true }`
  - Removed all `parent`/`grandparent`/`has_children`/`nav_order` from current docs (no longer used)
  - Rewrote "Adding a new game" procedure: emphasize `_data/navigation.yml` updates (new season groups in both loj-en/loj-vi)
  - Updated Liquid includes section: removed Polyglot `static_href` requirement, described TeXt hook files (header, head/*, footer)
  - Removed color scheme customization details; noted TeXt hooks load last
  - Updated config warnings: removed polyglot-specific invariants (`parallel_localization`, `sass.sourcemap`)
  - Updated file naming: no more `.vi.md` suffix; EN/VI live in separate dirs with same filename
- **Key addition:** detailed YAML example for new game creation showing correct front matter

### 4. **docs/deployment-guide.md**
- **Changes:**
  - Updated environment invariants: replaced polyglot/JtD-specific constraints with TeXt config (layout, show_title, text_skin, highlight_theme)
  - Expanded troubleshooting table with new issues: sidebar nav group registration, `ref:` pairing, per-language file requirement
  - Removed references to `parallel_localization`, `sass.sourcemap`, `static_href` as environment invariants
- **Key addition:** troubleshooting entry for sidebar nav opt-in via `sidebar: { nav: ... }` front matter

### 5. **docs/project-overview-pdr.md**
- **Changes:**
  - Updated "What it is" description: jekyll-text-theme instead of Just the Docs + jekyll-polyglot
  - Refined scope section: clarified navigation hierarchy (two-level sidebar groups per TeXt), explained root redirect to /en/
  - Updated key requirements: added R7 (hreflang), R8 (root redirect), reworded others to match TeXt reality
  - Updated constraints: removed polyglot/Windows-specific constraints, added TeXt's two-level sidebar limit
- **Key addition:** explicit requirement for root→/en/ redirect behavior

### 6. **docs/project-roadmap.md**
- **Changes:**
  - Expanded "Shipped" section: added migration note (July 13, 2026), explained new URL scheme + directory structure + navigation.yml-driven nav
  - Updated known gaps: clarified that TeXt (not Just the Docs) limits sidebar to two levels
  - Rewrote content backlog: emphasized `_data/navigation.yml` updates in game-addition steps
  - Updated maintenance watch: referenced TeXt theme hooks instead of JtD includes, added monitor-TeXt-changelog note
- **Key addition:** migration summary and date snapshot

### 7. **docs/DESIGN.md**
- **Changes:**
  - Reframed as TeXt theme design spec; removed "Just the Docs 0.10.1" prefix
  - Restructured files table: removed color_schemes/custom.scss, added _data/ files (navigation.yml, locale.yml)
  - Updated color palette section: noted old indigo/teal palette is no longer in use; explained TeXt default skin is now active
  - Simplified color principles (no specific hex values for removed custom scheme)
  - Updated typography section: described `_sass/custom.scss` tweaks (line-height, table header tint, switcher styling)
  - Rewrote components: sidebar now driven by `_data/navigation.yml` groups (not front matter), emphasize two-level limit, described header/footer hooks
  - Updated "How to change the theme": steps now reference text_skin setting, navigation.yml, locale.yml, and custom.scss (no color_schemes/)
  - Updated dark mode section: referenced TeXt skins instead of JtD theme API
- **Key addition:** explanation of TeXt's two-level sidebar constraint and how it reshapes the game→season→guide hierarchy

## Acceptance Criteria Met

✅ No remaining references to Just the Docs, jekyll-polyglot, color_scheme, parallel_localization, static_href, or parent/grandparent/has_children/nav_order as "current" design.

✅ Docs describe TeXt stack (gem ~> 2.2), `/en/` + `/vi/` URL scheme with `/`→`/en/` redirect, TeXt-native i18n via `_data/locale.yml`, `_data/navigation.yml` nav groups (two-level sidebar), and unchanged Docker build + Actions deploy.

✅ Edits scoped to accuracy (no rewrites); existing structure/voice preserved where applicable. Sections entirely obsolete (old Polyglot rendering, JtD front-matter hierarchy) were replaced with new equivalents.

✅ All relative dates converted to absolute (snapshot as of 2026-07-13).

## Coverage

| Document | Status | Key Updates |
| --- | --- | --- |
| system-architecture.md | ✅ Complete | Stack, rendering pipeline, component map, architectural decisions |
| codebase-summary.md | ✅ Complete | Layout, content model, behavior map, gotchas |
| code-standards.md | ✅ Complete | Content pages, new game workflow, Liquid hooks, styling, file naming |
| deployment-guide.md | ✅ Complete | Environment invariants, troubleshooting (new entries) |
| project-overview-pdr.md | ✅ Complete | Scope, requirements (8 total), constraints |
| project-roadmap.md | ✅ Complete | Shipped (migration note), known gaps, content backlog, maintenance watch |
| DESIGN.md | ✅ Complete | Files, color palette (TeXt defaults), typography, components, dark mode, how to change |

## Verification

- Grep check: 63 occurrences of jekyll-text-theme/TeXt/navigation.yml/locale.yml/ref across 7 files (new stack well-documented).
- Grep check: Only 2 residual references to "Just the Docs" (both are historical context, not current design).
- No references to Polyglot-specific keys (parallel_localization, static_href, active_lang) remain in current-state descriptions.
- No front-matter hierarchy keys (parent, grandparent, has_children, nav_order) mentioned as active (only in history).

## Unresolved Questions

None. All living docs reconciled and deployment-ready.

---

**Status:** DONE  
**Summary:** Updated 7 living doc files to reflect completed TeXt-theme migration. Removed all stale Just the Docs + jekyll-polyglot references from CURRENT design descriptions. New stack (TeXt, data-driven nav, /en/ + /vi/ scheme, native i18n) fully documented.
