# Brainstorm: lojcalc.com Style Alignment for Shared `.loj-planner` Tools

Date: 2026-09-10. Branch: `feat/tomes-collections-planner`.

## Problem statement

User referenced source site https://www.lojcalc.com/index.html when building the
Forticlad FC/AFC Planner and wanted to double-check the intended design rule: keep
the source site's *layout/interaction patterns*, but colors/style should match our
own TeXt-based framework, not lojcalc's dark terminal theme. Needed to verify what's
already true vs. what's still a gap, across all lojcalc-derived planner tools (not
just Forticlad), since they share one `.loj-planner` SCSS/JS component family.

## Method

- Scouted existing planner pages/data/JS (`forticlad.md`, `tomes-collections.md`,
  `forticlad.js`, `tomes.js`, `_sass/custom.scss`, `docs/system-architecture.md`).
- Viewed lojcalc.com/index.html live via browser (FC Buildings & T11 Research tool,
  scrolled through Current Stock / What You're Missing / Buildings sections).
- Viewed our own live production Forticlad page (games.taka97it.com) and Tomes &
  Collections source (not yet deployed — this branch is unmerged) to check actual
  current state rather than assume from memory. An earlier check against a local
  ad-hoc Python static server gave a false negative (JS didn't render) — corrected
  by checking the real deployed page per user's steer to use claude-in-chrome
  against the live site instead.

## lojcalc.com layout inventory

- Dark theme: black background, monospace font, red-orange accent (~#e8543c)
- Top tab bar to switch between its 5 tools (FC Buildings & T11 Research, Tomes &
  Collections, Robots & Satellites, Hero Equipment, Hero Stars & Exclusive Equipment)
- EN/FR language toggle
- Bracket-style section labels: `[ CURRENT STOCK ]`, `[ WHAT YOU'RE MISSING ]`
- Per-building/instance cards: colored left-accent border, status badge
  (`target set` / `no target` / `NEW`)
- Current/Target as dropdown `<select>` (FC-level pairs), not free numeric ranges
- Results table: TARGET | FROM | TO | COST
- Sticky bottom bar showing live running resource total

## Current state (verified, not assumed)

Already matches lojcalc's structural intent, using our own theme's colors:

- Light TeXt theme, sidebar nav (not a tab bar — TeXt's sidebar renders only two
  levels; a top tab switcher is structurally infeasible without forking the theme)
- Amber `#d97706` accent on missing-summary cards' left border — already close in
  hue to lojcalc's red-orange, consistent with the site's existing orange link/
  active-nav color; no new color introduced
- Current/Target dropdown `<select>` — **already live** in Forticlad buildings
  (verified on games.taka97it.com, e.g. "Current Base: Level 30 (start)" /
  "Target Base"); Tomes & Collections instances use the same
  `.loj-planner__instance-range` component
- Missing-summary cards with left-accent border + badge — live in both tools
- No bracket-style labels — plain TeXt headings (kept, see decision below)

Real gaps vs. lojcalc:

- **Sticky bottom "Missing" bar**: already implemented for Tomes & Collections
  (`.loj-planner__sticky-bar` SCSS + `updateStickyBar`/`scrollToSummary` in
  `tomes.js`, showing "Missing: X, Y, Z" and scrolling to the summary on click/Enter)
  but **not yet ported to Forticlad** — `forticlad.md` has no sticky-bar markup.
- **Per-instance status badge** ("target set" / "no target"): not implemented
  anywhere. lojcalc's `NEW` badge is data-driven (flags a recently-added
  building/track), not state-derived — separate from the other two.

## Decisions (user-confirmed)

1. **Scope**: applies to the whole shared `.loj-planner` family — Forticlad
   (buildings + research), Tomes & Collections, and future lojcalc migrations
   (Robots & Satellites, Hero Equipment, Hero Stars & Exclusive Equipment) — not
   just Forticlad alone.
2. **Sticky bar**: port existing Tomes & Collections pattern into Forticlad
   (buildings + research). Reuse existing SCSS; add markup + JS wiring only.
3. **Per-instance status badge**: add `target set` / `no target` to every
   `.loj-planner__instance-range` row, across all four instance groups (Forticlad
   buildings, Forticlad research tracks, Tomes, Collections) — consistent since they
   all share the same markup pattern. Pure function of existing current/target
   state; zero data-schema changes.
4. **`NEW` badge**: **skipped** (YAGNI). Would require a new `new: true` field in
   `_data/lands_of_jail/*.yml` plus an undefined editorial rule for who unsets it
   and when. No current need.
5. **Accent color**: keep amber `#d97706`. No shift to lojcalc's literal red-orange.
6. **Theme**: keep the site's shared light theme. No dark "calculator" surface for
   planner sections — avoids a jarring light→dark→light flash when navigating via
   the shared sidebar, and keeps one visual language across all guide pages.
7. **Bracket-style section labels**: **declined** — would be a site-wide
   typographic departure inconsistent with every non-planner guide page.
8. **Top tab-bar tool switcher**: not viable under TeXt's two-level sidebar
   constraint; not proposed as an option. Sidebar nav remains the navigation model
   for switching between planner tools.

## Implementation considerations

- Sticky bar: `forticlad.js` and `research.js` are independent engines sharing one
  profile tool-data key (`forticlad`) — the sticky bar likely needs to reflect
  combined missing state from whichever section currently has visible results, or
  two independent bars (one per section) mirroring Tomes & Collections' single-list
  simplicity. Needs a concrete decision in planning, since Forticlad (buildings +
  research, cross-entity prerequisites) is structurally more complex than Tomes &
  Collections (flat, prerequisite-free).
- Status badge: a small shared helper is likely reusable across `forticlad.js`,
  `research.js`, and `tomes.js` (e.g. in `table-helpers.js`) since the badge logic
  ("target > current" vs "target == current") is identical in each engine.
- No data file changes needed for either gap.

## Risks

- Forticlad's sticky bar needs a design call (single combined bar vs. per-section)
  that Tomes & Collections' simpler flat model didn't have to make — flag this
  explicitly in the plan's phase breakdown rather than assuming Tomes & Collections'
  exact pattern transfers 1:1.

## Next steps

- Hand off to `/ak:plan` (standard mode, not `--tdd`) referencing this report.

## Unresolved questions

- None outstanding — all open items were resolved via user Q&A above.
