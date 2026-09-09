---
title: "Phase 2: Fix and extend building data (bomber rename, FC6-10 subpalier backfill, FC Lab)"
status: done
---

# Phase 2: Fix and extend building data (bomber rename, FC6-10 subpalier backfill, FC Lab)

## Overview

Bring `_data/lands_of_jail/forticlad.yml` up to full parity with the source
data captured in [Phase 1](./phase-01-start.md): fix the `bomber-barrack`
mistranscription, backfill missing sub-palier rows for FC6-FC10, and add FC Lab
as an 8th building. Data-only phase — no JS changes here (Phase 3 handles JS).

## Requirements

- [x] `boomer-barrack` renamed to `bomber-barrack` everywhere in this file (buildings, requirements, every step's `costs` map).
- [x] Every building's tier transitions FC5->FC6, FC6->FC7, FC7->FC8, FC8->FC9, FC9->FC10 (as applicable to that building's `max_base`) have 5 rows each (4 sub-paliers + 1 checkpoint), not 1.
- [x] `fc_lab` added as a building with `max_base: FC6`, its own cost curve, gated by `warden-office` per tier.
- [x] `fc_lab` cost column added to every existing step row (0 for rows after FC6, since it doesn't progress further).
- [x] `source:` block updated: bump `retrieved` if the date changed, note the fix and the FC Lab/subpalier additions, keep the existing note about the `bomber-barrack` key.
- [x] `schema_version` bumped from `2` to `3`.

## Related Code Files

- Modify: `_data/lands_of_jail/forticlad.yml`

## Implementation Steps

1. **Rename the key.** Replace every `boomer-barrack` occurrence with
   `bomber-barrack` in `buildings:`, `requirements:`, and every `steps[].costs`
   map. Update the `source.note` to say the rename has been corrected (don't
   just delete the note — future readers should know this was fixed, not that
   it was never wrong).

2. **Backfill FC5-FC10 sub-palier rows**, per building, per Phase 1's cost
   table. For each tier transition `{afc, fc}` that currently exists only as a
   single checkpoint row (e.g. `FC6`), insert 4 more rows immediately before it
   with the **same** `{fc, afc}` cost and IDs following the existing pattern
   already used for the early tiers (e.g. `30-1`..`30-4` before `Forticlad
   (1)`) — use IDs like `FC5-1`, `FC5-2`, `FC5-3`, `FC5-4` before the existing
   `FC6` row, `FC6-1`..`FC6-4` before `FC7`, etc. Apply to every building that
   reaches that tier per its own `max_base` (Medical Station stops at FC8, so
   only needs FC6/FC7/FC8 backfilled — not FC9/FC10, which don't exist for it).
   **Every row's `costs` map must include an entry for every building key**
   (this repo's `planner-core.js` `normalizeStep()` throws if any building is
   missing from a row) — new sub-palier rows need the same `{fc:0,afc:0}` (or
   real cost) for buildings not part of that specific backfill.

3. **Add FC Lab.**
   - `buildings.fc_lab: { label: FC Lab, max_base: FC6 }`.
   - `requirements.fc_lab`: one entry per tier gating on `warden-office`
     reaching the same tier (`{ targetBase: FC1, building: warden-office,
     minimumBase: FC1 }` ... through `FC6`), matching the existing pattern
     used for the other 6 buildings' requirements — NOT the reverse (FC Lab
     does not gate Warden Office; only research gates on FC Lab, and research
     lives in the separate Phase 4 data file, not here).
   - Add an `fc_lab` cost entry to every row in `steps:` — the 5-row cost per
     tier from Phase 1's FC Lab table for tiers 1-6 (reusing the SAME shared
     row IDs already used by other buildings for those tiers — FC Lab's
     "level 1" sub-paliers land on rows `30-1`..`Forticlad (1)`, "level 2" on
     `Forticlad (1)-1`..`Forticlad (2)`, and so on through "level 6" landing on
     the FC6 tier's 5 rows added in step 2) — and `{fc:0, afc:0}` for every
     row from the FC7 tier onward (FC Lab caps at level 6).

4. **Update provenance.** Bump `schema_version: 3`. Update `source:` block
   (`retrieved` date if re-fetched, `note` describing: bomber-barrack rename,
   FC5-FC10 sub-palier backfill, FC Lab addition).

## Todo

- [x] Rename `boomer-barrack` -> `bomber-barrack`
- [x] Backfill FC5-FC10 sub-palier rows for all applicable buildings
- [x] Add `fc_lab` building + requirements + step costs
- [x] Bump `schema_version` to 3, update `source:` note

## Success Criteria

- Every row in `steps:` has a cost entry for all 8 building keys (7 renamed originals + `fc_lab`), no `boomer-barrack` left in the file.
- Counting rows per building: `warden_office`/`shieldbearer_barrack`/`bomber_barrack`/`shooter_barrack`/`communication_center`/`command_center` reach 51 total step rows (1 start + 10 tiers x 5); `medical_station` reaches 41 (1 start + 8 tiers x 5); `fc_lab` costs are non-zero only through the FC6-tier rows.
- `ruby -ryaml -e "YAML.load_file('_data/lands_of_jail/forticlad.yml')"` (via the Docker Ruby image — see Phase 6) parses without error.

## Risk Assessment

Manually inserting ~20 backfilled rows x 7 buildings by hand is error-prone.
Prefer writing the row insertion as a short one-off Ruby or Node script (not
committed) that reads the existing yml, expands each late-tier checkpoint row
into 5, and re-emits the yml, then diff-review the result — rather than
hand-editing every row. Whichever approach is used, the final diff must be
reviewed row-by-row against Phase 1's cost table before moving to Phase 3.
