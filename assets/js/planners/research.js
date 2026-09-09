import { createPlanner } from './planner-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setSummaryValue, setStatus as setStatusElement, renderMissingCard, targetCell, grandTotalFooter } from './table-helpers.js';
import { createResearchPlanner, calculateResearchRequirements, formatNumber } from './research-core.js';

const TROOP_TRANSLATIONS = {
  shieldbearer: 'Khiên binh',
  bomber: 'Bomber',
  shooter: 'Xạ thủ',
};

const TRACK_TRANSLATIONS = {
  expedition: 'Sức chứa Quân viễn chinh',
  lethality: 'Tăng Sát thương',
  atk: 'Tăng Công',
  def: 'Tăng Thủ',
  hp: 'Tăng Máu',
  rally: 'Tăng Sức chứa Quân tập hợp',
  bastion: 'Mở khóa Quân Lv.11',
  'heal-lethality': 'Giảm tài nguyên hồi quân và tăng sát thương',
  'train-hp': 'Giảm tài nguyên huấn luyện và tăng Máu',
};

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target level that is not lower than the current level.',
    inventory: 'Enter a whole number of Hyperalloy that is zero or greater.',
    noTarget: 'No target selected',
    noTargets: 'No target selected yet. Choose a target level for a research track to see the Hyperalloy you need.',
    notSet: 'Not set',
    covered: 'Covered',
    needed: '{amount} needed',
    missing: 'Missing {amount}',
    surplus: 'Surplus {amount}',
    autoLabel: '(auto-added — prerequisite)',
    currentLabel: 'Current level',
    targetLabel: 'Target level',
    noTargetLabel: 'No target',
    fcLabLevel: 'FC Lab must reach level {level} first.',
    prerequisiteUnreachable: 'A prerequisite track cannot reach level {level}.',
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn Lv. mục tiêu không thấp hơn Lv. hiện tại.',
    inventory: 'Hãy nhập số Hyperalloy nguyên lớn hơn hoặc bằng 0.',
    noTarget: 'Chưa chọn Lv. mục tiêu',
    noTargets: 'Chưa chọn Lv. mục tiêu. Hãy chọn Lv. mục tiêu cho một nhánh nghiên cứu để xem Hyperalloy cần thiết.',
    notSet: 'Chưa nhập',
    covered: 'Đã đủ',
    needed: 'Cần {amount}',
    missing: 'Còn thiếu {amount}',
    surplus: 'Dư {amount}',
    autoLabel: '(tự động thêm — điều kiện tiên quyết)',
    currentLabel: 'Lv. hiện tại',
    targetLabel: 'Lv. mục tiêu',
    noTargetLabel: 'Chưa chọn',
    fcLabLevel: 'Phòng Lab FC cần đạt Lv.{level} trước.',
    prerequisiteUnreachable: 'Một nhánh điều kiện tiên quyết không thể đạt Lv.{level}.',
  },
};

function localizedErrorMessage(error, message, fallback = message.range) {
  if (error?.code === 'fc-lab-level') return message.fcLabLevel.replace('{level}', String(error.params.level));
  if (error?.code === 'prerequisite-unreachable') return message.prerequisiteUnreachable.replace('{level}', String(error.params.level));
  return error?.message || fallback;
}

const root = document.querySelector('[data-research-planner]');

if (root) initializeResearchPlanner(root);

