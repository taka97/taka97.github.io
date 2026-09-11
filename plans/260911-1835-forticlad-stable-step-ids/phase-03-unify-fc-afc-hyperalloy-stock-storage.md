---
phase: 3
title: "Phase 3: Unify FC AFC Hyperalloy stock storage"
status: completed
priority: P2
effort: "45m"
dependencies: [1, 2]
---

# Phase 3: Unify FC AFC Hyperalloy stock storage

## Overview
Forticlad's on-hand inventory (FC, AFC, Hyperalloy) is currently stored as
three flat top-level fields on `tools.forticlad` (`fcOnHand`, `afcOnHand`,
`hyperalloyOnHand`, plus a legacy `coreOnHand` fallback for `fcOnHand`).
Every other lojcalc-style planner (Tomes & Collections, Robots & Satellites,
Hero Equipment, Hero Stars Exclusive Equipment) stores the equivalent data as
a single `stock: { resourceKey: amount }` object. This phase reshapes
Forticlad's on-hand fields into that same `stock: {}` convention, with an
in-app migration on read (mirroring the existing `migrateBoomerBarrackKey`
precedent in the same file) so no manual script is needed this time.

## Requirements
- Functional: `tools.forticlad.stock` becomes `{ fc?: number, afc?: number, hyperalloy?: number }`,
  matching the shape/spirit of `sanitizeStock` in the other 4 planners (only
  valid non-negative integers present; missing/invalid keys simply absent).
- Functional: existing saved profiles with the old flat fields
  (`fcOnHand`/`afcOnHand`/`hyperalloyOnHand`/`coreOnHand`) must keep working
  with zero data loss and no manual action — migrated automatically on next
  read via `getToolData`, old fields dropped on next write (same durable
  pattern `migrateBoomerBarrackKey` already uses for building keys).
- Non-functional: no UI/HTML change — this is a storage-shape change only.
  The 3 named inputs (`fc-on-hand`, `afc-on-hand`, `hyperalloy-on-hand` in
  `contents/{en,vi}/lands-of-jail/planners/forticlad.md`) are NOT genericized
  into the other tools' `data-role="stock-input"`/`data-resource-key` pattern
  — out of scope, not requested, and there are only ever exactly 3 fixed
  fields here (no dynamic resource list to justify the generic component).

## Architecture
- `storage.js`'s `getToolData` forticlad branch already special-cases this
  tool (existing `fcOnHand`/`coreOnHand` fallback + `migrateBoomerBarrackKey`
  call) — extend it with a `normalizeForticladStock(data)` helper that:
  1. Starts from `data.stock` if present (already the new shape).
  2. Fills in any missing `fc`/`afc`/`hyperalloy` key from the legacy flat
     fields (`fcOnHand ?? coreOnHand`, `afcOnHand`, `hyperalloyOnHand`) when
     `Number.isInteger` and not already set in `stock`.
  3. Returns only the resolved `stock` object — `getToolData` no longer
     returns `fcOnHand`/`afcOnHand`/`hyperalloyOnHand`/`coreOnHand` at all
     (dropped on the very next `saveForticladData`/`saveResearchData` write,
     since both spread `...getToolData(latest, 'forticlad')` as their base
     before applying `changes`).
- `forticlad.js` and `research.js` both already read/write through
  `getToolData`/`updateToolData` for the shared `'forticlad'` tool — update
  every read site (`toolData.fcOnHand ?? toolData.coreOnHand` →
  `toolData.stock?.fc`, etc.) and every write site (`saveForticladData({ fcOnHand: value })`
  → `saveForticladData({ stock: { ...toolData.stock, fc: value } })`) to use
  `stock`.

## Related Code Files
- Modify: `assets/js/planners/storage.js` (`getToolData` forticlad branch)
- Modify: `assets/js/planners/forticlad.js` (read sites: init `fcOnHand`/`afcOnHand`
  input values, `renderResult`'s `inventory` object; write site: the
  `[fcOnHand, afcOnHand].forEach` change handler)
