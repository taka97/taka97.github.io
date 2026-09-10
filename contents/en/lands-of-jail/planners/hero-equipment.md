---
title: Hero Equipment Planner
lang: en
permalink: /en/lands-of-jail/planners/hero-equipment/
ref: loj-hero-equipment-planner
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Hero Equipment Planner

Calculate the Equipment EXP, Precision Equipment, Magnet, and Potential Coil needed to level up your heroes' Equipment. Each of the 3 troops (Shieldbearer, Bomber, Shooter) has 4 fixed equipment slots (Gloves, Helm, Outerwear, Boots), each with its own Rarity track and Mastery track. Set a current and target level for both tracks on any slot; past Legendary, a Rarity level needs that same slot's Mastery track at a matching level — if your Mastery target isn't high enough, it's automatically bumped and tagged "(auto-added — prerequisite)" in the breakdown below. See the combined total across all 12 slots at once. One cost figure — the Common → Uncommon "levels maxed" checkpoint's Equipment EXP cost, shared by all 12 slots — is marked with a "≈" badge because it wasn't fully confirmed from source; click or focus it to read the note.

<section class="loj-planner" data-hero-equipment-planner data-lang="en" aria-labelledby="he-planner-heading">
  <h2 id="he-planner-heading">Plan your upgrade</h2>

  <section class="loj-planner__profile-context" aria-labelledby="he-profile-heading">
    <h3 id="he-profile-heading">Active profile</h3>
    <p data-role="active-profile">Loading profile…</p>
    <p><a href="/en/lands-of-jail/tools/settings/">Manage profiles in Settings</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="he-inventory-heading">
    <h3 id="he-inventory-heading">Current Stock</h3>
    <label for="he-stock-equipment-parts">Equipment EXP
      <input id="he-stock-equipment-parts" data-role="stock-input" data-resource-key="EquipmentParts" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="he-stock-precision-equipment">Precision Equipment
      <input id="he-stock-precision-equipment" data-role="stock-input" data-resource-key="PrecisionEquipment" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="he-stock-magnet">Magnet
      <input id="he-stock-magnet" data-role="stock-input" data-resource-key="Magnet" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="he-stock-potential-coil">Potential Coil
      <input id="he-stock-potential-coil" data-role="stock-input" data-resource-key="PotentialCoil" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="he-summary-heading">
    <h2 id="he-summary-heading" data-role="summary-heading">What you're missing</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="he-totals-heading" hidden>
      <h3 id="he-totals-heading">Upgrade requirements</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="he-totals-heading">
        <p>Totals will appear after you select a target level for a Rarity or Mastery track.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="he-equipment-heading">
    <h2 id="he-equipment-heading">Equipment</h2>
    <div data-role="equipment-groups" class="loj-planner__instance-ranges"></div>
  </section>

  <p>
    <button type="button" data-role="reset">Reset to default</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Scroll to what you're missing" hidden></div>

</section>

<script id="hero-equipment-data" type="application/json">{{ site.data.lands_of_jail.hero_equipment | jsonify }}</script>
<script type="module" src="/assets/js/planners/hero-equipment.js"></script>
