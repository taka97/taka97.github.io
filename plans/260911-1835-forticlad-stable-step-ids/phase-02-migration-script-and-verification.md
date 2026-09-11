---
phase: 2
title: "Phase 2: Migration script and verification"
status: completed
priority: P1
effort: "1h"
dependencies: [1]
---

# Phase 2: Migration script and verification

## Overview
Deliver a standalone browser-console script (not wired into the app) that
remaps existing users' saved `currentBase`/`targetBase` values in IndexedDB
from the old display-text ids to the new snake_case ids from Phase 1, then
verify the full planner still works end-to-end against both fresh and
migrated data.

## Requirements
- Functional: script must only touch the `forticlad` tool's `buildingBases`
  entries inside each profile, PLUS the legacy top-level
  `tools.forticlad.currentBase` field (still readable as a fallback per
  `forticlad.js`'s `legacyCurrent` — found during Phase 1's code-review gate);
  every other tool's data and profile field must be left byte-identical.
- Functional: user must run this BEFORE opening/interacting with the deployed
  Forticlad page in their own browser — `forticlad.js`'s `validBase()` silently
  resets any unresolvable saved base to the default on load, and the next
  dropdown change auto-saves that reset, permanently destroying the pre-rename
  values the script needs. (Confirmed acceptable risk for this user's own
  testing-only data; not a concern for real external users since none exist
  for this planner yet.)
- Functional: script must be idempotent — running it twice must not corrupt
  data (already-migrated/short ids like `fc6` that aren't in the old→new map
  pass through unchanged).
- Non-functional: script is plain, dependency-free JS pasteable directly into
  DevTools console (matches user's explicit request — no build step, no file
  wiring into `assets/js/`).
- Safety: script defaults to dry-run — logs a full before/after diff table
  with writes disabled; a second explicit flag (e.g. `RUN = true` at the top
  of the script, or a `dryRun: false` argument) is required to actually
  commit changes via `put()`. Protects real saved profile data from an
  unreviewed write.

## Architecture
- Reuse the exact old→new mapping table from the
  [brainstorm report](../reports/brainstorm-260911-1832-forticlad-stable-step-ids.md#full-id-mapping-old-base--new-base-id-label--old-value-verbatim)
  (26 entries: `Level 30 (start)`, `30-1..4`, `Forticlad (1)..(5)` and their
  `-1..4` sub-steps) as a plain JS object literal inside the script.
- Script flow: `indexedDB.open('lands-of-jail-tools')` → transaction on
  `profiles` (readwrite) → `getAll()` → for each profile with
  `tools.forticlad.buildingBases`, remap each building's `currentBase`/
  `targetBase` through the map (leave untouched if not a mapped key) → `put()`
  the updated profile → `console.table`/`console.log` a before/after summary
  per profile so the user can eyeball the change before trusting it.
- No dependency on `storage.js` module code (that's ES-module scoped to the
  site's own script tags) — the console script talks to IndexedDB directly
  with raw `indexedDB.open`/transaction APIs so it can be pasted standalone.

## Related Code Files
- Create: a scratch `.js` file for the console script content (deliver inline
  in the phase report / chat, not committed to the repo — this is a one-off
  user-run tool, not app source).
- No app files modified in this phase (Phase 1 already covers all source
  changes).

## Implementation Steps
1. Write the console script with the embedded old→new mapping object and a
   top-of-file `RUN` flag defaulted to `false`.
2. Have it log, per profile, which buildings/keys *would change* (old value →
   new value) as a diff table, regardless of `RUN`. Only call `put()` when
   `RUN === true`; otherwise skip the write and print a reminder that this
   was a dry run.
3. Hand the script to the user as a copy-pasteable snippet (per their explicit
   request to run it manually themselves — do not execute it against their
   real browser data). Instruct them to review the dry-run diff output first,
   then re-run with `RUN = true` to commit.
4. After Phase 1 ships and the user has run the script (or on fresh/no saved
   data), verify manually in a real browser:
   - Load the Forticlad planner page, confirm dropdown text/order is
     unchanged from before the change.
   - Set a current/target base, save, reload — confirm selection persists.
   - For a profile migrated by the script, confirm its previously-saved
     current/target base now shows the correct (same) label after reload.
   - Confirm totals/cost calculations match pre-change values for an
     identical current→target range.
5. Run the Docker Jekyll build to confirm no build regressions from the yml
   edits.

## Success Criteria
- [x] Console script delivered at
      `forticlad-migrate-step-ids.js` (scratchpad, not committed — one-off
      user-run tool per plan). Covers all 51 old→new mapped ids (widened from
      26 during Phase 1's code-review gate, since FC5-FC10's old mixed-case
      hyphenated ids also don't match the new lowercase snake_case ids), plus
      the legacy top-level `tools.forticlad.currentBase` field. Leaves
      everything else untouched (only remaps values matching the map; other
      tools/fields pass through via shallow spread). Idempotent — remap() is a
      no-op for values not in the map, including already-migrated ones.
- [ ] User confirms (manually, in their own browser) that a pre-existing saved
      profile's Forticlad selections survive the rename after running the
      script with `RUN = true`. **User must run this before opening the
      Forticlad page with the deployed code** (see Phase 1 code-review note in
      plan.md) — flagged to user, not verifiable by the agent.
- [x] Fresh (no saved data) planner usage confirmed via built page's embedded
      JSON matching expected `base`/`label` pairs (Phase 1 verification).
- [x] `docker run ... bundle exec jekyll build` succeeds with no errors
      (Phase 1 verification — no further yml/JS changes in Phase 2).

## Risk Assessment
- **Risk:** user runs the script against a profile that already has new-style
  ids (double-migration) if Phase 1 ships before they run it, or vice versa.
  **Mitigation:** idempotency requirement above — unmapped/already-new ids
  pass through unchanged, so run order relative to the code deploy doesn't
  matter.
- **Risk:** IndexedDB `profiles` store key path assumption (`keyPath: 'id'`,
  per `storage.js`) changes or the script targets the wrong database/store
  name. **Mitigation:** script hardcodes `DATABASE_NAME = 'lands-of-jail-tools'`
  matching `storage.js`'s constant exactly; verify against that file before
  handing off the script.
