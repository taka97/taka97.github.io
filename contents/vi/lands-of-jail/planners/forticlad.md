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

Tính FC và AFC cần thiết, bao gồm cả điều kiện tiên quyết được tự động thêm. Đặt Base hiện tại và Base mục tiêu độc lập cho cả bảy công trình.

<section class="forticlad-planner" data-forticlad-planner data-lang="vi" aria-labelledby="forticlad-planner-heading">
  <h2 id="forticlad-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="forticlad-planner__profile-context" aria-labelledby="forticlad-profile-heading">
    <h3 id="forticlad-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="forticlad-planner__inventory" aria-labelledby="forticlad-inventory-heading">
    <h3 id="forticlad-inventory-heading">Kho hiện tại</h3>
    <label for="forticlad-fc-on-hand">FC hiện có
      <input id="forticlad-fc-on-hand" data-role="fc-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="forticlad-afc-on-hand">AFC hiện có
      <input id="forticlad-afc-on-hand" data-role="afc-on-hand" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="forticlad-planner__summary" aria-labelledby="forticlad-summary-heading">
    <h2 id="forticlad-summary-heading">Bạn còn thiếu gì</h2>
    <dl>
      <div><dt>FC / AFC hiện có</dt><dd><output class="forticlad-planner__summary-value" data-role="summary-stock">—</output></dd></div>
      <div><dt>FC / AFC cần thiết</dt><dd><output class="forticlad-planner__summary-value" data-role="summary-required">—</output></dd></div>
      <div><dt>Kết quả</dt><dd><output class="forticlad-planner__summary-value" data-role="summary-balance">—</output></dd></div>
    </dl>
  </section>

  <form class="forticlad-planner__form" data-role="range-form">
    <fieldset>
      <legend>Khoảng Base của công trình</legend>
      <div data-role="building-ranges" class="forticlad-planner__building-ranges"></div>
    </fieldset>
  </form>

  <p data-role="status" class="forticlad-planner__status" role="status" aria-live="polite"></p>

  <section class="forticlad-planner__results" aria-labelledby="forticlad-breakdown-heading">
    <h2 id="forticlad-breakdown-heading">Chi tiết nâng cấp</h2>
    <div data-role="step-breakdown" class="forticlad-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-breakdown-heading">
      <p>Chọn khoảng Base hợp lệ cho các công trình để xem các bước nâng cấp.</p>
    </div>
  </section>

  <section class="forticlad-planner__results" aria-labelledby="forticlad-totals-heading">
    <h2 id="forticlad-totals-heading">Tổng FC / AFC theo công trình</h2>
    <div data-role="building-totals" class="forticlad-planner__table-wrap" tabindex="0" role="region" aria-labelledby="forticlad-totals-heading">
      <p>Tổng sẽ hiện sau khi bạn chọn khoảng Base của các công trình.</p>
    </div>
    <p class="forticlad-planner__grand-total"><strong>Tổng cộng:</strong> <output data-role="grand-total">—</output></p>
    <div class="forticlad-planner__charts">
      <section class="forticlad-planner__chart" aria-labelledby="forticlad-chart-heading">
        <h3 id="forticlad-chart-heading">Tỷ trọng Lõi trọng giáp theo công trình</h3>
        <div data-role="core-chart" class="forticlad-planner__chart-graphic"><p>Biểu đồ sẽ xuất hiện cùng phần tổng.</p></div>
        <ul data-role="chart-legend" class="forticlad-planner__chart-legend"></ul>
      </section>
      <section class="forticlad-planner__chart" aria-labelledby="forticlad-coverage-chart-heading">
        <h3 id="forticlad-coverage-chart-heading">Mức đáp ứng Lõi trọng giáp</h3>
        <div data-role="coverage-chart" class="forticlad-planner__chart-graphic"><p>Nhập số Lõi trọng giáp hiện có để xem mức đáp ứng.</p></div>
        <ul data-role="coverage-legend" class="forticlad-planner__chart-legend"></ul>
      </section>
    </div>
  </section>

</section>

<script id="forticlad-data" type="application/json">{{ site.data.lands_of_jail.forticlad | jsonify }}</script>
<script type="module" src="/assets/js/planners/forticlad.js"></script>
