# Planner localized data labels

## Outcome

Keep each planner's game-data display labels next to its release-controlled
data, so every planner can render any supported interface language without
JavaScript-owned translation maps.

## Constraints

- Persisted IDs (such as `base`, building, level, slot, and satellite IDs) stay
  unchanged.
- Every localized label must include an English value.
- A missing or blank label for the active UI language must render English.
- The scope covers Forticlad, its T11 Research section, Tomes & Collections,
  Robots & Satellites, Hero Equipment, and Hero Stars & Exclusive Equipment.
- Generic page UI copy and labels computed from numeric values stay in the
  existing per-page message dictionaries.

## Design

Replace game-data scalar labels and Satellite `labelKey` indirection with locale
maps in their owning `_data/lands_of_jail/*.yml` files:

```yml
label:
  en: Warden Office
  vi: Văn phòng Giám ngục
```

`assets/js/planners/localized-label.js` will provide one label resolver used by
all planner renderers. It selects a non-blank value for the active language,
then falls back to non-blank `en`, and finally uses the stable ID only as a
defensive rendering fallback. The migration removes per-tool translation maps
and Satellite `labelKey` lookups.

## Data flow

Jekyll serializes each YAML data source into its existing JSON script element.
Each renderer resolves labels at display time from the page's `data-lang`.
Saved selections continue to contain only stable IDs, so no IndexedDB migration
is needed.

## Acceptance criteria

- Every game-data label across the five planners has English and Vietnamese
  values.
- English and Vietnamese pages display matching game-data labels.
- An unknown language resolves every label to English.
- No persisted identifier changes.
