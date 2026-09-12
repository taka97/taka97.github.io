export function resolveLocalizedLabel(labels, language, fallback) {
  if (typeof labels === 'string' && labels.trim()) return labels;

  const requested = labels?.[language];
  if (typeof requested === 'string' && requested.trim()) return requested;

  const english = labels?.en;
  if (typeof english === 'string' && english.trim()) return english;

  return fallback;
}

export function hasLocalizedLabel(labels) {
  if (typeof labels === 'string') return Boolean(labels.trim());

  return ['en', 'vi'].every((language) => typeof labels?.[language] === 'string' && labels[language].trim());
}

export function localizeResources(resources, language) {
  return resources.map(({ key, label, ...resource }) => ({
    ...resource,
    key,
    label: resolveLocalizedLabel(label, language, key),
  }));
}
