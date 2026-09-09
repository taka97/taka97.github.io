import { calculateBuildingRequirements, createPlanner, formatNumber } from './planner-core.js';
import { createProfileStore, getToolData, updateToolData } from './storage.js';

const BUILDING_TRANSLATIONS = {
  'warden-office': 'Văn phòng Giám ngục',
  'shieldbearer-barrack': 'Doanh trại Khiên binh',
  'boomer-barrack': 'Doanh trại Boomer',
  'shooter-barrack': 'Doanh trại Xạ thủ',
  'communication-center': 'Trung tâm Liên lạc',
  'command-center': 'Trung tâm Chỉ huy',
  'medical-station': 'Trạm Y tế',
};

const CHART_COLORS = ['#2d6a8f', '#d97706', '#7c3f8c', '#2f855a', '#c05621', '#556cd6', '#9b2c2c'];

const MESSAGES = {
  en: {
    noProfile: 'Create or select an active profile in Settings before planning.',
    storage: 'Browser storage is unavailable. Your calculations will still work.',
    range: 'Choose a target Base that is not lower than the current Base.',
    inventory: 'Enter a whole number of FC or AFC that is zero or greater.',
    noTarget: 'No target selected',
    noTargets: 'No target selected yet. Choose a target Base for a building to see the Core you need.',
    notSet: 'Not set',
    covered: 'Target covered',
    missing: '{amount} missing',
    surplus: '{amount} surplus',
  },
  vi: {
    noProfile: 'Hãy tạo hoặc chọn hồ sơ đang dùng trong Cài đặt trước khi lập kế hoạch.',
    storage: 'Không thể dùng bộ nhớ trình duyệt. Bạn vẫn có thể tính toán.',
    range: 'Chọn Base mục tiêu không thấp hơn Base hiện tại.',
    inventory: 'Hãy nhập số FC hoặc AFC nguyên lớn hơn hoặc bằng 0.',
    noTarget: 'Chưa chọn Base mục tiêu',
    noTargets: 'Chưa chọn Base mục tiêu. Hãy chọn Base mục tiêu cho một công trình để xem Lõi trọng giáp cần thiết.',
    notSet: 'Chưa nhập',
    covered: 'Đủ Lõi cho mục tiêu',
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
    return store.saveProfile(updateToolData(profile, 'forticlad', {
      ...getToolData(profile, 'forticlad'),
      ...changes,
    }));
  }

  function renderResult() {
    if (!profile) return;
    if (updateRangeWarnings(elements.buildingRanges, planner, language)) {
      clearSummary(elements);
      clearElement(elements.stepBreakdown);
      clearElement(elements.buildingTotals);
      clearElement(elements.coreChart);
      clearElement(elements.chartLegend);
      clearElement(elements.coverageChart);
      clearElement(elements.coverageLegend);
      elements.grandTotal.textContent = '—';
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
        setStatus(elements, '');
        return;
      }
      renderSteps(elements.stepBreakdown, result, planner, language);
      renderTotals(elements.buildingTotals, elements.grandTotal, result, planner, language, inventory, message);
      renderResourceBreakdown(elements.coreChart, elements.chartLegend, result, planner, language, inventory);
      renderResourceBreakdown(elements.coverageChart, elements.coverageLegend, result, planner, language, inventory, true);
      if (profile) setStatus(elements, '');
    } catch (error) {
      clearSummary(elements);
      clearElement(elements.stepBreakdown);
      clearElement(elements.buildingTotals);
      clearElement(elements.coreChart);
      clearElement(elements.chartLegend);
      clearElement(elements.coverageChart);
      clearElement(elements.coverageLegend);
      elements.grandTotal.textContent = '—';
      if (profile) setStatus(elements, error.message || message.range, true);
    }
  }
}

function getElements(container) {
  const find = (role) => container.querySelector(`[data-role="${role}"]`);
  return {
    activeProfile: find('active-profile'), fcOnHand: find('fc-on-hand'), afcOnHand: find('afc-on-hand'), buildingRanges: find('building-ranges'), status: find('status'),
    stepBreakdown: find('step-breakdown'), buildingTotals: find('building-totals'), grandTotal: find('grand-total'),
    summaryStock: find('summary-stock'), summaryRequired: find('summary-required'), summaryBalance: find('summary-balance'),
    coreChart: find('core-chart'), chartLegend: find('chart-legend'), coverageChart: find('coverage-chart'), coverageLegend: find('coverage-legend'),
  };
}

