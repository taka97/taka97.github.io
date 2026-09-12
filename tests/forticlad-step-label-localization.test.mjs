import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocalizedLabel } from '../assets/js/planners/localized-label.js';

test('resolves scalar and localized Forticlad step labels', () => {
  assert.equal(resolveLocalizedLabel('30-1', 'vi', 'level_30_s1'), '30-1');
  assert.equal(resolveLocalizedLabel('30-1', 'fr', 'level_30_s1'), '30-1');
  assert.equal(
    resolveLocalizedLabel({ en: 'Forticlad (1)', vi: 'Trọng giáp (1)' }, 'vi', 'fc1'),
    'Trọng giáp (1)',
  );
  assert.equal(
    resolveLocalizedLabel({ en: 'Forticlad (1)', vi: 'Trọng giáp (1)' }, 'fr', 'fc1'),
    'Forticlad (1)',
  );
});
