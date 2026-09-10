# Brainstorm — migrate Hero Equipment planner (lojcalc.com)

4th tool in the lojcalc.com migration series (after Forticlad, Tomes &
Collections, Robots & Satellites). Source:
`https://www.lojcalc.com/hero-equipment.html`. Scouted via live browser
(localStorage state dump, `resource-calc-heroequipment-state-v1`,
schemaVersion 5) rather than static HTML — page is a client-rendered SPA.
User confirmed sequencing: this tool alone, own brainstorm→plan→cook→PR
cycle (same as every prior migration); Hero Stars & Exclusive Equipment
(5th/last tool) deferred to its own cycle.

## Source shape

**Fixed grid, not addable.** 3 troop lines × 4 equipment slots = 12
Equipment tracks + 12 paired Mastery tracks = 24 tracks total. Troop keys
(`shieldbearer`, `bomber`, `shooter`) match Forticlad's existing T11
Research troop lines — same trio, reuse the same display names/order.
Slots: Gloves, Helmet ("Helm" in UI), Chest ("Outerwear"/"Jacket" in UI
copy), Boots.

**Two parallel tracks per slot, cross-linked:**
- **Rarity** track (`levelStyle: "keyed"`): 11 rarity tiers (Common →
  Uncommon → Rare → Epic → Legendary → Legendary T1 → Legendary T2 →
  Exotic → Exotic T1 → Exotic T2 → Exotic T3), each tier except the last
  has a paired "· levels maxed" checkpoint entry (21 level-array entries
  total: `common`, `common_s1`, `uncommon`, `uncommon_s1`, ...). **Current**
  dropdown offers both plain and "levels maxed" entries (mid-farm state);
  **Target** dropdown offers only the 11 plain entries — reaching a target
  still sums through any intervening "_s1" checkpoint costs, so this is a
  plain range-sum over the 21-entry array like Tomes/Robots, no special
  handling needed.
- **Mastery** track (`levelStyle: "numeric"`): 21 levels, Level 0–20,
  linear-ish PrecisionEquipment cost per level.

**Cross-track prerequisite (the architecturally new part):** every Rarity
level from `legendary_t1` onward carries `requires: [{trackId:
"mastery_<troop>_<slot>", levelId: "<N>"}]` — i.e. promoting past Legendary
needs that *same slot's own* Mastery track at a matching level, auto-added
to the plan when insufficient (confirmed live: sample breakdown showed an
"(auto-added — prerequisite)" Mastery row alongside a Rarity target row).
This is **not** a general N:M requirement graph like `planner-core.js`
(Forticlad) — it's 12 independent 1:1 pairs (each Rarity track has exactly
one paired Mastery track, referenced via `pairedTrackId`). Simpler than
Forticlad's cascade, but still needs a real "bump the paired track's target
if the requirement isn't met, then include its added cost" resolution step
— materially different from Tomes/Robots & Satellites' flat range-sum-only
engines.

## Resources

4, all shared across every troop/slot (cost curves are **identical across
all 3 troops** — verified: `equip_shieldbearer_gloves` and
`equip_bomber_gloves`/`equip_shooter_gloves` cost arrays are byte-identical,
same for Mastery and across slots by rarity tier though absolute numbers
scale by slot... actually verified gloves vs. boots Rarity cost arrays are
**also identical** per-tier; the visible "Boots Legendary = 77,000
Equipment EXP" vs. "Gloves Legendary T1 = 400 Magnet" difference in the
sample breakdown is which resource+tier is spent, not a per-slot cost
multiplier — same table reused for all 4 slots × 3 troops, 12x total spend
if maxing everyone):

| Internal key | Display label |
|---|---|
| `EquipmentParts` | Equipment EXP |
| `PrecisionEquipment` | Precision Equipment |
| `Magnet` | Magnet |
| `PotentialCoil` | Potential Coil |

## Data-fidelity check