async function initializeResearchPlanner(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const message = MESSAGES[language];
  const elements = getElements(container);
  let buildingsPlanner;
  let planner;
  let store = null;
  let profile = null;
  let storageUnavailable = false;

  try {
    buildingsPlanner = createPlanner(JSON.parse(document.querySelector('#forticlad-data').textContent));
    const researchData = JSON.parse(document.querySelector('#forticlad-research-data').textContent);
    planner = createResearchPlanner(researchData, researchData.troops);
  } catch (error) {
    setStatus(elements, error.message, true);
    return;
  }

  try {
    store = await createProfileStore();
    const selectedId = await store.getSelectedProfileId();
    profile = (await store.listProfiles()).find((item) => item.id === selectedId) ?? null;
  } catch (error) {
    storageUnavailable = true;
    setStatus(elements, message.storage, true);
  }

  if (profile) {
    const toolData = getToolData(profile, 'forticlad');
    if (elements.hyperalloyOnHand) elements.hyperalloyOnHand.value = Number.isInteger(toolData.hyperalloyOnHand) && toolData.hyperalloyOnHand >= 0 ? toolData.hyperalloyOnHand : '';
  } else {
    if (elements.hyperalloyOnHand) elements.hyperalloyOnHand.disabled = true;
  }

  renderTrackRanges(elements.researchTracks, planner, trackRanges(planner, getToolData(profile, 'forticlad')), language, !profile);

  renderResult();

  elements.researchTracks.addEventListener('change', async (event) => {
    if (event.target.matches('[data-role="current-level"]')) {
      keepTargetAtOrAboveCurrent(event.target.closest('[data-track-key]'));
    }
    if (updateRangeWarnings(elements.researchTracks, planner, language)) {
      renderResult();
      return;
    }
    if (profile && store) {
      try {
        profile = await saveResearchData({ researchLevels: selectedTrackRanges(elements.researchTracks) });
      } catch (error) {
        setStatus(elements, localizedErrorMessage(error, message, message.storage), true);
      }
    }
    renderResult();
  });

  if (elements.hyperalloyOnHand) {
    elements.hyperalloyOnHand.addEventListener('change', async () => {
      if (!profile || !store) return;
      const value = inventoryValue(elements.hyperalloyOnHand);
      if (value === undefined) {
        setStatus(elements, message.inventory, true);
        return;
      }
      try {
        profile = await saveResearchData({ hyperalloyOnHand: value });
        renderResult();
      } catch (error) {
        setStatus(elements, localizedErrorMessage(error, message, message.storage), true);
      }
    });
  }

  document.addEventListener('forticlad:building-data-changed', async () => {
    if (!profile || !store) return;
    profile = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    renderResult();
  });

  async function saveResearchData(changes) {
    const latest = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    return store.saveProfile(updateToolData(latest, 'forticlad', {
      ...getToolData(latest, 'forticlad'),
      ...changes,
    }));
  }

  function currentFcLabLevel() {
    const toolData = getToolData(profile, 'forticlad');
    const base = toolData.buildingBases?.['fc-lab']?.currentBase || buildingsPlanner.steps[0].base;
    return fcLabLevelFromBase(buildingsPlanner, base);
  }

  function renderResult() {
    if (!profile) return;
    if (updateRangeWarnings(elements.researchTracks, planner, language)) {
      clearResults(elements);
      elements.trackResults.hidden = true;
      setStatus(elements, message.range, true);
      return;
    }
    try {
      const result = calculateResearchRequirements(planner, selectedTrackRanges(elements.researchTracks), currentFcLabLevel());
      const toolData = getToolData(profile, 'forticlad');
      const inventory = toolData.hyperalloyOnHand;
      renderSummary(elements, result, inventory, message);
      if (result.selectedTrackKeys.length === 0) {
        renderEmptyResults(elements, message.noTargets);
        elements.trackResults.hidden = true;
        setStatus(elements, '');
        return;
      }
      renderTotals(elements.trackTotals, result, planner, language, message);
      elements.trackResults.hidden = false;
      if (profile) setStatus(elements, '');
    } catch (error) {
      clearResults(elements);
      elements.trackResults.hidden = true;
      if (profile) setStatus(elements, localizedErrorMessage(error, message), true);
    }
  }
}

function getElements(container) {
  const find = (role) => container.querySelector(`[data-role="${role}"]`);
  return {
    researchTracks: find('research-tracks'), status: find('research-status'),
    trackTotals: find('research-totals'), trackResults: find('research-results'),
    hyperalloyOnHand: document.querySelector('[data-role="hyperalloy-on-hand"]'),
    summaryHyperalloyNeeded: document.querySelector('[data-role="summary-hyperalloy-needed"]'),
    summaryHyperalloyMissing: document.querySelector('[data-role="summary-hyperalloy-missing"]'),
  };
}

