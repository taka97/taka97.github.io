# 2026-09-10 — Migrate Robots & Satellites planner: brainstorm + plan

Third tool in the lojcalc.com migration series (after Forticlad, then Tomes &
Collections). Brainstormed and validated a plan to migrate "Robots &
Satellites" (`https://www.lojcalc.com/robots-satellites.html`). No code
touched — implementation not started this session.

## Source shape
Five new resources: PrisonerArmorData, PowerModule, AdvancedPowerModule,
DataDisk, PlanetCoin. Robot is a dynamic add-up-to-12 instance category (11
numeric levels: baseline "1", then steps of 10 to 100) — same repeatable
pattern as Tomes & Collections. Satellites are different in kind: 9 **fixed,
named** units, not addable, split into 3 rarity tiers (R/SR/SSR, 6/8/10
levels respectively) that each share one cost curve per tier. Like Tomes &
Collections and unlike Forticlad, there are **no cross-track prerequisites**
— flat cost summing, no cascade engine needed.

## Data-fidelity check
SSR tier's cost table isn't given directly in source — it has to be derived
by summing brackets out of a 90-entry per-level table. Rather than
hand-transcribing those sums (the kind of error a prior Forticlad round
already caught once), verified them independently with a Node script during
brainstorming. Source also flags one specific number — R-tier level 50's
Data Disk cost — as unconfirmed/estimated; this seeded a new UI primitive
(see below) instead of silently treating it as exact.

## New reusable primitives
Two additions to the shared `.loj-planner__*` component family, designed to
pay off across the 2 remaining future migrations, not just this one:
- Rarity-tier badge grouping pattern (R/SR/SSR).
- "Estimated cost" disclosure badge — a "≈" toggle plus a note, for costs the
  source itself flags as unconfirmed.

## Decisions confirmed during plan validation
Full-tier validation pass (6 phases, 9/9 claims checked, 0 failures) verified
`storage.js` / `planner-core.js` / `table-helpers.js` exports and confirmed
no naming collisions for the two new primitives. Three open questions were
resolved with the user:
- Satellite progress stored as an **object keyed by satellite id** (not an
  array like Robot's instances) — satellites are fixed/named, not
  add-as-many-as-you-want.
- **One combined** breakdown table across Robots + Satellites, not split per
  category.
- Phase 6 now **mandatorily** adds a "Robots & Satellites Planner client
  flow" section to `docs/system-architecture.md` (was optional in the first
  draft).

## Output
- Brainstorm report:
  `plans/reports/brainstorm-260910-1858-migrate-robots-satellites-planner.md`
- Validated plan: `plans/260910-1904-migrate-robots-satellites-planner/`
  (plan.md + 6 phases: Start through Verify).
- User ended the session after validation, choosing not to `/ak:cook` yet.
  Plan is ready to execute next session.
