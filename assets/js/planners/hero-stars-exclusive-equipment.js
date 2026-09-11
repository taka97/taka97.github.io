import { createHeroStarsEquipmentPlanner, calculateHeroStarsEquipment, formatNumber } from './hero-stars-exclusive-equipment-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setStatus as setStatusElement, renderMissingCard, grandTotalFooter, updateStickyBar, renderInstanceBadge } from './table-helpers.js';

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target level that is not lower than the current level.',
    inventory: 'Enter a whole number that is zero or greater.',
    noTargets: "No target selected yet. Choose a target level for a Hero Stars or Exclusive Equipment instance to see what you're missing.",
    notSet: 'Not set',
    covered: 'Covered',
    needed: '{amount} needed',
    missing: 'Missing {amount}',
    surplus: 'Surplus {amount}',
    heroLabel: 'Hero {n}',
    noTarget: 'No target',
    currentLabel: 'Current level',
    targetLabel: 'Target level',
    resetLabel: 'Reset to default',
    resetConfirmLabel: 'Click again to confirm reset',
    stickyBarLabel: 'Missing:',
    targetSetLabel: 'Target set',
    notRecruited: 'Not recruited',
    recruitedLabel: 'Recruited',
    starLabel: '{n} stars',
    stageLabel: '{n} stars · stage {s}',
    levelPrefix: 'Level',
    heroStarsTrackLabel: 'Hero Stars',
    exclusiveEquipmentTrackLabel: 'Exclusive Equipment',
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn cấp mục tiêu không thấp hơn cấp hiện tại.',
    inventory: 'Hãy nhập số nguyên lớn hơn hoặc bằng 0.',
    noTargets: 'Chưa chọn mục tiêu. Hãy chọn cấp mục tiêu cho một Hero Stars hoặc Exclusive Equipment để xem bạn còn thiếu gì.',
    notSet: 'Chưa nhập',
    covered: 'Đã đủ',
    needed: 'Cần {amount}',
    missing: 'Còn thiếu {amount}',
    surplus: 'Dư {amount}',
    heroLabel: 'Hero {n}',
    noTarget: 'Chưa chọn',
    currentLabel: 'Cấp hiện tại',
    targetLabel: 'Cấp mục tiêu',
    resetLabel: 'Khôi phục mặc định',
    resetConfirmLabel: 'Bấm lần nữa để xác nhận',
    stickyBarLabel: 'Còn thiếu:',
    targetSetLabel: 'Đã đặt mục tiêu',
    notRecruited: 'Chưa chiêu mộ',
    recruitedLabel: 'Đã chiêu mộ',
    starLabel: '{n} sao',
    stageLabel: '{n} sao · giai đoạn {s}',
    levelPrefix: 'Cấp',
    heroStarsTrackLabel: 'Hero Stars',
    exclusiveEquipmentTrackLabel: 'Exclusive Equipment',
  },
};

const root = document.querySelector('[data-hero-stars-exclusive-equipment-planner]');

if (root) initializeHeroStarsEquipmentPlanner(root);