function fcLabLevelFromBase(buildingsPlanner, base) {
  const currentIndex = buildingsPlanner.baseIndexes.get(base);
  if (currentIndex === undefined) return 0;
  const checkpoints = fcLabCheckpoints(buildingsPlanner);
  let level = 0;
  checkpoints.forEach((checkpoint, index) => {
    if (index === 0) return;
    if (buildingsPlanner.baseIndexes.get(checkpoint) <= currentIndex) level = index;
  });
  return level;
}

function fcLabCheckpoints(buildingsPlanner) {
  const checkpoints = [buildingsPlanner.steps[0].base];
  const maxIndex = buildingsPlanner.baseIndexes.get(buildingsPlanner.maximumBases['fc-lab']);
  for (let level = 1; ; level += 1) {
    const label = `FC${level}`;
    const resolved = buildingsPlanner.baseIndexes.has(label) ? label : buildingsPlanner.aliases.get(label);
    if (resolved === undefined) break;
    checkpoints.push(resolved);
    if (buildingsPlanner.baseIndexes.get(resolved) >= maxIndex) break;
  }
  return checkpoints;
}

function trackRanges(planner, savedData) {
  return Object.fromEntries(planner.trackKeys.map((key) => {
    const saved = savedData?.researchLevels?.[key] ?? {};
    const track = planner.tracks.get(key);
    const currentLevel = Number.isInteger(saved.currentLevel) && saved.currentLevel >= 0 && saved.currentLevel <= track.levels.length ? saved.currentLevel : 0;
    const targetLevel = Number.isInteger(saved.targetLevel) && saved.targetLevel >= currentLevel && saved.targetLevel <= track.levels.length ? saved.targetLevel : 0;
    return [key, { currentLevel, targetLevel }];
  }));
}

function inventoryValue(input) {
  if (input.value === '') return null;
  const value = input.valueAsNumber;
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

function renderTrackRanges(container, planner, ranges, language, disabled) {
  const fragment = document.createDocumentFragment();
  const message = MESSAGES[language];

  planner.troops.forEach((troop) => {
    const group = document.createElement('div');
    group.className = 'forticlad-planner__troop-group';
    const heading = document.createElement('h3');
    heading.textContent = troopName(troop, language);
    group.append(heading);

    planner.trackKeys.filter((key) => planner.tracks.get(key).troop === troop).forEach((key) => {
      const track = planner.tracks.get(key);
      const row = document.createElement('div');
      row.className = `forticlad-planner__building-range${track.accent ? ' is-accent' : ''}`;
      row.dataset.trackKey = key;
      const rowHeading = document.createElement('h4');
      rowHeading.textContent = trackName(track, language);
      rowHeading.id = `research-track-${key}`;
      row.setAttribute('role', 'group');
      row.setAttribute('aria-labelledby', rowHeading.id);
      const error = document.createElement('p');
      error.className = 'forticlad-planner__range-error';
      error.id = `research-range-error-${key}`;
      error.dataset.role = 'range-error';
      error.hidden = true;
      error.setAttribute('role', 'alert');
      const levels = Array.from({ length: track.levels.length }, (unused, index) => index + 1);
      const startLabel = language === 'vi' ? 'Lv.0 (chưa nghiên cứu)' : 'Lv.0 (not started)';
      const current = levelSelect(message.currentLabel, 'current-level', levels, ranges[key].currentLevel, disabled, startLabel);
      const target = levelSelect(message.targetLabel, 'target-level', levels, ranges[key].targetLevel, disabled, message.noTargetLabel);
      target.querySelector('select').setAttribute('aria-describedby', error.id);
      row.append(rowHeading, current, target, error);
      group.append(row);
    });

    fragment.append(group);
  });

  container.replaceChildren(fragment);
}

function levelSelect(labelText, role, levels, value, disabled, emptyLabel) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = document.createElement('select');
  select.dataset.role = role;
  select.disabled = disabled;
  const options = levels.map((level) => new Option(`Lv.${level}`, String(level)));
  if (emptyLabel) options.unshift(new Option(emptyLabel, '0'));
  select.replaceChildren(...options);
  select.value = String(value);
  label.append(select);
  return label;
}

