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

Calculate Forticlad Core (FC), Advanced Forticlad Core (AFC), and Hyperalloy for T11 Research, including automatically resolved prerequisites. Warden's Office progression is modeled from Level 30 all the way to FC10. Food, Wood, Steel, Gasoline and Gold Card aren't tracked — only FC, AFC and Hyperalloy.

<section class="loj-planner" data-forticlad-planner data-lang="en" aria-labelledby="forticlad-planner-heading">
  <h2 id="forticlad-planner-heading">Plan your upgrade</h2>

  <section class="loj-planner__profile-context" aria-labelledby="forticlad-profile-heading">
    <h3 id="forticlad-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="forticlad-inventory-heading">
    <h3 id="forticlad-inventory-heading">Current Stock</h3>
    <label for="forticlad-fc-on-hand">FC current amount
      <input id="forticlad-fc-on-hand" data-role="fc-on-hand" data-resource-key="fc" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    <label for="forticlad-afc-on-hand">AFC current amount
      <input id="forticlad-afc-on-hand" data-role="afc-on-hand" data-resource-key="afc" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    <label for="forticlad-hyperalloy-on-hand">Hyperalloy current amount
      <input id="forticlad-hyperalloy-on-hand" data-role="hyperalloy-on-hand" data-resource-key="hyperalloy" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="forticlad-summary-heading">
    <h2 id="forticlad-summary-heading">What you're missing</h2>
    <div class="loj-planner__missing-grid">
      <div class="loj-planner__missing-card">
        <div class="loj-planner__missing-card-header">
          <svg class="loj-planner__missing-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2 L20.6 7 L20.6 17 L12 22 L3.4 17 L3.4 7 Z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>FC</span>
        </div>
        <output class="loj-planner__missing-card-value" data-role="summary-fc-needed">—</output>
        <output class="loj-planner__missing-card-badge" data-role="summary-fc-missing">—</output>
      </div>
      <div class="loj-planner__missing-card">
        <div class="loj-planner__missing-card-header">
          <svg class="loj-planner__missing-card-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 L4 14 h6 l-1 8 9-12h-6z"/></svg>
          <span>AFC</span>
        </div>
        <output class="loj-planner__missing-card-value" data-role="summary-afc-needed">—</output>
        <output class="loj-planner__missing-card-badge" data-role="summary-afc-missing">—</output>
      </div>
      <div class="loj-planner__missing-card">
        <div class="loj-planner__missing-card-header">
          <svg class="loj-planner__missing-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
          <span>Hyperalloy</span>
        </div>
        <output class="loj-planner__missing-card-value" data-role="summary-hyperalloy-needed">—</output>
        <output class="loj-planner__missing-card-badge" data-role="summary-hyperalloy-missing">—</output>
      </div>
    </div>

    <section class="loj-planner__results" data-role="building-results" aria-labelledby="forticlad-totals-heading">
      <h3 id="forticlad-totals-heading">Upgrade requirements</h3>
      <div data-role="building-totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-totals-heading">
        <p>Totals will appear after you select building ranges.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="forticlad-buildings-heading">
    <h2 id="forticlad-buildings-heading">Buildings</h2>

    <form class="loj-planner__form" data-role="range-form">
      <fieldset>
        <legend>Building Base ranges</legend>
        <div data-role="building-ranges" class="loj-planner__instance-ranges"></div>
      </fieldset>
    </form>

    <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>
  </section>

  <section data-research-planner data-lang="en" aria-labelledby="forticlad-research-heading">
    <h2 id="forticlad-research-heading">Research T11</h2>

    <div data-role="research-tracks" class="loj-planner__instance-ranges"></div>

    <p data-role="research-status" class="loj-planner__status" role="status" aria-live="polite"></p>

    <section class="loj-planner__results" data-role="research-results" aria-labelledby="forticlad-research-totals-heading">
      <h3 id="forticlad-research-totals-heading">Research requirements</h3>
      <div data-role="research-totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-research-totals-heading">
        <p>Totals will appear after you select track levels.</p>
      </div>
    </section>
  </section>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>

</section>

<script id="forticlad-data" type="application/json">{{ site.data.lands_of_jail.forticlad | jsonify }}</script>
<script id="forticlad-research-data" type="application/json">{{ site.data.lands_of_jail.forticlad_research | jsonify }}</script>
<script type="module" src="/assets/js/planners/forticlad.js"></script>
<script type="module" src="/assets/js/planners/research.js"></script>
