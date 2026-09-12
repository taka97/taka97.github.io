import { createRobotsSatellitesPlanner, calculateRobotsSatellitesRequirements, formatNumber, resolveLevelIndex } from './robots-satellites-core.js';
import { localizeResources, resolveLocalizedLabel } from './localized-label.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setStatus as setStatusElement, renderMissingCard, grandTotalFooter, updateStickyBar, renderInstanceBadge, renderEstimatedBadge, resourceIcon, formatStockInputValue, parseStockInputValue, wireStockInputFormatting } from './table-helpers.js';

const SATELLITE_TIER_KEYS = ['R', 'SR', 'SSR'];

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target level that is not lower than the current level.',
    inventory: 'Enter a whole number that is zero or greater.',
    noTargets: "No target selected yet. Choose a target level for a Robot or Satellite to see what you're missing.",
    notSet: 'Not set',
    covered: 'Covered',
    needed: '{amount} needed',
    missing: 'Missing {amount}',
    surplus: 'Surplus {amount}',
    robotLabel: 'Robot {n}',
    notStarted: 'Not started',
    noTarget: 'No target',
    levelPrefix: 'Level',
    maxedSuffix: ' (maxed)',
    currentLabel: 'Current level',
    targetLabel: 'Target level',
    resetLabel: 'Reset to default',
    resetConfirmLabel: 'Click again to confirm reset',
    stickyBarLabel: 'Missing:',
    targetSetLabel: 'Target set',
    estimatedLabel: 'Estimated cost',
    estimatedNote: 'This step includes at least one unconfirmed source figure.',
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn cấp mục tiêu không thấp hơn cấp hiện tại.',
    inventory: 'Hãy nhập số nguyên lớn hơn hoặc bằng 0.',
    noTargets: 'Chưa chọn mục tiêu. Hãy chọn cấp mục tiêu cho một Robot hoặc Satellite để xem bạn còn thiếu gì.',
    notSet: 'Chưa nhập',
    covered: 'Đã đủ',
    needed: 'Cần {amount}',
    missing: 'Còn thiếu {amount}',
    surplus: 'Dư {amount}',
    robotLabel: 'Robot {n}',
    notStarted: 'Chưa bắt đầu',
    noTarget: 'Chưa chọn',
    levelPrefix: 'Cấp',
    maxedSuffix: ' (đã tối đa)',
    currentLabel: 'Cấp hiện tại',
    targetLabel: 'Cấp mục tiêu',
    resetLabel: 'Khôi phục mặc định',
    resetConfirmLabel: 'Bấm lần nữa để xác nhận',
    stickyBarLabel: 'Còn thiếu:',
    targetSetLabel: 'Đã đặt mục tiêu',
    estimatedLabel: 'Chi phí ước tính',
    estimatedNote: 'Bước này có ít nhất một số liệu nguồn chưa được xác nhận.',
  },
};

const root = document.querySelector('[data-robots-satellites-planner]');

if (root) initializeRobotsSatellitesPlanner(root);

