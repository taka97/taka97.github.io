---
title: "Migrate Tomes & Collections Planner"
description: "Migrate lojcalc.com's 'Tomes & Collections' tool into a new planner page on this site, following the existing Forticlad planner's Markdown + vanilla-JS pattern, and generalize its shared CSS for reuse by this and future tool migrations."
status: complete
priority: P1
effort: ""
tags: [lands-of-jail, planners, tomes-collections]
created: 2026-09-10
---

# Migrate Tomes & Collections Planner

## Overview

`contents/{en,vi}/lands-of-jail/planners/forticlad.md` already migrates "FC
Buildings & T11 Research" from `https://www.lojcalc.com/index.html`. This plan
migrates the next lojcalc.com tool: **Tomes & Collections**
(`https://www.lojcalc.com/tomes-collections.html`), a much simpler tool than
Forticlad — two repeatable instance types (Tomes, Collections) with **no
cross-track prerequisites**, unlike Forticlad's requirement-cascade graph.

Source data (resources, per-level cost tables, caps) was captured directly from
`tomes-collections.html`'s inline `<script>` and the shared `shared.js` engine it
loads, retrieved 2026-09-10. See
[Phase 1: Source data reference](./phase-01-start.md) for the full verified
dump — every later phase cites that phase instead of re-deriving numbers.

**New page, not merged into Forticlad:** nav entry "Tools -> Tomes &
Collections" at `/en|vi/lands-of-jail/planners/tomes-collections/`, one page
with two sibling sections (Tomes, Collections) sharing one stock pool and one
combined missing/breakdown table (mirrors source's own single-route, flat-
tracks behavior — `computeCascade()` iterates all tracks together).

**Layout mirrors the source's structure** (intro -> current stock -> what's
missing (summary + breakdown) -> Tomes catalog -> Collections catalog -> sticky
summary bar); **styling uses this site's own framework**, not source's
`shared.css`/`theme-tactical.css`. This round also generalizes the existing
`.forticlad-planner__*` SCSS block into a shared `.loj-planner__*` block reused
by both pages (pure structural styling today, nothing Forticlad-specific), so
this and the 3 remaining future tool migrations (Robots & Satellites, Hero
Equipment, Hero Stars & Exclusive Equipment) share one CSS implementation.

**Language:** VI content is created now with the full page structure, but the 6
new resource names and 11 collection tier names are left identical to the EN
text for this round (explicit user decision) — translated in a follow-up pass.
Source's French (`I18N.fr`) block is not used — this site is EN/VI only.

**Explicitly out of scope:** Robots & Satellites, Hero Equipment, Hero Stars &
Exclusive Equipment — future migration plans, one tool at a time.

See also the brainstorm report:
[`plans/reports/brainstorm-260910-1646-migrate-tomes-collections-planner.md`](../reports/brainstorm-260910-1646-migrate-tomes-collections-planner.md).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Transcribe Tomes & Collections source data verbatim into `_data/lands_of_jail/tomes_collections.yml` | P1 |
| 2 | Build a minimal calc engine (`tomes-core.js`) for repeatable, prerequisite-free instance tracks | P1 |
| 3 | Wire the UI (`tomes.js`): add-instance buttons (capped 18/6), current/target selects, combined breakdown table, sticky summary bar | P1 |
| 4 | Generalize `.forticlad-planner__*` SCSS into a shared `.loj-planner__*` block used by both pages | P1 |
| 5 | Add the new bilingual content page + nav entry | P1 |
| 6 | Verify via Docker Jekyll build + manual data spot-checks against source | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Source data reference](./phase-01-start.md) | Complete |
| 2 | [Phase 2: Data file and calc engine](./phase-02-data-file-and-calc-engine.md) | Complete |
| 3 | [Phase 3: UI wiring and storage](./phase-03-ui-wiring-and-storage.md) | Complete |
| 4 | [Phase 4: SCSS generalization](./phase-04-scss-generalization.md) | Complete |
| 5 | [Phase 5: Content pages and navigation](./phase-05-content-pages-and-navigation.md) | Complete |
| 6 | [Phase 6: Verify](./phase-06-verify.md) | Complete |

## Key Decisions (confirmed with user, 2026-09-10)