- Modify: `assets/js/planners/research.js` (read site: init `hyperalloyOnHand`
  input value, `renderResult`'s `inventory` value; write site: the
  `hyperalloyOnHand` change handler)

## Implementation Steps
1. In `storage.js`, add `normalizeForticladStock(data)` and use it in
   `getToolData`'s forticlad branch in place of the current inline
   `fcOnHand`/`afcOnHand` spread — return `{ ...data, stock, buildingBases: ... }`
   WITHOUT the legacy flat fields (destructure them out or build the return
   object explicitly rather than spreading all of `data`).
2. In `forticlad.js`:
   - Init: `elements.fcOnHand.value = Number.isInteger(toolData.stock?.fc) ...`,
     same for `afcOnHand` → `toolData.stock?.afc`.
   - Change handler: map `input.dataset.role` (`'fc-on-hand'`/`'afc-on-hand'`)
     to stock key (`'fc'`/`'afc'`), save
     `{ stock: { ...getToolData(profile, 'forticlad').stock, [stockKey]: value } }`.
   - `renderResult`: `const inventory = { fc: toolData.stock?.fc, afc: toolData.stock?.afc };`.
3. In `research.js`:
   - Init: `toolData.stock?.hyperalloy` for `elements.hyperalloyOnHand.value`.
   - Change handler: save `{ stock: { ...getToolData(latest, 'forticlad').stock, hyperalloy: value } }`.
   - `renderResult`: `const inventory = toolData.stock?.hyperalloy;`.
4. Grep the whole repo once more for `fcOnHand|afcOnHand|hyperalloyOnHand|coreOnHand`
   to confirm no other consumer was missed (same diligence as Phase 1's
   code-review gate caught `research.js`'s hidden `aliases` dependency).
5. Docker Jekyll build + manual browser check: enter FC/AFC/Hyperalloy amounts,
   reload, confirm they persist; confirm a profile with old-shape data (create
   one by temporarily reverting, or hand-craft via console) still shows its
   amounts correctly and gets cleanly migrated on first save.

## Post-Implementation Code Review (mandatory gate)

`code-reviewer` subagent found one **critical** regression before this shipped:
`forticlad.js` and `research.js` are two separate scripts that both read/write
the same shared `tools.forticlad` slot (pre-existing architecture). Before
this phase, each script only ever patched disjoint top-level keys
(`fcOnHand`/`afcOnHand` vs `hyperalloyOnHand`), so the whole-object
`{ ...getToolData(latest, 'forticlad'), ...changes }` write pattern was safe.
Making `stock` a single shared key broke that: each script's save function
rebuilt the *entire* `stock` object from its own module-level `profile`
closure (captured at page load / last own save), so editing Hyperalloy then
FC (or the reverse, on the same page load, no reload in between) silently
reverted whichever field the *other* script last wrote — invisible in the UI
since each script's in-memory state still showed its own last value.

**Fix applied**: `saveForticladData` (forticlad.js) and `saveResearchData`
(research.js) now merge `changes.stock` against `current.stock` (freshly
re-read via `getToolData(latest, 'forticlad')` inside the save function,
using the just-fetched `latest` profile) instead of merging against the
stale closure-level `toolData.stock` at the call site. Call sites simplified
to pass only the single changed key (`{ stock: { fc: value } }` instead of
`{ stock: { ...toolData.stock, fc: value } }`).

**Verified fixed**: re-ran the Node merge simulation (hyperalloy edit → fc
edit; both values survive) AND reproduced live in the browser against the
real user's own saved profile ("422 — Taka", real production IndexedDB data,
not test data) via `claude-in-chrome`:
1. Loaded the live page — confirmed pre-existing real profile still had old
   flat fields (`fcOnHand: 1907`, `coreOnHand: 1333`, `afcOnHand: 0`,
   `hyperalloyOnHand: 0`, no `stock` yet) and rendered correctly through the
   new code (FC "1,800 needed / Surplus 107" = 1907 − 1800 ✓). This also
   incidentally confirmed the user had already run the Phase 2 migration
   script themselves — `buildingBases` already held new-format ids (`fc1`,
   `fc2`, `level_30_start`), not the old verbose strings.
