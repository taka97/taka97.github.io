# 2026-09-11 — Planner results sections hiding their own TOC headings

User reported the Forticlad Core Planner sidebar TOC had a "Research requirements"
entry that led nowhere — clicking it landed on a blank spot. Root cause: the results
`<section>` in `contents/en|vi/lands-of-jail/planners/forticlad.md` started with a
static `hidden` attribute, and `assets/js/planners/research.js` only cleared it once
`result.selectedTrackKeys.length > 0`. The reporting user's real saved profile had no
T11 research target set, so the section — and the `<h3 id="forticlad-research-totals-heading">`
inside it that Jekyll's build-time TOC scan indexes — was invisible for exactly the
state they were actually in. `renderEmptyResults(elements, message.noTargets)` was
even writing a "No target selected yet" message into the section on the very next
line, immediately before `elements.trackResults.hidden = true` hid it again — dead
code that could never be seen by anyone.

## Root cause

```js
if (result.selectedTrackKeys.length === 0) {
  renderEmptyResults(elements, message.noTargets);
  elements.trackResults.hidden = true;   // ← unreachable message, section gone
  setStatus(elements, '');
  return;
}
```

Went looking for the same shape before calling it fixed. Found the identical
pattern — static `hidden` in markup, JS unhiding only on a non-empty result, an
empty-state message rendered then immediately re-hidden — in all 6 results sections
across all 5 lojcalc-style planners: Forticlad Buildings *and* Research, Collections
& Tomes, Robots & Satellites, Hero Equipment, and Hero Stars & Exclusive Equipment.
Every one of them could produce a dead TOC link for a user with an empty profile in
that section. Asked the user: fix just the reported case, or all 6 with the same root
cause. They chose all 6.

## Fix

Removed `hidden` from all 12 markdown files (6 sections × EN + VI) and, in each of
the 6 JS files (`forticlad.js`, `research.js`, `tomes.js`, `robots-satellites.js`,
`hero-equipment.js`, `hero-stars-exclusive-equipment.js`), deleted every
`elements.<x>.hidden = true/false` toggle on that section across all branches of
`renderResult()` — invalid-range, zero-targets, success, catch — plus the now-dead
element lookup in each `getElements()`. The section is now always present and always
in the TOC; only its inner content changes (empty-state message, real table, or an
emptied box on error, which already surfaces its own status message elsewhere on the
page). Net diff: 14 insertions, 42 deletions across 16 files — pure removal, no new
logic needed.

## Verification

Live-verified in a real browser against the site owner's actual saved profile (not
synthetic fixtures): Forticlad Research and Hero Equipment — both genuinely empty for
this profile — now show "No target selected yet" and are real DOM-visible
(`section.hidden === false`, heading has a non-null `offsetParent`). Collections &
Tomes, Robots & Satellites, and Hero Stars & Exclusive Equipment, which already had
targets set, render unchanged. Docker Jekyll build succeeds; no new console errors
(the pre-existing unrelated `search.js` syntax error is still there, untouched).

A `code-reviewer` subagent reviewed all 16 changed files afterward: no blocking
findings, no stale references, no CSS coupled to the removed toggles, error/invalid
branches still correctly empty their containers. One informational note, accepted as
a non-regression UX nuance rather than fixed: the results container's inner
`tabindex="0"` region now enters the tab order as an empty focusable stop in the
error/invalid-range states, where before it was hidden and skipped. Worth revisiting
if it ever gets a real accessibility complaint, but not today's problem.

## Lesson

A `hidden` attribute tied to "does this section have content worth showing" is the
wrong gate the moment the section's own *heading* is something external (a TOC scan,
a sidebar nav, an anchor link) depends on existing independent of content state. The
content should hide itself; the section and its heading shouldn't. This bit us in 6
places because it was copied as a pattern across every lojcalc-style planner migration
— worth grep-ing for `\.hidden = ` next to any `data-role="*-results"` before adding a
7th planner in this family.

## Decision deferred

Mid-fix, the user asked about merging Forticlad's two separate result tables
(Buildings' "Upgrade requirements" + Research's "Research requirements") into one
combined table, the way Collections & Tomes already does. Scoped out as its own
architectural change and deferred to a future `/ak:plan` — Forticlad Buildings and
Research are two independent ES modules with independent calc engines, unlike
Tomes/Collections which already share one module and one calculation function.
Folding it into this bug fix would have mixed a one-line-per-file hidden-attribute
removal with a real cross-module merge; not worth the risk in the same commit.

## Output

Changed (uncommitted at time of writing): 6 JS files under `assets/js/planners/`,
12 markdown files under `contents/en|vi/lands-of-jail/planners/`. No plan file —
went through `/ak:fix`'s scout → diagnose → fix → verify flow directly, not `/ak:plan`,
since the root cause and its blast radius were confirmed before any code moved.
