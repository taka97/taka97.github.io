import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTomesRequirements, createTomesPlanner } from '../assets/js/planners/tomes-core.js';

const zeroCost = {
  SealOfWisdom: 0,
  SealOfKnowledge: 0,
  CommonCoin: 0,
  RareCoin: 0,
  PreciousCoin: 0,
  LegendaryCoin: 0,
};

function plannerData() {
  return {
    caps: { tomes: 1, collections: 1 },
    tomeSlots: [{ troop: 'shieldbearer', type: 'attack' }],
    collectionSlots: [{ troop: 'shieldbearer', label: 'Knuckles' }],
    resources: [{ key: 'SealOfWisdom', label: { en: 'Seal of Wisdom', vi: 'Ấn Tri Thức' } }],
    collectionTiers: [{ key: 'uncommon', label: { en: 'Uncommon', vi: 'Không phổ biến' }, rows: 42 }],
    levelPostfixes: { collection: { star: { en: 'star', vi: 'sao' } } },
    tomeLevels: Array.from({ length: 13 }, (unused, index) => ({
      label: { en: index === 0 ? 'Not started' : `Level ${index}`, vi: index === 0 ? 'Chưa bắt đầu' : `Cấp ${index}` },
      ...zeroCost,
    })),
    collectionLevels: Array.from({ length: 43 }, (unused, index) => ({
      id: index === 0 ? 'start' : `uncommon_s${index}`,
      tier: index === 0 ? 'start' : 'uncommon',
      star: index,
      ...(index === 0 ? { label: { en: 'Not started', vi: 'Chưa bắt đầu' } } : {}),
      ...zeroCost,
    })),
  };
}

test('preserves localized labels and postfixes owned by Tomes & Collections YAML', () => {
  const planner = createTomesPlanner(plannerData());

  assert.deepEqual(planner.resources[0].label, { en: 'Seal of Wisdom', vi: 'Ấn Tri Thức' });
  assert.deepEqual(planner.tiers[0].label, { en: 'Uncommon', vi: 'Không phổ biến' });
  assert.deepEqual(planner.tomeLevels[1].label, { en: 'Level 1', vi: 'Cấp 1' });
  assert.deepEqual(planner.collectionLevels[0].label, { en: 'Not started', vi: 'Chưa bắt đầu' });
  assert.deepEqual(planner.levelPostfixes.collection.star, { en: 'star', vi: 'sao' });
});

test('keeps Tome cost calculations separate from localized level labels', () => {
  const data = plannerData();
  data.tomeLevels[1].SealOfWisdom = 10;
  const planner = createTomesPlanner(data);
  const result = calculateTomesRequirements(planner, [{ currentIndex: 0, targetIndex: 1 }], [{ currentIndex: 0, targetIndex: 0 }]);

  assert.equal(result.totals.SealOfWisdom, 10);
});
