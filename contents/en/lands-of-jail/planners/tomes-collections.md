---
title: Tomes & Collections Planner
lang: en
permalink: /en/lands-of-jail/planners/tomes-collections/
ref: loj-tomes-collections-planner
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Tomes & Collections Planner

Calculate the Seals and Trove Coins needed to level up your Tomes and Collections. Add as many Tomes (up to 18) and Collections (up to 6) as you're working on, set a current and target level for each, and see the combined total across everything at once. Resource and tier names are shown in English for now.

<section class="loj-planner" data-tomes-planner data-lang="en" aria-labelledby="tomes-planner-heading">
  <h2 id="tomes-planner-heading">Plan your upgrade</h2>

  <section class="loj-planner__profile-context" aria-labelledby="tomes-profile-heading">
    <h3 id="tomes-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="tomes-inventory-heading">
    <h3 id="tomes-inventory-heading">Current Stock</h3>
    <label for="tomes-stock-seal-of-wisdom">Seal of Wisdom
      <input id="tomes-stock-seal-of-wisdom" data-role="stock-input" data-resource-key="SealOfWisdom" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="tomes-stock-seal-of-knowledge">Seal of Knowledge
      <input id="tomes-stock-seal-of-knowledge" data-role="stock-input" data-resource-key="SealOfKnowledge" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="tomes-stock-common-coin">Common Trove Coin
      <input id="tomes-stock-common-coin" data-role="stock-input" data-resource-key="CommonCoin" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="tomes-stock-rare-coin">Rare Trove Coin
      <input id="tomes-stock-rare-coin" data-role="stock-input" data-resource-key="RareCoin" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="tomes-stock-precious-coin">Precious Trove Coin
      <input id="tomes-stock-precious-coin" data-role="stock-input" data-resource-key="PreciousCoin" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="tomes-stock-legendary-coin">Legendary Trove Coin
      <input id="tomes-stock-legendary-coin" data-role="stock-input" data-resource-key="LegendaryCoin" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="tomes-summary-heading">
    <h2 id="tomes-summary-heading" data-role="summary-heading">What you're missing</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="tomes-totals-heading" hidden>
      <h3 id="tomes-totals-heading">Upgrade requirements</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="tomes-totals-heading">
        <p>Totals will appear after you select a target level for a Tome or Collection.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="tomes-tomes-heading">
    <h2 id="tomes-tomes-heading">Tomes</h2>
    <div data-role="tomes-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-tome">+ Add Tome</button>
  </section>

  <section aria-labelledby="tomes-collections-heading">
    <h2 id="tomes-collections-heading">Collections</h2>
    <div data-role="collections-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-collection">+ Add Collection</button>
  </section>

  <p>
    <button type="button" data-role="reset">Reset to default</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>

</section>

<script id="tomes-data" type="application/json">{{ site.data.lands_of_jail.tomes_collections | jsonify }}</script>
<script type="module" src="/assets/js/planners/tomes.js"></script>
