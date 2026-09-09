---
title: Forticlad FC / AFC Planner
lang: en
permalink: /en/lands-of-jail/planners/forticlad/
ref: loj-forticlad-planner
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Forticlad FC / AFC Planner

Calculate Forticlad Core (FC) and Advanced Forticlad Core (AFC), including automatically resolved prerequisites. Set the current and target Base independently for all seven buildings.

<section class="forticlad-planner" data-forticlad-planner data-lang="en" aria-labelledby="forticlad-planner-heading">
  <h2 id="forticlad-planner-heading">Plan your upgrade</h2>

  <section class="forticlad-planner__profile-context" aria-labelledby="forticlad-profile-heading">
    <h3 id="forticlad-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="forticlad-planner__inventory" aria-labelledby="forticlad-inventory-heading">
    <h3 id="forticlad-inventory-heading">Current Stock</h3>
    <label for="forticlad-fc-on-hand">FC current amount
      <input id="forticlad-fc-on-hand" data-role="fc-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="forticlad-afc-on-hand">AFC current amount
      <input id="forticlad-afc-on-hand" data-role="afc-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="forticlad-planner__summary" aria-labelledby="forticlad-summary-heading">
    <h2 id="forticlad-summary-heading">What you're missing</h2>
    <dl>
      <div><dt>FC / AFC on hand</dt><dd><output class="forticlad-planner__summary-value" data-role="summary-stock">—</output></dd></div>
      <div><dt>FC / AFC required</dt><dd><output class="forticlad-planner__summary-value" data-role="summary-required">—</output></dd></div>
      <div><dt>Result</dt><dd><output class="forticlad-planner__summary-value" data-role="summary-balance">—</output></dd></div>
    </dl>
  </section>

  <form class="forticlad-planner__form" data-role="range-form">
    <fieldset>
      <legend>Building Base ranges</legend>
      <div data-role="building-ranges" class="forticlad-planner__building-ranges"></div>
    </fieldset>
  </form>

  <p data-role="status" class="forticlad-planner__status" role="status" aria-live="polite"></p>

  <section class="forticlad-planner__results" aria-labelledby="forticlad-breakdown-heading">
    <h2 id="forticlad-breakdown-heading">Upgrade breakdown</h2>
    <div data-role="step-breakdown" class="forticlad-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-breakdown-heading">
      <p>Select valid building ranges to see upgrade steps.</p>
    </div>
  </section>

  <section class="forticlad-planner__results" aria-labelledby="forticlad-totals-heading">
    <h2 id="forticlad-totals-heading">FC / AFC totals by building</h2>
    <div data-role="building-totals" class="forticlad-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-totals-heading">
      <p>Totals will appear after you select building ranges.</p>
    </div>
    <p class="forticlad-planner__grand-total"><strong>Grand total:</strong> <output data-role="grand-total">—</output></p>
    <div class="forticlad-planner__charts">
      <section class="forticlad-planner__chart" aria-labelledby="forticlad-chart-heading">
        <h3 id="forticlad-chart-heading">Core distribution by building</h3>
        <div data-role="core-chart" class="forticlad-planner__chart-graphic"><p>The chart will appear with the totals.</p></div>
        <ul data-role="chart-legend" class="forticlad-planner__chart-legend"></ul>
      </section>
      <section class="forticlad-planner__chart" aria-labelledby="forticlad-coverage-chart-heading">
        <h3 id="forticlad-coverage-chart-heading">Core coverage</h3>
        <div data-role="coverage-chart" class="forticlad-planner__chart-graphic"><p>Enter your current Core amount to see coverage.</p></div>
        <ul data-role="coverage-legend" class="forticlad-planner__chart-legend"></ul>
      </section>
    </div>
  </section>

</section>

<script id="forticlad-data" type="application/json">{{ site.data.lands_of_jail.forticlad | jsonify }}</script>
<script type="module" src="/assets/js/planners/forticlad.js"></script>
