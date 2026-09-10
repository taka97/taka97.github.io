# 2026-09-10 — Migrate Robots & Satellites planner: implementation

Executed the plan from the earlier brainstorm session
(`plans/260910-1904-migrate-robots-satellites-planner/`, 6 phases, all
complete). New page live at `/lands-of-jail/planners/robots-satellites/`
(EN+VI), new `robots-satellites-core.js` calc engine (no cross-track
prerequisites, same minimal shape as `tomes-core.js`), two new reusable
`.loj-planner__*` UI primitives (rarity badge, estimated-cost disclosure) for
the next two migrations (Hero Equipment, Hero Stars & Exclusive Equipment).

## Shape differences from the Tomes template

Robot is a dynamic add-up-to-12 category like Tomes' tracks. Satellites are
not — 9 fixed, named units across 3 rarity tiers, so their progress is stored
as an object keyed by satellite id rather than an array, and the UI splits
into 4 separate list containers (1 Robot list + 3 tier lists) instead of
Tomes' 2. That fan-out is exactly what caused the one real bug below.

## Bug caught before shipping

A code-reviewer subagent (given the full diff plus explicit knowledge of the
4-container split) found a real correctness bug: `handleRobotChange` and
`handleSatelliteChange` each read+committed *only their own* container after
a shared `validateAllLists()` gate across all 4. A valid edit made while a
*different* section briefly held an invalid range (e.g. current > target)
never got persisted — it silently reverted the next time any other section's
edit succeeded, with no error shown and a stale total displayed as if
current. Root cause: `tomes.js`'s single combined handler always re-reads
both its lists on recovery; splitting into per-container handlers dropped
that property. Fixed by collapsing into one `handleInstanceChange` +
`commitStateFromDom()` that re-reads all 4 containers and persists
`robots`+`satellites` together on every valid change, restoring the Tomes
recovery semantics without reversing the object-keyed-by-id storage decision
(that decision was correct and stays).

Also hardened `normalizeCost`'s `estimated` field to throw on malformed input
instead of silently dropping it — it's the only integrity marker for the
tool's one unconfirmed source number (R-tier level 50's Data Disk cost), so a
silent drop would be the worst possible failure mode for exactly the risk
this feature exists to surface.

## Data fidelity — independently re-verified twice

Brainstorm-time SSR bracket sums (script-verified then) were re-verified
again during review by re-fetching the live source and diffing every number,
id, and cap. All matched. One pre-existing upstream oddity survived,
correctly, both passes: `robotLevels[7].AdvancedPowerModule: 140` breaks an
otherwise monotone column and looks like a transposed `40` in lojcalc.com's
own data — but it's verbatim from source, and the plan's contract is
source-fidelity, not silent correction. Left as-is; flagged to the user
rather than "fixed."

## Verification: static first, then interactive once Chrome connected

The Chrome extension wasn't connected for most of the session, so the first
verification pass was static: Docker build (before + after the H1/M2 fixes),
a standalone Node script running the actual calc engine against the actual
built JSON data island matching every plan-specified hand-check, a
`data-role` grep confirming markup/JS agreement, and a grep confirming the
`table-helpers.js`/SCSS/nav edits are purely additive. Recorded the gap
explicitly in `phase-06-verify.md` rather than marking those items done on
logic-only checks.

The user then asked to test with Chrome before committing, and by that point
the extension had connected. Ran the full interactive pass: stock entry,
Robot to Level 50, R-tier Laser to Level 50 (triggers the estimated case),
clicked + keyboard-toggled the "≈" badge, sticky-bar scroll, reset
double-click-confirm, Add Robot past the cap (stops at 12), VI page parity,
and persistence across a reload. Also used a scripted DOM reproduction of the
reviewer's exact H1 repro (invalidate one satellite, edit the Robot while
blocked, then fix the satellite) and confirmed live that both edits land
together — the fix holds under real interaction, not just code reading. One
console error appeared (`search.js` `SyntaxError: Unexpected token '<'`) but
reproduces identically on the pre-existing Tomes & Collections page, so it's
a site-wide dev-server search-index issue, not a regression from this change.

## Output

Implementation complete, all 6 plan phases closed, one real bug fixed
pre-ship. `docs/system-architecture.md` and `docs/codebase-summary.md` both
updated (the latter was 4 spots stale — the code reviewer caught it, this
implementer's Phase 6 pass had only updated the plan-mandated
system-architecture.md section).