async function initializeHeroStarsEquipmentPlanner(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const message = MESSAGES[language];
  const elements = getElements(container);
  let planner;
  let store = null;
  let profile = null;
  let storageUnavailable = false;

  try {
    planner = createHeroStarsEquipmentPlanner(JSON.parse(document.querySelector('#hero-stars-exclusive-equipment-data').textContent));
  } catch (error) {
    setStatus(elements, error.message, true);
    return;
  }

  const heroStarsTargetIndices = [0, ...planner.heroStarsLevels
    .map((level, index) => index)
    .filter((index) => index !== 0 && !/_s\d+$/.test(planner.heroStarsLevels[index].id))];
  const exclusiveEquipmentTargetIndices = planner.exclusiveEquipmentLevels.map((level, index) => index);

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
  let heroStarsInstances = [{ currentIndex: 0, targetIndex: 0 }];
  let exclusiveEquipmentInstances = [{ currentIndex: 0, targetIndex: 0 }];

  if (profile) {
    elements.activeProfile.textContent = `${profile.server} — ${profile.name}`;
    const toolData = getToolData(profile, 'hero-stars-exclusive-equipment');
    stock = sanitizeStock(toolData.stock, planner);
    heroStarsInstances = sanitizeInstances(toolData.heroStars, planner.heroStarsLevels.length - 1, planner.caps.heroStars);
    exclusiveEquipmentInstances = sanitizeInstances(toolData.exclusiveEquipment, planner.exclusiveEquipmentLevels.length - 1, planner.caps.exclusiveEquipment);
  } else {
    elements.activeProfile.textContent = language === 'vi' ? 'Chưa chọn hồ sơ.' : 'No active profile selected.';
    if (!storageUnavailable) setStatus(elements, message.noProfile, true);
  }

  renderStockInputs();
  renderHeroStarsSection();
  renderExclusiveEquipmentSection();
  updateAddButtonState();
  elements.reset.disabled = disabled;
  renderResult();

  elements.heroStarsList.addEventListener('change', handleInstanceChange);
  elements.exclusiveEquipmentList.addEventListener('change', handleInstanceChange);
  elements.stockInputs.forEach((input) => input.addEventListener('change', handleStockChange));
  elements.addHeroStars.addEventListener('click', handleAddHeroStars);
  elements.addExclusiveEquipment.addEventListener('click', handleAddExclusiveEquipment);
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
    if (event.target.matches('[data-role="current-level"]')) keepTargetAtOrAboveCurrent(event.target.closest('[data-card-key]'));
    if (validateAllLists()) {
      renderResult();
      return;
    }
    commitStateFromDom();
    if (profile && store) {
      try {
        await persist({ heroStars: heroStarsInstances, exclusiveEquipment: exclusiveEquipmentInstances });
      } catch (error) {
        setStatus(elements, error.message || message.storage, true);
      }
    }
    renderResult();
  }

  function commitStateFromDom() {
    heroStarsInstances = readCardState(elements.heroStarsList).map(({ currentIndex, targetIndex }) => ({ currentIndex, targetIndex }));
    exclusiveEquipmentInstances = readCardState(elements.exclusiveEquipmentList).map(({ currentIndex, targetIndex }) => ({ currentIndex, targetIndex }));
  }

  async function handleAddHeroStars() {
    if (!profile) return;
    disarmReset();
    if (heroStarsInstances.length >= planner.caps.heroStars) return;
    heroStarsInstances = [...heroStarsInstances, { currentIndex: 0, targetIndex: 0 }];
    renderHeroStarsSection();
    updateAddButtonState();
    try {
      await persist({ heroStars: heroStarsInstances });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
    renderResult();
  }

  async function handleAddExclusiveEquipment() {
    if (!profile) return;
    disarmReset();
    if (exclusiveEquipmentInstances.length >= planner.caps.exclusiveEquipment) return;
    exclusiveEquipmentInstances = [...exclusiveEquipmentInstances, { currentIndex: 0, targetIndex: 0 }];
    renderExclusiveEquipmentSection();
    updateAddButtonState();
    try {
      await persist({ exclusiveEquipment: exclusiveEquipmentInstances });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
    renderResult();
  }

  function renderHeroStarsSection() {
    const maxIndex = planner.heroStarsLevels.length - 1;
    const cards = heroStarsInstances.map((instance, index) => ({
      key: String(index),
      headingText: message.heroLabel.replace('{n}', String(index + 1)),
      currentIndex: instance.currentIndex,
      targetIndex: instance.targetIndex,
      currentIndices: buildIndices(maxIndex),
      targetIndices: heroStarsTargetIndices,
      labelFn: (levelIndex) => heroStarsLevelLabel(levelIndex, planner, message),
    }));
    renderInstanceCards(elements.heroStarsList, 'hero-stars', cards, disabled, message);
  }

  function renderExclusiveEquipmentSection() {
    const maxIndex = planner.exclusiveEquipmentLevels.length - 1;
    const cards = exclusiveEquipmentInstances.map((instance, index) => ({
      key: String(index),
      headingText: message.heroLabel.replace('{n}', String(index + 1)),
      currentIndex: instance.currentIndex,
      targetIndex: instance.targetIndex,
      currentIndices: buildIndices(maxIndex),
      targetIndices: exclusiveEquipmentTargetIndices,
      labelFn: (levelIndex) => exclusiveEquipmentLevelLabel(levelIndex, message),
    }));
    renderInstanceCards(elements.exclusiveEquipmentList, 'exclusive-equipment', cards, disabled, message);
  }

  function updateAddButtonState() {
    elements.addHeroStars.disabled = disabled || heroStarsInstances.length >= planner.caps.heroStars;
    elements.addExclusiveEquipment.disabled = disabled || exclusiveEquipmentInstances.length >= planner.caps.exclusiveEquipment;
  }

  function validateAllLists() {
    const heroStarsInvalid = updateRangeWarnings(elements.heroStarsList, message);
    const exclusiveEquipmentInvalid = updateRangeWarnings(elements.exclusiveEquipmentList, message);
    return heroStarsInvalid || exclusiveEquipmentInvalid;
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
    heroStarsInstances = [{ currentIndex: 0, targetIndex: 0 }];
    exclusiveEquipmentInstances = [{ currentIndex: 0, targetIndex: 0 }];
    renderStockInputs();
    renderHeroStarsSection();
    renderExclusiveEquipmentSection();
    updateAddButtonState();
    try {
      await persist({ stock, heroStars: heroStarsInstances, exclusiveEquipment: exclusiveEquipmentInstances });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
      return;
    }
    renderResult();
  }

  async function persist(changes) {
    const latest = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    profile = await store.saveProfile(updateToolData(latest, 'hero-stars-exclusive-equipment', {
      ...getToolData(latest, 'hero-stars-exclusive-equipment'),
      ...changes,
    }));
  }

  function renderResult() {
    if (!profile) return;
    const invalid = validateAllLists();
    if (invalid) {
      clearElement(elements.missingGrid);
      clearElement(elements.totals);
      elements.results.hidden = true;
      updateStickyBar(elements.stickyBar, planner.resources, null, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, message.range, true);
      return;
    }
    try {
      const result = calculateHeroStarsEquipment(planner, heroStarsInstances, exclusiveEquipmentInstances);
      renderMissingSummary(elements.missingGrid, result.totals, stock, message, planner);
      const totalRows = result.heroStarsBreakdown.length + result.exclusiveEquipmentBreakdown.length;
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
    heroStarsList: find('hero-stars-list'),
    addHeroStars: find('add-hero-stars'),
    exclusiveEquipmentList: find('exclusive-equipment-list'),
    addExclusiveEquipment: find('add-exclusive-equipment'),
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

function sanitizeInstances(list, maxIndex, cap) {
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

function heroStarsLevelLabel(index, planner, message) {
  const id = planner.heroStarsLevels[index].id;
  if (id === 'start') return message.notRecruited;
  if (id === 'recruited') return message.recruitedLabel;
  const stageMatch = id.match(/^star(\d)_s(\d)$/);
  if (stageMatch) return message.stageLabel.replace('{n}', stageMatch[1]).replace('{s}', stageMatch[2]);
  const tierMatch = id.match(/^star(\d)$/);
  if (tierMatch) return message.starLabel.replace('{n}', tierMatch[1]);
  return id;
}

function exclusiveEquipmentLevelLabel(index, message) {
  return `${message.levelPrefix} ${index}`;
}

function buildIndices(maxIndex) {
  return Array.from({ length: maxIndex + 1 }, (value, index) => index);
}

function buildOptionsForIndices(indices, labelFn, zeroLabelOverride) {
  return indices.map((index) => new Option(index === 0 && zeroLabelOverride !== undefined ? zeroLabelOverride : labelFn(index), String(index)));
}

function renderInstanceCards(container, keyPrefix, cards, disabled, message) {
  const fragment = document.createDocumentFragment();
  cards.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'loj-planner__instance-range';
    card.dataset.cardKey = entry.key;
    const headingRow = document.createElement('div');
    headingRow.className = 'loj-planner__instance-heading';
    const heading = document.createElement('h3');
    heading.className = 'loj-planner__instance-label';
    heading.textContent = entry.headingText;
    heading.id = `${keyPrefix}-instance-${entry.key}`;
    card.setAttribute('role', 'group');
    card.setAttribute('aria-labelledby', heading.id);

    const badge = document.createElement('span');
    badge.className = 'loj-planner__instance-badge';
    badge.dataset.role = 'instance-badge';
    renderInstanceBadge(badge, entry.targetIndex !== 0, message.targetSetLabel, message.noTarget);
    headingRow.append(heading, badge);

    const errorId = `${keyPrefix}-range-error-${entry.key}`;
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
    currentSelect.replaceChildren(...buildOptionsForIndices(entry.currentIndices, entry.labelFn));
    currentSelect.value = String(entry.currentIndex);
    currentLabel.append(currentSelect);

    const targetLabel = document.createElement('label');
    targetLabel.textContent = message.targetLabel;
    const targetSelect = document.createElement('select');
    targetSelect.dataset.role = 'target-level';
    targetSelect.disabled = disabled;
    targetSelect.replaceChildren(...buildOptionsForIndices(entry.targetIndices, entry.labelFn, message.noTarget));
    targetSelect.value = String(entry.targetIndex);
    targetSelect.setAttribute('aria-describedby', errorId);
    targetLabel.append(targetSelect);

    card.append(headingRow, currentLabel, targetLabel, error);
    fragment.append(card);
  });
  container.replaceChildren(fragment);
}

function readCardState(container) {
  return [...container.querySelectorAll('[data-card-key]')].map((card) => ({
    key: card.dataset.cardKey,
    currentIndex: Number(card.querySelector('[data-role="current-level"]').value),
    targetIndex: Number(card.querySelector('[data-role="target-level"]').value),
  }));
}

function keepTargetAtOrAboveCurrent(card) {
  const currentSelect = card.querySelector('[data-role="current-level"]');
  const targetSelect = card.querySelector('[data-role="target-level"]');
  const currentIndex = Number(currentSelect.value);
  const targetIndex = Number(targetSelect.value);
  if (!targetIndex || targetIndex >= currentIndex) return;
  const nextValidOption = [...targetSelect.options].find((option) => Number(option.value) >= currentIndex);
  targetSelect.value = nextValidOption ? nextValidOption.value : '0';
}

function updateRangeWarnings(container, message) {
  let hasInvalidRange = false;
  container.querySelectorAll('[data-card-key]').forEach((card) => {
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
    ...result.heroStarsBreakdown.map((entry) => [
      `${message.heroLabel.replace('{n}', String(entry.index + 1))} — ${message.heroStarsTrackLabel}`,
      heroStarsLevelLabel(entry.currentIndex, planner, message),
      heroStarsLevelLabel(entry.targetIndex, planner, message),
      formatCost(entry.cost, planner),
    ]),
    ...result.exclusiveEquipmentBreakdown.map((entry) => [
      `${message.heroLabel.replace('{n}', String(entry.index + 1))} — ${message.exclusiveEquipmentTrackLabel}`,
      exclusiveEquipmentLevelLabel(entry.currentIndex, message),
      exclusiveEquipmentLevelLabel(entry.targetIndex, message),
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
