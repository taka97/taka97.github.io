---
title: Công cụ tính FC / AFC trọng giáp
lang: vi
permalink: /vi/lands-of-jail/planners/forticlad/
ref: loj-forticlad-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Công cụ tính FC / AFC trọng giáp

Tính Lõi Trọng Giáp (FC), Lõi Trọng Giáp Cao Cấp (AFC) và Hyperalloy cho nghiên cứu T11, bao gồm cả điều kiện tiên quyết được tự động thêm. Cấp Văn phòng Giám ngục được mô phỏng từ Cấp 30 đến FC10. Không theo dõi Lương thực, Gỗ, Thép, Xăng và Thẻ Vàng — chỉ theo dõi FC, AFC và Hyperalloy.

<section class="loj-planner" data-forticlad-planner data-lang="vi" aria-labelledby="forticlad-planner-heading">
  <h2 id="forticlad-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="forticlad-profile-heading">
    <h3 id="forticlad-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="forticlad-inventory-heading">
    <h3 id="forticlad-inventory-heading">Kho hiện tại</h3>
    <label for="forticlad-fc-on-hand">FC hiện có
      <input id="forticlad-fc-on-hand" data-role="fc-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="forticlad-afc-on-hand">AFC hiện có
      <input id="forticlad-afc-on-hand" data-role="afc-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="forticlad-hyperalloy-on-hand">Hyperalloy hiện có
      <input id="forticlad-hyperalloy-on-hand" data-role="hyperalloy-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="forticlad-summary-heading">
    <h2 id="forticlad-summary-heading">Bạn còn thiếu gì</h2>
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
      <h3 id="forticlad-totals-heading">Yêu cầu nâng cấp</h3>
      <div data-role="building-totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn khoảng Base của các công trình.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="forticlad-buildings-heading">
    <h2 id="forticlad-buildings-heading">Công trình</h2>

    <form class="loj-planner__form" data-role="range-form">
      <fieldset>
        <legend>Khoảng Base của công trình</legend>
        <div data-role="building-ranges" class="loj-planner__instance-ranges"></div>
      </fieldset>
    </form>

    <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>
  </section>

  <section data-research-planner data-lang="vi" aria-labelledby="forticlad-research-heading">
    <h2 id="forticlad-research-heading">Nghiên cứu T11</h2>

    <div data-role="research-tracks" class="loj-planner__instance-ranges"></div>

    <p data-role="research-status" class="loj-planner__status" role="status" aria-live="polite"></p>

    <section class="loj-planner__results" data-role="research-results" aria-labelledby="forticlad-research-totals-heading">
      <h3 id="forticlad-research-totals-heading">Yêu cầu nghiên cứu</h3>
      <div data-role="research-totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-research-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn Lv. của các nhánh nghiên cứu.</p>
      </div>
    </section>
  </section>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Cuộn đến phần bạn còn thiếu gì" hidden></div>

</section>

<script id="forticlad-data" type="application/json">{{ site.data.lands_of_jail.forticlad | jsonify }}</script>
<script id="forticlad-research-data" type="application/json">{{ site.data.lands_of_jail.forticlad_research | jsonify }}</script>
<script type="module" src="/assets/js/planners/forticlad.js"></script>
<script type="module" src="/assets/js/planners/research.js"></script>
