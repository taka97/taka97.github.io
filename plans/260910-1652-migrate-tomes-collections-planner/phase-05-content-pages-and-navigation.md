---
phase: 5
title: "Phase 5: Content pages and navigation"
status: complete
priority: P1
effort: ""
dependencies: [2, 3, 4]
---

# Phase 5: Content pages and navigation

## Overview

Add the bilingual Markdown content pages (EN + VI) that host the Tomes &
Collections planner, wire the data island, load the new JS module, and add the
nav entry so the page is reachable.

## Requirements

- Functional: `/en/lands-of-jail/planners/tomes-collections/` and
  `/vi/lands-of-jail/planners/tomes-collections/` both render and are reachable
  from the Tools nav group, following `forticlad.md`'s exact front-matter
  pattern (`permalink`, `lang`, `ref`, `sidebar: { nav: loj-en|loj-vi }`,
  `aside: { toc: true }`).
- Functional: page section order matches Phase 1's source structure: intro ->
  active profile -> current stock -> what's missing (summary + breakdown) ->
  Tomes -> Collections -> (sticky bar is a fixed-position element outside the
  normal flow, rendered by `tomes.js`, not part of this section order).
- Functional: EN copy adapted from source `I18N.en` (intro/feature text); VI
  copy created now with the same structure, new resource/tier terms left
  identical to EN per confirmed decision.

## Architecture

Mirrors `forticlad.md`'s pattern exactly:
```markdown
---
title: Tomes & Collections Planner
lang: en
permalink: /en/lands-of-jail/planners/tomes-collections/
ref: loj-tomes-collections-planner
sidebar: { nav: loj-en }
aside: { toc: true }
---

# Tomes & Collections Planner

<intro paragraph>

<section class="loj-planner" data-tomes-planner data-lang="en" aria-labelledby="tomes-planner-heading">
  ...active profile, stock, missing summary, Tomes section, Collections section...
</section>

<script id="tomes-data" type="application/json">{{ site.data.lands_of_jail.tomes_collections | jsonify }}</script>
<script type="module" src="/assets/js/planners/tomes.js"></script>
```

VI counterpart at `/vi/lands-of-jail/planners/tomes-collections/`,
`ref: loj-tomes-collections-planner` (same `ref` as EN — links the pair for the
language switcher/hreflang, per `_includes/header.html`'s matching logic).

## Related Code Files

- Create: `contents/en/lands-of-jail/planners/tomes-collections.md`
- Create: `contents/vi/lands-of-jail/planners/tomes-collections.md`
- Modify: `_data/navigation.yml` (add entry to both `loj-en` and `loj-vi` Tools
  groups, alongside the existing Forticlad + Settings entries)

## Implementation Steps

1. Write the EN content page: intro paragraph adapted from source's
   `introLead`/`introFeature1-3`/`introNote` (Phase 1's captured `I18N.en`),
   `<section data-tomes-planner>` skeleton with `data-role` hooks matching what
   `tomes.js` (Phase 3) queries, JSON data island, script tag.
2. Write the VI content page: same structure, translated intro copy (natural
   Vietnamese, consistent with existing VI content tone per `forticlad.md`'s
   VI counterpart), but resource/tier term values left as EN text per the
   confirmed decision — do not silently translate them anyway.
3. Add nav entries to `_data/navigation.yml`'s `loj-en`/`loj-vi` Tools groups:
   EN label "Tomes & Collections", VI label **"Công cụ tính Tomes &
   Collections"** (confirmed in Validation Session 1 — follows Forticlad's VI
   nav phrasing pattern "Công cụ tính Lõi trọng giáp" while keeping the term
   itself untranslated).
4. Cross-check `_includes/head/favicon.html`'s URL-matching rule — it only
   special-cases `/lands-of-jail`, so the new page automatically gets the
   default `game-console` favicon with no change needed there.

## Success Criteria

- [x] Both pages build and are reachable via the Tools nav group (EN + VI).
- [x] EN/VI pages share the same `ref`, confirmed via the language switcher
      linking correctly between them.
- [x] Page section order matches Phase 1's captured source order.
- [x] `hreflang` alternates generate correctly for the new `ref` pair (spot
      check `_includes/head/custom.html`'s output in the Phase 6 build).

## Risk Assessment

None outstanding — VI nav label was the only open call, resolved in
Validation Session 1 (see `plan.md`).
