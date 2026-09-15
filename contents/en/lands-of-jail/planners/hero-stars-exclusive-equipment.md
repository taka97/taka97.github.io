---
title: Hero Stars & Exclusive Equipment Planner
lang: en
permalink: /en/lands-of-jail/planners/hero-stars-exclusive-equipment/
ref: loj-hero-stars-exclusive-equipment-planner
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Hero Stars & Exclusive Equipment Planner

Calculate the Redeem and Exclusive Weapon Parts needed to level up your heroes' Star rank and Exclusive Equipment. Cost is identical across all heroes, so add as many Hero Stars instances and Exclusive Equipment instances as you're working on (up to 6 each — the two "+ Add Hero" buttons are independent), set a current and target level for each. Every Hero Stars level is a valid target — including in-between stage checkpoints and the trailing Max level past 5 stars · tier 5 — so pick any stopping point to see just that step's cost. See the combined total across everything at once.

<section class="loj-planner" data-hero-stars-exclusive-equipment-planner data-lang="en" aria-labelledby="hsee-planner-heading">
  <h2 id="hsee-planner-heading">Plan your upgrade</h2>

  <section class="loj-planner__profile-context" aria-labelledby="hsee-profile-heading">
    <h3 id="hsee-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="hsee-inventory-heading">
    <h3 id="hsee-inventory-heading">Current Stock</h3>
    {%- for resource in site.data.lands_of_jail.hero_stars_exclusive_equipment.resources -%}
    <label for="hsee-stock-{{ resource.key }}">{{ resource.label[page.lang] | default: resource.label.en | default: resource.label }}
      <input id="hsee-stock-{{ resource.key }}" data-role="stock-input" data-resource-key="{{ resource.key }}" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    {%- endfor -%}
  </section>

  <section class="loj-planner__summary" aria-labelledby="hsee-summary-heading">
    <h2 id="hsee-summary-heading" data-role="summary-heading">What you're missing</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="hsee-totals-heading">
      <h3 id="hsee-totals-heading">Upgrade requirements</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="hsee-totals-heading">
        <p>Totals will appear after you select a target level for a Hero Stars or Exclusive Equipment instance.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="hsee-hero-stars-heading">
    <h2 id="hsee-hero-stars-heading">Hero Stars</h2>
    <div data-role="hero-stars-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-hero-stars">+ Add Hero</button>
  </section>

  <section aria-labelledby="hsee-exclusive-equipment-heading">
    <h2 id="hsee-exclusive-equipment-heading">Exclusive Equipment</h2>
    <div data-role="exclusive-equipment-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-exclusive-equipment">+ Add Hero</button>
  </section>

  <p>
    <button type="button" data-role="reset">Reset to default</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>

</section>

<script id="hero-stars-exclusive-equipment-data" type="application/json">{{ site.data.lands_of_jail.hero_stars_exclusive_equipment | jsonify }}</script>
<script type="module" src="/assets/js/planners/hero-stars-exclusive-equipment.js"></script>