async function initializeRobotsSatellitesPlanner(container) {
  const language = container.dataset.lang === 'vi' ? 'vi' : 'en';
  const message = MESSAGES[language];
  const elements = getElements(container);
  let planner;
  let store = null;
  let profile = null;
  let storageUnavailable = false;

  try {
    planner = createRobotsSatellitesPlanner(JSON.parse(document.querySelector('#robots-satellites-data').textContent));
    planner.resources = localizeResources(planner.resources, language);
  } catch (error) {
    setStatus(elements, error.message, true);
    return;
  }

  SATELLITE_TIER_KEYS.forEach((tierKey) => {
    elements.tierBadges[tierKey]?.style.setProperty('--badge-color', planner.satelliteTiers[tierKey].badge);
  });

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
  let robotInstances = [{ currentIndex: 0, targetIndex: 0 }];
  let satelliteState = defaultSatelliteState(planner);

  if (profile) {
    elements.activeProfile.textContent = `${profile.server} — ${profile.name}`;
    const toolData = getToolData(profile, 'robots-satellites');
    stock = sanitizeStock(toolData.stock, planner);
    robotInstances = sanitizeRobotInstances(toolData.robots, planner);
    satelliteState = sanitizeSatelliteState(toolData.satellites, planner);
  } else {
    elements.activeProfile.textContent = language === 'vi' ? 'Chưa chọn hồ sơ.' : 'No active profile selected.';
    if (!storageUnavailable) setStatus(elements, message.noProfile, true);
  }

  renderStockInputs();
  renderRobotSection();
  SATELLITE_TIER_KEYS.forEach((tierKey) => renderSatelliteTierSection(tierKey));
  updateAddButtonState();
  elements.reset.disabled = disabled;
  renderResult();

  elements.robotsList.addEventListener('change', handleInstanceChange);
  SATELLITE_TIER_KEYS.forEach((tierKey) => {
    elements.satelliteLists[tierKey].addEventListener('change', handleInstanceChange);
  });
  elements.stockInputs.forEach((input) => {
    input.addEventListener('change', handleStockChange);
    wireStockInputFormatting(input, (key) => stock[key], formatNumber);
  });
  elements.addRobot.addEventListener('click', handleAddRobot);
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
        await persist({ robots: toRobotStorageState(robotInstances, planner), satellites: toSatelliteStorageState(satelliteState, planner) });
      } catch (error) {
        setStatus(elements, error.message || message.storage, true);
      }
    }
    renderResult();
  }

  function commitStateFromDom() {
    robotInstances = readCardState(elements.robotsList).map(({ currentIndex, targetIndex }) => ({ currentIndex, targetIndex }));
    const updated = { ...satelliteState };
    SATELLITE_TIER_KEYS.forEach((tierKey) => {
      readCardState(elements.satelliteLists[tierKey]).forEach(({ key, currentIndex, targetIndex }) => {
        updated[key] = { currentIndex, targetIndex };
      });
    });
    satelliteState = updated;
  }

  async function handleAddRobot() {
    if (!profile) return;
    disarmReset();
    if (robotInstances.length >= planner.caps.robots) return;
    robotInstances = [...robotInstances, { currentIndex: 0, targetIndex: 0 }];
    renderRobotSection();
    updateAddButtonState();
    try {
      await persist({ robots: toRobotStorageState(robotInstances, planner) });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
    renderResult();
  }

  function renderRobotSection() {
    const defaultMaxIndex = planner.robotLevels.length - 1;
    const cards = robotInstances.map((instance, index) => ({
      key: String(index),
      headingText: message.robotLabel.replace('{n}', String(index + 1)),
      currentIndex: instance.currentIndex,
      targetIndex: instance.targetIndex,
      maxIndex: planner.robotSlotMaxIndex[index] ?? defaultMaxIndex,
      labelFn: (levelIndex) => levelLabel(planner.robotLevels[levelIndex].id, message),
    }));
    renderInstanceCards(elements.robotsList, 'robot', cards, disabled, message);
  }

  function renderSatelliteTierSection(tierKey) {
    const maxIndex = planner.satelliteTiers[tierKey].levels.length - 1;
    const cards = planner.satellites
      .filter((satellite) => satellite.tier === tierKey)
      .map((satellite) => ({
        key: satellite.id,
        headingText: resolveLocalizedLabel(satellite.label, language, satellite.id),
        currentIndex: satelliteState[satellite.id].currentIndex,
        targetIndex: satelliteState[satellite.id].targetIndex,
        maxIndex,
        labelFn: (levelIndex) => levelLabel(planner.satelliteTiers[tierKey].levels[levelIndex].id, message),
      }));
    renderInstanceCards(elements.satelliteLists[tierKey], `sat-${tierKey}`, cards, disabled, message);
  }

  function updateAddButtonState() {
    elements.addRobot.disabled = disabled || robotInstances.length >= planner.caps.robots;
  }

  function validateAllLists() {
    const robotsInvalid = updateRangeWarnings(elements.robotsList, message);
    const satellitesInvalid = SATELLITE_TIER_KEYS.map((tierKey) => updateRangeWarnings(elements.satelliteLists[tierKey], message)).some(Boolean);
    return robotsInvalid || satellitesInvalid;
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
    robotInstances = [{ currentIndex: 0, targetIndex: 0 }];
    satelliteState = defaultSatelliteState(planner);
    renderStockInputs();
    renderRobotSection();
    SATELLITE_TIER_KEYS.forEach((tierKey) => renderSatelliteTierSection(tierKey));
    updateAddButtonState();
    try {
      await persist({ stock, robots: toRobotStorageState(robotInstances, planner), satellites: toSatelliteStorageState(satelliteState, planner) });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
      return;
    }
    renderResult();
  }

  async function persist(changes) {
    const latest = (await store.listProfiles()).find((item) => item.id === profile.id) ?? profile;
    profile = await store.saveProfile(updateToolData(latest, 'robots-satellites', {
      ...getToolData(latest, 'robots-satellites'),
      ...changes,
    }));
  }

  function renderResult() {
    if (!profile) return;
    const invalid = validateAllLists();
    if (invalid) {
      clearElement(elements.missingGrid);
      clearElement(elements.totals);
      updateStickyBar(elements.stickyBar, planner.resources, null, stock, message.stickyBarLabel, formatNumber);
      setStatus(elements, message.range, true);
      return;
    }
    try {
      const result = calculateRobotsSatellitesRequirements(planner, robotInstances, satelliteState);
      renderMissingSummary(elements.missingGrid, result.totals, stock, message, planner);
      const totalRows = result.robotBreakdown.length + result.satelliteBreakdown.length;
      if (totalRows === 0) {
        renderEmptyResults(elements.totals, message.noTargets);
      } else {
        renderBreakdownTable(elements.totals, result, planner, language, message);
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
    robotsList: find('robots-list'),
    addRobot: find('add-robot'),
    satelliteLists: { R: find('satellites-r-list'), SR: find('satellites-sr-list'), SSR: find('satellites-ssr-list') },
    tierBadges: { R: find('tier-badge-r'), SR: find('tier-badge-sr'), SSR: find('tier-badge-ssr') },
    reset: find('reset'),
    status: find('status'),
    stickyBar: find('sticky-bar'),
    summaryHeading: container.querySelector('[data-role="summary-heading"]'),
  };
}

function defaultSatelliteState(planner) {
  return Object.fromEntries(planner.satellites.map((satellite) => [satellite.id, { currentIndex: 0, targetIndex: 0 }]));
}

function sanitizeStock(stock, planner) {
  const result = {};
  planner.resources.forEach((resource) => {
    if (Number.isInteger(stock?.[resource.key]) && stock[resource.key] >= 0) result[resource.key] = stock[resource.key];
  });
  return result;
}

const ROBOT_KEY_PREFIX = 'robot_';

function robotKey(index) {
  return `${ROBOT_KEY_PREFIX}${index + 1}`;
}

// Robot slots are persisted as an object keyed by stable "robot_N" ids (1-based,
// matching the "Robot N" label and slot number used by robotSlotCaps) instead of
// array position, so a slot can be linked to from outside the planner. Slots are
// never removed once added, but gaps are still tolerated defensively: missing
// slots up to the highest one present fall back to the baseline level. Profiles
// saved before this refactor used a plain array; run the standalone
// migrate-robot-storage-keys console script once against existing profiles to
// convert those — this function only understands the keyed shape.
function sanitizeRobotInstances(stored, planner) {
  const entries = parseStoredRobots(stored, planner.caps.robots);
  const source = entries.length > 0 ? entries : [{ currentLevelId: 'not_started', targetLevelId: null }];
  const defaultMaxIndex = planner.robotLevels.length - 1;
  return source.map((instance, index) => {
    const maxIndex = planner.robotSlotMaxIndex[index] ?? defaultMaxIndex;
    const currentIndex = Math.min(resolveLevelIndex(planner.robotLevels, instance?.currentLevelId), maxIndex);
    const targetIndex = instance?.targetLevelId ? Math.min(resolveLevelIndex(planner.robotLevels, instance.targetLevelId), maxIndex) : 0;
    return { currentIndex, targetIndex };
  });
}

function parseStoredRobots(stored, capsRobots) {
  if (!stored || typeof stored !== 'object') return [];
  const bySlot = {};
  let maxSlot = 0;
  Object.keys(stored).forEach((key) => {
    if (!key.startsWith(ROBOT_KEY_PREFIX)) return;
    const slot = Number(key.slice(ROBOT_KEY_PREFIX.length));
    if (!Number.isInteger(slot) || slot < 1 || slot > capsRobots) return;
    bySlot[slot] = stored[key];
    if (slot > maxSlot) maxSlot = slot;
  });
  return Array.from({ length: maxSlot }, (_, index) => bySlot[index + 1] ?? { currentLevelId: 'not_started', targetLevelId: null });
}

// Reverse of sanitizeRobotInstances: converts in-memory index-based instances back
// to the "robot_N"-keyed, stable-id shape right before persisting.
function toRobotStorageState(robotInstances, planner) {
  return Object.fromEntries(robotInstances.map((instance, index) => [
    robotKey(index),
    {
      currentLevelId: planner.robotLevels[instance.currentIndex].id,
      targetLevelId: instance.targetIndex ? planner.robotLevels[instance.targetIndex].id : null,
    },
  ]));
}

// Satellite level progress is persisted as a stable `currentLevelId`/`targetLevelId`
// (see robots_satellites.yml), not an array index — this resolves those ids back to
// the positions the calc engine and rendering use internally for this session only.
function sanitizeSatelliteState(stored, planner) {
  const result = {};
  planner.satellites.forEach((satellite) => {
    const levels = planner.satelliteTiers[satellite.tier].levels;
    const entry = stored?.[satellite.id];
    result[satellite.id] = {
      currentIndex: resolveLevelIndex(levels, entry?.currentLevelId),
      targetIndex: entry?.targetLevelId ? resolveLevelIndex(levels, entry.targetLevelId) : 0,
    };
  });
  return result;
}

// Reverse of sanitizeSatelliteState: converts the in-memory index-based state back
// to stable ids right before persisting, so nothing index-shaped ever reaches storage.
function toSatelliteStorageState(satelliteState, planner) {
  const result = {};
  planner.satellites.forEach((satellite) => {
    const levels = planner.satelliteTiers[satellite.tier].levels;
    const state = satelliteState[satellite.id];
    result[satellite.id] = {
      currentLevelId: levels[state.currentIndex].id,
      targetLevelId: state.targetIndex ? levels[state.targetIndex].id : null,
    };
  });
  return result;
}

// Shared by robots and satellites — both use the same "not_started" baseline id
// and the same "level_N" / "level_N_maxed" scheme for every other level.
function levelLabel(id, message) {
  if (id === 'not_started') return message.notStarted;
  const isMaxed = id.endsWith('_maxed');
  const levelNumber = id.slice('level_'.length, isMaxed ? -'_maxed'.length : undefined);
  return `${message.levelPrefix} ${levelNumber}${isMaxed ? message.maxedSuffix : ''}`;
}

function buildLevelOptions(maxIndex, labelFn, zeroLabelOverride) {
  const options = [];
  for (let index = 0; index <= maxIndex; index += 1) {
    options.push(new Option(index === 0 && zeroLabelOverride !== undefined ? zeroLabelOverride : labelFn(index), String(index)));
  }
  return options;
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
    currentSelect.replaceChildren(...buildLevelOptions(entry.maxIndex, entry.labelFn));
    currentSelect.value = String(entry.currentIndex);
    currentLabel.append(currentSelect);

    const targetLabel = document.createElement('label');
    targetLabel.textContent = message.targetLabel;
    const targetSelect = document.createElement('select');
    targetSelect.dataset.role = 'target-level';
    targetSelect.disabled = disabled;
    targetSelect.replaceChildren(...buildLevelOptions(entry.maxIndex, entry.labelFn, message.noTarget));
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
  if (Number(targetSelect.value) && Number(targetSelect.value) < Number(currentSelect.value)) targetSelect.value = currentSelect.value;
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

function renderBreakdownTable(container, result, planner, language, message) {
  const labels = language === 'vi' ? ['Mục tiêu', 'Từ', 'Đến', 'Chi phí'] : ['Target', 'From', 'To', 'Cost'];
  const rows = [
    ...result.robotBreakdown.map((entry) => [
      message.robotLabel.replace('{n}', String(entry.index + 1)),
      levelLabel(planner.robotLevels[entry.currentIndex].id, message),
      levelLabel(planner.robotLevels[entry.targetIndex].id, message),
      formatCostCell(entry, planner, message),
    ]),
    ...result.satelliteBreakdown.map((entry) => [
      satelliteRowLabel(entry.id, planner, language),
      levelLabel(planner.satelliteTiers[entry.tier].levels[entry.currentIndex].id, message),
      levelLabel(planner.satelliteTiers[entry.tier].levels[entry.targetIndex].id, message),
      formatCostCell(entry, planner, message),
    ]),
  ];
  const table = createTable(labels, rows);
  table.className = 'loj-planner__breakdown-table';
  grandTotalFooter(table, language === 'vi' ? 'Tổng cộng' : 'Grand total', formatCost(result.totals, planner));
  container.replaceChildren(table);
}

function satelliteRowLabel(id, planner, language) {
  const satellite = planner.satellites.find((entry) => entry.id === id);
  return resolveLocalizedLabel(satellite?.label, language, id);
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

function setStatus(elements, value, isError = false) {
  setStatusElement(elements.status, value, isError);
}
