---
title: Settings
lang: en
permalink: /en/lands-of-jail/tools/settings/
ref: loj-tool-settings
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Settings

Manage the shared profile used by all Lands of Jail tools. Tool-specific progress remains attached to the selected profile in this browser.

<section class="tool-settings" data-profile-settings data-lang="en" aria-labelledby="profile-settings-heading">
  <h2 id="profile-settings-heading">Profiles</h2>
  <form data-role="profile-form">
    <fieldset>
      <legend>Create a profile</legend>
      <div class="tool-settings__fields">
        <label for="settings-server">Server <input id="settings-server" data-role="server" required></label>
        <label for="settings-name">Name <input id="settings-name" data-role="name" required></label>
        <button type="submit">Save profile</button>
      </div>
    </fieldset>
  </form>
  <div class="tool-settings__fields tool-settings__profile-actions">
    <label for="settings-profile">Active profile <select id="settings-profile" data-role="profile-select"></select></label>
    <button type="button" data-role="delete-profile">Delete profile</button>
  </div>
  <p data-role="status" role="status" aria-live="polite"></p>

  <section aria-labelledby="backup-heading">
    <h2 id="backup-heading">Backup profiles</h2>
    <p>Export all shared profiles and their tool progress as JSON, or restore them from a backup.</p>
    <div class="tool-settings__actions">
      <button type="button" data-role="export">Export profiles</button>
      <button type="button" data-role="import">Import profiles</button>
      <input data-role="import-file" type="file" accept="application/json,.json" hidden>
    </div>
  </section>
</section>

<script type="module" src="/assets/js/planners/profile-settings.js"></script>
