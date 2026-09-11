export function createTable(headers, rows) {
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

export function row(values, rowHeader = false) {
  const element = document.createElement('tr');
  values.forEach((value, index) => {
    const rowCell = cell(rowHeader && index === 0 ? 'th' : 'td', value);
    if (rowHeader && index === 0) rowCell.scope = 'row';
    element.append(rowCell);
  });
  return element;
}

export function cell(tag, value) {
  const element = document.createElement(tag);
  if (value instanceof Node) element.append(value);
  else element.textContent = value;
  return element;
}

export function clearElement(element) {
  element.replaceChildren();
}

export function inventoryValueFor(value) {
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

export function missingValue(required, stock, formatNumber) {
  return inventoryValueFor(stock) === undefined ? '—' : formatNumber(Math.max(required - stock, 0));
}

export function setSummaryValue(output, value, state = '') {
  output.textContent = value;
  output.classList.remove('is-complete', 'is-missing', 'is-surplus', 'is-unset');
  if (state) output.classList.add(state);
}

export function setStatus(statusElement, value, isError = false) {
  if (!statusElement) return;
  statusElement.textContent = value;
  statusElement.classList.toggle('is-error', isError);
}

export function targetCell(name, isAuto, autoLabel) {
  if (!isAuto) return name;
  const fragment = document.createDocumentFragment();
  fragment.append(`${name} `);
  const tag = document.createElement('span');
  tag.className = 'loj-planner__auto-tag';
  tag.textContent = autoLabel;
  fragment.append(tag);
  return fragment;
}

export function grandTotalFooter(table, label, costText) {
  const footer = document.createElement('tfoot');
  const footerRow = document.createElement('tr');
  const labelCell = document.createElement('th');
  labelCell.scope = 'row';
  labelCell.colSpan = 3;
  labelCell.className = 'loj-planner__grand-total-label';
  labelCell.textContent = label;
  const costCell = document.createElement('td');
  costCell.textContent = costText;
  footerRow.append(labelCell, costCell);
  footer.append(footerRow);
  table.append(footer);
}

const ROMAN_NUMERALS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

export function toRoman(value) {
  if (!Number.isInteger(value) || value <= 0) return String(value);
  let remaining = value;
  let result = '';
  for (const [amount, numeral] of ROMAN_NUMERALS) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

export function resourceIcon(resource, className) {
  if (!resource.icon) return null;
  const img = document.createElement('img');
  img.className = className;
  img.src = resource.icon;
  img.alt = '';
  return img;
}

export function updateStickyBar(container, resources, totals, stock, stickyBarLabel, formatNumber) {
  const chips = totals
    ? resources
        .filter((resource) => Number.isInteger(stock[resource.key]))
        .map((resource) => ({ resource, missing: Math.max(totals[resource.key] - stock[resource.key], 0) }))
        .filter((entry) => entry.missing > 0)
    : [];
  if (chips.length === 0) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }
  const fragment = document.createDocumentFragment();
  const summaryParts = [];
  chips.forEach(({ resource, missing }) => {
    const chip = document.createElement('span');
    chip.className = 'loj-planner__sticky-chip';
    const icon = resourceIcon(resource, 'loj-planner__sticky-chip-icon');
    if (icon) chip.append(icon);
    const text = `${resource.label}: ${formatNumber(missing)}`;
    chip.append(document.createTextNode(text));
    summaryParts.push(text);
    fragment.append(chip);
  });
  container.replaceChildren(fragment);
  container.hidden = false;
  container.setAttribute('aria-label', `${stickyBarLabel} ${summaryParts.join(', ')}`);
}

export function renderInstanceBadge(badgeElement, hasTarget, targetSetLabel, noTargetLabel) {
  if (!badgeElement) return;
  badgeElement.textContent = hasTarget ? targetSetLabel : noTargetLabel;
  badgeElement.classList.toggle('is-target-set', hasTarget);
  badgeElement.classList.toggle('is-no-target', !hasTarget);
}

export function renderEstimatedBadge(container, isEstimated, label, noteText) {
  container.replaceChildren();
  if (!isEstimated) return;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'loj-planner__estimated-tag';
  toggle.textContent = '≈';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', label);
  const note = document.createElement('span');
  note.className = 'loj-planner__estimated-note';
  note.textContent = noteText;
  note.hidden = true;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    note.hidden = expanded;
  });
  container.append(toggle, note);
}

export function renderMissingCard(neededOutput, missingOutput, required, stock, hasTarget, message, formatNumber) {
  if (!hasTarget) {
    setSummaryValue(neededOutput, '—');
    setSummaryValue(missingOutput, message.noTarget, 'is-unset');
    return;
  }
  setSummaryValue(neededOutput, message.needed.replace('{amount}', formatNumber(required)));
  if (inventoryValueFor(stock) === undefined) {
    setSummaryValue(missingOutput, message.notSet, 'is-unset');
    return;
  }
  const difference = stock - required;
  if (difference < 0) setSummaryValue(missingOutput, message.missing.replace('{amount}', formatNumber(-difference)), 'is-missing');
  else if (difference > 0) setSummaryValue(missingOutput, message.surplus.replace('{amount}', formatNumber(difference)), 'is-surplus');
  else setSummaryValue(missingOutput, message.covered, 'is-complete');
}
