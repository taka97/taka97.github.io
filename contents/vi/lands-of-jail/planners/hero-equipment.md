---
title: Tính Hero Equipment
lang: vi
permalink: /vi/lands-of-jail/planners/hero-equipment/
ref: loj-hero-equipment-planner
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Tính Hero Equipment

Tính số Equipment EXP, Precision Gear, Magnet và Potential Coil cần để nâng cấp Equipment của tướng. Mỗi troop trong số 3 troop (Shieldbearer, Bomber, Shooter) có 4 vị trí trang bị cố định (Găng tay, Mũ giáp, Áo giáp, Giày), mỗi vị trí có nhánh Độ hiếm và nhánh Tinh thông riêng. Chọn cấp hiện tại và cấp mục tiêu cho cả 2 nhánh ở bất kỳ vị trí nào; từ Legendary trở lên, một cấp Độ hiếm cần nhánh Tinh thông của chính vị trí đó đạt cấp tương ứng — nếu mục tiêu Tinh thông của bạn chưa đủ cao, nó sẽ tự động được nâng lên và đánh dấu "(tự động thêm — điều kiện tiên quyết)" trong bảng chi tiết bên dưới. Xem tổng số cần cho cả 12 vị trí cùng lúc. Một số liệu — chi phí Equipment EXP của mốc "đã tối đa cấp độ" Common → Uncommon, dùng chung cho cả 12 vị trí — được đánh dấu bằng huy hiệu "≈" vì chưa được xác nhận đầy đủ từ nguồn; bấm hoặc focus vào đó để đọc ghi chú.

<section class="loj-planner" data-hero-equipment-planner data-lang="vi" aria-labelledby="he-planner-heading">
  <h2 id="he-planner-heading">Lập kế hoạch nâng cấp</h2>

  <section class="loj-planner__profile-context" aria-labelledby="he-profile-heading">
    <h3 id="he-profile-heading">Hồ sơ đang dùng</h3>
    <p data-role="active-profile">Đang tải hồ sơ…</p>
    <p><a href="/vi/lands-of-jail/tools/settings/">Quản lý hồ sơ trong Cài đặt</a>.</p>
  </section>

  <section class="loj-planner__inventory" aria-labelledby="he-inventory-heading">
    <h3 id="he-inventory-heading">Kho hiện tại</h3>
    <label for="he-stock-equipment-parts">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/hero-equipment/equipment-exp.png" alt="" width="24" height="24">Equipment EXP</span>
      <input id="he-stock-equipment-parts" data-role="stock-input" data-resource-key="EquipmentParts" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    <label for="he-stock-precision-equipment">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/hero-equipment/precision-gear.png" alt="" width="24" height="24">Precision Gear</span>
      <input id="he-stock-precision-equipment" data-role="stock-input" data-resource-key="PrecisionEquipment" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    <label for="he-stock-magnet">
      <span class="loj-planner__stock-label"><img class="loj-planner__stock-icon" src="/assets/images/lands-of-jail/hero-equipment/magnet.png" alt="" width="24" height="24">Magnet</span>
      <input id="he-stock-magnet" data-role="stock-input" data-resource-key="Magnet" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
    <label for="he-stock-potential-coil">Potential Coil
      <input id="he-stock-potential-coil" data-role="stock-input" data-resource-key="PotentialCoil" type="text" pattern="[0-9,]*" inputmode="numeric" autocomplete="off">
    </label>
  </section>

  <section class="loj-planner__summary" aria-labelledby="he-summary-heading">
    <h2 id="he-summary-heading" data-role="summary-heading">Bạn còn thiếu gì</h2>
    <div data-role="missing-grid" class="loj-planner__missing-grid"></div>

    <section class="loj-planner__results" data-role="results" aria-labelledby="he-totals-heading">
      <h3 id="he-totals-heading">Yêu cầu nâng cấp</h3>
      <div data-role="totals" class="loj-planner__table-wrap" tabindex="0" role="region" aria-labelledby="he-totals-heading">
        <p>Tổng sẽ hiện sau khi bạn chọn cấp mục tiêu cho một nhánh Độ hiếm hoặc Tinh thông.</p>
      </div>
    </section>
  </section>

  <section aria-labelledby="he-equipment-heading">
    <h2 id="he-equipment-heading">Equipment</h2>
    <div data-role="equipment-groups" class="loj-planner__instance-ranges"></div>
  </section>

  <p>
    <button type="button" data-role="reset">Khôi phục mặc định</button>
  </p>

  <p data-role="status" class="loj-planner__status" role="status" aria-live="polite"></p>

  <div data-role="sticky-bar" class="loj-planner__sticky-bar" tabindex="0" role="button" aria-label="Cuộn đến phần bạn còn thiếu gì" hidden></div>

</section>

<script id="hero-equipment-data" type="application/json">{{ site.data.lands_of_jail.hero_equipment | jsonify }}</script>
<script type="module" src="/assets/js/planners/hero-equipment.js"></script>
