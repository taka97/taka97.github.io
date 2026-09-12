import { hasLocalizedLabel } from './localized-label.js';

const RESOURCES = ['fc', 'afc'];

export function createPlanner(data) {
  if (!data || !Array.isArray(data.steps) || !data.buildings || typeof data.requirements !== 'object') throw new TypeError('Forticlad data is unavailable.');
  const buildingKeys = Object.keys(data.buildings);
  const bases = new Set();
  const steps = data.steps.map((step) => normalizeStep(step, buildingKeys, bases));
  if (steps.length < 2) throw new TypeError('Forticlad data must contain at least two base steps.');
  const baseIndexes = new Map(steps.map((step, index) => [step.base, index]));
  const maximumBases = Object.fromEntries(buildingKeys.map((key) => [key, data.buildings[key].max_base || steps[steps.length - 1].base]));
  for (const [key, building] of Object.entries(data.buildings)) {
    if (!hasLocalizedLabel(building.label) || !baseIndexes.has(maximumBases[key])) throw new TypeError(`Forticlad data has an invalid building definition for ${key}.`);
  }
  const requirements = normalizeRequirements(data.requirements, buildingKeys, baseIndexes, maximumBases);
  validateRequirementGraph(requirements, baseIndexes);
  return { buildingKeys, buildings: structuredClone(data.buildings), steps, baseIndexes, maximumBases, requirements };
}

export function calculateRequirements(planner, currentBase, targetBase, buildingKey) {
  const { currentIndex, targetIndex } = rangeIndexes(planner, currentBase, targetBase, buildingKey);
  return calculateSteps(planner, planner.steps.slice(currentIndex + 1, targetIndex + 1), buildingKey);
}

export function calculateBuildingRequirements(planner, ranges) {
  const selectedRanges = normalizeRanges(planner, ranges);
  const effectiveRanges = resolveRequirements(planner, selectedRanges);
  const totals = emptyResourceTotals(planner.buildingKeys);
  const selectedBuildingKeys = Object.keys(selectedRanges).filter((key) => hasUpgrade(planner, selectedRanges[key]));
  const effectiveBuildingKeys = Object.keys(effectiveRanges).filter((key) => hasUpgrade(planner, effectiveRanges[key]));
  const automaticBuildingKeys = effectiveBuildingKeys.filter((key) => effectiveRanges[key].targetBase !== selectedRanges[key].targetBase);
  const steps = [];
  for (const key of effectiveBuildingKeys) {
    const { currentIndex, targetIndex } = rangeIndexes(planner, effectiveRanges[key].currentBase, effectiveRanges[key].targetBase, key);
    for (const step of planner.steps.slice(currentIndex + 1, targetIndex + 1)) {
      const cost = step.costs[key];
      addCost(totals[key], cost);
      steps.push({ building: key, base: step.base, ...cost, automatic: automaticBuildingKeys.includes(key) });
    }
  }
  return { selectedBuildingKeys, effectiveBuildingKeys, automaticBuildingKeys, selectedRanges, effectiveRanges, steps, totals, grandTotal: resourceTotal(totals), resourceTotals: resourceTotals(totals) };
}

export function formatNumber(value) { return new Intl.NumberFormat().format(value); }

function normalizeStep(step, buildingKeys, bases) {
  if (!step || typeof step.base !== 'string' || !step.base.trim() || bases.has(step.base)) throw new TypeError('Forticlad data contains an invalid or duplicate base.');
  if (!hasLocalizedLabel(step.label)) throw new TypeError(`Forticlad data has an invalid label for ${step.base}.`);
  const label = step.label;
  const sourceCosts = step.costs || Object.fromEntries(buildingKeys.map((key) => [key, { fc: step.cores?.[key], afc: 0 }]));
  const costs = {};
  for (const key of buildingKeys) {
    const cost = sourceCosts[key];
    if (!cost || !Number.isInteger(cost.fc) || cost.fc < 0 || !Number.isInteger(cost.afc) || cost.afc < 0) throw new TypeError(`Forticlad data has invalid resource values for ${step.base}.`);
    costs[key] = { fc: cost.fc, afc: cost.afc };
  }
  bases.add(step.base);
  return { base: step.base, label, tier: step.tier || step.base, costs };
}

