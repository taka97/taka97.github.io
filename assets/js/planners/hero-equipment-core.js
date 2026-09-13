import { formatNumber } from './planner-core.js';
import { hasLocalizedLabel } from './localized-label.js';

const RARITY_TIER_KEYS = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'legendary_t1', 'legendary_t2', 'exotic', 'exotic_t1', 'exotic_t2', 'exotic_t3'];

export { formatNumber };

const RESOURCE_KEYS = ['EquipmentParts', 'Magnet', 'PrecisionEquipment', 'PotentialCoil'];
const TROOP_COUNT = 3;
const SLOT_COUNT = 4;
const RARITY_LEVEL_COUNT = 21;
const MASTERY_LEVEL_COUNT = 21;

export function createHeroEquipmentPlanner(data) {
  if (!data || !Array.isArray(data.troops) || !Array.isArray(data.slots) || !Array.isArray(data.resources) || !Array.isArray(data.rarityTiers) || !data.rarity || !Array.isArray(data.rarity.levels) || !data.mastery || !Array.isArray(data.mastery.levels)) {
    throw new TypeError('Hero Equipment data is unavailable.');
  }
  if (data.troops.length !== TROOP_COUNT) throw new TypeError(`Hero Equipment data must contain exactly ${TROOP_COUNT} troops.`);
  if (data.slots.length !== SLOT_COUNT) throw new TypeError(`Hero Equipment data must contain exactly ${SLOT_COUNT} slots.`);
  if (data.rarity.levels.length !== RARITY_LEVEL_COUNT) throw new TypeError(`Hero Equipment data must contain exactly ${RARITY_LEVEL_COUNT} rarity levels.`);
  if (data.mastery.levels.length !== MASTERY_LEVEL_COUNT) throw new TypeError(`Hero Equipment data must contain exactly ${MASTERY_LEVEL_COUNT} mastery levels.`);

  const rarityTiers = data.rarityTiers.map(normalizeRarityTier);
  if (rarityTiers.length !== RARITY_TIER_KEYS.length || RARITY_TIER_KEYS.some((key) => !rarityTiers.some((tier) => tier.key === key))) {
    throw new TypeError(`Hero Equipment data must define labels for exactly these rarity tiers: ${RARITY_TIER_KEYS.join(', ')}.`);
  }
  const masteryLevels = data.mastery.levels.map((row, index) => normalizeLevel(row, `mastery level ${index}`));
  const masteryIndexById = new Map(masteryLevels.map((level, index) => [level.id, index]));
  const rarityLevels = data.rarity.levels.map((row, index) => normalizeRarityLevel(row, `rarity level ${index}`, masteryIndexById));
  const resources = data.resources.map(normalizeResource);

  const cellKeys = [];
  for (const troop of data.troops) {
    for (const slot of data.slots) cellKeys.push(`${troop}-${slot}`);
  }

  return { troops: [...data.troops], slots: [...data.slots], resources, rarityTiers, rarityLevels, masteryLevels, masteryIndexById, cellKeys };
}

