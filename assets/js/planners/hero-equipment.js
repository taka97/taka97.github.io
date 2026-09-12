import { createHeroEquipmentPlanner, calculateHeroEquipment, formatNumber } from './hero-equipment-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setStatus as setStatusElement, renderMissingCard, targetCell, grandTotalFooter, updateStickyBar, renderInstanceBadge, renderEstimatedBadge, resourceIcon, formatStockInputValue, parseStockInputValue, wireStockInputFormatting } from './table-helpers.js';

const TROOP_TRANSLATIONS = {
  shieldbearer: 'Khiên binh',
  bomber: 'Bomber',
  shooter: 'Xạ thủ',
};

const RARITY_TIER_LABELS = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  legendary_t1: 'Legendary T1',
  legendary_t2: 'Legendary T2',
  exotic: 'Exotic',
  exotic_t1: 'Exotic T1',
  exotic_t2: 'Exotic T2',
  exotic_t3: 'Exotic T3',
};

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target level that is not lower than the current level.',
    inventory: 'Enter a whole number that is zero or greater.',
    noTarget: 'No target',
    noTargets: "No target selected yet. Choose a target level for a Rarity or Mastery track to see what you're missing.",
    notSet: 'Not set',
    covered: 'Covered',
    needed: '{amount} needed',
    missing: 'Missing {amount}',
    surplus: 'Surplus {amount}',
    autoLabel: '(auto-added — prerequisite)',
    currentLabel: 'Current level',
    targetLabel: 'Target level',
    notStarted: 'Not started',
    levelPrefix: 'Level',
    levelsMaxedSuffix: ' (levels maxed)',
    resetLabel: 'Reset to default',
    resetConfirmLabel: 'Click again to confirm reset',
    stickyBarLabel: 'Missing:',
    targetSetLabel: 'Target set',
    estimatedLabel: 'Estimated cost',
    estimatedNote: 'This step includes at least one unconfirmed source figure.',
    rarityTrackLabel: 'Rarity',
    masteryTrackLabel: 'Mastery',
    slotLabels: { gloves: 'Gloves', helmet: 'Helm', chest: 'Outerwear', boots: 'Boots' },
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn cấp mục tiêu không thấp hơn cấp hiện tại.',
    inventory: 'Hãy nhập số nguyên lớn hơn hoặc bằng 0.',
    noTarget: 'Chưa chọn',
    noTargets: 'Chưa chọn mục tiêu. Hãy chọn cấp mục tiêu cho một nhánh Độ hiếm hoặc Tinh thông để xem bạn còn thiếu gì.',
    notSet: 'Chưa nhập',
    covered: 'Đã đủ',
    needed: 'Cần {amount}',
    missing: 'Còn thiếu {amount}',
    surplus: 'Dư {amount}',
    autoLabel: '(tự động thêm — điều kiện tiên quyết)',
    currentLabel: 'Cấp hiện tại',
    targetLabel: 'Cấp mục tiêu',
    notStarted: 'Chưa bắt đầu',
    levelPrefix: 'Cấp',
    levelsMaxedSuffix: ' (đã tối đa cấp độ)',
    resetLabel: 'Khôi phục mặc định',
    resetConfirmLabel: 'Bấm lần nữa để xác nhận',
    stickyBarLabel: 'Còn thiếu:',
    targetSetLabel: 'Đã đặt mục tiêu',
    estimatedLabel: 'Chi phí ước tính',
    estimatedNote: 'Bước này có ít nhất một số liệu nguồn chưa được xác nhận.',
    rarityTrackLabel: 'Độ hiếm',
    masteryTrackLabel: 'Tinh thông',
    slotLabels: { gloves: 'Găng tay', helmet: 'Mũ giáp', chest: 'Áo giáp', boots: 'Giày' },
  },
};

const root = document.querySelector('[data-hero-equipment-planner]');

if (root) initializeHeroEquipmentPlanner(root);

