# 2026-09-10 — Migrate Hero Equipment planner: brainstorm + plan

Fourth tool in the lojcalc.com migration series (after Forticlad, Tomes &
Collections, Robots & Satellites). Brainstormed and planned a migration of
"Hero Equipment" (`https://www.lojcalc.com/hero-equipment.html`). No code
touched this session — implementation not started.

## Scouting had to go through the browser
The source page is a client-rendered SPA; a plain WebFetch only returns the
shell (nav, headings, no data). Had to use live browser automation
(navigate, get_page_text, screenshots, and `javascript_tool` to read the
page's own `localStorage`) to get anything real. The payoff: the tool
persists its full cost-table catalog into `localStorage` under
`resource-calc-heroequipment-state-v1` (schemaVersion 5) alongside user
progress, so reading that key handed over the entire data model in one shot
instead of reverse-engineering it from rendered DOM.

## Source shape
Fixed grid, not addable/removable (unlike Tomes' or Robots' add-instance
pattern): 3 troops (`shieldbearer`, `bomber`, `shooter` — same troop keys
already used by this site's Forticlad T11 Research data) × 4 equipment slots
(Gloves, Helm, Outerwear, Boots) = 12 cells. Each cell has two tracks: Rarity
(21 keyed levels — 11 tiers, each paired with a "levels maxed" checkpoint
sub-level) and Mastery (21 numeric levels, 0–20). Past Legendary rarity,
promotion requires that same cell's own Mastery track at a matching level —
a real cross-track prerequisite. Forticlad's planner is the only existing
precedent for that (`planner-core.js`/`research-core.js`'s N:M requirement
graph with fixed-point iteration), but Hero Equipment's version is simpler:
exactly 12 independent 1:1 pairs, never cross-slot/cross-troop. The new
engine only needs a single-pass bump, not Forticlad's iterative loop — worth
remembering as an architecture nuance for whichever tool is next.

## Data-fidelity check
Verified programmatically, not by inspection, that the Rarity and Mastery
cost tables are byte-identical across all 3 troops and all 4 slots. That
collapses what could have been 12 copies of each table into one shared
21-row Rarity table and one shared 21-row Mastery table in the data file.
4 resources: EquipmentParts (EN label "Equipment EXP"), PrecisionEquipment,
Magnet, PotentialCoil. Source flags 12 `estimated: true` cost entries, but
all 12 land on the same step (`common_s1`, 2,620 EquipmentParts) — it's one
shared unconfirmed figure reused 12x, matching the source's own copy ("One
value is still an estimate"). Reuses the `renderEstimatedBadge` primitive
added during the Robots & Satellites migration; no new UI primitives needed
this round.

## Hero Stars & Exclusive Equipment, scouted ahead
Lightly scouted the 5th and final remaining tool for future reference only —
not planned or implemented this session. 2 independently-addable per-hero
tracks (HeroStar, 32 levels with stage sub-steps; ExclusiveEquip, 11 numeric
levels), flat cost sum, no cross-track prerequisites, no estimated-cost
flags. Structurally the simplest of the 5 tools. User explicitly chose to
sequence it as its own future brainstorm → plan → cook → PR cycle rather
than bundling it in here.

## Output
- Brainstorm report:
  `plans/reports/brainstorm-260910-2300-migrate-hero-equipment-planner.md`
- Plan: `plans/260910-2303-migrate-hero-equipment-planner/` (plan.md + 5
  phases: Start, Data File and Calc Engine, UI Wiring and Storage, Content
  Pages and Navigation, Verify). All source cost-table numbers were
  transcribed directly into Phase 2 and cross-verified across multiple
  troops/slots before being treated as canonical — continuing this repo's
  habit of re-verifying scraped numbers rather than trusting a single read.
- `node .agentkit/scripts/set-active-plan.cjs` failed with `MODULE_NOT_FOUND`
  when trying to mark the plan active — that script doesn't exist in this
  repo (not agentkit-scaffolded). Harmless; plan files are otherwise
  complete. Noting it in case it recurs.
- User ended the session after planning, choosing not to run
  `/ak:plan validate` or `/ak:cook` yet. Plan is ready to execute next
  session.
