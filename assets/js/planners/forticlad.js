import { calculateBuildingRequirements, createPlanner, formatNumber } from './planner-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setSummaryValue, setStatus as setStatusElement, renderMissingCard, targetCell, grandTotalFooter } from './table-helpers.js';

const BUILDING_TRANSLATIONS = {
  'warden-office': 'Văn phòng Giám ngục',
  'shieldbearer-barrack': 'Doanh trại Khiên binh',
  'bomber-barrack': 'Doanh trại Bomber',
  'shooter-barrack': 'Doanh trại Xạ thủ',
  'communication-center': 'Trung tâm Liên lạc',
  'command-center': 'Trung tâm Chỉ huy',
  'medical-station': 'Trạm Y tế',
  'fc-lab': 'Phòng Lab FC',
};

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target Base that is not lower than the current Base.',
    inventory: 'Enter a whole number of FC or AFC that is zero or greater.',
    noTargets: 'No target selected yet. Choose a target Base for a building to see the Core you need.',
    notSet: 'Not set',
    covered: 'Covered',
    needed: '{amount} needed',
    missing: 'Missing {amount}',
    surplus: 'Surplus {amount}',
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn Base mục tiêu không thấp hơn Base hiện tại.',
    inventory: 'Hãy nhập số FC hoặc AFC nguyên lớn hơn hoặc bằng 0.',
    noTargets: 'Chưa chọn Base mục tiêu. Hãy chọn Base mục tiêu cho một công trình để xem Lõi trọng giáp cần thiết.',
    notSet: 'Chưa nhập',
    covered: 'Đã đủ',
    needed: 'Cần {amount}',
    missing: 'Còn thiếu {amount}',
    surplus: 'Dư {amount}',
  },
};

const root = document.querySelector('[data-forticlad-planner]');

if (root) initializePlanner(root);

