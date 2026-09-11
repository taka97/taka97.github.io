import { formatNumber } from './planner-core.js';

export { formatNumber };

const RESOURCE_KEYS = ['HeroFragment', 'ExclusiveEquipPart'];
const HERO_STARS_LEVEL_COUNT = 32;
const EXCLUSIVE_EQUIPMENT_LEVEL_COUNT = 11;

export function createHeroStarsEquipmentPlanner(data) {
  if (!data || !data.heroStars || !Array.isArray(data.heroStars.levels) || !data.exclusiveEquipment || !Array.isArray(data.exclusiveEquipment.levels) || !data.caps) {
    throw new TypeError('Hero Stars & Exclusive Equipment data is unavailable.');
  }
  if (data.heroStars.levels.length !== HERO_STARS_LEVEL_COUNT) throw new TypeError(`Hero Stars & Exclusive Equipment data must contain exactly ${HERO_STARS_LEVEL_COUNT} Hero Stars levels.`);
  if (data.exclusiveEquipment.levels.length !== EXCLUSIVE_EQUIPMENT_LEVEL_COUNT) throw new TypeError(`Hero Stars & Exclusive Equipment data must contain exactly ${EXCLUSIVE_EQUIPMENT_LEVEL_COUNT} Exclusive Equipment levels.`);

  const heroStarsLevels = data.heroStars.levels.map((row, index) => normalizeLevel(row, `Hero Stars level ${index}`));
  const exclusiveEquipmentLevels = data.exclusiveEquipment.levels.map((row, index) => normalizeLevel(row, `Exclusive Equipment level ${index}`));
  const resources = Array.isArray(data.resources) ? data.resources.map(normalizeResource) : [];
  const caps = {
    heroStars: positiveInteger(data.caps.heroStars, 'caps.heroStars'),
    exclusiveEquipment: positiveInteger(data.caps.exclusiveEquipment, 'caps.exclusiveEquipment'),
  };

  return { heroStarsLevels, exclusiveEquipmentLevels, resources, caps };
}

export function calculateHeroStarsEquipment(planner, heroStarsInstances, exclusiveEquipmentInstances) {
  const totals = emptyResourceTotals();
  const heroStarsBreakdown = buildBreakdown(planner.heroStarsLevels, heroStarsInstances, totals);
  const exclusiveEquipmentBreakdown = buildBreakdown(planner.exclusiveEquipmentLevels, exclusiveEquipmentInstances, totals);
  return { totals, heroStarsBreakdown, exclusiveEquipmentBreakdown };
}

function buildBreakdown(levels, instances, totals) {
  const maxIndex = levels.length - 1;
  const rows = [];
  instances.forEach((instance, index) => {
    const currentIndex = clampIndex(instance?.currentIndex, maxIndex, 0);
    const targetIndex = instance?.targetIndex ? clampIndex(instance.targetIndex, maxIndex, undefined) : 0;
    if (targetIndex && targetIndex < currentIndex) throw new RangeError('Choose a target level that is not lower than the current level.');
    if (!targetIndex || targetIndex <= currentIndex) return;
    const cost = sumCostRange(levels, currentIndex + 1, targetIndex);
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

function sumCostRange(levels, fromIndex, toIndex) {
  const cost = emptyResourceTotals();
  for (let index = fromIndex; index <= toIndex; index += 1) addCost(cost, levels[index].cost);
  return cost;
}

function normalizeLevel(row, context) {
  if (typeof row?.id !== 'string' || !row.id) throw new TypeError(`Hero Stars & Exclusive Equipment data has a missing id for ${context}.`);
  return { id: row.id, cost: normalizeCost(row.cost, context) };
}

function normalizeCost(cost, context) {
  if (!cost) throw new TypeError(`Hero Stars & Exclusive Equipment data is missing cost values for ${context}.`);
  const result = {};
  for (const key of RESOURCE_KEYS) {
    const value = cost[key] ?? 0;
    if (!Number.isInteger(value) || value < 0) throw new TypeError(`Hero Stars & Exclusive Equipment data has an invalid ${key} value for ${context}.`);
    result[key] = value;
  }
  return result;
}

function normalizeResource(resource) {
  if (!resource || typeof resource.key !== 'string' || typeof resource.label !== 'string' || !RESOURCE_KEYS.includes(resource.key)) {
    throw new TypeError('Hero Stars & Exclusive Equipment data has an invalid resource definition.');
  }
  return { key: resource.key, label: resource.label };
}

function positiveInteger(value, context) {
  if (!Number.isInteger(value) || value <= 0) throw new TypeError(`Hero Stars & Exclusive Equipment data has an invalid ${context}.`);
  return value;
}

function emptyResourceTotals() { return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, 0])); }
function addCost(target, cost) { for (const key of RESOURCE_KEYS) target[key] += cost[key] ?? 0; }