- New standalone page, not merged into Forticlad's page.
- One page, two sections (Tomes, Collections), one shared stock pool + one
  combined missing/breakdown table.
- Layout structure mirrors the source; styling/colors use this site's own
  framework.
- Generalize `.forticlad-planner__*` -> `.loj-planner__*` now (reused by both
  pages), rather than duplicating CSS for the new page.
- Include the sticky summary bar (new to this site; restyled with our
  framework).
- Add-only UX matches source exactly: capped at 18 tomes / 6 collections, no
  per-instance remove button, shrink only via full Reset.
- VI content created now; new resource/tier terms left as EN text this round,
  translated later.

## Success Criteria

- [x] `_data/lands_of_jail/tomes_collections.yml` contains the full Tome
      (12-level) and Collection (11-tier, 43-row) cost tables plus caps
      (18/6), matching Phase 1's verified dump exactly.
- [x] `tomes-core.js` calculates per-instance and combined totals correctly for
      any current/target index pair, with no cross-track requirement logic
      (none exists for this tool).
- [x] Tomes & Collections planner page (EN + VI) renders: current stock ->
      what's missing (summary cards + breakdown table) -> Tomes (add up to 18)
      -> Collections (add up to 6) -> sticky bar, styled with `.loj-planner__*`.
- [x] Forticlad's page (EN + VI) still renders identically after the
      `.forticlad-planner__*` -> `.loj-planner__*` rename (visual regression
      check via Docker Jekyll build).
- [x] New "Tomes & Collections" nav entry appears under Tools (EN + VI) at the
      correct URLs.
- [x] Docker Jekyll build succeeds with no errors for both languages.
- [x] Manual spot-checks (Phase 6) confirm at least 3 computed totals (mix of
      Tomes and Collections) match hand-calculated source numbers.

## Open Questions

None outstanding — see brainstorm report's Decisions section for the full
confirmed set, and the Validation Log below for implementation-time calls
resolved during plan validation.

## Validation Log

### Session 1 — 2026-09-10
**Trigger:** `/ak:plan validate` after initial plan creation.
**Questions asked:** 4

