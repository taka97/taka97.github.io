---
title: "Satellite Detailed Stats Restructure"
description: "Restructure each satellite's write-up on satellite.md into a consistent Role/Skills/Overclock Effect/Verdict template, with real per-satellite stat data."
status: done
priority: P2
effort: "TBD"
tags: [lands-of-jail, content, satellite]
created: 2026-09-13
blockedBy: []
blocks: []
---

# Satellite Detailed Stats Restructure

## Overview

Follow-up to `plans/260913-1536-satellite-knowledge-tool-link/`. That plan
linked the Robots & Satellites planner to `satellite.md`; this one improves
`satellite.md` itself for readability by giving each of the 5 released
satellites a consistent structured section, and adding real stat/bonus data
(scope: knowledge page only — not the planner tool/yml).

## Process Note

This plan is filled in incrementally, satellite by satellite, as the user
supplies real data — it is not fully specified up front. When resuming this
plan (e.g. via `/ak:cook`):

- Do **not** invent, estimate, or guess stat/bonus numbers for any satellite
  still marked "Pending" below — leave it pending and ask the user for the
  real data instead.
- Implement one satellite's section only once its data is confirmed in this
  plan; update the plan doc itself as each satellite's data arrives (move it
  from "Pending" to "Done" with the data recorded), before or alongside
  editing `satellite.md`.
- The user may give UI feedback after seeing a satellite rendered (e.g. the
  Laser section) — apply that feedback and, if it changes the shared
  template, retrofit already-done satellites too.

## Template

Agreed with user via iterative refinement:

```
### <Name>: <tagline> <season-icon> {#sat-<slug>}

**Role:** one-line purpose
**Skills:** non-numeric mechanics (chest drops, troop training, etc.)
**Overclock Effect:** table (Overclock Tier | <stat column(s)>) if it scales,
                       or a bullet list if flat/qualitative
**Verdict:** priority recommendation
```

- Every Overclock Effect table (when it scales, i.e. a table not a bullet
  list) gets a trailing kramdown IAL `{: .overclock-table}` immediately after
  its last row, no blank line — the `.overclock-table` CSS class (added in
  `_sass/custom.scss` under `.js-article-content`) indents it (`margin-left`)
  to set it apart from the Role/Skills/Verdict lines. Scoped to this class
  only, so other tables on the site (e.g. planner tables) are unaffected.
- "Overclock Tier" is a separate progression axis from satellite level —
  named tiers, not numeric levels: `6 Stats Epic`, `2/4/6 Stats Legendary`,
  `2/4/6 Stats Exotic` (7 tiers total, ascending).
- Rarity tier names (`Epic`/`Legendary`/`Exotic`) stay in English in both EN
  and VI content, matching this repo's existing convention (see
  `assets/js/planners/hero-equipment.js`'s `RARITY_TIER_LABELS`, EN-only).
- Every occurrence of a rarity tier name inside an Overclock Effect table gets
  wrapped in `<span class="rarity-epic">Epic</span>` /
  `<span class="rarity-legendary">Legendary</span>` /
  `<span class="rarity-exotic">Exotic</span>`. Colors come from `:root`
  custom properties in `_sass/custom.scss` (`--rarity-epic: rgb(218, 82,
  160)`, `--rarity-legendary: rgb(243, 171, 8)`, `--rarity-exotic: rgb(205,
  47, 48)`), reusable for any future rarity text on the site, not just this
  table.
- Negative stat values get a `-` sign (e.g. `-6%`), no "Reduce" wording in
  the label — the table column header carries the stat name instead.

## Satellite Data

### Laser — Done {#sat-laser}

- **Role:** unchanged from before — "The engine of your progression — the
  only satellite that passively generates the resources needed to upgrade
  the others."
