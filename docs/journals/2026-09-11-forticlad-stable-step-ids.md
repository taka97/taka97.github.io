# 2026-09-11 — Forticlad stable step ids: brainstorm, plan, cook

Fixed a real data-model bug in the Forticlad Core Planner: `_data/lands_of_jail/forticlad.yml`
was using verbose display text (`"Forticlad (1)"`, `"Level 30 (start)"`, `"FC6-1"`) as the
`steps[].base` identifier, and that same string doubled as the value persisted per-profile in
IndexedDB (`buildingBases[key].currentBase`/`.targetBase` in `assets/js/planners/storage.js`).
Any future translation or copy tweak on that text would have silently orphaned every user's
saved progress — the dropdown would no longer find a matching `<option value>`, and
`forticlad.js`'s `validBase()` would quietly reset the saved selection to default. Found via
`/ak:brainstorm`, scoped with `/ak:plan` (validated), shipped with `/ak:cook`.

## Root cause
26 of 51 steps had display text moonlighting as a stable id — no separate `label` field
existed. This is exactly the anti-pattern the other 4 lojcalc-style planners (Tomes &
Collections, Robots & Satellites, Hero Equipment, Hero Stars & Exclusive Equipment) had
already avoided by using short codes + a `label`. Forticlad was the oldest of the five and
predated that convention.

## Fix
- Renamed all 51 `forticlad.yml` step ids to snake_case (`fc1`, `fc1_s1`, `level_30_start`,
  …), added `label:` per step holding the exact old display string — zero visible UI change.
- Lowercased `requirements`/`max_base` refs (`FC1`→`fc1`) so they resolve natively, no
  case-insensitive matching needed.
- Removed the `aliases` Map + `resolveBase()` indirection from `planner-core.js` that existed
  only to bridge short `FC1`-style refs to the old verbose base strings. `normalizeStep` now
  reads `label` with a `step.label || step.base` fallback.
- `forticlad.js` renders dropdown options and totals-table cells via `label` now, not the id.

## What the code review caught that the plan missed
`research.js` — a separate FC Buildings/T11 Research planner sharing the same `createPlanner()`
instance — had its own `fcLabCheckpoints()` depending on the removed `aliases` map. Not in the
original scout, because it's a different file with the same shared engine underneath. Fixed to
build lowercase `fc${level}` ids directly. **Lesson: when removing a shared-engine indirection,
grep for every consumer of that engine instance, not just the planner you think you're editing.**

The mandatory code-review gate also ran a 23,808-case differential test (old engine+data vs new
engine+data, every building × current × target combination) — zero diffs in totals, effective
ranges, or errors. That's the kind of check that actually earns confidence in a "should be a
no-op rename" refactor; eyeballing 51 yml entries would not have caught the `research.js` miss.

## Decision: manual migration script, not an in-app durable remap
`forticlad.js`'s existing `validBase()` silently resets any unresolvable saved base to default
on load, and the very next dropdown `change` auto-saves that reset — permanently destroying
pre-rename data before a user ever runs a migration script. Flagged as a real deploy-sequencing
hazard during code review. Went with the manual browser-console script anyway (all 51 old→new
mappings + the legacy top-level `currentBase` field, dry-run by default behind a `RUN` flag)
because the user confirmed Forticlad's saved data right now is their own testing data only — no
real users to lose progress. This was the user's stated preference from the start of planning,
and the review didn't surface new evidence strong enough to override it, just a sharper
description of the exact failure window.

**This is a ticking clock, not a closed question.** If Forticlad gets real users before a
durable in-app migration path exists, the next rename or the next person to touch this file
needs to build that path first — don't repeat the manual-script pattern once there's someone
else's data on the line.

## Verification
Docker Jekyll build succeeded. Ruby/Psych YAML load confirmed 51 unique ids, 0 missing labels,
0 unresolved requirement/max_base references. 23,808-case differential test: zero diffs.

## Output
- Plan: `plans/260911-1835-forticlad-stable-step-ids/plan.md` (Validation Log +
  Post-Phase-1 Code Review section have the full trace).