async function initializeHeroEquipmentPlanner(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const message = MESSAGES[language];
  const elements = getElements(container);
  let planner;
  let store = null;
  let profile = null;
  let storageUnavailable = false;

  try {
    planner = createHeroEquipmentPlanner(JSON.parse(document.querySelector('#hero-equipment-data').textContent));
  } catch (error) {
    setStatus(elements, error.message, true);
    return;
  }

  const rarityIndexById = new Map(planner.rarityLevels.map((level, index) => [level.id, index]));
  const rarityTargetIndices = planner.rarityLevels.map((level, index) => index).filter((index) => !planner.rarityLevels[index].id.endsWith('_s1'));

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
  let equipmentState = defaultEquipmentState(planner);

  if (profile) {
    elements.activeProfile.textContent = `${profile.server} — ${profile.name}`;
    const toolData = getToolData(profile, 'hero-equipment');
    stock = sanitizeStock(toolData.stock, planner);
    equipmentState = sanitizeEquipmentState(toolData.equipment, planner, rarityTargetIndices);
  } else {
    elements.activeProfile.textContent = language === 'vi' ? 'Chưa chọn hồ sơ.' : 'No active profile selected.';
    if (!storageUnavailable) setStatus(elements, message.noProfile, true);
  }

  renderStockInputs();
  renderEquipmentGroups();
  elements.reset.disabled = disabled;
  renderResult();

  elements.equipmentGroups.addEventListener('change', handleEquipmentChange);
  elements.stockInputs.forEach((input) => {
    input.addEventListener('change', handleStockChange);
    wireStockInputFormatting(input, (key) => stock[key], formatNumber);
  });
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
      input.value = formatStockInputValue(stock[key], formatNumber);
      input.disabled = disabled;
    });
  }

  async function handleStockChange(event) {
    if (!profile || !store) return;
    disarmReset();
    const key = event.target.dataset.resourceKey;
    const value = parseStockInputValue(event.target);
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

  async function handleEquipmentChange(event) {
    disarmReset();
    if (event.target.matches('[data-role="current-level"]')) {
      keepTargetAtOrAboveCurrent(event.target.closest('[data-cell-key]'));
    }
    if (updateRangeWarnings(elements.equipmentGroups, message)) {
      renderResult();
      return;
    }
    equipmentState = readEquipmentStateFromDom(elements.equipmentGroups, planner);
    if (profile && store) {
      try {
        await persist({ equipment: equipmentState });
      } catch (error) {
        setStatus(elements, error.message || message.storage, true);
      }
    }
    renderResult();
  }

  function renderEquipmentGroups() {
    renderTroopGroups(elements.equipmentGroups, planner, equipmentState, rarityTargetIndices, language, message, disabled);
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
    equipmentState = defaultEquipmentState(planner);
    renderStockInputs();
    renderEquipmentGroups();
    try {
      await persist({ stock, equipment: equipmentState });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
      return;
    }
    renderResult();
  }

  async function persist(changes) {
    const latest = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    profile = await store.saveProfile(updateToolData(latest, 'hero-equipment', {
      ...getToolData(latest, 'hero-equipment'),
      ...changes,
    }));
  }

  function renderResult() {
    if (!profile) return;
    const invalid = updateRangeWarnings(elements.equipmentGroups, message);
    if (invalid) {
      clearElement(elements.missingGrid);
      clearElement(elements.totals);
      updateStickyBar(elements.stickyBar, planner.resources, null, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, message.range, true);
      return;
    }
    try {
      const selections = toSelections(equipmentState, planner);
      const result = calculateHeroEquipment(planner, selections);
      renderMissingSummary(elements.missingGrid, result.totals, stock, message, planner);
      if (result.breakdown.length === 0) {
        renderEmptyResults(elements.totals, message.noTargets);
      } else {
        renderBreakdownTable(elements.totals, result, planner, rarityIndexById, language, message);
      }
      updateStickyBar(elements.stickyBar, planner.resources, result.totals, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, '');
    } catch (error) {
      clearElement(elements.missingGrid);
      clearElement(elements.totals);
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
    totals: find('totals'),
    equipmentGroups: find('equipment-groups'),
    reset: find('reset'),
    status: find('status'),
    stickyBar: find('sticky-bar'),
    summaryHeading: container.querySelector('[data-role="summary-heading"]'),
  };
}

function defaultEquipmentState(planner) {
  return Object.fromEntries(planner.troops.map((troop) => [troop, Object.fromEntries(planner.slots.map((slot) => [slot, defaultCellState()]))]));
}

function defaultCellState() {
  return { rarity: { currentIndex: 0, targetIndex: 0 }, mastery: { currentIndex: 0, targetIndex: 0 } };
}

function sanitizeStock(stock, planner) {
  const result = {};
  planner.resources.forEach((resource) => {
    if (Number.isInteger(stock?.[resource.key]) && stock[resource.key] >= 0) result[resource.key] = stock[resource.key];
  });
  return result;
}

function sanitizeEquipmentState(stored, planner, rarityTargetIndices) {
  const rarityMaxIndex = planner.rarityLevels.length - 1;
  const masteryMaxIndex = planner.masteryLevels.length - 1;
  return Object.fromEntries(planner.troops.map((troop) => [troop, Object.fromEntries(planner.slots.map((slot) => {
    const cell = stored?.[troop]?.[slot];
    return [slot, {
      rarity: {
        currentIndex: clampInstanceValue(cell?.rarity?.currentIndex, rarityMaxIndex),
        targetIndex: clampRarityTarget(cell?.rarity?.targetIndex, rarityTargetIndices),
      },
      mastery: {
        currentIndex: clampInstanceValue(cell?.mastery?.currentIndex, masteryMaxIndex),
        targetIndex: clampInstanceValue(cell?.mastery?.targetIndex, masteryMaxIndex),
      },
    }];
  }))]));
}

function clampInstanceValue(value, maxIndex) {
  return Number.isInteger(value) && value >= 0 && value <= maxIndex ? value : 0;
}

function clampRarityTarget(value, rarityTargetIndices) {
  return Number.isInteger(value) && rarityTargetIndices.includes(value) ? value : 0;
}

function toSelections(equipmentState, planner) {
  const selections = {};
  planner.troops.forEach((troop) => planner.slots.forEach((slot) => {
    selections[`${troop}-${slot}`] = equipmentState[troop][slot];
  }));
  return selections;
}

function rarityTierKey(id) {
  return id.endsWith('_s1') ? id.slice(0, -3) : id;
}

function rarityLevelLabel(index, planner, message) {
  const id = planner.rarityLevels[index].id;
  const label = RARITY_TIER_LABELS[rarityTierKey(id)] ?? rarityTierKey(id);
  return id.endsWith('_s1') ? `${label}${message.levelsMaxedSuffix}` : label;
}

function masteryLevelLabel(index, message) {
  return index === 0 ? message.notStarted : `${message.levelPrefix} ${index}`;
}

function buildOptionsForIndices(indices, labelFn, zeroLabelOverride) {
  return indices.map((index) => new Option(index === 0 && zeroLabelOverride !== undefined ? zeroLabelOverride : labelFn(index), String(index)));
}

function renderTroopGroups(container, planner, equipmentState, rarityTargetIndices, language, message, disabled) {
  const rarityAllIndices = planner.rarityLevels.map((level, index) => index);
  const masteryAllIndices = planner.masteryLevels.map((level, index) => index);
  const fragment = document.createDocumentFragment();

  planner.troops.forEach((troop) => {
    const group = document.createElement('details');
    group.className = 'loj-planner__group';
    group.open = true;
    const summary = document.createElement('summary');
    summary.textContent = troopName(troop, language);
    group.append(summary);

    planner.slots.forEach((slot) => {
      const cellKey = `${troop}-${slot}`;
      const heading = document.createElement('h4');
      heading.textContent = message.slotLabels[slot] ?? slot;
      group.append(heading);

      group.append(renderTrackRow(cellKey, 'rarity', {
        heading: message.rarityTrackLabel,
        currentIndices: rarityAllIndices,
        targetIndices: rarityTargetIndices,
        labelFn: (index) => rarityLevelLabel(index, planner, message),
        currentIndex: equipmentState[troop][slot].rarity.currentIndex,
        targetIndex: equipmentState[troop][slot].rarity.targetIndex,
      }, message, disabled));

      group.append(renderTrackRow(cellKey, 'mastery', {
        heading: message.masteryTrackLabel,
        currentIndices: masteryAllIndices,
        targetIndices: masteryAllIndices,
        labelFn: (index) => masteryLevelLabel(index, message),
        currentIndex: equipmentState[troop][slot].mastery.currentIndex,
        targetIndex: equipmentState[troop][slot].mastery.targetIndex,
      }, message, disabled));
    });

    fragment.append(group);
  });

  container.replaceChildren(fragment);
}

function renderTrackRow(cellKey, track, options, message, disabled) {
  const row = document.createElement('div');
  row.className = 'loj-planner__instance-range';
  row.dataset.cellKey = cellKey;
  row.dataset.track = track;
  const headingRow = document.createElement('div');
  headingRow.className = 'loj-planner__instance-heading';
  const rowHeading = document.createElement('h5');
  rowHeading.className = 'loj-planner__instance-label';
  rowHeading.textContent = options.heading;
  rowHeading.id = `he-${cellKey}-${track}`;
  row.setAttribute('role', 'group');
  row.setAttribute('aria-labelledby', rowHeading.id);

  const badge = document.createElement('span');
  badge.className = 'loj-planner__instance-badge';
  badge.dataset.role = 'instance-badge';
  renderInstanceBadge(badge, options.targetIndex !== 0, message.targetSetLabel, message.noTarget);
  headingRow.append(rowHeading, badge);

  const errorId = `he-range-error-${cellKey}-${track}`;
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
  currentSelect.replaceChildren(...buildOptionsForIndices(options.currentIndices, options.labelFn));
  currentSelect.value = String(options.currentIndex);
  currentLabel.append(currentSelect);

  const targetLabel = document.createElement('label');
  targetLabel.textContent = message.targetLabel;
  const targetSelect = document.createElement('select');
  targetSelect.dataset.role = 'target-level';
  targetSelect.disabled = disabled;
  targetSelect.replaceChildren(...buildOptionsForIndices(options.targetIndices, options.labelFn, message.noTarget));
  targetSelect.value = String(options.targetIndex);
  targetSelect.setAttribute('aria-describedby', errorId);
  targetLabel.append(targetSelect);

  row.append(headingRow, currentLabel, targetLabel, error);
  return row;
}

function readEquipmentStateFromDom(container, planner) {
  const state = {};
  planner.troops.forEach((troop) => {
    state[troop] = {};
    planner.slots.forEach((slot) => {
      const cellKey = `${troop}-${slot}`;
      state[troop][slot] = {
        rarity: readTrackState(container, cellKey, 'rarity'),
        mastery: readTrackState(container, cellKey, 'mastery'),
      };
    });
  });
  return state;
}

function readTrackState(container, cellKey, track) {
  const row = container.querySelector(`[data-cell-key="${cellKey}"][data-track="${track}"]`);
  return {
    currentIndex: Number(row.querySelector('[data-role="current-level"]').value),
    targetIndex: Number(row.querySelector('[data-role="target-level"]').value),
  };
}

function keepTargetAtOrAboveCurrent(row) {
  const currentSelect = row.querySelector('[data-role="current-level"]');
  const targetSelect = row.querySelector('[data-role="target-level"]');
  const currentIndex = Number(currentSelect.value);
  const targetIndex = Number(targetSelect.value);
  if (targetIndex === 0 || targetIndex >= currentIndex) return;
  if (row.dataset.track === 'rarity') {
    targetSelect.value = '0';
  } else {
    targetSelect.value = String(currentIndex);
  }
}

function updateRangeWarnings(container, message) {
  let hasInvalidRange = false;
  container.querySelectorAll('[data-cell-key]').forEach((row) => {
    const currentSelect = row.querySelector('[data-role="current-level"]');
    const targetSelect = row.querySelector('[data-role="target-level"]');
    const currentIndex = Number(currentSelect.value);
    const targetIndex = Number(targetSelect.value);
    const invalid = targetIndex !== 0 && targetIndex < currentIndex;
    const error = row.querySelector('[data-role="range-error"]');
    row.classList.toggle('is-invalid', invalid);
    targetSelect.setAttribute('aria-invalid', String(invalid));
    error.textContent = invalid ? message.range : '';
    error.hidden = !invalid;
    hasInvalidRange ||= invalid;
    renderInstanceBadge(row.querySelector('[data-role="instance-badge"]'), targetIndex !== 0, message.targetSetLabel, message.noTarget);
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
    const icon = resourceIcon(resource, 'loj-planner__missing-card-icon');
    if (icon) header.append(icon);
    header.append(document.createTextNode(resource.label));
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

function renderBreakdownTable(container, result, planner, rarityIndexById, language, message) {
  const labels = language === 'vi' ? ['Mục tiêu', 'Từ', 'Đến', 'Chi phí'] : ['Target', 'From', 'To', 'Cost'];
  const rows = result.breakdown.map((entry) => {
    const target = targetCell(rowLabel(entry, planner, language, message), entry.automatic, message.autoLabel);
    const levelLabel = entry.track === 'rarity'
      ? (id) => rarityLevelLabel(rarityIndexById.get(id), planner, message)
      : (id) => masteryLevelLabel(planner.masteryIndexById.get(id), message);
    return [target, levelLabel(entry.fromLevelId), levelLabel(entry.toLevelId), formatCostCell(entry, planner, message)];
  });
  const table = createTable(labels, rows);
  table.className = 'loj-planner__breakdown-table';
  grandTotalFooter(table, language === 'vi' ? 'Tổng cộng' : 'Grand total', formatCost(result.totals, planner));
  container.replaceChildren(table);
}

function rowLabel(entry, planner, language, message) {
  const trackLabel = entry.track === 'rarity' ? message.rarityTrackLabel : message.masteryTrackLabel;
  return `${troopName(entry.troop, language)} ${message.slotLabels[entry.slot] ?? entry.slot} — ${trackLabel}`;
}

function formatCostCell(entry, planner, message) {
  const text = formatCost(entry.cost, planner);
  if (!entry.estimated || entry.estimated.length === 0) return text;
  const fragment = document.createDocumentFragment();
  fragment.append(`${text} `);
  const badgeContainer = document.createElement('span');
  renderEstimatedBadge(badgeContainer, true, message.estimatedLabel, message.estimatedNote);
  fragment.append(badgeContainer);
  return fragment;
}

function formatCost(cost, planner) {
  const parts = planner.resources.filter((resource) => cost[resource.key] > 0).map((resource) => `${formatNumber(cost[resource.key])} ${resource.label}`);
  return parts.length ? parts.join(', ') : '—';
}

function troopName(troop, language) {
  return language === 'vi' ? TROOP_TRANSLATIONS[troop] : troop.charAt(0).toUpperCase() + troop.slice(1);
}

function setStatus(elements, value, isError = false) {
  setStatusElement(elements.status, value, isError);
}
