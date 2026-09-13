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

- **Migration series complete:** all 5 lojcalc.com browser-local calculator tools have
  been migrated into this site's `.loj-planner__*` pattern — Forticlad (Core + T11
  Research), Collections & Tomes, Robots & Satellites, Hero Equipment, and Hero Stars &
  Exclusive Equipment. No further lojcalc.com tool migrations are planned.
- **Verified boundary:** FC/AFC building data through FC10 and T11 Research data are
  transcribed from the cited independent reference; Medical Station stops at FC8, FC
  Lab stops at level 6, and prerequisites are resolved from the checked-in requirement
  graphs in [`_data/lands_of_jail/forticlad.yml`](../_data/lands_of_jail/forticlad.yml)
  and [`forticlad_research.yml`](../_data/lands_of_jail/forticlad_research.yml). The
  other 4 tools' data (Collections & Tomes, Robots & Satellites, Hero Equipment, Hero
  Stars & Exclusive Equipment) is transcribed from live source state captured during
  each tool's own migration — see each tool's `_data/lands_of_jail/*.yml` `source` block
  for its retrieval date and provenance notes.

## Known gaps / enhancements

| Item | Notes | Priority |
| --- | --- | --- |
| VI search UI strings not localized | Theme renders search placeholder in EN only | Low |
| Dark mode | Deferred (YAGNI) — plan in [DESIGN.md](DESIGN.md) | Low |
| Teal/amber accents in palette | Reserved for future callouts/badges | Low |
| Badge-stack layout rollout (see below) | Applied to all 5 planners — plan: `plans/260911-2022-badge-stack-layout-rollout/` | Done |
| Step-id/display-text decoupling audit (see below) | Done — Forticlad fixed, other 4 tools verified against real IndexedDB data | Done |
| Object knowledge cross-linking rollout (see below) | Satellites done; Robots and any future planner with a dedicated knowledge page still need it | In progress |

### Step-id/display-text decoupling audit

Forticlad Core Planner's step ids used to double as display text, coupling
persisted user progress to translatable strings — fixed in
[`plans/260911-1835-forticlad-stable-step-ids/`](../plans/260911-1835-forticlad-stable-step-ids/plan.md)
(stable snake_case ids + separate `label` field, plus a `stock: {}` storage
reshape for FC/AFC/Hyperalloy on-hand amounts). That plan's Post-Phase-3 review
also caught and fixed a cross-script storage-clobber regression specific to
Forticlad's architecture (its planner UI is split across `forticlad.js` +
`research.js`, both sharing one `tools.forticlad` storage slot).

Checked whether either issue — or the broader question of whether adding VI
translations *later* would ever force a storage-key migration like Forticlad
needed — applies to the other 4 lojcalc-style planners. Two passes
(2026-09-11): an initial id/yml scout, then a deeper re-audit tracing every
label/heading-construction function in each planner's JS (not just the yml
shape) after a request to double-check with fresh eyes.

- **Id/display-text coupling** — not present anywhere. Collections & Tomes,
  Robots & Satellites, Hero Equipment, and Hero Stars & Exclusive Equipment
  all use stable snake_case/id-like keys (`rare_s1`, `sat_r_laser`,
  `legendary_t1_s1`, `star1_s1`) as the stored/lookup identifier, fully
  separate from whatever text renders on screen. None of these 4 tools would
  ever need a storage-key migration to add or change translations later —
  confirmed by reading every `heading`/`headingText`/`label` construction site
  in each planner file, not just the yml `id` fields.
- **Shared storage-slot clobber** — not applicable. Each of the other 4
  planners owns its `tools.*` slot exclusively (one file, one tool key each:
  `collections-tomes`, `robots-satellites`, `hero-equipment`,
  `hero-stars-exclusive-equipment`) — confirmed via grep, no file pair shares
  a slot the way `forticlad.js`/`research.js` do. That regression class is
  Forticlad-specific architecture, not a systemic pattern.
- **Found instead — a translation-content gap (not a data-model risk):**
  `hero-equipment.js` and `hero-stars-exclusive-equipment.js`'s resource
  labels (`_data/lands_of_jail/hero_equipment.yml` / `hero_stars_exclusive_equipment.yml`
  `resources: [{ key: EquipmentParts, label: Equipment EXP }, ...]`) are a
  single plain-English string with no VI variant, unlike Forticlad's
  `BUILDING_TRANSLATIONS` or Tomes' `TROOP_TRANSLATIONS`/`TOME_TYPE_TRANSLATIONS`
  dicts. `key` and `label` are already separate fields here, so adding VI text
  later is purely additive (mirror the `BUILDING_TRANSLATIONS`-keyed-by-`key`
  pattern) — zero migration risk, just untranslated content. Not urgent;
  noted so it isn't mistaken for the same class of bug Forticlad had.

No storage-migration action needed for any of the other 4 tools based on this
audit — tracked here so it isn't re-investigated later.

**Real-data spot-check (2026-09-11) — confirms the audit above:** ran a
read-only console dump of the user's real `lands-of-jail-tools` → `profiles`
store against all 4 tools' `tools.*` slots. Result: `stock` keys match each
tool's yml `resources` exactly (no leftover flat fields like Forticlad's old
`fcOnHand`/`afcOnHand`), and `robots-satellites`' `satellites` map is keyed by
stable ids (`sat_r_laser`, `sat_ssr_domaine_omniscient`, ...), never by
display name. No bug found; source-only conclusion holds against real data.

