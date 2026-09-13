---
phase: 1
title: "Data and knowledge page anchors"
status: done
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Data and knowledge page anchors

## Overview

Consolidate satellite names into `robots_satellites.yml` (already the runtime
source used by the planner), remove the now-redundant name terms from
`terms.yml`, and give `satellite.md`'s per-satellite headings stable anchor
ids in both languages so the planner can link to them.

## Requirements

- Functional: `robots_satellites.yml` gains `knowledgeBase` (top level) and
  `knowledgeAnchor` (5 released satellites only — not the 4 unreleased SSR
  ones). `terms.yml` loses the 5 per-satellite-name keys. `satellite.md`
  (EN+VI) headings get matching `{#anchor}` ids; satellite names in that page
  render via a new include reading the yml instead of `term.html`.
- Non-functional: no visible change to `satellite.md`'s rendered prose text
  (same names/wording) — only the underlying data source and the presence of
  anchor ids change.

## Architecture

- `robots_satellites.yml`'s existing `satellites:` list already carries
  `id`/`tier`/`label: {en, vi}` per satellite — this becomes the single
  source of satellite names, replacing `terms.yml`'s `laser`/`radiance`/
  `watcher`/`sentinel`/`arbitrator` keys (verified via grep: those 5 keys are
  used nowhere except `satellite.md`).
- New top-level yml key `knowledgeBase: /lands-of-jail/satellite/` — the
  language-agnostic path segment the tool prefixes with `/${language}` to
  build a link (satellite.md's permalinks are `/en/lands-of-jail/satellite/`
  and `/vi/lands-of-jail/satellite/`).
- New per-satellite `knowledgeAnchor:` field, added only to the 5 satellites
  that have a write-up in `satellite.md`:
  - `sat_r_laser` → `sat-laser`
  - `sat_r_observateur` → `sat-watcher`
  - `sat_r_radiance` → `sat-radiance`
  - `sat_sr_arbitre` → `sat-arbitrator`
  - `sat_sr_sentinelle` → `sat-sentinel`
  The 4 SSR satellites (`sat_ssr_domaine_omniscient`, `sat_ssr_nexus_celeste`,
  `sat_ssr_argus`, `sat_ssr_polaris`) get no `knowledgeAnchor` field.
- New include `_includes/loj-satellite-name.html`, modeled on
  `_includes/term.html`: takes `include.id` (a satellite id like
  `sat_r_laser`), looks it up in
  `site.data.lands_of_jail.robots_satellites.satellites`, renders
  `label[page.lang] | default: label.en`.
- `satellite.md` (EN+VI): replace each `{% include term.html key="laser" %}`
  (and radiance/watcher/sentinel/arbitrator) call with
  `{% include loj-satellite-name.html id="sat_r_laser" %}` (etc, matching id
  per satellite). Add `{#sat-laser}` etc. to the 5 corresponding `###`
  headings — same anchor slug in both EN and VI files (mirrors the existing
  `## Season 2 Release Update {#season-2-release-update}` pattern already in
  both files).

## Related Code Files

- Modify: `_data/terms.yml` (remove 5 keys, keep `satellite`)
- Modify: `_data/lands_of_jail/robots_satellites.yml` (add `knowledgeBase`,
  add `knowledgeAnchor` to 5 satellites)
- Create: `_includes/loj-satellite-name.html`
- Modify: `contents/en/lands-of-jail/satellite.md` (headings + include swap)
- Modify: `contents/vi/lands-of-jail/satellite.md` (headings + include swap)

## Implementation Steps

1. Edit `_data/terms.yml`: delete the `laser`, `radiance`, `watcher`,
   `sentinel`, `arbitrator` blocks. Leave `satellite` untouched.
2. Edit `_data/lands_of_jail/robots_satellites.yml`: add
   `knowledgeBase: /lands-of-jail/satellite/` near the top (after `caps`, next
   to the other top-level keys), and add `knowledgeAnchor: <slug>` to the 5
   released satellite entries listed above (leave the 4 SSR entries as-is).
3. Create `_includes/loj-satellite-name.html`:
   ```liquid
   {%- assign lang = page.lang | default: site.lang | default: "en" -%}
   {%- assign sat = site.data.lands_of_jail.robots_satellites.satellites | where: "id", include.id | first -%}
   {%- if sat -%}
     {{- sat.label[lang] | default: sat.label.en -}}
   {%- else -%}
     {{- include.id -}}
   {%- endif -%}
   ```
4. In both `satellite.md` files: for each of the 5 `###` headings (Laser,
   Watcher, Radiance, Arbitrator, Sentinel — note the file currently orders
   them Laser/Sentinel/Arbitrator/Radiance/Watcher), append the matching
   `{#sat-*}` anchor id, and replace the per-satellite `term.html` include
   calls (in the heading itself, in body prose, and in the "Priority Order"
   list) with `loj-satellite-name.html id="..."`. Double-check every
   occurrence of `key="laser"` etc. in both files is replaced (not just the
   headings — body prose and the priority list also reference them).
5. Build via Docker (`bundle exec jekyll build`, per CLAUDE.md) and confirm no
   Liquid errors; check `_site/en/lands-of-jail/satellite/index.html` and the
   `vi` counterpart render the same names as before, with the new anchor ids
   present on the right headings.

## Success Criteria

- [ ] `terms.yml` has no `laser`/`radiance`/`watcher`/`sentinel`/`arbitrator` keys.
- [ ] `robots_satellites.yml` has `knowledgeBase` + `knowledgeAnchor` on exactly the 5 released satellites.
- [ ] `_includes/loj-satellite-name.html` created and resolves correctly for both `en` and `vi`.
- [ ] Both `satellite.md` files: 5 headings have `{#sat-*}` ids; every former `term.html` satellite-name call (headings, prose, priority list) now uses the new include; rendered text unchanged from before the edit.
- [ ] Docker Jekyll build succeeds with no errors.

## Risk Assessment

- **Risk:** missing a `term.html key="laser"`-style call inside body prose
  (not just headings) after deleting the term, causing that spot to render
  the raw key name via `term.html`'s fallback. **Mitigation:** grep both
  `satellite.md` files for `key="laser"` etc. after editing to confirm zero
  remaining matches before deleting the terms.
- **Risk:** anchor slug collides with Jekyll's auto-generated id for an
  unrelated heading. **Mitigation:** the chosen `sat-*` slugs are novel and
  scoped to this page; verify in the built HTML there's exactly one element
  with each id.

## Implementation Notes

- Docker Jekyll build succeeded; built HTML confirmed exactly one `id="sat-*"`
  per slug in both `_site/en/.../satellite/index.html` and the VI counterpart,
  with correct rendered names (VI "radiance" casing shifted from the old
  `terms.yml` copy's "Bắn Tỏa" to `robots_satellites.yml`'s "Bắn tỏa" — the
  intended effect of consolidating to one source, per Goal 1).
- Code review caught that `_includes/loj-satellite-name.html`'s
  `sat.label[lang] | default: sat.label.en` renders blank for the 4 unreleased
  SSR satellites, whose `label` is a scalar string rather than an `{en, vi}`
  map (unlike the JS side's `resolveLocalizedLabel`, which already handles
  both shapes). Not triggered today since the priority list hardcodes
  `ARGUS`/`POLARIS` as plain text, but latent for future SSR write-ups.
  Fixed by adding a `| default: sat.label` fallback.
