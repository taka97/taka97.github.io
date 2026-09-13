# Brainstorm: center satellite knowledge, link tool → detail

## Problem
Satellite names/data live in 2 places: `_data/terms.yml` (5 name terms: laser,
radiance, watcher, sentinel, arbitrator — used only inside `satellite.md`) and
`_data/lands_of_jail/robots_satellites.yml`'s `satellites:` list (id/tier/label,
used by the Robots & Satellites planner). VI casing already drifted between the
two copies ("Bắn Tỏa" vs "Bắn tỏa"). The planner tool has no link to the
satellite.md knowledge page (role/effect/verdict/priority per satellite) and
vice versa — a user configuring the planner can't jump to the write-up.

Same duplication pattern exists for Robots (`season-2/robots.md` named
write-ups vs generic "Robot 1..12" planner slots), but user scoped this round
to **Satellites only**; Robots stays deferred (see memory
`pending-robot-external-link` — robot_N storage keys already prep for it).

Other planners (Hero Equipment, Collections & Tomes, Forticlad) have no
separate narrative knowledge page today, so this problem doesn't exist there
yet — tracked in roadmap for when it does.

## Approaches considered
1. **Keep narrative in .md, add stable anchors + yml link field** — chosen.
   Prose stays hand-written markdown (easiest to write/translate), tool gets a
   small `knowledgeAnchor` per satellite in the existing yml.
2. Move narrative into yml, render .md from yml — rejected: mixes long prose
   into yml, harder VI review, bigger diff for no real benefit at this scope.
3. New dedicated `_data/lands_of_jail/knowledge/*.yml` files — rejected as
   premature: only 1 object (satellites) needs this right now; YAGNI.

## Decision
- `_data/terms.yml`: delete `laser`, `radiance`, `watcher`, `sentinel`,
  `arbitrator` (verified: used nowhere outside `satellite.md`). Keep generic
  `satellite` term (used site-wide).
- `_data/lands_of_jail/robots_satellites.yml`: add `knowledgeBase:
  /lands-of-jail/satellite/` (top level) and `knowledgeAnchor:` on the 5
  released satellites only (`sat_r_laser`→`sat-laser`,
  `sat_r_observateur`→`sat-watcher`, `sat_r_radiance`→`sat-radiance`,
  `sat_sr_arbitre`→`sat-arbitrator`, `sat_sr_sentinelle`→`sat-sentinel`). The 4
  unreleased SSR satellites get no anchor → no link renders for them.
- `satellite.md` (EN+VI): add stable `{#sat-laser}` etc. ids to the 5
  per-satellite headings (same slug both languages, matching the existing
  `{#season-2-release-update}` pattern). Replace the deleted `term.html`
  per-satellite calls with a new `_includes/loj-satellite-name.html` include
  that looks the name up from `robots_satellites.yml`'s `satellites` list —
  page and tool now read the same name data.
- `assets/js/planners/robots-satellites.js`: `renderSatelliteTierSection`
  computes `knowledgeHref` (`/${language}${planner.knowledgeBase}#${anchor}`,
  omitted when no anchor); `renderInstanceCards` renders a "Details ↗" /
  "Chi tiết ↗" link (new tab, `target="_blank" rel="noopener"`) in the card
  heading when present. New `detailsLabel` message keys (en/vi).
- `_sass/custom.scss`: small style for the new link, reusing the existing
  `.loj-planner__instance-heading` flex-column spacing.

## Non-goals (this round)
- No reverse link (knowledge page → tool).
- No stub write-ups for the 4 unreleased SSR satellites.
- Robots untouched — deferred, tracked in roadmap.

## Roadmap
Added tracking entry in `docs/project-roadmap.md` under "Known gaps /
enhancements" for rolling this same tool↔knowledge-link pattern out to Robots
(and any future planner that gains a dedicated narrative knowledge page).

## Unresolved questions
None — design approved, new-tab link behavior confirmed.
