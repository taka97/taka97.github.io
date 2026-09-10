# System Architecture — Game Guides

Static-site architecture: Markdown + Jekyll theme → static HTML on GitHub Pages. No
runtime server, database, or API; the Forticlad Planner keeps optional browser-local
profile data in IndexedDB.

## Stack

| Layer | Choice |
| --- | --- |
| Generator | Jekyll 4 (`~> 4.3`) |
| Theme | jekyll-text-theme (gem `~> 2.2`) |
| i18n | TeXt-native (no polyglot); UI strings in `_data/locale.yml` |
| Plugins | jekyll-feed, jekyll-paginate, jekyll-sitemap, jemoji |
| Host | GitHub Pages (custom domain via `CNAME`) |
| CI/CD | GitHub Actions |
| Local build | Docker `ruby:3.3` (no local Ruby) |

## Build & deploy flow

```
push to main
   │
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   ├─ actions/checkout
   ├─ ruby/setup-ruby (3.3, bundler-cache)
   ├─ bundle exec jekyll build   (JEKYLL_ENV=production)
   │     └─ Renders EN (/en/) + VI (/vi/) + root redirect to /en/
   ├─ upload-pages-artifact  (_site)
   └─ deploy-pages  → GitHub Pages (HTTPS, custom domain)
```

- Trigger: push to `main` (or manual `workflow_dispatch`).
- Concurrency `group: pages`, `cancel-in-progress: true` — one live deploy.
- Pages **Source must be "GitHub Actions"** (not legacy branch build).

## Rendering pipeline (per build)

1. Jekyll reads `_config.yml`; `defaults` apply `layout: article` + `show_title: false`
   to every page (home pages override `layout: page`).
2. Content in `contents/en/` and `contents/vi/` directories; each page has a `lang` and `ref` (slug)
   linking its language counterpart. TeXt navigates by `ref`, not by file path.
3. TeXt theme renders navigation from `_data/navigation.yml` (header nav + per-language
   sidebar groups `loj-en` / `loj-vi`). Sidebar navigator renders two levels only (group
   title + children); game→season→guide hierarchy is flattened (each season is a group).
4. `_includes` hooks (`header.html`, `head/favicon.html`, `head/custom.html`, `footer.html`)
   inject the language switcher, per-game favicons, hreflang tags, and copyright.
5. Sass compiles `_sass/custom.scss` (typography + component tweaks); theme skin
   (`text_skin: default`) and highlight theme applied from `_config.yml`.

## Component map

```
                 ┌──────────────────────────┐
  Content .md ──▶│  Jekyll + TeXt-theme     │──▶ _site/
  (en/, vi/      └────────────┬─────────────┘
   dirs, ref-linked)          │
             ┌────────────────┼──────────────────┐
             ▼                ▼                  ▼
      _data/navigation   _includes/*         _sass/custom.scss
      (sidebar groups,    (switcher,          (typography,
       header nav)        favicon, hreflang)  tables, layout)
```

## Key architectural decisions

- **Two content directories, native language routing.** `contents/en/<path>.md` and
  `contents/vi/<path>.md` with shared `ref` slug. TeXt's i18n handles language detection; no
  polyglot needed. Cleaner than one source tree + plugin overhead.
- **Navigation as data.** `_data/navigation.yml` defines sidebar groups and header nav;
  no front matter hierarchy keys needed. Easier to reorganize, no broken references.
- **Theme hooks for branding.** Custom behavior lives in a few `_includes` + one Sass
  file layered on the gem — upgrades stay tractable (re-verify hooks on theme bump).
- **Two-level sidebar, flattened hierarchy.** TeXt's navigator renders only two levels.
  The game→season→guide tree is expressed as: season-level groups, each with guide
  children. Game title is a non-link section header.
- **Zero-ops publishing.** Push-to-deploy; no build step for the author beyond writing
  Markdown.
- **Local builds in Docker** because Ruby isn't installed on the dev machine.

## Data flow at request time

None — every URL is a pre-rendered static file served by GitHub Pages CDN. Root `/`
redirects to `/en/` via a meta-refresh `index.html`. Search runs client-side (Lunr-like
index shipped with the theme).

## Forticlad Planner client flow

`_data/lands_of_jail/forticlad.yml` (8 buildings incl. FC Lab) and
`_data/lands_of_jail/forticlad_research.yml` (T11 Research: 3 troop lines x 9 tracks,
Hyperalloy-only) are release-controlled game data with declarative prerequisite graphs.
Jekyll embeds both as non-executing JSON on the matched EN/VI planner page.
`assets/js/planners/planner-core.js` (buildings: Base-step ranges, FC/AFC) and
`research-core.js` (research: per-track numeric levels, Hyperalloy) are independent
calculation engines with the same shape — validate ranges, resolve cross-entity
prerequisites to a fixed point, aggregate costs — driven by `forticlad.js` and
`research.js` respectively; `table-helpers.js` holds the tiny DOM table builder both UI
controllers share. Both engines read/write the same `forticlad` profile tool-data key
(buildings and research selections + FC/AFC/Hyperalloy on-hand all live in one blob per
profile); each save re-fetches the current profile from storage immediately before
merging its own change in, so the two independently-initializing scripts don't clobber
each other's fields on write. A `forticlad:building-data-changed` DOM event separately
lets `research.js` react when a building change (e.g. FC Lab's level) affects research
prerequisites. Settings owns profile creation, selection, deletion, and JSON
backup/restore; player profile and inventory data stays in IndexedDB.

## Tomes & Collections Planner client flow

`_data/lands_of_jail/tomes_collections.yml` holds two flat, prerequisite-free cost
tables (13 Tome levels, 43 Collection levels across 11 tiers) plus add-instance caps
(18 Tomes / 6 Collections) and resource labels. `tomes-core.js` is a minimal engine —
no cross-entity requirement graph, unlike `planner-core.js`/`research-core.js` — that
sums per-instance cost ranges into combined totals, driven by `tomes.js`. Instances are
repeatable (an arbitrary number of Tomes/Collections, each just `{currentIndex,
targetIndex}`), added via an "+ Add" control up to the cap with no per-instance remove;
a page-local double-click-confirm "Reset to default" control is the only way counts
shrink back to one each. State (stock, tome/collection instance lists) lives under the
`tomes-collections` profile tool-data key, saved with the same
read-latest-then-merge-then-write pattern as Forticlad/Research. Both this page and
Forticlad's share one `.loj-planner__*` SCSS block in `_sass/custom.scss` (generalized
from a Forticlad-only `.forticlad-planner__*` block during this migration) for reuse by
future lojcalc.com tool migrations (Robots & Satellites, Hero Equipment, Hero Stars &
Exclusive Equipment).