async function initializePlanner(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const message = MESSAGES[language];
  const elements = getElements(container);
  let planner;
  let store = null;
  let profile = null;
  let storageUnavailable = false;

  try {
    planner = createPlanner(JSON.parse(document.querySelector('#forticlad-data').textContent));
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
    elements.activeProfile.textContent = `${profile.server} — ${profile.name}`;
    const toolData = getToolData(profile, 'forticlad');
    elements.fcOnHand.value = Number.isInteger(toolData.fcOnHand ?? toolData.coreOnHand) && (toolData.fcOnHand ?? toolData.coreOnHand) >= 0 ? (toolData.fcOnHand ?? toolData.coreOnHand) : '';
    elements.afcOnHand.value = Number.isInteger(toolData.afcOnHand) && toolData.afcOnHand >= 0 ? toolData.afcOnHand : '';
  } else {
    elements.activeProfile.textContent = language === 'vi' ? 'Chưa chọn hồ sơ.' : 'No active profile selected.';
    elements.fcOnHand.disabled = true;
    elements.afcOnHand.disabled = true;
    if (!storageUnavailable) setStatus(elements, message.noProfile, true);
  }

  renderBuildingRanges(
    elements.buildingRanges,
    planner,
    buildingRanges(planner, getToolData(profile, 'forticlad')),
    language,
    !profile,
  );

  renderResult();

  elements.buildingRanges.addEventListener('change', async (event) => {
    if (event.target.matches('[data-role="current-base"]')) {
      keepTargetAtOrAboveCurrent(event.target.closest('[data-building-key]'), planner);
    }
    if (updateRangeWarnings(elements.buildingRanges, planner, language)) {
      renderResult();
      return;
    }
    if (profile && store) {
      try {
        profile = await saveForticladData({
          buildingBases: selectedBuildingRanges(elements.buildingRanges),
        });
      } catch (error) {
        setStatus(elements, error.message || message.storage, true);
      }
    }
    renderResult();
  });

  [elements.fcOnHand, elements.afcOnHand].forEach((input) => input.addEventListener('change', async () => {
    if (!profile || !store) return;
    const value = inventoryValue(input);
    if (value === undefined) {
      setStatus(elements, message.inventory, true);
      return;
    }
    try {
      profile = await saveForticladData({ [input.dataset.role === 'fc-on-hand' ? 'fcOnHand' : 'afcOnHand']: value });
      renderResult();
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
  }));

  async function saveForticladData(changes) {
    const latest = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    const saved = await store.saveProfile(updateToolData(latest, 'forticlad', {
      ...getToolData(latest, 'forticlad'),
      ...changes,
    }));
    if ('buildingBases' in changes) document.dispatchEvent(new CustomEvent('forticlad:building-data-changed'));
    return saved;
  }

  function renderResult() {
    if (!profile) return;
    if (updateRangeWarnings(elements.buildingRanges, planner, language)) {
      clearSummary(elements);
      clearElement(elements.buildingTotals);
      elements.buildingResults.hidden = true;
      setStatus(elements, message.range, true);
      return;
    }
    try {
      const result = calculateBuildingRequirements(planner, selectedBuildingRanges(elements.buildingRanges));
      const toolData = getToolData(profile, 'forticlad');
      const inventory = { fc: toolData.fcOnHand ?? toolData.coreOnHand, afc: toolData.afcOnHand };
      renderSummary(elements, result, inventory, message);
      if (result.selectedBuildingKeys.length === 0) {
        renderEmptyResults(elements, message.noTargets);
        elements.buildingResults.hidden = true;
        setStatus(elements, '');
        return;
      }
      renderTotals(elements.buildingTotals, result, planner, language);
      elements.buildingResults.hidden = false;
      if (profile) setStatus(elements, '');
    } catch (error) {
      clearSummary(elements);
      clearElement(elements.buildingTotals);
      elements.buildingResults.hidden = true;
      if (profile) setStatus(elements, error.message || message.range, true);
    }
  }
}

function getElements(container) {
  const find = (role) => container.querySelector(`[data-role="${role}"]`);
  return {
    activeProfile: find('active-profile'), fcOnHand: find('fc-on-hand'), afcOnHand: find('afc-on-hand'), buildingRanges: find('building-ranges'), status: find('status'),
    buildingTotals: find('building-totals'), buildingResults: find('building-results'),
    summaryFcNeeded: find('summary-fc-needed'), summaryFcMissing: find('summary-fc-missing'),
    summaryAfcNeeded: find('summary-afc-needed'), summaryAfcMissing: find('summary-afc-missing'),
  };
}

function buildingRanges(planner, savedData) {
  return Object.fromEntries(planner.buildingKeys.map((key) => {
    const savedRange = savedData?.buildingBases?.[key] ?? {};
    const legacyCurrent = savedData?.currentBase;
    const currentBase = validBase(planner, savedRange.currentBase) ? savedRange.currentBase
      : validBase(planner, legacyCurrent) ? legacyCurrent : planner.steps[0].base;
    const targetBase = validBase(planner, savedRange.targetBase) ? savedRange.targetBase : currentBase;
    const currentIndex = planner.steps.findIndex((step) => step.base === currentBase);
    const targetIndex = planner.steps.findIndex((step) => step.base === targetBase);
    return [key, {
      currentBase,
      targetBase: targetIndex !== -1 && targetIndex < currentIndex ? currentBase : targetBase,
    }];
  }));
}

function validBase(planner, base) {
  return planner.steps.some((step) => step.base === base);
}

function inventoryValue(input) {
  if (input.value === '') return null;
  const value = input.valueAsNumber;
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

function renderBuildingRanges(container, planner, ranges, language, disabled) {
  const currentLabel = language === 'vi' ? 'Base hiện tại' : 'Current Base';
  const targetLabel = language === 'vi' ? 'Base mục tiêu' : 'Target Base';
  const fragment = document.createDocumentFragment();

  planner.buildingKeys.forEach((key) => {
    const row = document.createElement('div');
    row.className = 'forticlad-planner__building-range';
    row.dataset.buildingKey = key;
    const heading = document.createElement('h3');
    heading.textContent = buildingName(key, planner, language);
    heading.id = `forticlad-building-${key}`;
    row.setAttribute('role', 'group');
    row.setAttribute('aria-labelledby', heading.id);
    const error = document.createElement('p');
    error.className = 'forticlad-planner__range-error';
    error.id = `forticlad-range-error-${key}`;
    error.dataset.role = 'range-error';
    error.hidden = true;
    error.setAttribute('role', 'alert');
    const availableSteps = planner.steps.slice(0, planner.baseIndexes.get(planner.maximumBases[key]) + 1);
    const current = rangeLabel(currentLabel, 'current-base', availableSteps, ranges[key].currentBase, disabled);
    const target = rangeLabel(targetLabel, 'target-base', planner.steps.slice(0, planner.baseIndexes.get(planner.maximumBases[key]) + 1), ranges[key].targetBase, disabled);
    target.querySelector('select').setAttribute('aria-describedby', error.id);
    row.append(heading, current, target, error);
    fragment.append(row);
  });

  container.replaceChildren(fragment);
}

function rangeLabel(labelText, role, steps, value, disabled, emptyLabel) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = document.createElement('select');
  select.dataset.role = role;
  select.disabled = disabled;
  const options = steps.map((step) => new Option(step.base, step.base));
  if (emptyLabel) options.unshift(new Option(emptyLabel, ''));
  select.replaceChildren(...options);
  select.value = value;
  label.append(select);
  return label;
}

function selectedBuildingRanges(container) {
  return Object.fromEntries([...container.querySelectorAll('[data-building-key]')].map((row) => [row.dataset.buildingKey, {
    currentBase: row.querySelector('[data-role="current-base"]').value,
    targetBase: row.querySelector('[data-role="target-base"]').value,
  }]));
}

function keepTargetAtOrAboveCurrent(row, planner) {
  const currentSelect = row.querySelector('[data-role="current-base"]');
  const targetSelect = row.querySelector('[data-role="target-base"]');
  const currentIndex = planner.steps.findIndex((step) => step.base === currentSelect.value);
  const targetIndex = planner.steps.findIndex((step) => step.base === targetSelect.value);

  if (targetIndex !== -1 && targetIndex < currentIndex) targetSelect.value = currentSelect.value;
}

function updateRangeWarnings(container, planner, language) {
  const warning = language === 'vi'
    ? 'Base mục tiêu không được thấp hơn Base hiện tại.'
    : 'Target Base cannot be lower than Current Base.';
  let hasInvalidRange = false;

  container.querySelectorAll('[data-building-key]').forEach((row) => {
    const currentSelect = row.querySelector('[data-role="current-base"]');
    const targetSelect = row.querySelector('[data-role="target-base"]');
    const currentIndex = planner.steps.findIndex((step) => step.base === currentSelect.value);
    const targetIndex = planner.steps.findIndex((step) => step.base === targetSelect.value);
    const invalid = targetIndex !== -1 && targetIndex < currentIndex;
    const error = row.querySelector('[data-role="range-error"]');

    row.classList.toggle('is-invalid', invalid);
    targetSelect.setAttribute('aria-invalid', String(invalid));
    error.textContent = invalid ? warning : '';
    error.hidden = !invalid;
    hasInvalidRange ||= invalid;
  });

  return hasInvalidRange;
}

function renderTotals(container, result, planner, language) {
  const labels = language === 'vi'
    ? ['Mục tiêu', 'Từ', 'Đến', 'Chi phí']
    : ['Target', 'From', 'To', 'Cost'];
  const autoLabel = language === 'vi' ? '(tự động thêm — điều kiện tiên quyết)' : '(auto-added — prerequisite)';
  const rows = result.effectiveBuildingKeys.map((key) => {
    const range = result.effectiveRanges[key];
    const isAuto = result.automaticBuildingKeys.includes(key);
    const target = targetCell(buildingName(key, planner, language), isAuto, autoLabel);
    return [target, range.currentBase, range.targetBase, formatCost(result.totals[key].fc, result.totals[key].afc)];
  });
  const table = createTable(labels, rows);
  table.className = 'forticlad-planner__breakdown-table';
  grandTotalFooter(table, language === 'vi' ? 'Tổng cộng' : 'Grand total', formatCost(result.resourceTotals.fc, result.resourceTotals.afc));
  container.replaceChildren(table);
}

function formatCost(fc, afc) {
  const parts = [];
  if (fc > 0) parts.push(`${formatNumber(fc)} FC`);
  if (afc > 0) parts.push(`${formatNumber(afc)} AFC`);
  return parts.length ? parts.join(', ') : '—';
}

function renderSummary(elements, result, inventory, message) {
  renderMissingCard(elements.summaryFcNeeded, elements.summaryFcMissing, result.resourceTotals.fc, inventory.fc, result.selectedBuildingKeys.length > 0, message, formatNumber);
  renderMissingCard(elements.summaryAfcNeeded, elements.summaryAfcMissing, result.resourceTotals.afc, inventory.afc, result.selectedBuildingKeys.length > 0, message, formatNumber);
}

function renderEmptyResults(elements, message) {
  const emptyState = () => {
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    return paragraph;
  };
  elements.buildingTotals.replaceChildren(emptyState());
}

function clearSummary(elements) {
  [elements.summaryFcNeeded, elements.summaryFcMissing, elements.summaryAfcNeeded, elements.summaryAfcMissing].forEach((output) => setSummaryValue(output, '—'));
}

function buildingName(key, planner, language) {
  return language === 'vi' ? BUILDING_TRANSLATIONS[key] : planner.buildings[key].label;
}

function setStatus(elements, value, isError = false) {
  setStatusElement(elements.status, value, isError);
}
