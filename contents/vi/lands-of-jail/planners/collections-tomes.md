---
title: Công cụ tính Collections & Tomes
lang: vi
permalink: /vi/lands-of-jail/planners/collections-tomes/
ref: loj-tomes-collections-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Công cụ tính Collections & Tomes

Tính số Seal và Trove Coin cần để nâng cấp Collections và Tomes. 6 Collection và 18 Tome (mỗi loại Khiên binh, Bomber, Xạ thủ có 2 Collection và 6 Tome — Tome chia thành 3 Tấn công và 3 Phòng thủ) luôn hiển thị sẵn. Chọn cấp hiện tại và cấp mục tiêu cho từng cái, rồi xem tổng số cần cho tất cả cùng lúc. Tên tài nguyên và tên bậc hiện đang hiển thị bằng tiếng Anh.

<section class="loj-planner" data-tomes-planner data-lang="vi" aria-labelledby="collections-tomes-planner-heading">
  <h2 id="collections-tomes-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="collections-tomes-profile-heading">
    <h3 id="collections-tomes-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="collections-tomes-inventory-heading">
    <h3 id="collections-tomes-inventory-heading">Kho hiện tại</h3>
    <label for="collections-tomes-stock-common-coin">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/collections-tomes/common-trove-coin.png" alt="" width="24" height="24">Common Trove Coin</span>
      <input id="collections-tomes-stock-common-coin" data-role="stock-input" data-resource-key="CommonCoin" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
    <label for="collections-tomes-stock-rare-coin">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/collections-tomes/rare-trove-coin.png" alt="" width="24" height="24">Rare Trove Coin</span>
      <input id="collections-tomes-stock-rare-coin" data-role="stock-input" data-resource-key="RareCoin" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
    <label for="collections-tomes-stock-precious-coin">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/collections-tomes/precious-trove-coin.png" alt="" width="24" height="24">Precious Trove Coin</span>
      <input id="collections-tomes-stock-precious-coin" data-role="stock-input" data-resource-key="PreciousCoin" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
    <label for="collections-tomes-stock-legendary-coin">
      <span class="loj-planner__stock-label">Legendary Trove Coin</span>
      <input id="collections-tomes-stock-legendary-coin" data-role="stock-input" data-resource-key="LegendaryCoin" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
    <label for="collections-tomes-stock-seal-of-wisdom">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/collections-tomes/seal-of-wisdom.png" alt="" width="24" height="24">Seal of Wisdom</span>
      <input id="collections-tomes-stock-seal-of-wisdom" data-role="stock-input" data-resource-key="SealOfWisdom" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
    <label for="collections-tomes-stock-seal-of-knowledge">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/collections-tomes/seal-of-knowledge.png" alt="" width="24" height="24">Seal of Knowledge</span>
      <input id="collections-tomes-stock-seal-of-knowledge" data-role="stock-input" data-resource-key="SealOfKnowledge" type="text" inputmode="numeric" pattern="[0-9,]*" autocomplete="off">
    </label>
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
    <h2 id="collections-heading">Collections</h2>
    <div data-role="collections-list" class="loj-planner__instance-ranges"></div>
  </section>

  <section aria-labelledby="tomes-heading">
    <h2 id="tomes-heading">Tomes</h2>
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
