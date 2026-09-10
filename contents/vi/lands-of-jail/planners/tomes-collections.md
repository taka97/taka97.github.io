---
title: Công cụ tính Tomes & Collections
lang: vi
permalink: /vi/lands-of-jail/planners/tomes-collections/
ref: loj-tomes-collections-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Công cụ tính Tomes & Collections

Tính số Seal và Trove Coin cần để nâng cấp Tomes và Collections. Thêm bao nhiêu Tome (tối đa 18) và Collection (tối đa 6) tùy ý, chọn cấp hiện tại và cấp mục tiêu cho từng cái, rồi xem tổng số cần cho tất cả cùng lúc. Tên tài nguyên và tên bậc hiện đang hiển thị bằng tiếng Anh.

<section class="loj-planner" data-tomes-planner data-lang="vi" aria-labelledby="tomes-planner-heading">
  <h2 id="tomes-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="tomes-profile-heading">
    <h3 id="tomes-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="tomes-inventory-heading">
    <h3 id="tomes-inventory-heading">Kho hiện tại</h3>
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
    <h2 id="tomes-summary-heading" data-role="summary-heading">Bạn còn thiếu gì</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="tomes-totals-heading" hidden>
      <h3 id="tomes-totals-heading">Yêu cầu nâng cấp</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="tomes-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn cấp mục tiêu cho một Tome hoặc Collection.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="tomes-tomes-heading">
    <h2 id="tomes-tomes-heading">Tomes</h2>
    <div data-role="tomes-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-tome">+ Thêm Tome</button>
  </section>

  <section aria-labelledby="tomes-collections-heading">
    <h2 id="tomes-collections-heading">Collections</h2>
    <div data-role="collections-list" class="loj-planner__instance-ranges"></div>
    <button type="button" data-role="add-collection">+ Thêm Collection</button>
  </section>

  <p>
    <button type="button" data-role="reset">Khôi phục mặc định</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Cuộn đến phần bạn còn thiếu gì" hidden></div>

</section>

<script id="tomes-data" type="application/json">{{ site.data.lands_of_jail.tomes_collections | jsonify }}</script>
<script type="module" src="/assets/js/planners/tomes.js"></script>