function selectedTrackRanges(container) {
  return Object.fromEntries([...container.querySelectorAll('[data-track-key]')].map((trackRow) => [trackRow.dataset.trackKey, {
    currentLevel: Number(trackRow.querySelector('[data-role="current-level"]').value),
    targetLevel: Number(trackRow.querySelector('[data-role="target-level"]').value),
  }]));
}

function keepTargetAtOrAboveCurrent(trackRow) {
  const currentSelect = trackRow.querySelector('[data-role="current-level"]');
  const targetSelect = trackRow.querySelector('[data-role="target-level"]');
  if (Number(targetSelect.value) && Number(targetSelect.value) < Number(currentSelect.value)) targetSelect.value = currentSelect.value;
}

function updateRangeWarnings(container, planner, language) {
  const warning = language === 'vi'
    ? 'Lv. mục tiêu không được thấp hơn Lv. hiện tại.'
    : 'Target level cannot be lower than current level.';
  let hasInvalidRange = false;

  container.querySelectorAll('[data-track-key]').forEach((trackRow) => {
    const currentLevel = Number(trackRow.querySelector('[data-role="current-level"]').value);
    const targetLevel = Number(trackRow.querySelector('[data-role="target-level"]').value);
    const invalid = targetLevel !== 0 && targetLevel < currentLevel;
    const error = trackRow.querySelector('[data-role="range-error"]');

    trackRow.classList.toggle('is-invalid', invalid);
    trackRow.querySelector('[data-role="target-level"]').setAttribute('aria-invalid', String(invalid));
    error.textContent = invalid ? warning : '';
    error.hidden = !invalid;
    hasInvalidRange ||= invalid;
  });

  return hasInvalidRange;
}

function renderTotals(container, result, planner, language, message) {
  const labels = language === 'vi'
    ? ['Mục tiêu', 'Từ', 'Đến', 'Chi phí']
    : ['Target', 'From', 'To', 'Cost'];
  const rows = result.effectiveTrackKeys.map((key) => {
    const selection = result.effectiveSelections[key];
    const isAuto = !result.selectedTrackKeys.includes(key);
    const target = targetCell(trackName(planner.tracks.get(key), language), isAuto, message.autoLabel);
    return [target, `Lv.${selection.currentLevel}`, `Lv.${selection.targetLevel}`, formatHyperalloy(result.totals[key])];
  });
  const table = createTable(labels, rows);
  table.className = 'forticlad-planner__breakdown-table';
  grandTotalFooter(table, language === 'vi' ? 'Tổng cộng' : 'Grand total', formatHyperalloy(result.grandTotal));
  container.replaceChildren(table);
}

function formatHyperalloy(amount) {
  return amount > 0 ? `${formatNumber(amount)} Hyperalloy` : '—';
}

function renderSummary(elements, result, inventory, message) {
  if (!elements.summaryHyperalloyNeeded || !elements.summaryHyperalloyMissing) return;
  renderMissingCard(elements.summaryHyperalloyNeeded, elements.summaryHyperalloyMissing, result.grandTotal, inventory, result.selectedTrackKeys.length > 0, message, formatNumber);
}

function renderEmptyResults(elements, message) {
  const emptyState = () => {
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    return paragraph;
  };
  elements.trackTotals.replaceChildren(emptyState());
}

function clearResults(elements) {
  if (elements.summaryHyperalloyNeeded) setSummaryValue(elements.summaryHyperalloyNeeded, '—');
  if (elements.summaryHyperalloyMissing) setSummaryValue(elements.summaryHyperalloyMissing, '—');
  clearElement(elements.trackTotals);
}

function troopName(troop, language) {
  return language === 'vi' ? TROOP_TRANSLATIONS[troop] : troop.charAt(0).toUpperCase() + troop.slice(1);
}

function trackName(track, language) {
  return language === 'vi' ? TRACK_TRANSLATIONS[track.id] : track.label;
}

function setStatus(elements, value, isError = false) {
  setStatusElement(elements.status, value, isError);
}