2. Edited Hyperalloy → 555 via the real UI. Confirmed via IndexedDB read:
   `stock` created for the first time as `{fc:1907, afc:0, hyperalloy:555}` —
   legacy fields correctly migrated and dropped in one write.
3. Edited FC → 1908 via the real UI. Confirmed via IndexedDB read:
   `{fc:1908, afc:0, hyperalloy:555}` — hyperalloy survived (this is the
   exact sequence that would have reverted hyperalloy to 0 pre-fix).
4. Restored both fields to their original values (1907, 0) via the UI;
   confirmed final IndexedDB state matches the original exactly; reloaded the
   page and confirmed rendering is byte-identical to the pre-test state.

Also checked and cleared by the reviewer: `0`-as-valid-value handling in
`normalizeForticladStock` (no off-by-something), `researchLevels` and other
sibling fields survive the `getToolData` destructuring, `>= 0` validation
still enforced at every display site, zero missed consumers.

**Deferred, not blocking**: reviewer noted `normalizeForticladStock` doesn't
sanitize `stock` as strictly as the peer planners' `sanitizeStock` (e.g. a
hand-corrupted `stock: { afc: "5" }` would survive the read) — not currently
exploitable since every write path already validates via `inventoryValue`,
and every display site guards with `Number.isInteger`. Not fixed this round
per the reviewer's own "optional" framing and scope discipline (YAGNI) — flag
here for future reference if `stock` ever gains a non-UI write path.

## Success Criteria
- [x] `tools.forticlad.stock` is the sole source of truth for FC/AFC/Hyperalloy
      on-hand amounts; old flat fields are read-compatible but dropped on next write.
      Verified via Node script exercising `getToolData` against 6 cases
      (legacy-only, fcOnHand-priority-over-coreOnHand, already-migrated,
      empty, mixed old/new, other-tool-passthrough) — all correct.
- [x] No behavior change visible to the user — same 3 inputs, same values,
      same sticky-bar/summary calculations (read/write sites updated 1:1,
      no HTML/UI changes made).
- [x] Grep confirms zero remaining reads of `fcOnHand`/`afcOnHand`/`hyperalloyOnHand`/`coreOnHand`
      outside `storage.js`'s migration helper (DOM element variables named
      `fcOnHand`/`hyperalloyOnHand` in `forticlad.js`/`research.js` are
      unrelated — same variable names as the old data field, referring to
      `<input>` elements).
- [x] Docker Jekyll build succeeds (4.67s, no errors).
- [x] No cross-script `stock` clobber between `forticlad.js` and `research.js`
      (critical regression found by code review, fixed, and verified live in
      the browser against the real user's own profile data — see
      Post-Implementation Code Review section above).

## Risk Assessment
- **Risk:** a stale cached page (old `forticlad.js` bundle expecting flat
  fields) reads a profile already migrated to `stock`-only shape by a newer
  tab, sees `undefined` for `fcOnHand`. **Mitigation:** low-probability/short
  window (same class of risk as Phase 1's stale-cache label finding, already
  accepted for this same testing-only, single-user profile data per the
  earlier confirmed decision); no cross-tab coordination needed for a
  single-user use case.
- **Risk:** forgetting to strip the legacy fields on write leaves duplicate/
  stale data forever. **Mitigation:** step 1 explicitly builds the return
  object without spreading raw `data`, so the legacy fields structurally
  cannot survive a round-trip through `getToolData` → `saveForticladData`.