function normalizeRequirements(records, buildingKeys, baseIndexes, maximumBases) {
  const requirements = new Map();
  for (const [targetKey, entries] of Object.entries(records)) {
    if (!buildingKeys.includes(targetKey) || !Array.isArray(entries)) throw new TypeError('Forticlad data contains an invalid prerequisite record.');
    for (const entry of entries) {
      const minimumBase = entry?.minimumBase;
      const targetBase = entry?.targetBase;
      if (!entry || !buildingKeys.includes(entry.building) || !baseIndexes.has(minimumBase) || !baseIndexes.has(targetBase) || baseIndexes.get(minimumBase) > baseIndexes.get(maximumBases[entry.building]) || baseIndexes.get(targetBase) > baseIndexes.get(maximumBases[targetKey])) throw new TypeError('Forticlad data contains an unreachable prerequisite.');
      const key = `${targetKey}:${targetBase}`;
      if (!requirements.has(key)) requirements.set(key, []);
      requirements.get(key).push({ building: entry.building, minimumBase });
    }
  }
  return requirements;
}

function normalizeRanges(planner, ranges) {
  return Object.fromEntries(planner.buildingKeys.map((key) => {
    const range = ranges?.[key] || {};
    const currentBase = (planner.baseIndexes.has(range.currentBase) ? range.currentBase : undefined) || planner.steps[0].base;
    const targetBase = planner.baseIndexes.has(range.targetBase) ? range.targetBase : undefined;
    if (targetBase) rangeIndexes(planner, currentBase, targetBase, key);
    return [key, { currentBase, targetBase: targetBase || '' }];
  }));
}

function validateRequirementGraph(requirements, baseIndexes) {
  const graph = new Map();
  for (const [key, entries] of requirements) {
    const separator = key.indexOf(':');
    const targetNode = `${key.slice(0, separator)}:${baseIndexes.get(key.slice(separator + 1))}`;
    if (!graph.has(targetNode)) graph.set(targetNode, new Set());
    entries.forEach((entry) => graph.get(targetNode).add(`${entry.building}:${baseIndexes.get(entry.minimumBase)}`));
  }
  const visiting = new Set();
  const visited = new Set();
  const visit = (key) => {
    if (visiting.has(key)) throw new TypeError('Forticlad prerequisites contain a cycle.');
    if (visited.has(key)) return;
    visiting.add(key);
    for (const dependency of graph.get(key) || []) visit(dependency);
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of graph.keys()) visit(key);
}

function resolveRequirements(planner, selectedRanges) {
  const effective = structuredClone(selectedRanges);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [targetKey, range] of Object.entries(effective)) {
      if (!hasUpgrade(planner, range)) continue;
      const targetIndex = planner.baseIndexes.get(range.targetBase);
      for (let index = 1; index <= targetIndex; index += 1) {
        const base = planner.steps[index].base;
        for (const entry of planner.requirements.get(`${targetKey}:${base}`) || []) {
          const required = planner.baseIndexes.get(entry.minimumBase);
          const existing = effective[entry.building];
          if (!existing.targetBase || planner.baseIndexes.get(existing.targetBase) < required) {
            if (required > planner.baseIndexes.get(planner.maximumBases[entry.building])) throw new RangeError(`Prerequisite ${entry.building} cannot reach ${entry.minimumBase}.`);
            effective[entry.building].targetBase = entry.minimumBase;
            changed = true;
          }
        }
      }
    }
  }
  return effective;
}

function rangeIndexes(planner, currentBase, targetBase, buildingKey) {
  const currentIndex = planner.baseIndexes.get(currentBase);
  const targetIndex = planner.baseIndexes.get(targetBase);
  if (currentIndex === undefined || targetIndex === undefined || targetIndex < currentIndex) throw new RangeError('Choose a valid current and target base.');
  if (buildingKey && targetIndex > planner.baseIndexes.get(planner.maximumBases[buildingKey])) throw new RangeError(`Target base is unavailable for ${buildingKey}.`);
  return { currentIndex, targetIndex };
}
function hasUpgrade(planner, range) { return Boolean(range.targetBase) && planner.baseIndexes.get(range.targetBase) > planner.baseIndexes.get(range.currentBase); }
function calculateSteps(planner, steps, buildingKey) {
  if (!buildingKey || !planner.buildingKeys.includes(buildingKey)) throw new RangeError('Choose a valid building.');
  const totals = { fc: 0, afc: 0 };
  const normalizedSteps = steps.map((step) => { const cost = step.costs[buildingKey]; addCost(totals, cost); return { building: buildingKey, base: step.base, ...cost }; });
  return { steps: normalizedSteps, totals, resourceTotals: { ...totals }, grandTotal: totals.fc + totals.afc };
}
function emptyResourceTotals(buildingKeys) { return Object.fromEntries(buildingKeys.map((key) => [key, { fc: 0, afc: 0 }])); }
function addCost(target, cost) { for (const resource of RESOURCES) target[resource] += cost[resource]; }
function resourceTotal(totals) { const total = resourceTotals(totals); return total.fc + total.afc; }
function resourceTotals(totals) { return Object.values(totals).reduce((result, cost) => ({ fc: result.fc + cost.fc, afc: result.afc + cost.afc }), { fc: 0, afc: 0 }); }
