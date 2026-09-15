# 2026-09-15 — Hero Stars max level: revert the relabel, add a real data level

Two commits ago (412be18) this planner special-cased `star5_s5` — the last real
tier in `heroStars.levels` — to render as "Max level" instead of its honest
"5 stars · tier 5" label. That was the wrong fix from the start: it made the
*last existing tier* lie about what it was, and it capped the achievable
Redeem total at whatever tier 5 already cost, with no way to express "beyond
fully tiered" as its own thing. User caught it and asked for a real reversal:
put tier 5's label back, and add a genuinely separate `max_level` entry after
it that carries its own cost.

## Root cause of the original mistake

Relabeling an existing id is a display-only patch that's cheap to write and
easy to approve in review, but it conflates two different concepts — "the
last tier" and "beyond all tiers" — into one id. The moment someone needs the
real total to differ from tier 5's total (confirmed with the user via
`AskUserQuestion`: current="5 stars" → target="max_level" must total exactly
600 Redeem, not tier 5's existing 500), the relabel has nowhere to put the
difference. There was never a code path for "one more level past the last
one" because there was never a level there.

## Fix

- `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`: appended a new
  `{ id: max_level, cost: { HeroFragment: 100 } }` after `star5_s5` —
  `heroStars.levels` goes from 32 to 33 entries. 500 (tiers 1–5, unchanged) +
  100 (new sink level) = 600, matching the user-confirmed target.
- `hero-stars-exclusive-equipment.js`: removed the `star5_s5 → "Max level"`
  special case in `heroStarsLevelLabel`; `max_level → "Max level"` replaces
  it. `star5_s5` now falls through to the normal tier-label regex again
  ("5 stars · tier 5" / "5 sao · bậc 5").
- `hero-stars-exclusive-equipment-core.js`: `HERO_STARS_LEVEL_COUNT` 32 → 33.
- Index clamping across the engine is length-derived everywhere, so the extra
  level was purely additive — no persisted per-profile progress became
  invalid or needed a migration script.

## What the code review caught: append vs. replace on a comment

The plan's phase step said "update the yml header comment to describe the new
trailing max_level sink level." First pass took that literally as *append* —
a new "33 entries, trailing max_level sink" note got tacked on below the
existing "32 entries" text, leaving the header self-contradicting about the
data it was describing right above the entries themselves. The
`code-reviewer` subagent flagged it as a Medium finding. Fixed by
consolidating into one accurate comment instead of two competing ones.

Small catch, but a real lesson: "update the comment" in a plan step means
*replace the stale claim*, not *append a correction next to it*. A comment
block that argues with itself is worse than a merely outdated one, because a
future reader can't tell which line is current without reading the actual
data below it to arbitrate.

## Deliberately left alone

The EN/VI content-page intro prose that lists which Hero Stars targets are
selectable already understated the real option set before this change (flagged
by review as pre-existing, out of scope). Adding `max_level` makes that prose
one entry more stale — it still doesn't mention the new target. Told the user,
left it as-is per the requested scope (data + engine + label fix only, not a
content-copy pass). Next person touching this planner's content page should
check whether that intro list has drifted further before trusting it.

## Verification

Docker Jekyll build passed. Live check via claude-in-chrome on both `/en/`
and `/vi/`: Current="5 stars", Target="Max level" → breakdown shows exactly
600 Redeem (500 existing + 100 new), and tier 5 no longer renders as "Max
level" anywhere in the UI.

## Output

Small, single-session, low-risk change — brainstorm
(`plans/reports/brainstorm-260915-1238-hero-stars-max-level-tier-revert.md`)
→ plan (`plans/260915-1244-hero-stars-max-level-revert-and-new-sink-level/`,
2 phases, both complete, 0 verification failures) → direct implementation.
Changed: `_data/lands_of_jail/hero_stars_exclusive_equipment.yml`,
`assets/js/planners/hero-stars-exclusive-equipment.js`,
`assets/js/planners/hero-stars-exclusive-equipment-core.js`,
`docs/system-architecture.md`. Uncommitted at time of writing — user has not
asked for a commit yet.