- **Skills:** unchanged from before (renamed from "Effect") — 6 chests/day,
  Planet Coin + Data Disks (corrected from placeholder "Space Parts" / "EXP
  Disks" to the real resource names, matching `_data/lands_of_jail/
  robots_satellites.yml`'s `PlanetCoin`/`DataDisk` entries; VI content uses
  that yml's own translations: "Tiền tệ Hành tinh" / "Đĩa dữ liệu").
- **Overclock Effect:** Enemy Bomber HP reduction (corrected from placeholder
  "Enemy Bomb HP"), by Overclock tier:

  | Overclock Tier | Enemy Bomber HP |
  | --- | --- |
  | 6 Stats Epic | -6% |
  | 2 Stats Legendary | -9% |
  | 4 Stats Legendary | -12% |
  | 6 Stats Legendary | -15% |
  | 2 Stats Exotic | -19% |
  | 4 Stats Exotic | -23% |
  | 6 Stats Exotic | -27% |

  (rarity tier names color-coded per the convention above)
- **Verdict:** unchanged from before.
- Applied to both `contents/en/lands-of-jail/satellite.md` and
  `contents/vi/lands-of-jail/satellite.md` (VI: Role/Skills/Verdict prose
  unchanged from before this plan; table header translated to "Cấp
  Siêu tần" / "HP Lính ném bom Địch" — "Lính ném bom" matching this repo's
  existing "Bomber" translation in `contents/vi/lands-of-jail/planners/
  collections-tomes.md`; tier names kept in English per the convention
  above).
- UI feedback applied: table indented via `{: .overclock-table}` +
  `_sass/custom.scss` rule (see Template above).

### Watcher — Done {#sat-watcher}

- **Role:** "Arrest Resource" (replaces prior "The comfort bonus.").
- **Skills:** "Get 6-hours Capture Earnings immediately per day." (replaces
  prior "Reduced HP for deflectors + daily resource chest." — the HP-
  reduction part moves to Overclock Effect below).
- **Overclock Effect:** Enemy Shieldbearer HP reduction, by Overclock tier —
  same progression/values as Laser/Radiance's tables, different target stat:

  | Overclock Tier | Enemy Shieldbearer HP |
  | --- | --- |
  | 6 Stats Epic | -6% |
  | 2 Stats Legendary | -9% |
  | 4 Stats Legendary | -12% |
  | 6 Stats Legendary | -15% |
  | 2 Stats Exotic | -19% |
  | 4 Stats Exotic | -23% |
  | 6 Stats Exotic | -27% |

  (rarity tier names color-coded per the convention above)
- **Verdict:** unchanged from before.
- Applied to both `contents/en/lands-of-jail/satellite.md` and
  `contents/vi/lands-of-jail/satellite.md` (VI: Role "Tài nguyên Bắt giữ",
  Skills "Nhận ngay thu nhập bắt giữ của 6 giờ mỗi ngày.", table header "Cấp
  Siêu tần" / "HP Lính khiên Địch" — "Lính khiên" matching this repo's
  existing "Shieldbearer" translation in `contents/vi/lands-of-jail/
  planners/collections-tomes.md`; tier names kept in English per the
  convention above).

### Radiance — Done {#sat-radiance}

- **Role:** unchanged from before — "The field specialist for PvE arrests."
- **Skills:** unchanged from before (renamed from "Effect") — "+6% Attack &
  Defense during prisoner arrests." (corrected from a prior placeholder
  "+11%" to the real value, +6%, before this Overclock data arrived).
- **Overclock Effect:** Enemy Shooter ATK reduction, by Overclock tier — same
  progression/values as Laser's table, different target stat:

  | Overclock Tier | Enemy Shooter ATK |
  | --- | --- |
  | 6 Stats Epic | -6% |
  | 2 Stats Legendary | -9% |
  | 4 Stats Legendary | -12% |
  | 6 Stats Legendary | -15% |
  | 2 Stats Exotic | -19% |
  | 4 Stats Exotic | -23% |
  | 6 Stats Exotic | -27% |

  (rarity tier names color-coded per the convention above)
- **Verdict:** unchanged from before.
- Applied to both `contents/en/lands-of-jail/satellite.md` and
  `contents/vi/lands-of-jail/satellite.md` (VI: table header "Cấp Siêu tần" /
  "Tấn công Lính súng Địch" — "Lính súng" matching this repo's existing
  troop-type translation in `contents/vi/lands-of-jail/planners/
  collections-tomes.md` (alongside "Lính khiên"/"Lính ném bom"), tier names
  kept in English per the convention above).

### Sentinel — Done {#sat-sentinel}

- **Role:** "Reinforcement Soldiers" (replaces prior "Reinforcement
  satellite.").
- **Skills:** "Get 8-hour soldiers immediately per day." (replaces prior
  "Instant troop training.").
- **Overclock Effect:** Enemy Shooter Lethality reduction, by Overclock
  tier — same value progression as Arbitrator's table, different target
  stat:

  | Overclock Tier | Enemy Shooter Lethality |
  | --- | --- |
  | 6 Stats Epic | -11% |
  | 2 Stats Legendary | -16% |
  | 4 Stats Legendary | -21% |
  | 6 Stats Legendary | -26% |
  | 2 Stats Exotic | -33% |
  | 4 Stats Exotic | -40% |
  | 6 Stats Exotic | -48% |

  (rarity tier names color-coded per the convention above)
- **Verdict:** unchanged from before.
- Applied to both `contents/en/lands-of-jail/satellite.md` and
  `contents/vi/lands-of-jail/satellite.md` (VI: Role "Lính Tăng viện", Skills
  "Nhận ngay lính huấn luyện 8 giờ mỗi ngày.", table header "Cấp Siêu tần" /
  "Sát thương Lính súng Địch", tier names kept in English per the convention
  above).

### Arbitrator — Done {#sat-arbitrator}

- **Role:** "Bonus for Cage Dmg" (replaces prior "Combat satellite for event
  damage.").
- **Skills:** "Increase dmg deal to Cage by 24%." (replaces prior "Extra
  damage during the Cage event.").
- **Overclock Effect:** Enemy Bomber ATK reduction, by Overclock tier — a
  distinct value progression from the other 3 satellites (confirmed with
  user, not assumed):

  | Overclock Tier | Enemy Bomber ATK |
  | --- | --- |
  | 6 Stats Epic | -11% |
  | 2 Stats Legendary | -16% |
  | 4 Stats Legendary | -21% |
  | 6 Stats Legendary | -26% |
  | 2 Stats Exotic | -33% |
  | 4 Stats Exotic | -40% |
  | 6 Stats Exotic | -48% |

  (rarity tier names color-coded per the convention above)
- **Verdict:** unchanged from before.
- Applied to both `contents/en/lands-of-jail/satellite.md` and
  `contents/vi/lands-of-jail/satellite.md` (VI: Role "Thưởng Sát thương
  Cage", Skills "Tăng 24% sát thương gây ra cho Cage.", table header "Cấp
  Siêu tần" / "Tấn công Lính ném bom Địch" — "Tấn công"/"Lính ném bom"
  matching this
  repo's existing "Bomber" translation in `contents/vi/lands-of-jail/
  planners/collections-tomes.md`; tier names kept in English per the
  convention above).

## Success Criteria

- [x] Template agreed with user.
- [x] Laser section restructured in EN + VI, Overclock Effect table added.
- [x] Watcher section restructured in EN + VI.
- [x] Radiance section restructured in EN + VI.
- [x] Sentinel section restructured in EN + VI.
- [x] Arbitrator section restructured in EN + VI.
- [x] User UI feedback (mentioned as likely) incorporated — Overclock table
  indent, rarity tier color/bold/italic styling.
- [x] Docker Jekyll build succeeds with no errors after all 5 are done.

## Post-Completion Realignment

After all 5 satellites were done, the user asked to realign the page's
structure now that it no longer needs a "still need confirmation" stub:

- Removed the `## Season 2 Release Update` / `## Cập nhật Mùa 2` section (EN +
  VI) — its content (Sentinel/Arbitrator blurbs, "still need confirmation"
  disclaimer) is now redundant with their full Overview sections. Fixed 4
  now-dangling links to that section's anchor in `contents/en/lands-of-
  jail/index.md`, `contents/en/lands-of-jail/season-2/index.md`, and their VI
  counterparts — retargeted to `/en(vi)/lands-of-jail/satellite/` (no anchor).
  Then, as a follow-up, removed those satellite links from `season-1/
  index.md`, `season-2/index.md`, and the "### Season 1"/"### Season 2"
  subsections of the main `lands-of-jail/index.md` (EN + VI, 6 files total)
  entirely — satellite.md is no longer season-specific (it's organized by
  rarity tier now, see below), so a per-season link to it was redundant with
  the canonical link already under `lands-of-jail/index.md`'s "Guides"
  section. The main index's now-empty "### Season 1" subsection (it existed
  only for that link) was removed outright; "### Season 2" kept its
  Heroes/Robots links.
- Reordered the Overview satellite sections by unit rarity tier (R then SR),
  matching `_data/lands_of_jail/robots_satellites.yml`'s `satellites:` list
  order: Laser, Watcher, Radiance (R) → Arbitrator, Sentinel (SR). The
  Priority Order list itself is a deliberate cross-tier ranking, not grouped
  by release/tier, so its item order was left unchanged — only its legend
  line was updated (see below).
- Replaced the "Season 1"/"Season 2 releasing in later seasons" framing
  (`🔵 Season 1 · 🟣 Season 2 · 🟡 releasing in later seasons` legend, and the
  "Season 2" heading tagline on Sentinel/Arbitrator) with the Robots &
  Satellites planner's own unit-rarity tiers: `R`/`SR`/`SSR`, matching
  `robots_satellites.yml`'s `satelliteTiers[].label` values exactly (kept as
  bare abbreviations, not spelled out — same convention as the planner's own
  `Vệ tinh — R/SR/SSR` VI headings, which don't translate them either).
  Applied via `<span class="tier-r">R</span>` / `.tier-sr` / `.tier-ssr` on
  all 5 headings — Laser/Watcher/Radiance's prior custom taglines (Top
  Priority, Secondary Support, PvE Optimization) were replaced with the same
  `R` tier badge too, for full consistency across the Overview section (user
  follow-up after the initial pass, which had left those three as-is).
- Moved the tier badge colors out of the planner tool and into `:root` custom
  properties in `_sass/custom.scss` (`--tier-r: #5b8cff`, `--tier-sr:
  #9b6bff`, `--tier-ssr: #ffd60a` — exact values carried over from
  `robots_satellites.yml`'s previous `satelliteTiers[].badge` hex literals),
  plus `.tier-r`/`.tier-sr`/`.tier-ssr` text-color classes for reuse in
  content pages. `robots_satellites.yml`'s `badge:` fields now hold
  `"var(--tier-r)"` etc. instead of the raw hex, so the planner (which sets
  `--badge-color` from that field via `assets/js/planners/robots-
  satellites.js`) and satellite.md's new tier spans share one source of
  truth. Verified via claude-in-chrome that the planner's `Satellites — R`
  badge on `/en/lands-of-jail/planners/robots-satellites/` still renders in
  the same blue after this change — this is the one deviation from the
  Non-Goals below (planner/yml touched), done at explicit user request.

## Non-Goals

- No changes to the Robots & Satellites planner tool or
  `robots_satellites.yml` beyond the tier-badge-color relocation above (which
  the user explicitly requested after the plan's original scope was done) —
  the satellite stat/bonus data itself is still knowledge-page only.