#### Verification Results
- **Tier:** Full (6 phases) — scoped to load-bearing claims given effort
  budget, not exhaustive 15-claims/phase (same scoping the prior Forticlad
  migration plan's own validation used).
- **Claims checked:** 10 | **Verified:** 10 | **Failed:** 0 | **Unverified:** 0
- `.forticlad-planner` block: 43 total occurrences, 24 distinct `__element`
  selectors in `_sass/custom.scss` — VERIFIED (grep during brainstorm scout).
- Exactly 5 non-SCSS files reference the `forticlad-planner` string
  (`forticlad.js`, `research.js`, `table-helpers.js`,
  `contents/en/.../forticlad.md`, `contents/vi/.../forticlad.md`) — VERIFIED
  (repo-wide grep).
- No `reset`/`toRoman` logic exists anywhere in `forticlad.js`, `research.js`,
  `table-helpers.js`, or `planner-core.js` today — VERIFIED (grep, zero
  matches); confirms Phase 3 must add both as new capability, not reuse.
- `storage.js`'s `getToolData`/`updateToolData` are fully generic except one
  `tool === 'forticlad'` legacy-migration special case
  (`assets/js/planners/storage.js:65-73`) — VERIFIED (full file read); a new
  `tomes-collections` tool key needs zero `storage.js` changes.
- `planner-core.js` has no support for repeatable/dynamic instances — its
  `buildingKeys` are fixed at `createPlanner()` time from `data.buildings`
  (`planner-core.js:5`) — VERIFIED (full file read); confirms Phase 2 must be
  a new, separate engine, not an extension of `planner-core.js`.
- `table-helpers.js`'s `targetCell()`/`grandTotalFooter()` hardcode the
  literal strings `'forticlad-planner__auto-tag'` /
  `'forticlad-planner__grand-total-label'` (`table-helpers.js:63`, `:75`) —
  VERIFIED; both are in Phase 4's rename file list.
- Source `TOME_COSTS` (12 rows) and `COLLECTION_TIERS` (11 tiers, 2+4×10=42
  rows +1 start = 43) transcribed in Phase 1 — VERIFIED against the raw
  fetched `tomes-collections.html` inline script (not re-derived from memory).
- `_data/navigation.yml`'s `loj-en`/`loj-vi` Tools groups currently list only
  Forticlad + Settings (`navigation.yml:39-44`, `:69-74`) — VERIFIED (full
  file read); confirms Phase 5's insertion point.
- `contents/en/lands-of-jail/planners/forticlad.md` front-matter/data-island
  pattern (`permalink`, `ref`, `sidebar.nav`, JSON script island via
  `jsonify`) — VERIFIED (full file read); Phase 5 mirrors it exactly.
- No existing VI precedent anywhere on the site for "Tomes & Collections" or
  any of the 6 new resource names — VERIFIED (matches the user's own decision
  to defer translation, consistent with how "Hyperalloy" was handled in the
  prior migration).

#### Questions & Answers

1. **[Scope]** Exact VI nav label for the new Tools entry?
   - Options: "Tomes & Collections" (Recommended) | "Công cụ tính Tomes & Collections"
   - **Answer:** "Công cụ tính Tomes & Collections".
   - **Rationale:** Matches Forticlad's VI nav phrasing pattern ("Công cụ tính
     Lõi trọng giáp") while keeping the term itself untranslated, consistent
     with the deferred-translation decision.

2. **[Architecture]** New profile storage tool key naming?
   - Options: `tomes-collections` (Recommended) | `tomes`
   - **Answer:** `tomes-collections`.
   - **Rationale:** Matches the page slug/URL exactly — no change from the
     original plan.

3. **[Scope]** Add a new "Reset to default" button (not present anywhere else
   on this site today), scoped to the new page only?
   - Options: Yes, add it to the new page only (Recommended) | Skip it
   - **Answer:** Yes, add it to the new page only.
   - **Rationale:** Add-only + no per-instance remove means Reset is the only
     way to undo an accidental add or start over; Forticlad's page is
     untouched by this addition.

4. **[Architecture]** Keep `.loj-planner__building-range(s)` /
   `__troop-group` element names as-is under the renamed prefix, or
   generalize those specific element names too in the same Phase 4 pass?
   - Options: Keep as-is (Recommended) | Generalize now too
   - **Answer:** Generalize now too.
   - **Rationale:** User chose the cleaner long-term naming
     (`__instance-range(s)`, `__group`) over the smaller-diff option — widens
     Phase 4's scope slightly but avoids Forticlad/Research-flavored element
     names leaking into a page about tomes and collections.

#### Confirmed Decisions
- VI nav label: "Công cụ tính Tomes & Collections".
- Storage tool key: `tomes-collections` (unchanged from original plan).
- New "Reset to default" button added to the Tomes & Collections page only.
- `.loj-planner__building-range(s)` → `.loj-planner__instance-range(s)`,
  `.loj-planner__troop-group` → `.loj-planner__group`, renamed in Phase 4
  (all consuming call sites in `forticlad.js`/`research.js` updated too, not
  just the SCSS selectors).

#### Action Items
- [x] Propagate VI nav label to Phase 5.
- [x] Propagate Reset button decision to Phase 3 (already present in the
      original draft; confirmed, no change needed).
- [x] Propagate element-renaming decision to Phase 4 (expands its scope from
      prefix-only to prefix + two specific element renames, with call-site
      updates in `forticlad.js`/`research.js`).

#### Impact on Phases
- Phase 4: element rename scope expands — `__building-range` →
  `__instance-range`, `__building-ranges` → `__instance-ranges`,
  `__troop-group` → `__group`, in `_sass/custom.scss` AND every JS call site
  in `forticlad.js`/`research.js` that references those specific class names
  (not just the shared prefix).
- Phase 5: VI nav entry label is "Công cụ tính Tomes & Collections" (no
  longer an open question).

### Whole-Plan Consistency Sweep
- Files reread: `plan.md`, `phase-01-start.md` through `phase-06-verify.md`.
- Decision deltas checked: 4 (VI nav label, storage key confirmation, Reset
  button confirmation, element-rename scope).
- Reconciled stale references: 2 (Phase 5's "confirm before finalizing" VI
  nav placeholder resolved; Phase 4's "do NOT touch element names" instruction
  superseded by the two specific renames below).
- Unresolved contradictions: 0.

<!-- slug: migrate-tomes-collections-planner -->