function buildingRanges(planner, savedData) {
  return Object.fromEntries(planner.buildingKeys.map((key) => {
    const savedRange = savedData?.buildingBases?.[key] ?? {};
    const legacyCurrent = savedData?.currentBase;
    const currentBase = validBase(planner, savedRange.currentBase) ? savedRange.currentBase
      : validBase(planner, legacyCurrent) ? legacyCurrent : planner.steps[0].base;
    const targetBase = validBase(planner, savedRange.targetBase) ? savedRange.targetBase : '';
    const currentIndex = planner.steps.findIndex((step) => step.base === currentBase);
    const targetIndex = planner.steps.findIndex((step) => step.base === targetBase);
    return [key, {
      currentBase,
      targetBase: targetIndex !== -1 && targetIndex < currentIndex ? '' : targetBase,
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
    const target = rangeLabel(targetLabel, 'target-base', planner.steps.slice(0, planner.baseIndexes.get(planner.maximumBases[key]) + 1), ranges[key].targetBase, disabled, MESSAGES[language].noTarget);
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

function renderSteps(container, result, planner, language) {
  const levels = planner.steps
    .map((step) => step.base)
    .filter((base) => result.steps.some((step) => step.base === base));
  const costs = new Map(result.steps.map((step) => [`${step.building}:${step.base}`, step]));
  const headers = [language === 'vi' ? 'Công trình' : 'Building', ...levels, language === 'vi' ? 'Tổng' : 'Total'];
  const rows = result.selectedBuildingKeys.map((key) => [
    buildingName(key, planner, language),
    ...levels.map((level) => {
      const cost = costs.get(`${key}:${level}`);
      return cost === undefined ? '—' : `${formatNumber(cost.fc)} / ${formatNumber(cost.afc)}`;
    }),
    formatNumber(result.totals[key]),
  ]);
  const table = createTable(headers, rows);
  table.className = 'forticlad-planner__breakdown-table';
  container.replaceChildren(table);
}

function renderTotals(container, grandTotal, result, planner, language, inventory, message) {
  const labels = language === 'vi'
    ? ['Công trình', 'FC cần', 'AFC cần', 'FC thiếu', 'AFC thiếu']
    : ['Building', 'FC required', 'AFC required', 'FC missing', 'AFC missing'];
  const rows = result.effectiveBuildingKeys.map((key) => {
    const fcMissing = inventoryValueFor(inventory.fc) === undefined ? '—' : formatNumber(Math.max(result.totals[key].fc - inventory.fc, 0));
    const afcMissing = inventoryValueFor(inventory.afc) === undefined ? '—' : formatNumber(Math.max(result.totals[key].afc - inventory.afc, 0));
    return [buildingName(key, planner, language), formatNumber(result.totals[key].fc), formatNumber(result.totals[key].afc), fcMissing, afcMissing];
  });
  const table = createTable(labels, rows);
  const footer = document.createElement('tfoot');
  footer.append(row([language === 'vi' ? 'Tất cả công trình' : 'All buildings', formatNumber(result.resourceTotals.fc), formatNumber(result.resourceTotals.afc), missingValue(result.resourceTotals.fc, inventory.fc), missingValue(result.resourceTotals.afc, inventory.afc)], true));
  table.append(footer);
  container.replaceChildren(table);
  grandTotal.textContent = `${formatNumber(result.resourceTotals.fc)} FC / ${formatNumber(result.resourceTotals.afc)} AFC`;
}

function inventoryValueFor(value) { return Number.isInteger(value) && value >= 0 ? value : undefined; }
function missingValue(required, stock) { return inventoryValueFor(stock) === undefined ? '—' : formatNumber(Math.max(required - stock, 0)); }

function renderResourceBreakdown(container, legend, result, planner, language, inventory, coverage = false) {
  const values = coverage ? result.resourceTotals : result.resourceTotals;
  const title = language === 'vi' ? 'FC / AFC' : 'FC / AFC';
  const paragraph = document.createElement('p');
  paragraph.textContent = `${title}: ${formatNumber(values.fc)} / ${formatNumber(values.afc)}${coverage ? ` — ${language === 'vi' ? 'Kho' : 'Stock'} ${inventoryValueFor(inventory.fc) === undefined ? '—' : formatNumber(inventory.fc)} / ${inventoryValueFor(inventory.afc) === undefined ? '—' : formatNumber(inventory.afc)}` : ''}`;
  container.replaceChildren(paragraph);
  clearElement(legend);
}

function renderCoreChart(container, legend, result, planner, language) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', language === 'vi' ? 'Tỷ trọng Lõi trọng giáp cần thiết theo công trình' : 'Required Forticlad Core distribution by building');

  const circumference = 2 * Math.PI * 40;
  let offset = 0;
  const items = result.selectedBuildingKeys.map((key) => ({
    key,
    value: result.totals[key],
    color: CHART_COLORS[planner.buildingKeys.indexOf(key)],
  }));

  items.forEach((item) => {
    const length = result.grandTotal ? (item.value / result.grandTotal) * circumference : 0;
    const slice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    slice.setAttribute('cx', '50');
    slice.setAttribute('cy', '50');
    slice.setAttribute('r', '40');
    slice.setAttribute('fill', 'none');
    slice.setAttribute('stroke', item.color);
    slice.setAttribute('stroke-width', '20');
    slice.setAttribute('stroke-dasharray', `${length} ${circumference - length}`);
    slice.setAttribute('stroke-dashoffset', String(-offset));
    slice.setAttribute('transform', 'rotate(-90 50 50)');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${buildingName(item.key, planner, language)}: ${formatNumber(item.value)}`;
    slice.append(title);
    svg.append(slice);
    offset += length;
  });

  const center = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  center.setAttribute('x', '50');
  center.setAttribute('y', '52');
  center.setAttribute('text-anchor', 'middle');
  center.setAttribute('font-size', '9');
  center.textContent = formatNumber(result.grandTotal);
  svg.append(center);
  container.replaceChildren(svg);

  legend.replaceChildren(...items.map((item) => chartLegendItem(item, result.grandTotal, planner, language)));
}

function chartLegendItem(item, grandTotal, planner, language) {
  const entry = document.createElement('li');
  const swatch = document.createElement('span');
  swatch.className = 'forticlad-planner__chart-swatch';
  swatch.style.backgroundColor = item.color;
  const percentage = grandTotal ? `${((item.value / grandTotal) * 100).toFixed(1)}%` : '0%';
  entry.append(swatch, document.createTextNode(`${buildingName(item.key, planner, language)} — ${formatNumber(item.value)} (${percentage})`));
  return entry;
}

function renderCoverageChart(container, legend, result, coreOnHand, language) {
  const hasInventory = Number.isInteger(coreOnHand) && coreOnHand >= 0;
  if (!hasInventory) {
    const message = document.createElement('p');
    message.textContent = language === 'vi'
      ? 'Nhập số Lõi trọng giáp hiện có để xem mức đáp ứng.'
      : 'Enter your current Core amount to see coverage.';
    container.replaceChildren(message);
    clearElement(legend);
    return;
  }

  const required = result.grandTotal;
  const covered = Math.min(coreOnHand, required);
  const missing = Math.max(required - coreOnHand, 0);
  const coveragePercent = required ? (covered / required) * 100 : 100;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', language === 'vi'
    ? `${coveragePercent.toFixed(1)}% Lõi trọng giáp đáp ứng mục tiêu`
    : `${coveragePercent.toFixed(1)}% Forticlad Core coverage`);

  appendDonutSlice(svg, '#a32020', 1, 0);
  appendDonutSlice(svg, '#1d6b3b', required ? covered / required : 1, 0);

  const center = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  center.setAttribute('x', '50');
  center.setAttribute('y', '48');
  center.setAttribute('text-anchor', 'middle');
  center.setAttribute('font-size', '10');
  center.textContent = `${coveragePercent.toFixed(0)}%`;
  const caption = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  caption.setAttribute('x', '50');
  caption.setAttribute('y', '59');
  caption.setAttribute('text-anchor', 'middle');
  caption.setAttribute('font-size', '6');
  caption.textContent = language === 'vi' ? 'đáp ứng' : 'covered';
  svg.append(center, caption);
  container.replaceChildren(svg);

  legend.replaceChildren(
    coverageLegendItem('#1d6b3b', language === 'vi' ? 'Lõi đáp ứng mục tiêu' : 'Core covering target', covered),
    coverageLegendItem('#a32020', language === 'vi' ? 'Lõi còn thiếu' : 'Missing Core', missing),
    coverageLegendItem('#5d5d67', language === 'vi' ? 'Lõi hiện có' : 'Current Core', coreOnHand),
    coverageLegendItem('#5d5d67', language === 'vi' ? 'Lõi cần thiết' : 'Core required', required),
  );
}

function appendDonutSlice(svg, color, portion, offset) {
  const circumference = 2 * Math.PI * 40;
  const length = portion * circumference;
  const slice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  slice.setAttribute('cx', '50');
  slice.setAttribute('cy', '50');
  slice.setAttribute('r', '40');
  slice.setAttribute('fill', 'none');
  slice.setAttribute('stroke', color);
  slice.setAttribute('stroke-width', '20');
  slice.setAttribute('stroke-dasharray', `${length} ${circumference - length}`);
  slice.setAttribute('stroke-dashoffset', String(-offset * circumference));
  slice.setAttribute('transform', 'rotate(-90 50 50)');
  svg.append(slice);
}

function coverageLegendItem(color, label, value) {
  const entry = document.createElement('li');
  const swatch = document.createElement('span');
  swatch.className = 'forticlad-planner__chart-swatch';
  swatch.style.backgroundColor = color;
  entry.append(swatch, document.createTextNode(`${label}: ${formatNumber(value)}`));
  return entry;
}

function renderSummary(elements, result, inventory, message) {
  const hasFc = inventoryValueFor(inventory.fc) !== undefined;
  const hasAfc = inventoryValueFor(inventory.afc) !== undefined;
  setSummaryValue(elements.summaryStock, `${hasFc ? formatNumber(inventory.fc) : message.notSet} FC / ${hasAfc ? formatNumber(inventory.afc) : message.notSet} AFC`, hasFc || hasAfc ? '' : 'is-unset');
  setSummaryValue(elements.summaryRequired, `${formatNumber(result.resourceTotals.fc)} FC / ${formatNumber(result.resourceTotals.afc)} AFC`);

  if (result.selectedBuildingKeys.length === 0) {
    setSummaryValue(elements.summaryBalance, message.noTarget, 'is-unset');
    return;
  }
  if (!hasFc && !hasAfc) {
    setSummaryValue(elements.summaryBalance, message.notSet, 'is-unset');
    return;
  }

  const fcDifference = hasFc ? inventory.fc - result.resourceTotals.fc : null;
  const afcDifference = hasAfc ? inventory.afc - result.resourceTotals.afc : null;
  const summary = [fcDifference === null ? 'FC —' : fcDifference < 0 ? `FC ${message.missing.replace('{amount}', formatNumber(Math.abs(fcDifference)))}` : fcDifference > 0 ? `FC ${message.surplus.replace('{amount}', formatNumber(fcDifference))}` : 'FC covered', afcDifference === null ? 'AFC —' : afcDifference < 0 ? `AFC ${message.missing.replace('{amount}', formatNumber(Math.abs(afcDifference)))}` : afcDifference > 0 ? `AFC ${message.surplus.replace('{amount}', formatNumber(afcDifference))}` : 'AFC covered'];
  setSummaryValue(elements.summaryBalance, summary.join(' / '), fcDifference < 0 || afcDifference < 0 ? 'is-missing' : 'is-complete');
}

function renderEmptyResults(elements, message) {
  const emptyState = () => {
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    return paragraph;
  };
  elements.stepBreakdown.replaceChildren(emptyState());
  elements.buildingTotals.replaceChildren(emptyState());
  elements.grandTotal.textContent = '—';
  elements.coreChart.replaceChildren(emptyState());
  elements.coverageChart.replaceChildren(emptyState());
  clearElement(elements.chartLegend);
  clearElement(elements.coverageLegend);
}

function clearSummary(elements) {
  [elements.summaryStock, elements.summaryRequired, elements.summaryBalance].forEach((output) => setSummaryValue(output, '—'));
}

function setSummaryValue(output, value, state = '') {
  output.textContent = value;
  output.classList.remove('is-complete', 'is-missing', 'is-surplus', 'is-unset');
  if (state) output.classList.add(state);
}

function createTable(headers, rows) {
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach((header) => {
    const headerCell = cell('th', header);
    headerCell.scope = 'col';
    headerRow.append(headerCell);
  });
  head.append(headerRow);
  const body = document.createElement('tbody');
  rows.forEach((values) => body.append(row(values, true)));
  table.append(head, body);
  return table;
}

function row(values, rowHeader = false) {
  const element = document.createElement('tr');
  values.forEach((value, index) => {
    const rowCell = cell(rowHeader && index === 0 ? 'th' : 'td', value);
    if (rowHeader && index === 0) rowCell.scope = 'row';
    element.append(rowCell);
  });
  return element;
}

function cell(tag, value) {
  const element = document.createElement(tag);
  element.textContent = value;
  return element;
}

function buildingName(key, planner, language) {
  return language === 'vi' ? BUILDING_TRANSLATIONS[key] : planner.buildings[key].label;
}

function setStatus(elements, value, isError = false) {
  elements.status.textContent = value;
  elements.status.classList.toggle('is-error', isError);
}

function clearElement(element) {
  element.replaceChildren();
}
