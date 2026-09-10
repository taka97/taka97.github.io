import { formatNumber } from './planner-core.js';

export { formatNumber };

const RESOURCE_KEYS = ['SealOfWisdom', 'SealOfKnowledge', 'CommonCoin', 'RareCoin', 'PreciousCoin', 'LegendaryCoin'];
const TOME_LEVEL_COUNT = 13;
const COLLECTION_LEVEL_COUNT = 43;

export function createTomesPlanner(data) {
  if (!data || !Array.isArray(data.tomeLevels) || !Array.isArray(data.collectionLevels) || !data.caps) {
    throw new TypeError('Tomes & Collections data is unavailable.');
  }
  if (data.tomeLevels.length !== TOME_LEVEL_COUNT) throw new TypeError(`Tomes & Collections data must contain exactly ${TOME_LEVEL_COUNT} tome levels.`);
  if (data.collectionLevels.length !== COLLECTION_LEVEL_COUNT) throw new TypeError(`Tomes & Collections data must contain exactly ${COLLECTION_LEVEL_COUNT} collection levels.`);

  const tomeLevels = data.tomeLevels.map((row, index) => normalizeCost(row, `tome level ${index}`));
  const collectionLevels = data.collectionLevels.map((row) => {
    if (typeof row.id !== 'string' || !row.id) throw new TypeError('Tomes & Collections data has a collection level with a missing id.');
    return { id: row.id, tier: row.tier, star: Number.isInteger(row.star) ? row.star : 0, cost: normalizeCost(row, `collection level ${row.id}`) };
  });
  const tiers = Array.isArray(data.collectionTiers) ? data.collectionTiers.map(normalizeTier) : [];
  const resources = Array.isArray(data.resources) ? data.resources.map(normalizeResource) : [];
  const caps = { tomes: positiveInteger(data.caps.tomes, 'caps.tomes'), collections: positiveInteger(data.caps.collections, 'caps.collections') };

  return { tomeLevels, collectionLevels, tiers, resources, caps };
}

export function calculateTomesRequirements(planner, tomeInstances, collectionInstances) {
  const totals = emptyResourceTotals();
  const tomeBreakdown = buildBreakdown(planner.tomeLevels, tomeInstances, totals);
  const collectionLevelCosts = planner.collectionLevels.map((level) => level.cost);
  const collectionBreakdown = buildBreakdown(collectionLevelCosts, collectionInstances, totals);
  return { totals, tomeBreakdown, collectionBreakdown };
}

function buildBreakdown(levelCosts, instances, totals) {
  const maxIndex = levelCosts.length - 1;
  const rows = [];
  instances.forEach((instance, index) => {
    const currentIndex = clampIndex(instance?.currentIndex, maxIndex, 0);
    const targetIndex = instance?.targetIndex ? clampIndex(instance.targetIndex, maxIndex, undefined) : 0;
    if (targetIndex && targetIndex < currentIndex) throw new RangeError('Choose a target level that is not lower than the current level.');
    if (!targetIndex || targetIndex <= currentIndex) return;
    const cost = sumCostRange(levelCosts, currentIndex + 1, targetIndex);
    addCost(totals, cost);
    rows.push({ index, currentIndex, targetIndex, cost });
  });
  return rows;
}

function clampIndex(value, maxIndex, fallback) {
  if (Number.isInteger(value) && value >= 0 && value <= maxIndex) return value;
  if (fallback !== undefined) return fallback;
  throw new RangeError('Choose a valid level.');
}

function sumCostRange(levelCosts, fromIndex, toIndex) {
  const cost = emptyResourceTotals();
  for (let index = fromIndex; index <= toIndex; index += 1) addCost(cost, levelCosts[index]);
  return cost;
}

function normalizeCost(row, context) {
  const cost = {};
  for (const key of RESOURCE_KEYS) {
    const value = row[key] ?? 0;
    if (!Number.isInteger(value) || value < 0) throw new TypeError(`Tomes & Collections data has an invalid ${key} value for ${context}.`);
    cost[key] = value;
  }
  return cost;
}

function normalizeTier(tier) {
  if (!tier || typeof tier.key !== 'string' || typeof tier.label !== 'string' || !Number.isInteger(tier.rows) || tier.rows <= 0) {
    throw new TypeError('Tomes & Collections data has an invalid collection tier definition.');
  }
  return { key: tier.key, label: tier.label, rows: tier.rows };
}

function normalizeResource(resource) {
  if (!resource || typeof resource.key !== 'string' || typeof resource.label !== 'string' || !RESOURCE_KEYS.includes(resource.key)) {
    throw new TypeError('Tomes & Collections data has an invalid resource definition.');
  }
  return { key: resource.key, label: resource.label };
}

function positiveInteger(value, context) {
  if (!Number.isInteger(value) || value <= 0) throw new TypeError(`Tomes & Collections data has an invalid ${context}.`);
  return value;
}

function emptyResourceTotals() { return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, 0])); }
function addCost(target, cost) { for (const key of RESOURCE_KEYS) target[key] += cost[key]; }
