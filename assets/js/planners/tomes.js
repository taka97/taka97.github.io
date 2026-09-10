import { createTomesPlanner, calculateTomesRequirements, formatNumber } from './tomes-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setStatus as setStatusElement, renderMissingCard, grandTotalFooter, toRoman, updateStickyBar, renderInstanceBadge } from './table-helpers.js';

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target level that is not lower than the current level.',
    inventory: 'Enter a whole number that is zero or greater.',
    noTargets: "No target selected yet. Choose a target level for a Tome or Collection to see what you're missing.",
    notSet: 'Not set',
    covered: 'Covered',
    needed: '{amount} needed',
    missing: 'Missing {amount}',
    surplus: 'Surplus {amount}',
    tomeLabel: 'Tome {n}',
    collectionLabel: 'Collection {n}',
    notStarted: 'Not started',
    noTarget: 'No target',
    levelPrefix: 'Level',
    starWord: 'star',
    currentLabel: 'Current level',
    targetLabel: 'Target level',
    resetLabel: 'Reset to default',
    resetConfirmLabel: 'Click again to confirm reset',
    stickyBarLabel: 'Missing:',
    targetSetLabel: 'Target set',
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn cấp mục tiêu không thấp hơn cấp hiện tại.',
    inventory: 'Hãy nhập số nguyên lớn hơn hoặc bằng 0.',
    noTargets: 'Chưa chọn mục tiêu. Hãy chọn cấp mục tiêu cho một Tome hoặc Collection để xem bạn còn thiếu gì.',
    notSet: 'Chưa nhập',
    covered: 'Đã đủ',
    needed: 'Cần {amount}',
    missing: 'Còn thiếu {amount}',
    surplus: 'Dư {amount}',
    tomeLabel: 'Tome {n}',
    collectionLabel: 'Collection {n}',
    notStarted: 'Chưa bắt đầu',
    noTarget: 'Chưa chọn',
    levelPrefix: 'Cấp',
    starWord: 'sao',
    currentLabel: 'Cấp hiện tại',
    targetLabel: 'Cấp mục tiêu',
    resetLabel: 'Khôi phục mặc định',
    resetConfirmLabel: 'Bấm lần nữa để xác nhận',
    stickyBarLabel: 'Còn thiếu:',
    targetSetLabel: 'Đã đặt mục tiêu',
  },
};

const root = document.querySelector('[data-tomes-planner]');

if (root) initializeTomesPlanner(root);

