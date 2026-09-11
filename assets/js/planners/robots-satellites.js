import { createRobotsSatellitesPlanner, calculateRobotsSatellitesRequirements, formatNumber } from './robots-satellites-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';
import { createTable, clearElement, setStatus as setStatusElement, renderMissingCard, grandTotalFooter, updateStickyBar, renderInstanceBadge, renderEstimatedBadge } from './table-helpers.js';

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
    currentLabel: 'Current level',
    targetLabel: 'Target level',
    resetLabel: 'Reset to default',
    resetConfirmLabel: 'Click again to confirm reset',
    stickyBarLabel: 'Missing:',
    targetSetLabel: 'Target set',
    estimatedLabel: 'Estimated cost',
    estimatedNote: 'This step includes at least one unconfirmed source figure.',
    satelliteLabels: {
      sat_r_laser: 'Laser',
      sat_r_observateur: 'Watcher',
      sat_r_radiance: 'Radiance',
      sat_sr_arbitre: 'Arbitrator',
      sat_sr_sentinelle: 'Sentinel',
      sat_ssr_domaine_omniscient: 'Omniscient Domain',
      sat_ssr_nexus_celeste: 'Sky Nexus',
      sat_ssr_argus: 'Argus',
      sat_ssr_polaris: 'Polaris',
    },
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
    currentLabel: 'Cấp hiện tại',
    targetLabel: 'Cấp mục tiêu',
    resetLabel: 'Khôi phục mặc định',
    resetConfirmLabel: 'Bấm lần nữa để xác nhận',
    stickyBarLabel: 'Còn thiếu:',
    targetSetLabel: 'Đã đặt mục tiêu',
    estimatedLabel: 'Chi phí ước tính',
    estimatedNote: 'Bước này có ít nhất một số liệu nguồn chưa được xác nhận.',
    satelliteLabels: {
      sat_r_laser: 'Laser',
      sat_r_observateur: 'Watcher',
      sat_r_radiance: 'Radiance',
      sat_sr_arbitre: 'Arbitrator',
      sat_sr_sentinelle: 'Sentinel',
      sat_ssr_domaine_omniscient: 'Omniscient Domain',
      sat_ssr_nexus_celeste: 'Sky Nexus',
      sat_ssr_argus: 'Argus',
      sat_ssr_polaris: 'Polaris',
    },
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
  elements.stockInputs.forEach((input) => input.addEventListener('change', handleStockChange));
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
        await persist({ robots: robotInstances, satellites: satelliteState });
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
      await persist({ robots: robotInstances });
    } catch (error) {
      setStatus(elements, error.message || message.storage, true);
    }
    renderResult();
  }

  function renderRobotSection() {
    const maxIndex = planner.robotLevels.length - 1;
    const cards = robotInstances.map((instance, index) => ({
      key: String(index),
      headingText: message.robotLabel.replace('{n}', String(index + 1)),
      currentIndex: instance.currentIndex,
      targetIndex: instance.targetIndex,
      maxIndex,
      labelFn: (levelIndex) => robotLevelLabel(levelIndex, message),
    }));
    renderInstanceCards(elements.robotsList, 'robot', cards, disabled, message);
  }

  function renderSatelliteTierSection(tierKey) {
    const maxIndex = planner.satelliteTiers[tierKey].levels.length - 1;
    const cards = planner.satellites
      .filter((satellite) => satellite.tier === tierKey)
      .map((satellite) => ({
        key: satellite.id,
        headingText: message.satelliteLabels[satellite.labelKey] ?? satellite.labelKey,
        currentIndex: satelliteState[satellite.id].currentIndex,
        targetIndex: satelliteState[satellite.id].targetIndex,
        maxIndex,
        labelFn: (levelIndex) => satelliteLevelLabel(levelIndex, message),
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
      await persist({ stock, robots: robotInstances, satellites: satelliteState });
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
      elements.results.hidden = true;
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

function sanitizeRobotInstances(list, planner) {
  const maxIndex = planner.robotLevels.length - 1;
  const source = Array.isArray(list) && list.length > 0 ? list.slice(0, planner.caps.robots) : [{ currentIndex: 0, targetIndex: 0 }];
  return source.map((instance) => ({
    currentIndex: clampInstanceValue(instance?.currentIndex, maxIndex),
    targetIndex: clampInstanceValue(instance?.targetIndex, maxIndex),
  }));
}

function sanitizeSatelliteState(stored, planner) {
  const result = {};
  planner.satellites.forEach((satellite) => {
    const maxIndex = planner.satelliteTiers[satellite.tier].levels.length - 1;
    const entry = stored?.[satellite.id];
    result[satellite.id] = {
      currentIndex: clampInstanceValue(entry?.currentIndex, maxIndex),
      targetIndex: clampInstanceValue(entry?.targetIndex, maxIndex),
    };
  });
  return result;
}

function clampInstanceValue(value, maxIndex) {
  return Number.isInteger(value) && value >= 0 && value <= maxIndex ? value : 0;
}

function inventoryValue(input) {
  if (input.value === '') return null;
  const value = input.valueAsNumber;
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

function robotLevelLabel(index, message) {
  return index === 0 ? `${message.levelPrefix} 1` : `${message.levelPrefix} ${index * 10}`;
}

function satelliteLevelLabel(index, message) {
  return index === 0 ? message.notStarted : `${message.levelPrefix} ${index * 10}`;
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
    ...result.robotBreakdown.map((entry) => [
      message.robotLabel.replace('{n}', String(entry.index + 1)),
      robotLevelLabel(entry.currentIndex, message),
      robotLevelLabel(entry.targetIndex, message),
      formatCostCell(entry, planner, message),
    ]),
    ...result.satelliteBreakdown.map((entry) => [
      satelliteRowLabel(entry.id, planner, message),
      satelliteLevelLabel(entry.currentIndex, message),
      satelliteLevelLabel(entry.targetIndex, message),
      formatCostCell(entry, planner, message),
    ]),
  ];
  const table = createTable(labels, rows);
  table.className = 'loj-planner__breakdown-table';
  grandTotalFooter(table, language === 'vi' ? 'Tổng cộng' : 'Grand total', formatCost(result.totals, planner));
  container.replaceChildren(table);
}

function satelliteRowLabel(id, planner, message) {
  const satellite = planner.satellites.find((entry) => entry.id === id);
  return satellite ? message.satelliteLabels[satellite.labelKey] ?? satellite.labelKey : id;
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
