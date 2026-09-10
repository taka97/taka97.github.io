---
title: "Brainstorm: Migrate Tomes & Collections to a new planner page"
date: 2026-09-10
status: approved
tags: [lands-of-jail, forticlad, planners, brainstorm]
---

# Brainstorm: Migrate Tomes & Collections planner

## Problem statement

Continue migrating lojcalc.com tools into this site's own planner pattern. Previous
work (`plans/260909-2127-migrate-fc-buildings-t11-research-to-forticlad-planner/`)
migrated "FC Buildings & T11 Research" into `contents/{en,vi}/lands-of-jail/planners/forticlad.md`.
This round migrates the next tool: `https://www.lojcalc.com/tomes-collections.html`.

## Source data (captured 2026-09-10)

From `tomes-collections.html`'s inline `<script>` + `shared.js` (the generic engine
every lojcalc.com route loads):

- **Resources (6, all new to this site):** `SealOfWisdom`, `SealOfKnowledge`,
  `CommonCoin`, `RareCoin`, `PreciousCoin`, `LegendaryCoin`.
- **Tomes:** dynamic category, up to 18 instances, default 1. Each is a 12-level
  linear track (level 0 = zero cost, levels 1-12 = `TOME_COSTS[i]`), identical cost
  curve `{SealOfWisdom, SealOfKnowledge}` for every tome. No requirements.
- **Collections:** dynamic category, up to 6 instances, default 1. Each is a 43-row
  track: `start` (zero cost) + 11 tiers (`uncommon`, `rare`, `epic`, `epic_t1`,
  `legendary`, `legendary_t1`, `legendary_t2`, `exotic`, `exotic_t1`, `exotic_t2`,
  `exotic_t3`). `uncommon` has 2 levels; every other tier has 4 (id = tier key for
  the first row, `<tier>_s<n>` for sub-levels 2-4, styled as "· star n"). Cost per
  level: `{CommonCoin, RareCoin, PreciousCoin, LegendaryCoin}`. No requirements.
- **No cross-track prerequisite graph** (`requires:[]` everywhere) — the single
  biggest structural difference from Forticlad, which needed a full requirement-
  cascade engine. One shared stock pool + one combined missing/breakdown table
  across both categories (source's `computeCascade()` iterates all tracks flatly).
- Add-only UX: a "+ Add Tome" / "+ Add Collection" button per category, capped at
  max; no per-instance remove button. Counts only shrink via full Reset.
- Layout order: intro -> current stock -> what's missing (summary cards +
  breakdown table) -> Tomes catalog -> Collections catalog. A sticky bottom bar
  mirrors the missing totals while scrolling.

Full verbatim source dump (HTML + `shared.js`) was captured during this session;
re-fetch `https://www.lojcalc.com/tomes-collections.html` and
`https://www.lojcalc.com/shared.js` if implementation needs to re-verify a number
rather than re-deriving from memory.

## Decisions (confirmed with user, 2026-09-10)

1. **New standalone page**, not merged into the Forticlad page: nav entry "Tools ->
   Tomes & Collections" at `/en|vi/lands-of-jail/planners/tomes-collections/`.
2. **One page, two sections** (Tomes, Collections) sharing one stock pool and one
   combined missing/breakdown table — matches source's own single-route, flat-
   tracks behavior.
3. **Layout mirrors source structure** (section order or intro -> stock -> missing
   -> Tomes -> Collections -> sticky bar); **styling uses this site's own framework**
   (colors/cards/tables), not source's `shared.css`/`theme-tactical.css`.
4. **Generalize `.forticlad-planner__*` SCSS into a shared `.loj-planner__*` block**,
   reused by both pages (it's pure structural styling today, nothing Forticlad-
   specific) — pays off for the 3 remaining future tool migrations too.
5. **Include the sticky summary bar** (new to this site; Forticlad's page doesn't
   have one) — restyled with our framework, useful since Tomes can list up to 18
   instances.
6. **Add-only UX matches source exactly**: capped at 18 tomes / 6 collections, no
   per-instance remove button, shrink only via full Reset.
7. **VI content**: create the VI page/content now with the full structure, but
   leave the 6 new resource names + collection tier names identical to the EN
   text for this round — translate in a follow-up pass (explicit user decision,
   deferred rather than skipped).

## Proposed architecture (new files, following existing pattern)

- `_data/lands_of_jail/tomes_collections.yml` — `TOME_COSTS` (12 rows) and
  `COLLECTION_TIERS` (11 tiers) cost tables + caps (18/6), transcribed verbatim
  from source.
- `assets/js/planners/tomes-core.js` — pure calc engine. Much simpler than
  `planner-core.js`: no requirement graph/cascade needed (source has none for this
  tool) — just per-instance current/target index -> summed cost, plus totals
  across all instances of both categories.
- `assets/js/planners/tomes.js` — UI wiring: add-instance buttons (capped),
  current/target `<select>` per instance, renders via `table-helpers.js`
  (`targetCell`, `grandTotalFooter`) for the breakdown table, sticky bar render.
- `contents/{en,vi}/lands-of-jail/planners/tomes-collections.md` — Markdown +
  `<section data-*>` skeleton, JSON data island via
  `{{ site.data.lands_of_jail.tomes_collections | jsonify }}`, same pattern as
  `forticlad.md`.
- `_data/navigation.yml` — new "Tomes & Collections" entry in `loj-en`/`loj-vi`
  Tools groups.
- `_sass/custom.scss` — rename/generalize `.forticlad-planner__*` -> `.loj-planner__*`
  (used by both `forticlad.js`/`research.js` and the new `tomes.js`).
- Storage: new tool key `tomes-collections` in the existing generic
  `profile.tools[...]` blob via `storage.js`'s `getToolData`/`updateToolData` — no
  `storage.js` changes needed (its only per-tool special-casing is a legacy
  Forticlad migration shim, unrelated to this tool).

## Explicitly out of scope

Robots & Satellites, Hero Equipment, Hero Stars & Exclusive Equipment (the
remaining 3 lojcalc.com tools) — future migration rounds, one at a time, same
pattern as this one.

## Risks / things to verify during implementation

- Collection tier level counts (`uncommon`=2, all others=4) must be transcribed
  exactly — an off-by-one here breaks both the level dropdown and the cost sum.
- `.loj-planner__*` rename touches `forticlad.js`/`research.js` DOM class
  references too — must grep every `forticlad-planner__` usage (CSS + JS class
  strings) before renaming, not just the SCSS file, to avoid an unstyled Forticlad
  page.
- Sticky bar is new to this site: needs its own scroll-jump target + hidden/shown
  logic (source's `renderStickyBar`) reimplemented, not copied verbatim (site
  doesn't load `shared.js`).

## Next steps

Hand off to `/ak:plan` for phased implementation planning (data transcription,
core engine, UI wiring + SCSS generalization, i18n, verification), following the
same phase structure as the prior Forticlad migration plan.

## Unresolved questions

None outstanding — all decisions confirmed above.