async function initializeTomesPlanner(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const message = MESSAGES[language];
  const elements = getElements(container);
  let planner;
  let store = null;
  let profile = null;
  let storageUnavailable = false;

  try {
    planner = createTomesPlanner(JSON.parse(document.querySelector('#tomes-data').textContent));
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

  const disabled = !profile;
  let stock = {};
  let tomeInstances = [{ currentIndex: 0, targetIndex: 0 }];
  let collectionInstances = [{ currentIndex: 0, targetIndex: 0 }];

  if (profile) {
    elements.activeProfile.textContent = `${profile.server} — ${profile.name}`;
    const toolData = getToolData(profile, 'tomes-collections');
    stock = sanitizeStock(toolData.stock, planner);
    tomeInstances = sanitizeInstances(toolData.tomes, planner.caps.tomes, planner.tomeLevels.length - 1);
    collectionInstances = sanitizeInstances(toolData.collections, planner.caps.collections, planner.collectionLevels.length - 1);
  } else {
    elements.activeProfile.textContent = language === 'vi' ? 'Chưa chọn hồ sơ.' : 'No active profile selected.';
    if (!storageUnavailable) setStatus(elements, message.noProfile, true);
  }

  renderStockInputs();
  renderInstanceListFor('tomes');
  renderInstanceListFor('collections');
  updateAddButtonState();
  elements.reset.disabled = disabled;
  renderResult();

  elements.tomesList.addEventListener('change', (event) => handleInstanceChange(event));
  elements.collectionsList.addEventListener('change', (event) => handleInstanceChange(event));
  elements.stockInputs.forEach((input) => input.addEventListener('change', handleStockChange));
  elements.addTome.addEventListener('click', () => handleAdd('tomes'));
  elements.addCollection.addEventListener('click', () => handleAdd('collections'));
  elements.reset.addEventListener('click', handleReset);
  elements.stickyBar.addEventListener('click', scrollToSummary);
  elements.stickyBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToSummary();
    }
  });

  function renderStockInputs() {
    elements.stockInputs.forEach((input) => {
      const key = input.dataset.resourceKey;
      input.value = Number.isInteger(stock[key]) && stock[key] >= 0 ? stock[key] : '';
      input.disabled = disabled;
    });
  }

  async function handleStockChange(event) {
    if (!profile || !store) return;
    disarmReset();
    const key = event.target.dataset.resourceKey;
    const value = inventoryValue(event.target);
    if (value === undefined) {
      setStatus(elements, message.inventory, true);
      return;
    }
    stock = { ...stock, [key]: value };
    try {
      await persist({ stock });
      renderResult();
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
  }

  async function handleInstanceChange(event) {
    disarmReset();
    if (event.target.matches('[data-role="current-level"]')) keepTargetAtOrAboveCurrent(event.target.closest('[data-instance-index]'));
    const tomesInvalid = updateRangeWarnings(elements.tomesList, message);
    const collectionsInvalid = updateRangeWarnings(elements.collectionsList, message);
    if (tomesInvalid || collectionsInvalid) {
      renderResult();
      return;
    }
    tomeInstances = selectedInstances(elements.tomesList);
    collectionInstances = selectedInstances(elements.collectionsList);
    if (profile && store) {
      try {
        await persist({ tomes: tomeInstances, collections: collectionInstances });
      } catch (error) {
        setStatus(elements, error.message || message.storage, true);
      }
    }
    renderResult();
  }

  async function handleAdd(category) {
    if (!profile) return;
    disarmReset();
    const cap = category === 'tomes' ? planner.caps.tomes : planner.caps.collections;
    const list = category === 'tomes' ? tomeInstances : collectionInstances;
    if (list.length >= cap) return;
    const updated = [...list, { currentIndex: 0, targetIndex: 0 }];
    if (category === 'tomes') tomeInstances = updated;
    else collectionInstances = updated;
    renderInstanceListFor(category);
    updateAddButtonState();
    try {
      await persist({ [category]: updated });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
    renderResult();
  }

  function renderInstanceListFor(category) {
    if (category === 'tomes') {
      renderInstanceList(elements.tomesList, 'tomes', tomeInstances, planner.tomeLevels.length - 1, (index) => tomeLevelLabel(index, message), message, disabled);
    } else {
      renderInstanceList(elements.collectionsList, 'collections', collectionInstances, planner.collectionLevels.length - 1, (index) => collectionLevelLabel(index, planner, message), message, disabled);
    }
  }

  function updateAddButtonState() {
    elements.addTome.disabled = disabled || tomeInstances.length >= planner.caps.tomes;
    elements.addCollection.disabled = disabled || collectionInstances.length >= planner.caps.collections;
  }

  let resetArmed = false;
  let resetTimer = null;

  function disarmReset() {
    resetArmed = false;
    elements.reset.textContent = message.resetLabel;
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  }

  async function handleReset() {
    if (!profile || !store) return;
    if (!resetArmed) {
      resetArmed = true;
      elements.reset.textContent = message.resetConfirmLabel;
      resetTimer = setTimeout(disarmReset, 4000);
      return;
    }
    disarmReset();
    stock = {};
    tomeInstances = [{ currentIndex: 0, targetIndex: 0 }];
    collectionInstances = [{ currentIndex: 0, targetIndex: 0 }];
    renderStockInputs();
    renderInstanceListFor('tomes');
    renderInstanceListFor('collections');
    updateAddButtonState();
    try {
      await persist({ stock, tomes: tomeInstances, collections: collectionInstances });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
      return;
    }
    renderResult();
  }

  async function persist(changes) {
    const latest = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    profile = await store.saveProfile(updateToolData(latest, 'tomes-collections', {
      ...getToolData(latest, 'tomes-collections'),
      ...changes,
    }));
  }

  function renderResult() {
    if (!profile) return;
    const tomesInvalid = updateRangeWarnings(elements.tomesList, message);
    const collectionsInvalid = updateRangeWarnings(elements.collectionsList, message);
    const invalid = tomesInvalid || collectionsInvalid;
    if (invalid) {
      clearElement(elements.missingGrid);
      clearElement(elements.totals);
      elements.results.hidden = true;
      updateStickyBar(elements.stickyBar, planner.resources, null, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, message.range, true);
      return;
    }
    try {
      const result = calculateTomesRequirements(planner, tomeInstances, collectionInstances);
      renderMissingSummary(elements.missingGrid, result.totals, stock, message, planner);
      const totalRows = result.tomeBreakdown.length + result.collectionBreakdown.length;
      if (totalRows === 0) {
        renderEmptyResults(elements.totals, message.noTargets);
        elements.results.hidden = true;
      } else {
        renderBreakdownTable(elements.totals, result, planner, language, message);
        elements.results.hidden = false;
      }
      updateStickyBar(elements.stickyBar, planner.resources, result.totals, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, '');
    } catch (error) {
      clearElement(elements.missingGrid);
      clearElement(elements.totals);
      elements.results.hidden = true;
      updateStickyBar(elements.stickyBar, planner.resources, null, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, error.message || message.range, true);
    }
  }

  function scrollToSummary() {
    elements.summaryHeading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getElements(container) {
  const find = (role) => container.querySelector(`[data-role="${role}"]`);
  return {
    activeProfile: find('active-profile'),
    stockInputs: [...container.querySelectorAll('[data-role="stock-input"]')],
    missingGrid: find('missing-grid'),
    results: find('results'),
    totals: find('totals'),
    tomesList: find('tomes-list'),
    addTome: find('add-tome'),
    collectionsList: find('collections-list'),
    addCollection: find('add-collection'),
    reset: find('reset'),
    status: find('status'),
    stickyBar: find('sticky-bar'),
    summaryHeading: container.querySelector('[data-role="summary-heading"]'),
  };
}

function sanitizeStock(stock, planner) {
  const result = {};
  planner.resources.forEach((resource) => {
    if (Number.isInteger(stock?.[resource.key]) && stock[resource.key] >= 0) result[resource.key] = stock[resource.key];
  });
  return result;
}

function sanitizeInstances(list, cap, maxIndex) {
  const source = Array.isArray(list) && list.length > 0 ? list.slice(0, cap) : [{ currentIndex: 0, targetIndex: 0 }];
  return source.map((instance) => ({
    currentIndex: clampInstanceValue(instance?.currentIndex, maxIndex),
    targetIndex: clampInstanceValue(instance?.targetIndex, maxIndex),
  }));
}

function clampInstanceValue(value, maxIndex) {
  return Number.isInteger(value) && value >= 0 && value <= maxIndex ? value : 0;
}

function inventoryValue(input) {
  if (input.value === '') return null;
  const value = input.valueAsNumber;
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

function tomeLevelLabel(index, message) {
  return index === 0 ? message.notStarted : `${message.levelPrefix} ${toRoman(index)}`;
}

function collectionLevelLabel(index, planner, message) {
  const row = planner.collectionLevels[index];
  if (row.tier === 'start') return message.notStarted;
  const tier = planner.tiers.find((entry) => entry.key === row.tier);
  const label = tier ? tier.label : row.tier;
  return row.star > 0 ? `${label} · ${message.starWord} ${row.star}` : label;
}

function buildLevelOptions(maxIndex, labelFn, zeroLabelOverride) {
  const options = [];
  for (let index = 0; index <= maxIndex; index += 1) {
    options.push(new Option(index === 0 && zeroLabelOverride !== undefined ? zeroLabelOverride : labelFn(index), String(index)));
  }
  return options;
}

function renderInstanceList(container, category, instances, maxIndex, labelFn, message, disabled) {
  const fragment = document.createDocumentFragment();
  instances.forEach((instance, index) => {
    const card = document.createElement('div');
    card.className = 'loj-planner__instance-range';
    card.dataset.category = category;
    card.dataset.instanceIndex = String(index);
    const headingText = (category === 'tomes' ? message.tomeLabel : message.collectionLabel).replace('{n}', String(index + 1));
    const heading = document.createElement('h3');
    heading.textContent = headingText;
    heading.id = `${category}-instance-${index}`;
    card.setAttribute('role', 'group');
    card.setAttribute('aria-labelledby', heading.id);

    const badge = document.createElement('span');
    badge.className = 'loj-planner__instance-badge';
    badge.dataset.role = 'instance-badge';
    renderInstanceBadge(badge, instance.targetIndex !== 0, message.targetSetLabel, message.noTarget);
    heading.append(badge);

    const errorId = `${category}-range-error-${index}`;
    const error = document.createElement('p');
    error.className = 'loj-planner__range-error';
    error.id = errorId;
    error.dataset.role = 'range-error';
    error.hidden = true;
    error.setAttribute('role', 'alert');

    const currentLabel = document.createElement('label');
    currentLabel.textContent = message.currentLabel;
    const currentSelect = document.createElement('select');
    currentSelect.dataset.role = 'current-level';
    currentSelect.disabled = disabled;
    currentSelect.replaceChildren(...buildLevelOptions(maxIndex, labelFn));
    currentSelect.value = String(instance.currentIndex);
    currentLabel.append(currentSelect);

    const targetLabel = document.createElement('label');
    targetLabel.textContent = message.targetLabel;
    const targetSelect = document.createElement('select');
    targetSelect.dataset.role = 'target-level';
    targetSelect.disabled = disabled;
    targetSelect.replaceChildren(...buildLevelOptions(maxIndex, labelFn, message.noTarget));
    targetSelect.value = String(instance.targetIndex);
    targetSelect.setAttribute('aria-describedby', errorId);
    targetLabel.append(targetSelect);

    card.append(heading, currentLabel, targetLabel, error);
    fragment.append(card);
  });
  container.replaceChildren(fragment);
}

function selectedInstances(container) {
  return [...container.querySelectorAll('[data-instance-index]')].map((card) => ({
    currentIndex: Number(card.querySelector('[data-role="current-level"]').value),
    targetIndex: Number(card.querySelector('[data-role="target-level"]').value),
  }));
}

function keepTargetAtOrAboveCurrent(card) {
  const currentSelect = card.querySelector('[data-role="current-level"]');
  const targetSelect = card.querySelector('[data-role="target-level"]');
  if (Number(targetSelect.value) && Number(targetSelect.value) < Number(currentSelect.value)) targetSelect.value = currentSelect.value;
}

function updateRangeWarnings(container, message) {
  let hasInvalidRange = false;
  container.querySelectorAll('[data-instance-index]').forEach((card) => {
    const currentSelect = card.querySelector('[data-role="current-level"]');
    const targetSelect = card.querySelector('[data-role="target-level"]');
    const currentIndex = Number(currentSelect.value);
    const targetIndex = Number(targetSelect.value);
    const invalid = targetIndex !== 0 && targetIndex < currentIndex;
    const error = card.querySelector('[data-role="range-error"]');
    card.classList.toggle('is-invalid', invalid);
    targetSelect.setAttribute('aria-invalid', String(invalid));
    error.textContent = invalid ? message.range : '';
    error.hidden = !invalid;
    hasInvalidRange ||= invalid;
    renderInstanceBadge(card.querySelector('[data-role="instance-badge"]'), targetIndex !== 0, message.targetSetLabel, message.noTarget);
  });
  return hasInvalidRange;
}

function renderMissingSummary(container, totals, stock, message, planner) {
  const needed = planner.resources.filter((resource) => totals[resource.key] > 0);
  if (needed.length === 0) {
    const paragraph = document.createElement('p');
    paragraph.textContent = message.noTargets;
    container.replaceChildren(paragraph);
    return;
  }
  const fragment = document.createDocumentFragment();
  needed.forEach((resource) => {
    const card = document.createElement('div');
    card.className = 'loj-planner__missing-card';
    const header = document.createElement('div');
    header.className = 'loj-planner__missing-card-header';
    header.textContent = resource.label;
    const neededOutput = document.createElement('output');
    neededOutput.className = 'loj-planner__missing-card-value';
    const missingOutput = document.createElement('output');
    missingOutput.className = 'loj-planner__missing-card-badge';
    renderMissingCard(neededOutput, missingOutput, totals[resource.key], stock[resource.key], true, message, formatNumber);
    card.append(header, neededOutput, missingOutput);
    fragment.append(card);
  });
  container.replaceChildren(fragment);
}

function renderEmptyResults(container, text) {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  container.replaceChildren(paragraph);
}

function renderBreakdownTable(container, result, planner, language, message) {
  const labels = language === 'vi' ? ['Mục tiêu', 'Từ', 'Đến', 'Chi phí'] : ['Target', 'From', 'To', 'Cost'];
  const rows = [
    ...result.tomeBreakdown.map((entry) => [
      message.tomeLabel.replace('{n}', String(entry.index + 1)),
      tomeLevelLabel(entry.currentIndex, message),
      tomeLevelLabel(entry.targetIndex, message),
      formatCost(entry.cost, planner),
    ]),
    ...result.collectionBreakdown.map((entry) => [
      message.collectionLabel.replace('{n}', String(entry.index + 1)),
      collectionLevelLabel(entry.currentIndex, planner, message),
      collectionLevelLabel(entry.targetIndex, planner, message),
      formatCost(entry.cost, planner),
    ]),
  ];
  const table = createTable(labels, rows);
  table.className = 'loj-planner__breakdown-table';
  grandTotalFooter(table, language === 'vi' ? 'Tổng cộng' : 'Grand total', formatCost(result.totals, planner));
  container.replaceChildren(table);
}

function formatCost(cost, planner) {
  const parts = planner.resources.filter((resource) => cost[resource.key] > 0).map((resource) => `${formatNumber(cost[resource.key])} ${resource.label}`);
  return parts.length ? parts.join(', ') : '—';
}

function setStatus(elements, value, isError = false) {
  setStatusElement(elements.status, value, isError);
}
