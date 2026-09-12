import { formatNumber } from './planner-core.js';

export { formatNumber };

const RESOURCE_KEYS = ['PrisonerArmorData', 'PowerModule', 'AdvancedPowerModule', 'DataDisk', 'PlanetCoin'];
const ROBOT_RESOURCE_KEYS = ['PrisonerArmorData', 'PowerModule', 'AdvancedPowerModule'];
const SATELLITE_RESOURCE_KEYS = ['DataDisk', 'PlanetCoin'];
const ROBOT_LEVEL_COUNT = 21;
const TIER_LEVEL_COUNTS = { R: 11, SR: 15, SSR: 19 };
const SATELLITE_COUNT = 9;

// The stored/persisted value for a robot's or satellite's level is its stable `id`
// (see robots_satellites.yml), never its array position, so reordering/inserting
// levels later can't reinterpret a saved profile. This resolves an id back to
// the position the calc engine needs; unknown/missing ids fall back to index 0
// (baseline) rather than throwing, since a profile might be stale.
export function resolveLevelIndex(levels, id) {
  const index = levels.findIndex((level) => level.id === id);
  return index === -1 ? 0 : index;
}

export function createRobotsSatellitesPlanner(data) {
  if (!data || !Array.isArray(data.robotLevels) || !Array.isArray(data.satelliteTiers) || !Array.isArray(data.satellites) || !data.caps) {
    throw new TypeError('Robots & Satellites data is unavailable.');
  }
  if (data.robotLevels.length !== ROBOT_LEVEL_COUNT) throw new TypeError(`Robots & Satellites data must contain exactly ${ROBOT_LEVEL_COUNT} robot levels.`);

  const robotLevels = data.robotLevels.map((row, index) => normalizeCost(row, ROBOT_RESOURCE_KEYS, `robot level ${index}`, true));
  const robotLevelIds = robotLevels.map((level) => level.id);
  if (new Set(robotLevelIds).size !== robotLevelIds.length) throw new TypeError('Robots & Satellites data has duplicate robot level ids.');

  const satelliteTiers = {};
  for (const tierKey of Object.keys(TIER_LEVEL_COUNTS)) {
    const tier = data.satelliteTiers.find((entry) => entry.key === tierKey);
    if (!tier) throw new TypeError(`Robots & Satellites data is missing the ${tierKey} satellite tier.`);
    if (!Array.isArray(tier.levels) || tier.levels.length !== TIER_LEVEL_COUNTS[tierKey]) {
      throw new TypeError(`Robots & Satellites data's ${tierKey} tier must contain exactly ${TIER_LEVEL_COUNTS[tierKey]} levels.`);
    }
    if (typeof tier.label !== 'string' || typeof tier.badge !== 'string') throw new TypeError(`Robots & Satellites data has an invalid ${tierKey} tier definition.`);
    satelliteTiers[tierKey] = {
      key: tier.key,
      label: tier.label,
      badge: tier.badge,
      levels: tier.levels.map((row, index) => normalizeCost(row, SATELLITE_RESOURCE_KEYS, `${tierKey} tier level ${index}`, true)),
    };
    const ids = satelliteTiers[tierKey].levels.map((level) => level.id);
    if (new Set(ids).size !== ids.length) throw new TypeError(`Robots & Satellites data's ${tierKey} tier has duplicate level ids.`);
  }

  if (data.satellites.length !== SATELLITE_COUNT) throw new TypeError(`Robots & Satellites data must contain exactly ${SATELLITE_COUNT} satellites.`);
  const satellites = data.satellites.map((satellite) => {
    if (typeof satellite.id !== 'string' || !satellite.id) throw new TypeError('Robots & Satellites data has a satellite with a missing id.');
    if (!TIER_LEVEL_COUNTS[satellite.tier]) throw new TypeError(`Robots & Satellites data has a satellite with an invalid tier for ${satellite.id}.`);
    if (typeof satellite.labelKey !== 'string' || !satellite.labelKey) throw new TypeError(`Robots & Satellites data has a satellite with a missing labelKey for ${satellite.id}.`);
    return { id: satellite.id, tier: satellite.tier, labelKey: satellite.labelKey };
  });

  const resources = Array.isArray(data.resources) ? data.resources.map(normalizeResource) : [];
  const caps = { robots: positiveInteger(data.caps.robots, 'caps.robots') };

  const defaultMaxIndex = robotLevels.length - 1;
  const robotSlotMaxIndex = Array.from({ length: caps.robots }, () => defaultMaxIndex);
  (Array.isArray(data.robotSlotCaps) ? data.robotSlotCaps : []).forEach((entry) => {
    if (!Number.isInteger(entry?.slot) || entry.slot < 1 || entry.slot > caps.robots) {
      throw new TypeError('Robots & Satellites data has an invalid robotSlotCaps slot.');
    }
    if (!Number.isInteger(entry?.maxLevel) || entry.maxLevel < 1) {
      throw new TypeError(`Robots & Satellites data has an invalid maxLevel for robotSlotCaps slot ${entry.slot}.`);
    }
    // A level cap always includes maxing that level (see robots_satellites.yml comment),
    // so resolve to its "_maxed" step and only fall back to the raw step if none exists
    // (e.g. level 1, which has no maxed variant).
    const maxedIndex = robotLevelIds.indexOf(`level_${entry.maxLevel}_maxed`);
    const rawIndex = robotLevelIds.indexOf(`level_${entry.maxLevel}`);
    const levelIndex = maxedIndex !== -1 ? maxedIndex : rawIndex;
    if (levelIndex === -1) throw new TypeError(`Robots & Satellites data's robotSlotCaps references an unknown level ${entry.maxLevel} for slot ${entry.slot}.`);
    robotSlotMaxIndex[entry.slot - 1] = levelIndex;
  });

  return { robotLevels, satelliteTiers, satellites, resources, caps, robotSlotMaxIndex };
}

