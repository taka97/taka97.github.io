import test from 'node:test';
import assert from 'node:assert/strict';
import { hasLocalizedLabel, localizeResources, resolveLocalizedLabel } from '../assets/js/planners/localized-label.js';

test('resolves a non-empty requested locale value', () => {
  assert.equal(resolveLocalizedLabel({ en: 'Warden Office', vi: 'Văn phòng Giám ngục' }, 'vi', 'warden-office'), 'Văn phòng Giám ngục');
});

test('falls back to English for missing, blank, or unsupported locale values', () => {
  assert.equal(resolveLocalizedLabel({ en: 'Warden Office', vi: '  ' }, 'vi', 'warden-office'), 'Warden Office');
  assert.equal(resolveLocalizedLabel({ en: 'Warden Office', vi: 'Văn phòng Giám ngục' }, 'fr', 'warden-office'), 'Warden Office');
});

test('uses the stable fallback when no usable locale value exists', () => {
  assert.equal(resolveLocalizedLabel({ en: null, vi: '' }, 'vi', 'warden-office'), 'warden-office');
  assert.equal(resolveLocalizedLabel(null, 'en', 'warden-office'), 'warden-office');
});

test('uses a scalar label unchanged for every language', () => {
  assert.equal(resolveLocalizedLabel('Forticlad (1)', 'vi', 'fc1'), 'Forticlad (1)');
  assert.equal(resolveLocalizedLabel('Forticlad (1)', 'fr', 'fc1'), 'Forticlad (1)');
});

test('accepts a non-empty scalar or maps with non-empty English and Vietnamese labels', () => {
  assert.equal(hasLocalizedLabel({ en: 'Warden Office', vi: 'Văn phòng Giám ngục' }), true);
  assert.equal(hasLocalizedLabel({ en: 'Warden Office', vi: ' ' }), false);
  assert.equal(hasLocalizedLabel('Warden Office'), true);
  assert.equal(hasLocalizedLabel(' '), false);
});

test('creates display resources with resolved string labels', () => {
  const [resource] = localizeResources([{ key: 'fc', label: { en: 'FC', vi: 'Lõi FC' }, icon: '/fc.png' }], 'vi');
  assert.deepEqual(resource, { key: 'fc', label: 'Lõi FC', icon: '/fc.png' });
});
