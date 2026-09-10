# 2026-09-10 — Forticlad/lojcalc style alignment: brainstorm + plan

Requested check: should Forticlad FC/AFC Planner borrow lojcalc.com's
layout/interaction patterns while keeping this site's own TeXt colors/style.
Brainstormed, scoped, planned, validated. No code touched — implementation not
started.

## False start
Tried previewing local `_site` via `python -m http.server` to compare against
lojcalc.com; JS-driven content didn't render, giving a false negative (looked
like Current/Target dropdowns were missing). User redirected to check the real
deployed production page instead — dropdowns were already there. **Lesson:
never trust a plain static-file-server preview for JS-hydrated pages; compare
against the actual deployed site or a full `jekyll serve`.**

## Decisions
- Scope: applies to all tools sharing the `.loj-planner` component family
  (Forticlad now, Tomes & Collections next), not a one-off Forticlad tweak.
- Port from lojcalc: per-instance "target set" / "no target" status badge,
  and a sticky bottom "Missing" totals bar.
- Keep: existing amber accent, light TeXt theme — no dark "calculator" surface.
- Skip: bracket-style section labels, lojcalc's data-driven "NEW" badge (no
  editorial/versioning rule backs it here — YAGNI).
- Report: `plans/reports/brainstorm-260910-1747-forticlad-lojcalc-style-alignment.md`

## Bug caught by /ak:plan validate
Grep-based validation pass on the freshly written Phase 2 caught a real
structural mistake before any code was written: the phase assumed Forticlad
had two separate missing-summary sections (buildings, research) and proposed
two independent sticky bars. Actual markup has **one** shared
`.loj-planner__summary` section (`#forticlad-summary-heading`) holding
FC/AFC/Hyperalloy together. Corrected to a single combined sticky bar:
`research.js` will dispatch a new `forticlad:research-totals-changed`
CustomEvent (mirroring the existing `forticlad:building-data-changed`
precedent) for `forticlad.js` to merge in. Two other validate questions
(badge inline-vs-flex placement, badge amber-vs-gray) confirmed the plan's
existing choices unchanged. **Lesson: always validate a freshly drafted phase
against the real markup structure, not the shape assumed during brainstorm —
would have shipped two redundant sticky bars otherwise.**

## Output
- Validated plan: `plans/260910-1803-forticlad-lojcalc-style-alignment/`
  (plan.md + 4 phases: Start, Sticky Missing Bar for Forticlad, Per-Instance
  Status Badge, Verify).
- User ended session after validation (chose not to `/ak:cook` yet). Plan is
  ready to execute next session — no implementation done.
