import { formatNumber } from './planner-core.js';

export { formatNumber };

export function createResearchPlanner(data, troops) {
  if (!data || typeof data.tracks !== 'object' || !Array.isArray(troops) || troops.length === 0) throw new TypeError('Forticlad research data is unavailable.');
  const trackIds = Object.keys(data.tracks);
  for (const [id, track] of Object.entries(data.tracks)) {
    if (typeof track.label !== 'string' || !Array.isArray(track.levels) || track.levels.length === 0 || track.levels.some((cost) => !Number.isInteger(cost) || cost < 0)) {
      throw new TypeError(`Forticlad research data has an invalid track definition for ${id}.`);
    }
  }

  const tracks = new Map();
  const trackKeys = [];
  for (const troop of troops) {
    for (const id of trackIds) {
      const source = data.tracks[id];
      const trackKey = `${troop}-${id}`;
      trackKeys.push(trackKey);
      const requires = new Map();
      for (const [levelText, entries] of Object.entries(source.requires || {})) {
        const level = Number(levelText);
        if (!Number.isInteger(level) || level < 1 || level > source.levels.length) throw new TypeError(`Forticlad research data has an invalid requirement level for ${id}.`);
        if (!Array.isArray(entries)) throw new TypeError(`Forticlad research data has an invalid requirement record for ${id}.`);
        requires.set(level, entries.map((entry) => normalizeRequirementEntry(entry, troop, data.tracks)));
      }
      tracks.set(trackKey, { troop, id, label: source.label, levels: source.levels, accent: Boolean(source.accent), requires });
    }
  }

  validateRequirementGraph(tracks);
  return { troops: [...troops], trackKeys, tracks };
}

export function calculateResearchRequirements(planner, selections, fcLabLevel) {
  const selectedSelections = normalizeSelections(planner, selections);
  const effective = resolveRequirements(planner, selectedSelections, fcLabLevel);
  const totals = Object.fromEntries(planner.trackKeys.map((key) => [key, 0]));
  const selectedTrackKeys = planner.trackKeys.filter((key) => selectedSelections[key].targetLevel > 0);
  const effectiveTrackKeys = planner.trackKeys.filter((key) => effective[key].targetLevel > 0);
  const automaticTrackKeys = effectiveTrackKeys.filter((key) => effective[key].targetLevel !== selectedSelections[key].targetLevel);
  const steps = [];
  for (const key of effectiveTrackKeys) {
    const track = planner.tracks.get(key);
    const { currentLevel, targetLevel } = effective[key];
    for (let level = currentLevel + 1; level <= targetLevel; level += 1) {
      const hyperalloy = track.levels[level - 1];
      totals[key] += hyperalloy;
      steps.push({ track: key, level, hyperalloy, automatic: automaticTrackKeys.includes(key) });
    }
  }
  const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);
  return { selectedTrackKeys, effectiveTrackKeys, automaticTrackKeys, selectedSelections, effectiveSelections: effective, steps, totals, grandTotal };
}

function normalizeRequirementEntry(entry, troop, dataTracks) {
  if (!entry || !Number.isInteger(entry.level) || entry.level < 1) throw new TypeError('Forticlad research data contains an invalid prerequisite entry.');
  if (entry.building) {
    if (entry.track !== 'fc-lab') throw new TypeError('Forticlad research data contains an invalid building prerequisite.');
    return { building: true, level: entry.level };
  }
  if (!dataTracks[entry.track]) throw new TypeError(`Forticlad research data references an unknown track: ${entry.track}.`);
  if (entry.level > dataTracks[entry.track].levels.length) throw new TypeError(`Forticlad research data contains an unreachable prerequisite for ${entry.track}.`);
  return { building: false, trackKey: `${troop}-${entry.track}`, level: entry.level };
}

function validateRequirementGraph(tracks) {
  const visiting = new Set();
  const visited = new Set();
  const visit = (trackKey) => {
    if (visited.has(trackKey)) return;
    if (visiting.has(trackKey)) throw new TypeError('Forticlad research prerequisites contain a cycle.');
    visiting.add(trackKey);
    for (const entries of tracks.get(trackKey).requires.values()) {
      for (const entry of entries) {
        if (!entry.building) visit(entry.trackKey);
      }
    }
    visiting.delete(trackKey);
    visited.add(trackKey);
  };
  for (const trackKey of tracks.keys()) visit(trackKey);
}

function normalizeSelections(planner, selections) {
  return Object.fromEntries(planner.trackKeys.map((key) => {
    const track = planner.tracks.get(key);
    const maxLevel = track.levels.length;
    const selection = selections?.[key] || {};
    const currentLevel = clampLevel(selection.currentLevel, maxLevel, 0);
    const targetLevel = selection.targetLevel ? clampLevel(selection.targetLevel, maxLevel, 0) : 0;
    if (targetLevel && targetLevel < currentLevel) throw new RangeError(`Choose a valid current and target level for ${key}.`);
    return [key, { currentLevel, targetLevel }];
  }));
}

function clampLevel(value, maxLevel, fallback) {
  return Number.isInteger(value) && value >= 0 && value <= maxLevel ? value : fallback;
}

function researchError(code, params) {
  const error = new RangeError(code === 'fc-lab-level' ? `FC Lab must reach level ${params.level} first.` : `Prerequisite ${params.trackKey} cannot reach level ${params.level}.`);
  error.code = code;
  error.params = params;
  return error;
}

function resolveRequirements(planner, selections, fcLabLevel) {
  const effective = structuredClone(selections);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [trackKey, selection] of Object.entries(effective)) {
      if (!selection.targetLevel) continue;
      const track = planner.tracks.get(trackKey);
      for (let level = selection.currentLevel + 1; level <= selection.targetLevel; level += 1) {
        for (const entry of track.requires.get(level) || []) {
          if (entry.building) {
            if (!Number.isInteger(fcLabLevel) || fcLabLevel < entry.level) throw researchError('fc-lab-level', { level: entry.level });
            continue;
          }
          const required = entry.level;
          const existing = effective[entry.trackKey];
          if (existing.currentLevel >= required) continue;
          if (existing.targetLevel < required) {
            if (required > planner.tracks.get(entry.trackKey).levels.length) throw researchError('prerequisite-unreachable', { trackKey: entry.trackKey, level: required });
            existing.targetLevel = required;
            changed = true;
          }
        }
      }
    }
  }
  return effective;
}
