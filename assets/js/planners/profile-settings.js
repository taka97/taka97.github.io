import { createProfileStore } from './storage.js';

const root = document.querySelector('[data-profile-settings]');

if (root) initialize(root);

async function initialize(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const text = language === 'vi'
    ? { choose: 'Chọn hồ sơ', created: 'Đã tạo hồ sơ.', deleted: 'Đã xóa hồ sơ.', exported: 'Đã tải xuống bản sao lưu.', imported: 'Đã khôi phục bản sao lưu.', replace: 'Thay thế tất cả hồ sơ bằng {count} hồ sơ đã nhập?' }
    : { choose: 'Choose a profile', created: 'Profile created.', deleted: 'Profile deleted.', exported: 'Backup downloaded.', imported: 'Backup restored.', replace: 'Replace all local profiles with {count} imported profile(s)?' };
  const find = (role) => container.querySelector(`[data-role="${role}"]`);
  const elements = {
    form: find('profile-form'), server: find('server'), name: find('name'), select: find('profile-select'), delete: find('delete-profile'),
    status: find('status'), export: find('export'), import: find('import'), importFile: find('import-file'),
  };
  const store = await createProfileStore();
  let profiles = await store.listProfiles();
  let selectedId = await store.getSelectedProfileId();

  render();

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const profile = await store.saveProfile({ server: elements.server.value, name: elements.name.value });
      profiles = [...profiles, profile];
      selectedId = profile.id;
      await store.setSelectedProfileId(selectedId);
      elements.form.reset();
      render(text.created);
    } catch (error) {
      render(error.message, true);
    }
  });

  elements.select.addEventListener('change', async () => {
    selectedId = elements.select.value || null;
    if (selectedId) await store.setSelectedProfileId(selectedId);
    render();
  });

  elements.delete.addEventListener('click', async () => {
    if (!selectedId) return;
    await store.deleteProfile(selectedId);
    profiles = profiles.filter((profile) => profile.id !== selectedId);
    selectedId = profiles[0]?.id ?? null;
    if (selectedId) await store.setSelectedProfileId(selectedId);
    render(text.deleted);
  });

  elements.export.addEventListener('click', () => {
    const backup = { schemaVersion: 1, exportedAt: new Date().toISOString(), profiles };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lands-of-jail-profiles-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    render(text.exported);
  });

  elements.import.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', async () => {
    try {
      const backup = JSON.parse(await elements.importFile.files[0].text());
      if (!backup || backup.schemaVersion !== 1 || !Array.isArray(backup.profiles)) throw new TypeError(language === 'vi' ? 'Tệp sao lưu không hợp lệ.' : 'The backup format is not supported.');
      if (!window.confirm(text.replace.replace('{count}', backup.profiles.length))) return;
      profiles = await store.replaceProfiles(backup.profiles);
      selectedId = await store.getSelectedProfileId();
      render(text.imported);
    } catch (error) {
      render(error.message, true);
    } finally {
      elements.importFile.value = '';
    }
  });

  function render(message = '', isError = false) {
    const placeholder = new Option(text.choose, '');
    placeholder.disabled = true;
    elements.select.replaceChildren(placeholder, ...profiles.map((profile) => new Option(`${profile.server}-${profile.name}`, profile.id)));
    elements.select.value = selectedId || '';
    elements.delete.disabled = !selectedId;
    elements.status.textContent = message;
    elements.status.classList.toggle('is-error', isError);
  }
}
