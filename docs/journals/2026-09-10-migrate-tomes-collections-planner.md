# 2026-09-10 — Migrate Tomes & Collections planner: brainstorm + plan

Continued the lojcalc.com migration series (after FC Buildings & T11 Research
-> Forticlad planner). Brainstormed and validated a plan to migrate "Tomes &
Collections" as a new standalone page.

## Key finding
Source tool (`tomes-collections.html` + `shared.js`, captured 2026-09-10) is
structurally simpler than Forticlad: two repeatable instance categories
(Tomes, capped 18; Collections, capped 6) with **no cross-track
prerequisites** at all. This rules out reusing `planner-core.js`'s
requirement-cascade engine — Phase 2 of the new plan is a new, minimal
`tomes-core.js` instead.

## Decisions
- New standalone page (`/planners/tomes-collections/`), not merged into
  Forticlad's page; one page, two sections, one shared stock pool.
- Layout mirrors the source's structure; styling uses this site's own
  framework, not source's CSS.
- Generalized `.forticlad-planner__*` SCSS into a shared `.loj-planner__*`
  block (plus two Forticlad/Research-flavored element renames:
  `__building-range(s)` -> `__instance-range(s)`, `__troop-group` ->
  `__group`) — pays off for the 3 remaining future tool migrations.
- New "Reset to default" button — first of its kind on this site; scoped to
  the new page only.
- VI content created now with the page's full structure, but the 6 new
  resource names + 11 collection tier names left as EN text this round,
  translated later (explicit user decision, not an oversight).

## Output
- Brainstorm report: `plans/reports/brainstorm-260910-1646-migrate-tomes-collections-planner.md`
- Validated plan: `plans/260910-1652-migrate-tomes-collections-planner/` (6 phases)
- No code changed this session — implementation not started yet.
