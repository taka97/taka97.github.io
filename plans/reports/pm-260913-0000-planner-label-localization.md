# Planner label localization — completion

Status: complete

| Area | Result |
| --- | --- |
| Label contract | Scalars render unchanged; `{ en, vi }` maps resolve requested locale then English. |
| Data | Confirmed Forticlad and Research translations are maps; unconfirmed labels remain strings; Satellite `labelKey` removed. |
| Compatibility | IDs, costs, caps, prerequisites, and browser-local storage shapes unchanged. |
| Verification | Resolver tests: 6/6; generated planner data accepted by all core validators; Docker Jekyll build passed. |
| Review | Independent re-review passed after the scalar-or-map contract update. |

Unresolved questions: none.