## Robots & Satellites Planner client flow

`_data/lands_of_jail/robots_satellites.yml` holds 5 resources, Robot's 11-row cost
table, and 3 satellite rarity tiers' (R/SR/SSR) shared cost curves (6/8/10 rows each)
plus the 9 fixed named Satellites (`{id, tier, labelKey}`, no per-satellite cost — a
Satellite's cost comes from its tier's shared curve). `robots-satellites-core.js` is a
minimal engine with the same no-cascade shape as `tomes-core.js` — a range sum is a
straight loop over `levels[currentIndex+1..targetIndex]`, no cross-entity requirement
graph. It differs from `tomes-core.js` in two ways: Robot is a dynamic, repeatable
add-instance category (cap 12, like Tomes), while Satellites are a *fixed* set keyed by
id (not addable — state lives in an object keyed by satellite id, not an array); and
breakdown rows carry an `estimated` array of resource keys (empty when nothing in the
summed range is flagged) for the one unconfirmed source figure (R-tier level 50's Data
Disk cost), driven by `robots-satellites.js`. Two small, generically-scoped UI
primitives were added for reuse by later migrations (Hero Equipment, Hero Stars &
Exclusive Equipment): `table-helpers.js`'s `renderEstimatedBadge` (an accessible
click-to-toggle "≈" disclosure badge + hidden note) and `_sass/custom.scss`'s
`.loj-planner__rarity-badge` (a colored pill driven by a `--badge-color` custom
property, one per satellite tier heading) alongside `.loj-planner__estimated-tag`/
`.loj-planner__estimated-note`. State (stock, Robot instance list, Satellite state)
lives under the `robots-satellites` profile tool-data key as `{stock, robots: [...],
satellites: { [id]: {currentIndex, targetIndex} }}`, saved with the same
read-latest-then-merge-then-write pattern as Forticlad/Research/Tomes & Collections.

## Hero Equipment Planner client flow

`_data/lands_of_jail/hero_equipment.yml` holds 4 resources, one shared 21-entry Rarity
cost table, and one shared 21-entry Mastery cost table — verified byte-identical across
all 3 troops and all 4 equipment slots, so the same two tables back all 12 (troop, slot)
cells rather than each cell owning its own copy. `hero-equipment-core.js` is the first
engine since `research-core.js` to resolve a cross-track prerequisite, but the shape is
much simpler than Forticlad's N:M requirement graph: every Rarity level from
`legendary_t1` onward carries a `requiresMastery` id pointing at that *same cell's own*
Mastery track, so the dependency graph is exactly 12 disjoint 1:1 pairs, never
cross-cell and never multi-hop. `calculateHeroEquipment` resolves each cell in a single
pass — walk the selected Rarity range for any `requiresMastery` entries, bump the
effective Mastery target to the highest one required (tagging that cell's Mastery row as
automatic only when the bump exceeds the user's own selection), then range-sum both
tracks — no fixed-point loop needed, unlike `resolveRequirements` in `research-core.js`.
Breakdown rows carry an `estimated` array of resource keys, computed by
`hero-equipment-core.js`'s `sumCostRange` for the one unconfirmed source figure (the
Common → Uncommon "levels maxed" checkpoint's Equipment EXP cost, shared by all 12
Rarity tracks) — rendered by `hero-equipment.js` with `table-helpers.js`'s
`renderEstimatedBadge` unmodified, the same primitive
Robots & Satellites introduced. The UI is a fixed 3×4 grid (12 cells, not addable) —
closer to Robots & Satellites' fixed-named-Satellite pattern than Tomes' addable
instances — with 48 selects total (2 tracks × 2 current/target selects × 12 cells) built
per-cell via a shared `renderTrackRow` helper reused for both tracks, plus the existing
`targetCell` "(auto-added — prerequisite)" tag from `research.js`'s cascade UI. State
(stock, all 12 cells' Rarity/Mastery current and target indices) lives under the
`hero-equipment` profile tool-data key as `{stock, equipment: { [troop]: { [slot]: {
rarity: {currentIndex, targetIndex}, mastery: {currentIndex, targetIndex} } } } }`,
saved with the same read-latest-then-merge-then-write pattern as every prior planner.

## Related

- [Deployment guide](deployment-guide.md) · [Codebase summary](codebase-summary.md) ·
  [Design system](DESIGN.md)
