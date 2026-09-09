---
title: Cài đặt
lang: vi
permalink: /vi/lands-of-jail/tools/settings/
ref: loj-tool-settings
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Cài đặt

Quản lý hồ sơ dùng chung cho mọi công cụ Lands of Jail. Tiến trình riêng của từng công cụ được gắn với hồ sơ đang chọn trong trình duyệt này.

<section class="tool-settings" data-profile-settings data-lang="vi" aria-labelledby="profile-settings-heading">
  <h2 id="profile-settings-heading">Hồ sơ</h2>
  <form data-role="profile-form">
    <fieldset>
      <legend>Tạo hồ sơ</legend>
      <div class="tool-settings__fields">
        <label for="settings-server">Máy chủ <input id="settings-server" data-role="server" required></label>
        <label for="settings-name">Tên <input id="settings-name" data-role="name" required></label>
        <button type="submit">Lưu hồ sơ</button>
      </div>
    </fieldset>
  </form>
  <div class="tool-settings__fields tool-settings__profile-actions">
    <label for="settings-profile">Hồ sơ đang dùng <select id="settings-profile" data-role="profile-select"></select></label>
    <button type="button" data-role="delete-profile">Xóa hồ sơ</button>
  </div>
  <p data-role="status" role="status" aria-live="polite"></p>

  <section aria-labelledby="backup-heading">
    <h2 id="backup-heading">Sao lưu hồ sơ</h2>
    <p>Xuất mọi hồ sơ dùng chung cùng tiến trình công cụ thành JSON, hoặc khôi phục từ bản sao lưu.</p>
    <div class="tool-settings__actions">
      <button type="button" data-role="export">Xuất hồ sơ</button>
      <button type="button" data-role="import">Nhập hồ sơ</button>
      <input data-role="import-file" type="file" accept="application/json,.json" hidden>
    </div>
  </section>
</section>

<script type="module" src="/assets/js/planners/profile-settings.js"></script>
