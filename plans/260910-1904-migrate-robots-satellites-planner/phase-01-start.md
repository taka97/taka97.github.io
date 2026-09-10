---
phase: 1
title: "Data File"
status: complete
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Data File

## Overview

Transcribe `robots-satellites.html`'s inline data into
`_data/lands_of_jail/robots_satellites.yml`, following the exact structure and
transcription-note style of `_data/lands_of_jail/tomes_collections.yml`.

## Requirements

- Functional: yml holds 5 resources, Robot's 11-row cost table, 3 satellite tiers'
  shared cost curves (with the R tier's level-50 row flagged estimated), and the 9
  named satellites mapped to their tier, in a shape the Phase 2 engine can consume
  directly (mirroring `tomes_collections.yml`'s `tomeLevels`/`collectionLevels`
  shape: one shared cost-curve array per repeatable-thing, keyed by index).
- Non-functional: every number transcribed here is either taken verbatim from
  source or (for SSR) independently verified by script during brainstorming — do
  not re-derive, just transcribe as given below.

## Architecture

`robotLevels`: 11 rows, index 0 = baseline (level "1", zero cost), indices 1-10 =
`ROBOT_COSTS[0..9]` (levels 10-100).

`satelliteTiers`: one entry per tier (`R`, `SR`, `SSR`), each with `label`, `badge`
(hex color from source), and `levels` (shared cost curve for every satellite in
that tier — same shape as `robotLevels`: index 0 = baseline, remaining indices =
that tier's cost table in order).

`satellites`: the fixed list of 9 named units — `{ id, tier, labelKey }` — no cost
data here (cost comes from `satelliteTiers[tier].levels`), matching source's
`makeSatelliteTrack(id, category, nameKey, costs)` where `costs` is shared per tier
call-site, not per satellite.

## Related Code Files

- Create: `_data/lands_of_jail/robots_satellites.yml`

## Implementation Steps

1. Write the file header: `schema_version: 1`, `source: { url, retrieved: 2026-09-10, note }`.
   Note should state (mirroring `tomes_collections.yml`'s note style): no
   cross-track prerequisites (every level's `requires` in source is `[]`); Robot is
   the only add-instance category (cap 12); Satellites are 9 fixed named units
   across 3 rarity tiers, not addable; resource keys match source's `RESOURCES`
   array exactly; SSR tier's cost table is derived from source's per-level
   `SSR_LEVEL_DATADISK` (90 entries) summed into 9 brackets of 10 plus
   `SSR_BREAKTHROUGH_PLANETCOIN` — values below were independently recomputed via
   script during brainstorming (see brainstorm report), not hand-summed.
2. `caps: { robots: 12 }`.
3. `resources:` (order matches source `RESOURCES` array):
   ```yaml
   resources:
     - { key: PrisonerArmorData, label: Prisoner Armor Data }
     - { key: PowerModule, label: Power Module }
     - { key: AdvancedPowerModule, label: Advanced Power Module }
     - { key: DataDisk, label: Data Disk }
     - { key: PlanetCoin, label: Planet Coin }
   ```
4. `robotLevels:` (11 rows — baseline + `ROBOT_COSTS`):
   ```yaml
   robotLevels:
     - { PrisonerArmorData: 0,     PowerModule: 0,   AdvancedPowerModule: 0 }
     - { PrisonerArmorData: 1200,  PowerModule: 20,  AdvancedPowerModule: 0 }
     - { PrisonerArmorData: 2310,  PowerModule: 30,  AdvancedPowerModule: 0 }
     - { PrisonerArmorData: 3600,  PowerModule: 40,  AdvancedPowerModule: 10 }
     - { PrisonerArmorData: 5320,  PowerModule: 60,  AdvancedPowerModule: 15 }
     - { PrisonerArmorData: 7560,  PowerModule: 80,  AdvancedPowerModule: 20 }
     - { PrisonerArmorData: 10260, PowerModule: 100, AdvancedPowerModule: 30 }
     - { PrisonerArmorData: 19400, PowerModule: 130, AdvancedPowerModule: 140 }
     - { PrisonerArmorData: 24800, PowerModule: 160, AdvancedPowerModule: 50 }
     - { PrisonerArmorData: 30300, PowerModule: 190, AdvancedPowerModule: 70 }
     - { PrisonerArmorData: 36300, PowerModule: 230, AdvancedPowerModule: 90 }
   ```
   (row index = level: 0="1"/baseline, 1="10", 2="20", ... 10="100")
5. `satelliteTiers:` (3 tiers, each `levels` = baseline + that tier's cost table;
   `estimated: true` on R tier's last row applies to `DataDisk` only, `PlanetCoin`
   at that level is confirmed):
   ```yaml
   satelliteTiers:
     - key: R
       label: R
       badge: "#5b8cff"
       levels:
         - { DataDisk: 0,     PlanetCoin: 0 }
         - { DataDisk: 1565,  PlanetCoin: 10 }
         - { DataDisk: 2840,  PlanetCoin: 20 }
         - { DataDisk: 4730,  PlanetCoin: 40 }
         - { DataDisk: 7480,  PlanetCoin: 60 }
         - { DataDisk: 11230, PlanetCoin: 80, estimated: [DataDisk] }
     - key: SR
       label: SR
       badge: "#9b6bff"
       levels:
         - { DataDisk: 0,     PlanetCoin: 0 }
         - { DataDisk: 1740,  PlanetCoin: 20 }
         - { DataDisk: 3125,  PlanetCoin: 40 }
         - { DataDisk: 5205,  PlanetCoin: 60 }
         - { DataDisk: 8225,  PlanetCoin: 100 }
         - { DataDisk: 12350, PlanetCoin: 150 }
         - { DataDisk: 17565, PlanetCoin: 200 }
         - { DataDisk: 23825, PlanetCoin: 260 }
     - key: SSR
       label: SSR
       badge: "#ffd60a"
       levels:
         - { DataDisk: 0,     PlanetCoin: 0 }
         - { DataDisk: 1785,  PlanetCoin: 30 }
         - { DataDisk: 3180,  PlanetCoin: 60 }
         - { DataDisk: 5310,  PlanetCoin: 100 }
         - { DataDisk: 8380,  PlanetCoin: 150 }
         - { DataDisk: 12555, PlanetCoin: 210 }
         - { DataDisk: 17820, PlanetCoin: 280 }
         - { DataDisk: 24130, PlanetCoin: 360 }
         - { DataDisk: 29025, PlanetCoin: 450 }
         - { DataDisk: 32855, PlanetCoin: 500 }
   ```
   Note: `estimated` is a list of resource keys (not a bare boolean) so a future
   tier can flag only the specific resource that's unconfirmed, matching source's
   actual precision (only R-level-50's `dd` was flagged, not the whole row) rather
   than over-broadening to the whole level's cost.
6. `satellites:` (9 fixed units, `labelKey` matches source's I18N keys so EN/VI
   labels can key off the same id later):
   ```yaml
   satellites:
     - { id: sat_r_laser, tier: R, labelKey: sat_r_laser }
     - { id: sat_r_observateur, tier: R, labelKey: sat_r_observateur }
     - { id: sat_r_radiance, tier: R, labelKey: sat_r_radiance }
     - { id: sat_sr_arbitre, tier: SR, labelKey: sat_sr_arbitre }
     - { id: sat_sr_sentinelle, tier: SR, labelKey: sat_sr_sentinelle }
     - { id: sat_ssr_domaine_omniscient, tier: SSR, labelKey: sat_ssr_domaine_omniscient }
     - { id: sat_ssr_nexus_celeste, tier: SSR, labelKey: sat_ssr_nexus_celeste }
     - { id: sat_ssr_argus, tier: SSR, labelKey: sat_ssr_argus }
     - { id: sat_ssr_polaris, tier: SSR, labelKey: sat_ssr_polaris }
   ```
   EN labels (for Phase 5's page copy, not stored in yml — labels live in the
   Markdown/JS message tables per this site's existing i18n pattern, not in yml):
   Laser, Watcher, Radiance (R); Arbitrator, Sentinel (SR); Omniscient Domain, Sky
   Nexus, Argus, Polaris (SSR).

## Todo

- [x] Write `_data/lands_of_jail/robots_satellites.yml` per steps above.
- [x] Diff row counts against source: `robotLevels` = 11, R `levels` = 6, SR
      `levels` = 8, SSR `levels` = 10, `satellites` = 9.
- [x] Confirm `PrisonerArmorData`/`PowerModule`/`AdvancedPowerModule` never appear
      in `satelliteTiers`, and `DataDisk`/`PlanetCoin` never appear in
      `robotLevels` (resources are disjoint per category, matching source).

## Success Criteria

- [x] File parses as valid YAML (`bundle exec jekyll build` in Phase 6 will fail
      loudly otherwise) — confirmed, build succeeded and JSON data island parsed
      with correct row counts.
- [x] Every numeric value matches the transcription in this phase file exactly (no
      independent re-derivation needed — the SSR sums were already
      script-verified).
