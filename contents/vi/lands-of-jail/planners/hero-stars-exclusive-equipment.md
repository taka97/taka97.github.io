---
title: Công cụ tính Hero Stars & Exclusive Equipment
lang: vi
permalink: /vi/lands-of-jail/planners/hero-stars-exclusive-equipment/
ref: loj-hero-stars-exclusive-equipment-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Công cụ tính Hero Stars & Exclusive Equipment

Tính số Redeem (Chuộc) và Exclusive Weapon Parts cần để nâng cấp Star rank và Exclusive Equipment của tướng. Chi phí giống nhau cho mọi tướng, nên hãy thêm bao nhiêu Hero Stars và Exclusive Equipment tùy ý (tối đa 6 mỗi loại — hai nút "+ Add Hero" hoạt động độc lập), chọn cấp hiện tại và cấp mục tiêu cho từng cái. Danh sách mục tiêu của Hero Stars chỉ hiện Đã chiêu mộ và mỗi mốc sao trọn vẹn (1-5 sao) — các giai đoạn trung gian không phải mục tiêu hợp lệ, chỉ là điểm dừng trên đường đi. Xem tổng số cần cho tất cả cùng lúc.

<section class="loj-planner" data-hero-stars-exclusive-equipment-planner data-lang="vi" aria-labelledby="hsee-planner-heading">
  <h2 id="hsee-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="hsee-profile-heading">
    <h3 id="hsee-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="hsee-inventory-heading">
    <h3 id="hsee-inventory-heading">Kho hiện tại</h3>
    <label for="hsee-stock-hero-fragment">Redeem
      <input id="hsee-stock-hero-fragment" data-role="stock-input" data-resource-key="HeroFragment" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
    <label for="hsee-stock-exclusive-equip-part">Exclusive Weapon Parts
      <input id="hsee-stock-exclusive-equip-part" data-role="stock-input" data-resource-key="ExclusiveEquipPart" type="number" min="0" step="1" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="hsee-summary-heading">
    <h2 id="hsee-summary-heading" data-role="summary-heading">Bạn còn thiếu gì</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="hsee-totals-heading" hidden>
      <h3 id="hsee-totals-heading">Yêu cầu nâng cấp</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="hsee-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn cấp mục tiêu cho một Hero Stars hoặc Exclusive Equipment.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="hsee-hero-stars-heading">
    <h2 id="hsee-hero-stars-heading">Hero Stars</h2>
    <div data-role="hero-stars-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-hero-stars">+ Thêm Hero</button>
  </section>

  <section aria-labelledby="hsee-exclusive-equipment-heading">
    <h2 id="hsee-exclusive-equipment-heading">Exclusive Equipment</h2>
    <div data-role="exclusive-equipment-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-exclusive-equipment">+ Thêm Hero</button>
  </section>

  <p>
    <button type="button" data-role="reset">Khôi phục mặc định</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Cuộn đến phần bạn còn thiếu gì" hidden></div>

</section>

<script id="hero-stars-exclusive-equipment-data" type="application/json">{{ site.data.lands_of_jail.hero_stars_exclusive_equipment | jsonify }}</script>
<script type="module" src="/assets/js/planners/hero-stars-exclusive-equipment.js"></script>