export function calculateRobotsSatellitesRequirements(planner, robotInstances, satelliteState) {
  const totals = emptyResourceTotals();
  const robotBreakdown = buildBreakdown(planner.robotLevels, robotInstances, totals, planner.robotSlotMaxIndex);
  const satelliteBreakdown = [];
  planner.satellites.forEach((satellite) => {
    const levels = planner.satelliteTiers[satellite.tier].levels;
    const maxIndex = levels.length - 1;
    const state = satelliteState[satellite.id] ?? { currentIndex: 0, targetIndex: 0 };
    const currentIndex = clampIndex(state.currentIndex, maxIndex, 0);
    const targetIndex = state.targetIndex ? clampIndex(state.targetIndex, maxIndex, undefined) : 0;
    if (targetIndex && targetIndex < currentIndex) throw new RangeError('Choose a target level that is not lower than the current level.');
    if (!targetIndex || targetIndex <= currentIndex) return;
    const { cost, estimated } = sumCostRange(levels, currentIndex + 1, targetIndex);
    addCost(totals, cost);
    satelliteBreakdown.push({ id: satellite.id, tier: satellite.tier, currentIndex, targetIndex, cost, estimated });
  });
  return { totals, robotBreakdown, satelliteBreakdown };
}

function buildBreakdown(levelCosts, instances, totals, slotMaxIndex) {
  const defaultMaxIndex = levelCosts.length - 1;
  const rows = [];
  instances.forEach((instance, index) => {
    const maxIndex = slotMaxIndex?.[index] ?? defaultMaxIndex;
    const currentIndex = clampIndex(instance?.currentIndex, maxIndex, 0);
    const targetIndex = instance?.targetIndex ? clampIndex(instance.targetIndex, maxIndex, undefined) : 0;
    if (targetIndex && targetIndex < currentIndex) throw new RangeError('Choose a target level that is not lower than the current level.');
    if (!targetIndex || targetIndex <= currentIndex) return;
    const { cost, estimated } = sumCostRange(levelCosts, currentIndex + 1, targetIndex);
    addCost(totals, cost);
    rows.push({ index, currentIndex, targetIndex, cost, estimated });
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
  const estimatedKeys = new Set();
  for (let index = fromIndex; index <= toIndex; index += 1) {
    addCost(cost, levelCosts[index]);
    levelCosts[index].estimated.forEach((key) => estimatedKeys.add(key));
  }
  return { cost, estimated: [...estimatedKeys] };
}

function normalizeCost(row, resourceKeys, context, requireId = false) {
  const cost = {};
  for (const key of resourceKeys) {
    const value = row[key] ?? 0;
    if (!Number.isInteger(value) || value < 0) throw new TypeError(`Robots & Satellites data has an invalid ${key} value for ${context}.`);
    cost[key] = value;
  }
  if (row.estimated !== undefined && (!Array.isArray(row.estimated) || row.estimated.some((key) => !resourceKeys.includes(key)))) {
    throw new TypeError(`Robots & Satellites data has an invalid estimated list for ${context}.`);
  }
  cost.estimated = row.estimated ?? [];
  if (requireId) {
    if (typeof row.id !== 'string' || !row.id) throw new TypeError(`Robots & Satellites data is missing a level id for ${context}.`);
    cost.id = row.id;
  }
  return cost;
}

function normalizeResource(resource) {
  if (!resource || typeof resource.key !== 'string' || typeof resource.label !== 'string' || !RESOURCE_KEYS.includes(resource.key)) {
    throw new TypeError('Robots & Satellites data has an invalid resource definition.');
  }
  return { key: resource.key, label: resource.label, ...(typeof resource.icon === 'string' ? { icon: resource.icon } : {}) };
}

function positiveInteger(value, context) {
  if (!Number.isInteger(value) || value <= 0) throw new TypeError(`Robots & Satellites data has an invalid ${context}.`);
  return value;
}

function emptyResourceTotals() { return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, 0])); }
function addCost(target, cost) { for (const key of RESOURCE_KEYS) target[key] += cost[key] ?? 0; }