export function calculateHeroEquipment(planner, selections) {
  const totals = emptyResourceTotals();
  const breakdown = [];
  const rarityMaxIndex = planner.rarityLevels.length - 1;
  const masteryMaxIndex = planner.masteryLevels.length - 1;

  for (const troop of planner.troops) {
    for (const slot of planner.slots) {
      const cellKey = `${troop}-${slot}`;
      const cellSelection = selections?.[cellKey] || {};
      const rarity = cellSelection.rarity || {};
      const mastery = cellSelection.mastery || {};

      const rarityCurrentIndex = clampIndex(rarity.currentIndex, rarityMaxIndex, 0);
      const rarityTargetIndex = rarity.targetIndex ? clampIndex(rarity.targetIndex, rarityMaxIndex, undefined) : 0;
      if (rarityTargetIndex && rarityTargetIndex < rarityCurrentIndex) throw new RangeError(`Choose a target Rarity level that is not lower than the current level for ${cellKey}.`);

      const masteryCurrentIndex = clampIndex(mastery.currentIndex, masteryMaxIndex, 0);
      const selectedMasteryTargetIndex = mastery.targetIndex ? clampIndex(mastery.targetIndex, masteryMaxIndex, undefined) : 0;
      if (selectedMasteryTargetIndex && selectedMasteryTargetIndex < masteryCurrentIndex) throw new RangeError(`Choose a target Mastery level that is not lower than the current level for ${cellKey}.`);

      let effectiveMasteryTargetIndex = selectedMasteryTargetIndex;
      for (let index = rarityCurrentIndex + 1; index <= rarityTargetIndex; index += 1) {
        const requiresMastery = planner.rarityLevels[index].requiresMastery;
        if (requiresMastery === undefined) continue;
        const requiredIndex = planner.masteryIndexById.get(requiresMastery);
        if (requiredIndex > effectiveMasteryTargetIndex) effectiveMasteryTargetIndex = requiredIndex;
      }
      const masteryAutomatic = effectiveMasteryTargetIndex !== selectedMasteryTargetIndex;

      if (rarityTargetIndex > rarityCurrentIndex) {
        const { cost, estimated } = sumCostRange(planner.rarityLevels, rarityCurrentIndex + 1, rarityTargetIndex);
        addCost(totals, cost);
        breakdown.push({
          cellKey,
          troop,
          slot,
          track: 'rarity',
          fromLevelId: planner.rarityLevels[rarityCurrentIndex].id,
          toLevelId: planner.rarityLevels[rarityTargetIndex].id,
          cost,
          automatic: false,
          estimated,
        });
      }

      if (effectiveMasteryTargetIndex > masteryCurrentIndex) {
        const { cost, estimated } = sumCostRange(planner.masteryLevels, masteryCurrentIndex + 1, effectiveMasteryTargetIndex);
        addCost(totals, cost);
        breakdown.push({
          cellKey,
          troop,
          slot,
          track: 'mastery',
          fromLevelId: planner.masteryLevels[masteryCurrentIndex].id,
          toLevelId: planner.masteryLevels[effectiveMasteryTargetIndex].id,
          cost,
          automatic: masteryAutomatic,
          estimated,
        });
      }
    }
  }

  return { totals, breakdown };
}

function normalizeRarityLevel(row, context, masteryIndexById) {
  const level = normalizeLevel(row, context);
  if (row.requiresMastery !== undefined) {
    if (typeof row.requiresMastery !== 'string' || !masteryIndexById.has(row.requiresMastery)) {
      throw new TypeError(`Hero Equipment data references an unknown mastery requirement for ${context}.`);
    }
    level.requiresMastery = row.requiresMastery;
  }
  return level;
}

function normalizeLevel(row, context) {
  if (typeof row?.id !== 'string' || !row.id) throw new TypeError(`Hero Equipment data has a missing id for ${context}.`);
  return { id: row.id, cost: normalizeCost(row.cost, context), estimated: Boolean(row.estimated) };
}

function normalizeCost(cost, context) {
  if (!cost) throw new TypeError(`Hero Equipment data is missing cost values for ${context}.`);
  const result = {};
  for (const key of RESOURCE_KEYS) {
    const value = cost[key] ?? 0;
    if (!Number.isInteger(value) || value < 0) throw new TypeError(`Hero Equipment data has an invalid ${key} value for ${context}.`);
    result[key] = value;
  }
  return result;
}

function normalizeRarityTier(tier) {
  if (!tier || typeof tier.key !== 'string' || !hasLocalizedLabel(tier.label)) {
    throw new TypeError('Hero Equipment data has an invalid rarity tier definition.');
  }
  return { key: tier.key, label: tier.label };
}

function normalizeResource(resource) {
  if (!resource || typeof resource.key !== 'string' || !hasLocalizedLabel(resource.label) || !RESOURCE_KEYS.includes(resource.key)) {
    throw new TypeError('Hero Equipment data has an invalid resource definition.');
  }
  return { key: resource.key, label: resource.label, ...(typeof resource.icon === 'string' ? { icon: resource.icon } : {}) };
}

function clampIndex(value, maxIndex, fallback) {
  if (Number.isInteger(value) && value >= 0 && value <= maxIndex) return value;
  if (fallback !== undefined) return fallback;
  throw new RangeError('Choose a valid level.');
}

function sumCostRange(levels, fromIndex, toIndex) {
  const cost = emptyResourceTotals();
  const estimatedKeys = new Set();
  for (let index = fromIndex; index <= toIndex; index += 1) {
    addCost(cost, levels[index].cost);
    if (levels[index].estimated) {
      for (const key of RESOURCE_KEYS) if (levels[index].cost[key] > 0) estimatedKeys.add(key);
    }
  }
  return { cost, estimated: [...estimatedKeys] };
}

function emptyResourceTotals() { return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, 0])); }
function addCost(target, cost) { for (const key of RESOURCE_KEYS) target[key] += cost[key]; }
