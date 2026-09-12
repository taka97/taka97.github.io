import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../assets/js/planners/forticlad.js', import.meta.url), 'utf8');

test('passes the active language into Base-range option rendering', () => {
  assert.match(source, /rangeLabel\(currentLabel, 'current-base', availableSteps, ranges\[key\]\.currentBase, disabled, undefined, language\)/);
  assert.match(source, /rangeLabel\(targetLabel, 'target-base', planner\.steps\.slice\(0, planner\.baseIndexes\.get\(planner\.maximumBases\[key\]\) \+ 1\), ranges\[key\]\.targetBase, disabled, undefined, language\)/);
  assert.match(source, /function rangeLabel\(labelText, role, steps, value, disabled, emptyLabel, language\)/);
});
