---
title: Tính Kho báu & Sách cổ
lang: vi
permalink: /vi/lands-of-jail/planners/collections-tomes/
ref: loj-tomes-collections-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Tính Kho báu & Sách cổ

Tính số Bảo điển (Seal) và Xu kỷ niệm (Trove Coin) cần để nâng cấp Kho báu và Sách cổ. 6 Kho báu và 18 Sách cổ (mỗi loại Lính khiên, Lính ném bom, Lính súng có 2 Kho báu và 6 Sách cổ — Sách cổ chia thành 3 Tấn công và 3 Phòng thủ) luôn hiển thị sẵn. Chọn cấp hiện tại và cấp mục tiêu cho từng cái, rồi xem tổng số cần cho tất cả cùng lúc. Tên bậc hiện đang hiển thị bằng tiếng Anh.

<section class="loj-planner" data-tomes-planner data-lang="vi" aria-labelledby="collections-tomes-planner-heading">
  <h2 id="collections-tomes-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="collections-tomes-profile-heading">
    <h3 id="collections-tomes-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="collections-tomes-inventory-heading">
    <h3 id="collections-tomes-inventory-heading">Kho hiện tại</h3>
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
    <h2 id="collections-tomes-summary-heading" data-role="summary-heading">Bạn còn thiếu gì</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="collections-tomes-totals-heading">
      <h3 id="collections-tomes-totals-heading">Yêu cầu nâng cấp</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="collections-tomes-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn cấp mục tiêu cho một Tome hoặc Collection.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="collections-heading">
    <h2 id="collections-heading">Kho báu</h2>
    <div data-role="collections-list" class="loj-planner__instance-ranges"></div>
  </section>

  <section aria-labelledby="tomes-heading">
    <h2 id="tomes-heading">Sách cổ</h2>
    <div data-role="tomes-list" class="loj-planner__instance-ranges"></div>
  </section>

  <p>
    <button type="button" data-role="reset">Khôi phục mặc định</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Cuộn đến phần bạn còn thiếu gì" hidden></div>

</section>

<script id="collections-tomes-data" type="application/json">{{ site.data.lands_of_jail.tomes_collections | jsonify }}</script>
<script type="module" src="/assets/js/planners/tomes.js"></script>
