# Brainstorm — migrate Hero Stars & Exclusive Equipment planner (lojcalc.com)

5th and **last** tool in the lojcalc.com migration series (after Forticlad,
Tomes & Collections, Robots & Satellites, Hero Equipment — roadmap item in
[project-roadmap.md](../../docs/project-roadmap.md) line 35 names this the
final remaining out-of-scope tool). Source:
`https://www.lojcalc.com/hero-stars-exclusive-equipment.html`. Scouted via
live browser: `window.trackById()`/`window.resourceLabel()` (page-global
functions leaked from an inline, non-module script) plus a
`localStorage['resource-calc-herostars-state-v1']` dump (schemaVersion 2) —
same "read the live client state" method as all 4 prior migrations, no
static-HTML source to parse (client-rendered SPA).

## Source shape

**Two independent addable categories, no cross-track link.** Page shows two
separate "+ Add Hero" buttons — one under "⭐ HERO STARS", one under
"⚔️ EXCLUSIVE EQUIPMENT" — each with its own instance counter
(`counts.HeroStar`, `counts.ExclusiveEquip` in the state dump). Source's own
copy confirms independence: *"The two add buttons are independent."* This is
architecturally **simpler than Hero Equipment** (no Rarity→Mastery
prerequisite pairing — confirmed every level's `requires: []` is empty on
both tracks) and shaped like **Robots & Satellites** (two categories, each a
flat add-up range-sum, no cross-track requirement resolution needed).

- **Hero Stars** track (`herostar_N`, `levelStyle: "keyed"`, 32 levels):
  `start` (Not recruited) → `recruited` → 5 star tiers, each tier =
  5 stage sub-levels (`starK_s1`..`starK_s5`, "K stars · stage N" in the UI)
  + 1 "whole tier" checkpoint (`starK`). All 32 levels' cost is 100%
  `HeroFragment` (labeled **"Redeem"** in the UI — display label confirmed
  via `resourceLabel('HeroFragment')`), `ExclusiveEquipPart` always 0 on
  this track.
- **Exclusive Equipment** track (`exclusiveequip_N`, `levelStyle: "numeric"`,
  11 levels, `0`..`10`): cost is 100% `ExclusiveEquipPart` (labeled
  **"Exclusive Weapon Parts"**), `HeroFragment` always 0 on this track.
- **Target-dropdown filtering** (UI-layer, not core-engine, per
  `hero-equipment.js:105`'s existing `!id.endsWith('_s1')` precedent): Hero
  Stars' Target list must exclude `start` and all 5 stage sub-levels per
  tier (`_s1`..`_s5`), leaving 6 selectable targets (`recruited`, `star1`..
  `star5`) — matches the live page's Target dropdown exactly (6 options:
  "Recruited (0 stars), 1 star, 2 stars, 3 stars, 4 stars, 5 stars"). This
  needs a **generalized suffix filter** (`/_s\d+$/`, not just `_s1`) since
  this tool has 5 stage checkpoints per tier vs. Hero Equipment's 1 — the
  one genuinely new UI-layer detail vs. straight copy-paste, still trivial
  (one regex vs. one literal suffix check).
- **No `estimated`/unconfirmed-cost flags anywhere** (checked every level
  key set: `{id, cost, requires, targetCheckpoint?}` — no `estimated` field
  on either track, unlike the other 4 tools). No estimated badge needed;
  `renderEstimatedBadge` simply won't be invoked for this planner.

## Resources

2, cleanly split one-per-track (no shared/overlapping resource):

| Internal key | Display label | Spent by |
|---|---|---|
| `HeroFragment` | Redeem | Hero Stars track only |
| `ExclusiveEquipPart` | Exclusive Weapon Parts | Exclusive Equipment track only |

## Data-fidelity check

Source's own "What this does" copy: *"Cost is identical across all heroes."*
— confirmed structurally: `trackById()` for `herostar_1`/`exclusiveequip_1`
returns the shared level-cost tables reused per-instance, same
"one shared cost table, N addable instances" shape as Tomes & Collections
and Robots & Satellites (not per-instance unique data). Full level arrays
captured and verified complete (32/32 Hero Stars levels, 11/11 Exclusive
Equipment levels, all cost values transcribed) — ready to paste directly
into a plan's data-file phase, no re-fetch needed.

## Architecture decision

