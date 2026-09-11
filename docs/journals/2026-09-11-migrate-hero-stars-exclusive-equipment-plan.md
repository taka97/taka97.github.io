# 2026-09-11 — Migrate Hero Stars & Exclusive Equipment planner: brainstorm + plan

Fifth and **last** tool in the lojcalc.com migration series (after Forticlad,
Tomes & Collections, Robots & Satellites, Hero Equipment — all shipped).
Brainstormed and planned a migration of "Hero Stars & Exclusive Equipment"
(`https://www.lojcalc.com/hero-stars-exclusive-equipment.html`). No code
touched this session — implementation not started, user ended the session
after planning.

## Scouting, same recipe as the prior four
Client-rendered SPA, no static HTML to parse. Read `window.trackById()` /
`window.resourceLabel()` (page-global functions leaked from an inline
script) and dumped `localStorage['resource-calc-herostars-state-v1']`
(schemaVersion 2) via live browser automation. Nothing new in method — this
is now a well-worn path across all 5 migrations.

## Source shape: simplest of the 5, by design
Two independent addable categories — separate "+ Add Hero" buttons for Hero
Stars and Exclusive Equipment, no shared state between them. Confirmed by
grep every level's `requires: []` is empty on both tracks: **no cross-track
prerequisite at all**, unlike Hero Equipment's Rarity→Mastery cascade. Also
**no `estimated` cost flags anywhere** (checked every level's field set),
unlike all 4 prior tools — `renderEstimatedBadge` simply won't be invoked
here. Two tracks:

- **Hero Stars** (`herostar_N`, keyed, 32 levels): `start` → `recruited` →
  5 star tiers × (5 stage sub-levels + 1 whole-tier checkpoint). 100%
  `HeroFragment` cost, labeled "Redeem" in the UI.
- **Exclusive Equipment** (`exclusiveequip_N`, numeric, 11 levels, 0–10):
  100% `ExclusiveEquipPart` cost, labeled "Exclusive Weapon Parts".

## The one genuinely new detail: generalizing a literal suffix check
Hero Equipment's Target-dropdown filter already strips one stage-checkpoint
suffix (`hero-equipment.js`'s `!id.endsWith('_s1')`). This tool has 5 stage
checkpoints per star tier, not 1, so the filter needs generalizing to a
regex (`/_s\d+$/`) instead of a literal string compare. Trivial change, but
it's the only piece of this plan that isn't a straight copy-paste of an
existing pattern — everything else is Robots & Satellites' addable-flat-sum
engine shape plus Hero Equipment's keyed-level filtering, recombined with no
new engine primitive or UI component.

## Caps had to be discovered empirically
The 6-instance cap on each addable list isn't stated anywhere in the page's
visible copy. Found it by scripting 20x dispatched `.click()` calls on both
`[data-add-item="HeroStar"]` and `[data-add-item="ExclusiveEquip"]` buttons
and watching them go `disabled` at 6 (confirmed in the `localStorage` state's
`counts.HeroStar` / `counts.ExclusiveEquip`). Matches the
`robots_satellites.yml` `caps: { robots: 12 }` precedent — same enforcement
pattern (disable button + `positiveInteger` guard in the core engine),
different numbers. Worth remembering for any future scrape: don't trust a
page's stated copy for limits — click through the actual control.

## Closing the series
This was the last tool named in `docs/project-roadmap.md`'s "Lands of Jail
tools" out-of-scope list. Plan's Phase 5 and success criteria include
updating that roadmap section once this ships — after this plan executes,
there are no more lojcalc.com tools left to migrate.

## Output
- Brainstorm report:
  `plans/reports/brainstorm-260911-0000-migrate-hero-stars-exclusive-equipment-planner.md`
- Plan: `plans/260911-0013-migrate-hero-stars-exclusive-equipment-planner/`
  (plan.md + 5 phases: Start, Data File and Calc Engine, UI Wiring and
  Storage, Content Pages and Navigation, Verify). Both level tables (32-row
  Hero Stars, 11-row Exclusive Equipment) fully transcribed and verified
  live, ready to paste directly into Phase 2.
- Naming confirmed with user: full-title slug throughout (data file
  `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`, core engine
  `hero-stars-exclusive-equipment-core.js`, etc.) over the shorter
  `hero-stars-equipment` alternative.
- User ended the session after planning, choosing not to run
  `/ak:plan validate` or `/ak:cook` yet. Plan is ready to execute next
  session.
