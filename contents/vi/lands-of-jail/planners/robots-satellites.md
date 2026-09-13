---
title: Tính Robots & Satellites
lang: vi
permalink: /vi/lands-of-jail/planners/robots-satellites/
ref: loj-robots-satellites-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Tính Robots & Satellites

Tính số Data Disk, Planet Coin và Power Module cần để nâng cấp Robot và cả 9 Satellite có tên riêng. Thêm bao nhiêu Robot tùy ý (tối đa 12), chọn cấp hiện tại và cấp mục tiêu cho từng cái, rồi chọn cấp hiện tại/mục tiêu cho các Satellite bậc R, SR, SSR bạn đang nâng cấp. Xem tổng số cần cho tất cả cùng lúc. Một số liệu — chi phí Data Disk ở cấp 50 của Satellite bậc R — được đánh dấu bằng huy hiệu "≈" vì chưa được xác nhận đầy đủ từ nguồn; bấm hoặc focus vào đó để đọc ghi chú. Tên tài nguyên và tên Satellite hiện đang hiển thị bằng tiếng Anh.

<section class="loj-planner" data-robots-satellites-planner data-lang="vi" aria-labelledby="rs-planner-heading">
  <h2 id="rs-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="rs-profile-heading">
    <h3 id="rs-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="rs-inventory-heading">
    <h3 id="rs-inventory-heading">Kho hiện tại</h3>
    {%- for resource in site.data.lands_of_jail.robots_satellites.resources -%}
    <label for="rs-stock-{{ resource.key }}">
      <span class="loj-planner__stock-label">{% if resource.icon %}<img class="loj-planner__stock-icon" src="{{ resource.icon }}" alt="" width="24" height="24">{% endif %}{{ resource.label[page.lang] | default: resource.label.en | default: resource.label }}</span>
      <input id="rs-stock-{{ resource.key }}" data-role="stock-input" data-resource-key="{{ resource.key }}" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    {%- endfor -%}
  </section>

  <section class="loj-planner__summary" aria-labelledby="rs-summary-heading">
    <h2 id="rs-summary-heading" data-role="summary-heading">Bạn còn thiếu gì</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="rs-totals-heading">
      <h3 id="rs-totals-heading">Yêu cầu nâng cấp</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="rs-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn cấp mục tiêu cho một Robot hoặc Satellite.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="rs-robots-heading">
    <h2 id="rs-robots-heading">Robots</h2>
    <div data-role="robots-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-robot">+ Thêm Robot</button>
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
    <button type="button" data-role="reset">Khôi phục mặc định</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Cuộn đến phần bạn còn thiếu gì" hidden></div>

</section>

<script id="robots-satellites-data" type="application/json">{{ site.data.lands_of_jail.robots_satellites | jsonify }}</script>
<script type="module" src="/assets/js/planners/robots-satellites.js"></script>