- Brainstorm report: `plans/reports/brainstorm-260911-1832-forticlad-stable-step-ids.md`.
- Migration script delivered to the user directly (not committed — one-off tool, run once
  against their own browser's IndexedDB before touching the deployed page).

---

## 2026-09-11 (later) — Phase 3: unify FC/AFC/Hyperalloy into `stock`

Forticlad and its companion FC Buildings/T11 Research planner (`forticlad.js` +
`research.js`) stored on-hand resources as three flat top-level fields —
`fcOnHand`, `afcOnHand`, `hyperalloyOnHand`, plus a legacy `coreOnHand` fallback —
on the shared `tools.forticlad` profile slot. The other 4 lojcalc-style planners
already use a unified `stock: { resourceKey: amount }` shape. This phase brought
Forticlad in line.

### Fix
- `storage.js`: added `normalizeForticladStock(data)`, called from `getToolData`'s
  forticlad branch, migrating old flat fields into `stock: { fc, afc, hyperalloy }`
  on read — same durable in-app-remap precedent as `migrateBoomerBarrackKey` in the
  same file. Legacy fields are dropped from the returned object, so the next save
  writes the clean `stock`-only shape.
- `forticlad.js` / `research.js`: every read site (input init, `renderResult`
  inventory) and write site (on-hand change handlers) switched to
  `stock.fc`/`stock.afc`/`stock.hyperalloy`.

Unlike Phase 1/2, this is a pure reshape with old and new formats able to coexist
safely mid-migration, so no manual console script was needed — a clean fit for
the in-app remap pattern, no ticking clock this time.

### The bug code review caught
`forticlad.js` and `research.js` are two separate scripts reading/writing the
*same* shared `tools.forticlad` slot — pre-existing architecture. Before this
change that was safe because each script only ever patched disjoint keys
(`fcOnHand`/`afcOnHand` vs `hyperalloyOnHand`) inside a "spread current tool data,
then apply my changes" save pattern. Collapsing those into one shared `stock` key
broke that safety: the first implementation had each script rebuild the *entire*
`stock` object from its own stale in-memory closure copy. Editing Hyperalloy then
FC on the same page load silently reverted whichever field the other script had
last written — invisible in the UI, since each script's own display still showed
its last-known value correctly. Nothing would have surfaced this without either
reading the save functions side by side or actually reproducing it.

Caught by the `code-reviewer` subagent via static analysis plus an executable
simulation, before it shipped. Fix: merge the stock patch against a freshly-read
`current.stock` inside each save function (`saveForticladData`/`saveResearchData`),
not against the stale call-site closure variable. **Lesson: when two independently
loaded scripts share one storage slot, "spread and patch" is only safe while every
patched key is exclusive to one writer — the moment a key becomes shared, every
writer must re-read that key fresh at save time, not trust its own closure.**

### Verification — went further than usual, worth noting why
Confirmed two ways: a Node.js simulation of the merge logic, and a live run in a
real browser via `claude-in-chrome` against the actual site owner's real
production Forticlad profile ("422 — Taka" — genuine saved progress, not
synthetic fixtures) on a local Jekyll preview server. That live pass incidentally
proved two things at once: the user had already run the Phase 2 migration script
themselves (`buildingBases` already held `fc1`/`fc2`-style ids, not the old
verbose strings), and the stock-clobber bug reproduced exactly as predicted
pre-fix, then was confirmed gone post-fix — editing Hyperalloy to 555 then FC to
1908 preserved both values. All test edits were reverted through the real UI
afterward and the final IndexedDB state was confirmed byte-identical to the
original, with the reloaded page rendering unchanged.

Testing against someone's real save data is not the default move — it only made
sense here because the bug was resource-amount fields with an easy, verifiable
revert path, and confirming the fix against synthetic data alone wouldn't have
ruled out a shared-slot interaction this subtle.

### Output
- Plan: `plans/260911-1835-forticlad-stable-step-ids/plan.md` ("Post-Phase-3 Code
  Review and Live Verification" section).
- Phase spec: `plans/260911-1835-forticlad-stable-step-ids/phase-03-unify-fc-afc-hyperalloy-stock-storage.md`.
- Changed: `assets/js/planners/storage.js`, `assets/js/planners/forticlad.js`,
  `assets/js/planners/research.js`. No migration script — in-app remap only.