Side note (not part of this audit): these 4 tools' instance tracks (`tomes`,
`collections`, `robots`, `heroStars`, `exclusiveEquipment`, `equipment`)
persist plain numeric `{currentIndex, targetIndex}` positions into each yml's
fixed-order arrays, rather than named ids. That's a different, narrower risk
than Forticlad's issue — reordering (not renaming) a yml `levels`/`tomeSlots`/
etc. array would silently corrupt saved indices. Noted so it isn't mistaken
for the same bug class Forticlad had.

This actually happened for Robots & Satellites (2026-09-11): splitting each
satellite level into a raw step + a "maxed" breakthrough step doubled the
`satelliteTiers[].levels` array length, which would have silently
reinterpreted every saved `currentIndex`/`targetIndex` as the wrong level.
Fixed by giving each level row a stable snake_case `id` (`level_10`,
`level_10_maxed`, ...) and switching persisted state to
`currentLevelId`/`targetLevelId` — array position is now only an internal
lookup, resolved via `resolveLevelIndex()` in
`assets/js/planners/robots-satellites-core.js`. Robot levels got the same
id-based storage in the same pass, and turned out to need the same raw/maxed
split too: each bracket is Prisoner Armor Data (raw level) then Power Module +
Advanced Power Module together (that level's "maxed" step) — `level_1` (no
split, baseline) through `level_100`/`level_100_maxed`, 21 rows total. The
other 3 tools (Tomes/Collections, Hero Equipment, Hero Stars &
Exclusive Equipment) were left on plain index storage — no concrete need to
restructure them has come up, so converting them now would be pure
speculative cost (YAGNI). Apply this same id-based pattern to any of them if
and when they actually need a `levels`/`tomeSlots`-style array restructured.

### Badge-stack layout rollout — Done (2026-09-11)

Collections & Tomes' redesign (`341282e`) fixed a sidebar-TOC bug where the
"No target"/"Target set" instance badge's text leaked into the TOC entry,
because the badge `<span>` was appended directly inside the item's heading
element. The fix: wrap heading + badge in a `.loj-planner__instance-heading`
flex-column div instead of nesting the badge inside the heading, so the badge
renders stacked under the name and the TOC (which reads heading text) no
longer picks it up. User confirmed intent to roll this out to the other
planners, deferred timing ("we will do it later") — now done. Full plan:
[`plans/260911-2022-badge-stack-layout-rollout/`](../plans/260911-2022-badge-stack-layout-rollout/plan.md).

All planners now use the wrapper pattern — verified via live browser DOM
inspection (badge confirmed as a sibling of the label element, never nested
inside it) on every page:

| File | Heading element | Status |
| --- | --- | --- |
| `assets/js/planners/forticlad.js` (building rows) | `<h3>` | **Done** |
| `assets/js/planners/research.js` (T11 research track rows) | `<h4>` | **Done** |
| `assets/js/planners/robots-satellites.js` | `<h3>` | **Done** |
| `assets/js/planners/hero-equipment.js` | `<h5>` | **Done** |
| `assets/js/planners/hero-stars-exclusive-equipment.js` | `<h3>` | **Done** |
| `assets/js/planners/tomes.js` (Collections & Tomes) | `.loj-planner__instance-heading` wrapper | **Done** (reference implementation) |

Scope note: only the heading/badge wrapper + CSS treatment is confirmed
in-scope for the rollout — Tomes' additional troop-grouped `<details>`
restructuring in the same commit was specific to its fixed-count grouping
need and is not implied for the other planners unless separately requested.

Reference implementation: `assets/js/planners/tomes.js`'s `buildInstanceCard`
(the `.loj-planner__instance-heading`/`.loj-planner__instance-label` CSS is in
`_sass/custom.scss`). Full history: commit `341282e`.

### Object knowledge cross-linking rollout — In progress (2026-09-13)

Game-knowledge write-ups (role/effect/verdict per named object, e.g.
`satellite.md`, `season-2/robots.md`) used to live fully separate from the
planner tool that manages the same objects, with no link between them and, for
Satellites, a duplicated name list (`_data/terms.yml` vs
`_data/lands_of_jail/robots_satellites.yml`). Fix: keep narrative in the
markdown knowledge page as the single source of prose, give each covered
object's heading a stable `{#anchor}` id, and have the tool's yml carry an
optional `knowledgeAnchor` per object so the planner can render a "Details ↗"
link straight to that section. Brainstorm:
[`plans/reports/brainstorm-260913-1531-satellite-knowledge-tool-link.md`](../plans/reports/brainstorm-260913-1531-satellite-knowledge-tool-link.md).

| Object | Knowledge page | Tool | Status |
| --- | --- | --- | --- |
| Satellites | `satellite.md` | Robots & Satellites planner | **Done** (5 released satellites linked; 4 unreleased SSR satellites have no write-up yet, so no link) |
| Robots | `season-2/robots.md` | Robots & Satellites planner | Not started — deferred by user; robot slots already use stable `robot_N` storage keys to prep for this (see memory `pending-robot-external-link`) |
| Heroes / Hero Equipment / Collections & Tomes / Forticlad | none yet | respective planners | N/A — no dedicated narrative knowledge page exists for these yet; apply the same pattern if one is written later |

Scope note: this round is tool → knowledge links only (no reverse link from
the knowledge page back into the planner), and no stub write-ups were added
just to give every object a link target.

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
