# 2026-09-10 — Migrate Hero Equipment planner: implementation

Executed the plan from the earlier brainstorm session
(`plans/260910-2303-migrate-hero-equipment-planner/`, 5 phases, all
complete). New page live at `/lands-of-jail/planners/hero-equipment/`
(EN+VI), new `hero-equipment-core.js` calc engine — the first engine since
Forticlad's `research-core.js` to resolve a cross-track prerequisite, but far
simpler: exactly 12 disjoint 1:1 Rarity→Mastery pairs (never cross-cell,
never multi-hop), so a single pass suffices where Forticlad needs a
fixed-point loop.

## Branch base was stale mid-session

Phase 1 said to branch off `main` on the assumption that the three prior
migrations (Forticlad, Tomes & Collections, Robots & Satellites) were already
merged there. They weren't — `main` was missing 10 commits' worth of Tomes
& Collections/Robots & Satellites work, including the exact `table-helpers.js`
additions (`renderEstimatedBadge`, sticky bar helpers) this plan explicitly
depends on. Caught it before writing any code by diffing `main` against the
leftover `feat/tomes-collections-planner` branch. User merged that branch to
`main` mid-session; rebased the new `feat/hero-equipment-planner` branch
cleanly once confirmed. Worth remembering: a plan's "prior work is
complete/done" claim describes the *plan's* status, not necessarily the
actual git state — verify before trusting it as a branch-point assumption.

## Two real bugs caught by code review, both from the same design choice

The Rarity Target `<select>` intentionally offers only 11 of the 21 level
indices (the non-"_s1" tiers) — the engine's range-sum semantics don't care,
but the UI code has to actively account for a target index space that's a
strict subset of the current index space. Two spots didn't:

1. `sanitizeEquipmentState` clamped a stored Rarity target to `[0, 20]` only,
   not to the actual 11 valid option values. A corrupted/hand-edited profile
   backup (imported via the existing `profile-settings.js` restore path,
   which has no per-tool schema validation) with an odd target index would
   render a blank/unmatched `<select>`, show a "No target" badge, but still
   silently bill that target's cost in the totals and breakdown table — the
   UI and the actual charged cost would disagree. Fixed by clamping against
   the real `rarityTargetIndices` list instead of a numeric range.
2. `keepTargetAtOrAboveCurrent` (fires when the user raises Current past an
   already-set Target) picked the *next valid* target index at or above the
   new Current for the Rarity track — meaning raising Current could silently
   jump Target several tiers forward and invent cost the user never asked
   for, including triggering the Mastery auto-add cascade in the same click.
   The sibling precedent (`robots-satellites.js`) only ever sets
   `target = current`, a zero-cost no-op, because its target space is
   unrestricted. Fixed by clearing the Rarity target to "No target" instead
   of raising it when the previous target is no longer expressible — matches
   the sibling's "never fabricate a plan the user didn't choose" property
   without needing the full valid-target list at all.

## Data fidelity — independently re-verified

The code-reviewer subagent re-fetched the live source and diffed all 42 cost
values plus the 6 `requiresMastery` levels against `hero_equipment.yml`: byte
exact. Two figures that look like transcription slips on visual inspection
are confirmed correct against source: Mastery Precision Equipment 17-20 =
`360, 380, 400, 400` (breaks the otherwise clean ×20 ladder), and Mastery
Magnet level 10 = 220 vs level 11 = 200 (non-monotonic step). Both verbatim
from lojcalc.com, not errors. First migration in this series where the
"every migration hits at least one transcription slip" streak didn't hold.

## Verification

Docker Jekyll build clean (before and after the two post-review fixes). Live
interactive pass in Chrome on both `/en/` and `/vi/`: reproduced the
brainstorm's exact auto-add sample (Gloves Legendary(maxed)→Legendary T1 =
400 Magnet + auto-added Mastery Level 5→10 = 800 Precision Equipment + 220
Magnet, tagged "(auto-added — prerequisite)"), the "≈" estimated badge
appearing and toggling on the `common_s1` range, full state survival across
a reload, and the EN↔VI language switcher round-tripping via the shared
`ref`. Re-tested both bug fixes live after applying them: a corrupted stored
target now clamps correctly, and raising Current past a set Target now
clears to "No target" instead of auto-promoting.

## Output

Implementation complete, all 5 plan phases closed, two real bugs fixed
pre-ship. `docs/system-architecture.md` and `docs/codebase-summary.md` both
updated (the latter was missed in this implementer's first docs pass — same
gap the Robots & Satellites review caught last time; worth making this an
explicit Phase-4 checklist item in the next migration's plan rather than
relying on review to catch it again).