**No new engine capability.** This is the first of the 5 tools with *both*
"addable instances" (Tomes/Robots/Satellites' shape) *and* "keyed levels
with stage checkpoints excluded from Target" (Hero Equipment's shape) —
but never needed together before. Concretely:

- New `hero-stars-equipment-core.js`, modeled directly on
  `robots-satellites-core.js`'s `buildBreakdown()` (flat per-instance
  range-sum over a shared level-cost array, no fixed-point/prerequisite
  loop — this tool has no `requires` at all) applied independently to two
  instance arrays (Hero Stars instances, Exclusive Equipment instances).
- Hero Stars' keyed levels need the same `id`-based Target-list filter
  `hero-equipment.js` already has for Rarity (`_s1` suffix) — generalized
  to strip any `_s\d+` stage suffix. This lives in the UI-wiring file
  (`hero-stars-equipment.js`), not the core engine, matching where Hero
  Equipment put it.
- Reused as-is: `.loj-planner__*` SCSS block, `table-helpers.js` (minus
  `renderEstimatedBadge`, unused here), the add/remove instance UI pattern
  from Tomes & Collections/Robots & Satellites, `storage.js`'s generic
  read-latest-merge-write (no central tool-key registry to update —
  confirmed empty grep against `storage.js`).
- **State shape** (new `hero-stars-exclusive-equipment` profile tool-data
  key): two independent instance arrays, not paired —
  ```
  { stock: {...2 resources},
    heroStars: [ {currentIndex, targetIndex}, ... ],
    exclusiveEquipment: [ {currentIndex, targetIndex}, ... ] }
  ```

## Caps (empirically verified, not visible in static page copy)

Clicking `[data-add-item="HeroStar"]` and `[data-add-item="ExclusiveEquip"]`
20x each via dispatched `.click()` events shows both buttons go `disabled`
at **6 instances** (`counts.HeroStar` / `counts.ExclusiveEquip` both cap at
6 in the `localStorage` state). Matches `robots_satellites.yml`'s
`caps: { robots: 12 }` precedent — add `caps: { heroStars: 6,
exclusiveEquipment: 6 }` to the new data file and enforce it the same way
`robots-satellites-core.js:45`/`robots-satellites.js:209` do (disable the
add button, `positiveInteger` guard in the core engine's data validation).

## Naming (confirmed with user)

Full-title slug, matching the source tool's exact name verbatim (user chose
this over the shorter `hero-stars-equipment` option):

- Data file: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`
- Core engine: `assets/js/planners/hero-stars-exclusive-equipment-core.js`
- UI wiring: `assets/js/planners/hero-stars-exclusive-equipment.js`
- Content pages: `contents/{en,vi}/lands-of-jail/planners/hero-stars-exclusive-equipment.md`
- URL: `/{en,vi}/lands-of-jail/planners/hero-stars-exclusive-equipment/`
- Nav entry: "Hero Stars & Exclusive Equipment" in both `loj-en`/`loj-vi`
  Tools groups, positioned after "Hero Equipment" (last item before
  Settings) — confirmed insertion point at `_data/navigation.yml:47-48`
  (EN) / `:83-84` (VI).

## Open questions (for plan phase, not blocking)

- Exact EN/VI copy for the "Redeem" resource label (source's own English
  copy is already slightly cryptic — "Redeem" as a currency name — confirm
  whether to keep verbatim or clarify, and pick the VI translation) and for
  "Exclusive Weapon Parts".
- Star-tier/stage display wording ("2 stars · stage 1" source phrasing) —
  confirm EN/VI wording consistency with Hero Equipment's existing
  "(auto-added — prerequisite)" / "· levels maxed" tone, though no
  auto-added rows exist here (no cross-track requires).
- `docs/system-architecture.md` "Hero Stars & Exclusive Equipment Planner
  client flow" section is mandatory per established convention (same
  non-optional pattern as the prior 4 tools).
- This closes the entire lojcalc.com migration series named in
  `docs/project-roadmap.md`'s "Lands of Jail tools" section — plan phase
  should update that section's "remain out of scope" line once this ships.

## Output

Brainstorm report: this file. Architecture is fully precedented (4 prior
migrations establish "own -core.js, shared SCSS, shared table helper,
profile tool-data key"; the only combination not yet exercised — addable
instances + keyed-level Target filtering — is scoped above with no new
primitive needed). Proceeding to `/ak:plan` with this report as context.
