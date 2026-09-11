---
title: Robots & Satellites Planner
lang: en
permalink: /en/lands-of-jail/planners/robots-satellites/
ref: loj-robots-satellites-planner
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Robots & Satellites Planner

Calculate the Data Disks, Planet Coins, and Power Modules needed to level up your Robot and all 9 named Satellites. Add as many Robot instances as you're working on (up to 12), set a current and target level for each, and set current/target levels for the R, SR, and SSR Satellites you're leveling. See the combined total across everything at once. One cost figure — the R-tier Satellites' level 50 Data Disk cost — is marked with a "≈" badge because it wasn't fully confirmed from source; click or focus it to read the note. Resource and Satellite names are shown in English for now.

<section class="loj-planner" data-robots-satellites-planner data-lang="en" aria-labelledby="rs-planner-heading">
  <h2 id="rs-planner-heading">Plan your upgrade</h2>

  <section class="loj-planner__profile-context" aria-labelledby="rs-profile-heading">
    <h3 id="rs-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="rs-inventory-heading">
    <h3 id="rs-inventory-heading">Current Stock</h3>
    <label for="rs-stock-prisoner-armor-data">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/robots-satellites/prisoner-armor-data.png" alt="" width="24" height="24">Prisoner Armor Data</span>
      <input id="rs-stock-prisoner-armor-data" data-role="stock-input" data-resource-key="PrisonerArmorData" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="rs-stock-power-module">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/robots-satellites/power-module.png" alt="" width="24" height="24">Power Module</span>
      <input id="rs-stock-power-module" data-role="stock-input" data-resource-key="PowerModule" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="rs-stock-advanced-power-module">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/robots-satellites/advanced-power-module.png" alt="" width="24" height="24">Advanced Power Module</span>
      <input id="rs-stock-advanced-power-module" data-role="stock-input" data-resource-key="AdvancedPowerModule" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="rs-stock-data-disk">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/robots-satellites/data-disk.png" alt="" width="24" height="24">Data Disk</span>
      <input id="rs-stock-data-disk" data-role="stock-input" data-resource-key="DataDisk" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="rs-stock-planet-coin">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/robots-satellites/planet-coin.png" alt="" width="24" height="24">Planet Coin</span>
      <input id="rs-stock-planet-coin" data-role="stock-input" data-resource-key="PlanetCoin" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="rs-summary-heading">
    <h2 id="rs-summary-heading" data-role="summary-heading">What you're missing</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="rs-totals-heading">
      <h3 id="rs-totals-heading">Upgrade requirements</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="rs-totals-heading">
        <p>Totals will appear after you select a target level for a Robot or Satellite.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="rs-robots-heading">
    <h2 id="rs-robots-heading">Robots</h2>
    <div data-role="robots-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-robot">+ Add Robot</button>
  </section>

  <section aria-labelledby="rs-satellites-r-heading">
    <h2 id="rs-satellites-r-heading">Satellites — <span class="loj-planner__rarity-badge" data-role="tier-badge-r">R</span></h2>
    <div data-role="satellites-r-list" class="loj-planner__instance-ranges"></div>
  </section>

  <section aria-labelledby="rs-satellites-sr-heading">
    <h2 id="rs-satellites-sr-heading">Satellites — <span class="loj-planner__rarity-badge" data-role="tier-badge-sr">SR</span></h2>
    <div data-role="satellites-sr-list" class="loj-planner__instance-ranges"></div>
  </section>

  <section aria-labelledby="rs-satellites-ssr-heading">
    <h2 id="rs-satellites-ssr-heading">Satellites — <span class="loj-planner__rarity-badge" data-role="tier-badge-ssr">SSR</span></h2>
    <div data-role="satellites-ssr-list" class="loj-planner__instance-ranges"></div>
  </section>

  <p>
    <button type="button" data-role="reset">Reset to default</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>

</section>

<script id="robots-satellites-data" type="application/json">{{ site.data.lands_of_jail.robots_satellites | jsonify }}</script>
<script type="module" src="/assets/js/planners/robots-satellites.js"></script>
