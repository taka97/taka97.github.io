---
title: Collections & Tomes Planner
lang: en
permalink: /en/lands-of-jail/planners/collections-tomes/
ref: loj-tomes-collections-planner
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Collections & Tomes Planner

Calculate the Seals and Trove Coins needed to level up your Collections and Tomes. Your 6 Collections and 18 Tomes (2 and 6 each for Shieldbearer, Bomber, and Shooter — Tomes split into 3 Attack and 3 Defense) are always shown. Set a current and target level for each, and see the combined total across everything at once. Resource and tier names are shown in English for now.

<section class="loj-planner" data-tomes-planner data-lang="en" aria-labelledby="collections-tomes-planner-heading">
  <h2 id="collections-tomes-planner-heading">Plan your upgrade</h2>

  <section class="loj-planner__profile-context" aria-labelledby="collections-tomes-profile-heading">
    <h3 id="collections-tomes-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="collections-tomes-inventory-heading">
    <h3 id="collections-tomes-inventory-heading">Current Stock</h3>
    {%- assign stock_order = "CommonCoin,RareCoin,PreciousCoin,LegendaryCoin,SealOfWisdom,SealOfKnowledge" | split: "," -%}
    {%- for stock_key in stock_order -%}
    {%- assign resource = site.data.lands_of_jail.tomes_collections.resources | where: "key", stock_key | first -%}
    <label for="collections-tomes-stock-{{ resource.key }}">
      <span class="loj-planner__stock-label">{% if resource.icon %}<img class="loj-planner__stock-icon" src="{{ resource.icon }}" alt="" width="24" height="24">{% endif %}{{ resource.label[page.lang] | default: resource.label.en | default: resource.label }}</span>
      <input id="collections-tomes-stock-{{ resource.key }}" data-role="stock-input" data-resource-key="{{ resource.key }}" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
    {%- endfor -%}
  </section>

  <section class="loj-planner__summary" aria-labelledby="collections-tomes-summary-heading">
    <h2 id="collections-tomes-summary-heading" data-role="summary-heading">What you're missing</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="collections-tomes-totals-heading">
      <h3 id="collections-tomes-totals-heading">Upgrade requirements</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="collections-tomes-totals-heading">
        <p>Totals will appear after you select a target level for a Tome or Collection.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="collections-heading">
    <h2 id="collections-heading">Collections</h2>
    <div data-role="collections-list" class="loj-planner__instance-ranges"></div>
  </section>

  <section aria-labelledby="tomes-heading">
    <h2 id="tomes-heading">Tomes</h2>
    <div data-role="tomes-list" class="loj-planner__instance-ranges"></div>
  </section>

  <p>
    <button type="button" data-role="reset">Reset to default</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>

</section>

<script id="collections-tomes-data" type="application/json">{{ site.data.lands_of_jail.tomes_collections | jsonify }}</script>
<script type="module" src="/assets/js/planners/tomes.js"></script>
