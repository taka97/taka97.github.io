# 2026-09-10 — Migrate Tomes & Collections planner: implementation

Executed the plan from the earlier brainstorm session
(`plans/260910-1652-migrate-tomes-collections-planner/`, 6 phases, all
complete). New page live at `/lands-of-jail/planners/tomes-collections/`
(EN+VI), new `tomes-core.js` calc engine (no cross-track prerequisites, so a
much smaller engine than Forticlad's requirement-cascade one), `.loj-planner__*`
shared SCSS block now backing two pages, new double-click-confirm "Reset to
default" control, new sticky missing-resources bar.

## Bugs caught before shipping

A code-reviewer subagent caught two real bugs from the Phase 4 SCSS
generalization step — a blanket
`sed 's/forticlad-planner/loj-planner/g'` across 6 files reached further than
intended:
- Corrupted Forticlad's `ref: loj-forticlad-planner` front-matter into
  `ref: loj-loj-planner`. `ref` is a page-identity token the language switcher
  and hreflang generation key off — not a CSS class — so it was never in
  scope for a class-prefix rename.
- Renamed `data-forticlad-planner` (JS root-element hook owned by
  `forticlad.js`) and `data-role="building-ranges"` — functionally harmless
  today (self-consistent rename) but a scope-creep trap: a generic
  `data-loj-planner` attribute invites the next migrated tool to collide with
  Forticlad's script. Both reverted.
  **Lesson: string-rename-by-sed across a class prefix must explicitly
  exclude non-CSS identifiers (`ref`, `data-*`, `id`) even when they share
  the substring.**

Same review caught a real cross-tab data-loss bug in `tomes.js`'s
`persist()`: it re-fetched the live profile correctly but then wrote the
*entire* `tomes-collections` blob from in-memory state instead of merging via
`getToolData()` first — two tabs open, one saving stock, would let the other's
stale instance list silently clobber it. Fixed to match the
`getToolData(latest, tool) + spread + changes` pattern already established in
`forticlad.js`.

I found one more myself during live-browser QA: the sticky bar's own
`display: flex` rule was beating the UA's `[hidden] { display: none }` at
equal specificity, so it rendered even when JS set `hidden = true`. Fixed
with an explicit `&[hidden] { display: none; }`.
**Worth remembering for any future `[hidden]`-toggled element that also
carries its own `display` override.**

## False positive worth noting

A tester subagent's independent YAML check reported a FAIL by comparing a
single row's raw value (e.g. `rare` row's own `CommonCoin: 13500`) against
the plan's *cumulative* expected total (`start->rare = 24000`, summing four
rows). Hand-verified the cumulative sum was correct — the tester's ad-hoc
script just didn't replicate the engine's summing semantics.
**Lesson: when delegating verification of a level-0-to-N cumulative
calculation, require the check to call the real function, not diff raw
source rows.**

Also fixed an arithmetic slip in the plan doc itself (Phase 2 claimed
`collectionLevels.length === 44`, contradicting Phase 1's own verified count
of 43) so the next migration doesn't inherit the wrong number.

## Verification

Docker Jekyll build (before + after review fixes), `node --check` against
`.mjs` copies of every touched JS file (plain `.js` node --check misses
ES-module-only syntax errors), a standalone engine sanity script matching
every hand-computed number from Phase 1/6 of the plan, and a live Chrome QA
pass: instance caps (18 tomes / 6 collections), reset double-click-confirm,
stock badge states, combined breakdown table, sticky bar, VI page, and a
Forticlad regression check post-SCSS-rename.

## Output

Implementation complete, all 6 plan phases closed. No further action pending
on this tool; SCSS generalization sets up the next 3 lojcalc.com migrations.