12 `estimated: true` flags total — one per Equipment track (all 12), always
at the same level id (`common_s1`, the Common→Uncommon "levels maxed"
checkpoint), always the same value (2,620 Equipment EXP, verified
identical across all 12 tracks). Source's own "What this does" copy
confirms: *"One value is still an estimate — look for the ≈ badge."*
Singular "one value" matches — it's one shared unconfirmed number reused
12x, same shape as Robots & Satellites' single flagged R-tier figure.
Reuse the existing `renderEstimatedBadge` primitive (`table-helpers.js`)
as-is, no new UI primitive needed this time.

## Architecture decision

New `hero-equipment-core.js`, same "independent engine, same shape as
siblings" convention as `research-core.js`/`tomes-core.js`/
`robots-satellites-core.js`. Shape: closer to `planner-core.js`/
`research-core.js` (needs prerequisite resolution) than to
`tomes-core.js`/`robots-satellites-core.js` (flat sum), but the
prerequisite shape is simpler than Forticlad's graph — 12 fixed 1:1 pairs,
not N:M. Concretely: for each of the 12 (troop, slot) cells, resolve
Rarity target → walk levels `[current+1..target]`, for any level carrying
a `requires` entry, ensure the paired Mastery target ≥ required level
(bump + tag as auto-added if not), then sum both tracks' ranges. No
fixed-point iteration loop needed (Forticlad's graph can cascade multiple
hops; here it's exactly one hop, Rarity → its own Mastery, never the
reverse and never cross-slot/cross-troop).

**State shape** (new `hero-equipment` profile tool-data key, same
read-latest-then-merge-then-write pattern as the other 3 planners): fixed
object, not addable —
```
{ stock: {...4 resources},
  equipment: {
    shieldbearer: { gloves: {rarity:{currentIndex,targetIndex}, mastery:{currentIndex,targetIndex}}, helmet: {...}, chest: {...}, boots: {...} },
    bomber: {...same 4 slots...},
    shooter: {...same 4 slots...}
  } }
```
No add/remove UI needed (unlike Tomes/Robots' addable instances) — this
is a fixed 3×4 grid, closer to Satellites' fixed-named-set pattern than
Tomes' add-up-to-cap pattern.

**Reused UI primitives**, no new ones needed: `.loj-planner__*` SCSS block,
`table-helpers.js`'s `renderEstimatedBadge`, the combined breakdown table
pattern (one table across all 12 cells, like Robots & Satellites' combined
Robots+Satellites table — consistent with established preference for one
combined breakdown over per-category tables, confirmed during Robots &
Satellites' plan validation).

**Data file**: `_data/lands_of_jail/hero_equipment.yml` — 1 shared 21-entry
Rarity cost table (used by all 12 cells), 1 shared 21-entry Mastery cost
table (used by all 12), the `requires` pairing rule (Legendary T1+ needs
matching Mastery level, mechanical not per-tier-data), troop/slot labels.

## Open questions (for plan phase, not blocking)

- Exact EN/VI label wording for the 4 slots (site copy uses "Gloves,
  Helmet, Jacket, Boots" in the page subtitle but "Outerwear" in the UI
  dropdowns — pick one consistent term per locale) and the 3 troop
  display names (site's live breakdown sample only showed "Shooter";
  Shieldbearer/Bomber names to confirm against existing Forticlad
  research copy for consistency).
- Whether to surface the Rarity↔Mastery link in copy (e.g. inline note
  near Mastery, mirroring source's "handled automatically" framing) —
  Forticlad's FC Lab→research cascade note is the closest existing
  precedent to match tone against.
- `docs/system-architecture.md` "Hero Equipment Planner client flow"
  section is mandatory per established convention (Robots & Satellites
  made this non-optional during plan validation) — carry that forward.

## Output

Brainstorm report: this file. Proceeding directly to `/ak:plan` per user's
explicit "continue migrate" instruction — no separate approval checkpoint
needed given the architecture is fully precedented (3 prior migrations
already establish the "own -core.js file, shared SCSS, shared table
helper, profile tool-data key" pattern); the only genuinely new element
(1:1 Rarity↔Mastery prerequisite pairing) is scoped and verified above.
