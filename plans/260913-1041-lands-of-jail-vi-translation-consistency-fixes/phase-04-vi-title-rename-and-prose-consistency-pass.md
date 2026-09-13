---
phase: 4
title: "VI title rename and prose consistency pass"
status: in-progress
priority: P2
effort: "1h"
dependencies: [3]
---

# Phase 4: VI title rename and prose consistency pass

## Overview
After Phase 3 merged to `main`, the user renamed all 4 remaining VI tool
titles (Forticlad's VI title, "Tính Lõi trọng giáp", was already localized
before this session) to real Vietnamese names, which surfaced a batch of
prose in the same pages that hadn't kept up — stale English tool/track/troop
names, an overbroad disclaimer sentence, and one EN-only sentence that never
made sense in English to begin with. This phase covers the title renames,
the resulting consistency fixes, a resource-name phrasing format the user
asked to apply everywhere, and a wording shortening — all implemented and
live-verified, not yet committed.

## Requirements
- Functional: every renamed VI title/heading/track-label renders consistently
  end-to-end — page title, H1, sidebar nav, TOC, JS-rendered instance/track
  labels, and intro-paragraph prose all agree with each other.
- Non-functional: no EN-page changes except removing the one sentence that
  was nonsensical there; `node --test tests/*.test.mjs` stays green throughout.

## Architecture
Pure content/copy changes — no code architecture changes. Two content layers
touched: static Liquid/HTML in each `contents/vi/...md` (titles, headings,
intro prose) and the small `assets/js/planners/hero-stars-exclusive-equipment.js`
`MESSAGES.vi` block (dynamic track labels rendered into the breakdown table,
which needed to match the new static section headings).

## Related Code Files
- Modify: `_data/navigation.yml` — VI sidebar nav entries for the 4 renamed tools.
- Modify: `contents/vi/lands-of-jail/planners/collections-tomes.md` — title, H1, "Collections"/"Tomes" → "Kho báu"/"Sách cổ" section headings, intro paragraph (old tool name, stale troop names, VI(EN) resource pairing, narrowed disclaimer).
- Modify: `contents/vi/lands-of-jail/planners/robots-satellites.md` — title, H1, "Satellites" → "Vệ tinh" (generic word + 3 tier-badge section headings), intro paragraph (VI(EN) resource pairing, narrowed disclaimer), `PowerModule` label shortened.
- Modify: `contents/vi/lands-of-jail/planners/hero-equipment.md` — title, H1, intro paragraph (stale troop names, VI(EN) resource pairing).
- Modify: `contents/vi/lands-of-jail/planners/hero-stars-exclusive-equipment.md` — title, H1, "Hero Stars"/"Exclusive Equipment" → "Sao Anh hùng"/"Trang bị độc quyền" section headings, intro paragraph (VI(EN) resource pairing using the yml's original EN labels, stale quoted button text).
- Modify: `assets/js/planners/hero-stars-exclusive-equipment.js` — `MESSAGES.vi.heroStarsTrackLabel`/`exclusiveEquipmentTrackLabel`/`noTargets` updated to match the new VI section headings (these render as breakdown-table row labels, e.g. "Hero 1 — Sao Anh hùng").
- Modify: `contents/en/lands-of-jail/planners/collections-tomes.md`, `robots-satellites.md` — removed "Resource and tier/Satellite names are shown in English for now." (only ever meaningful for a VI reader; nonsensical on the EN page itself).
- Modify: `_data/lands_of_jail/robots_satellites.yml` — `PowerModule` label shortened from "Mô-đun Cấp điện Thông thường" to "Mô-đun Cấp điện Thường" (user: too long).

## Implementation Steps
1. Renamed 4 VI titles one at a time per explicit user instruction, each time updating both the page (`title:` front matter + H1) and its `_data/navigation.yml` sidebar entry:
   - Collections & Tomes → "Tính Kho báu & Sách cổ"
   - Robots & Satellites → "Tính Robots & Vệ tinh"
   - Hero Equipment → "Tính Trang bị Anh hùng"
   - Hero Stars & Exclusive Equipment → "Tính Mảnh Anh hùng và Trang bị độc quyền"
2. User asked to check "tools description" (the intro paragraphs) for staleness the renames might have caused. Found and fixed, scope confirmed with the user via `ask_user` before proceeding on the 2 less-obvious cases (Satellite→Vệ tinh generic word, Hero Stars/Exclusive Equipment track names):
   - `collections-tomes.md`: "Collections và Tomes" (old tool name) → "Kho báu và Sách cổ"; "Collections"/"Tomes" H2 section headings → "Kho báu"/"Sách cổ".
   - `robots-satellites.md`: generic word "Satellite" (not the specific unit names like Laser/Watcher, which stay deferred) → "Vệ tinh", including the 3 "Satellites — R/SR/SSR" H2 headings → "Vệ tinh — R/SR/SSR".
   - `hero-stars-exclusive-equipment.md`: "Hero Stars"/"Exclusive Equipment" track names → "Sao Anh hùng"/"Trang bị độc quyền", in the intro, the 2 H2 headings, and the JS `MESSAGES.vi` track labels (which render as breakdown-table row labels).
3. A further re-verification pass ("let check tools description... ensure no stale text") found 5 more spots the rename hadn't touched:
   - `collections-tomes.md`: "6 Collection và 18 Tome" (English count nouns) → "6 Kho báu và 18 Sách cổ"; troop names "Khiên binh, Bomber, Xạ thủ" (pre-dated this session's `troop-name.js` VI relabel) → "Lính khiên, Lính ném bom, Lính súng"; disclaimer "Tên tài nguyên và tên bậc..." → "Tên bậc..." (resource names are fully translated now, so that clause was already false).
   - `robots-satellites.md`: same disclaimer fix, "Tên tài nguyên và tên Vệ tinh..." → "Tên Vệ tinh...".
   - `hero-equipment.md`: same stale troop names → "Lính khiên, Lính ném bom, Lính súng".
   - `hero-stars-exclusive-equipment.md`: quoted button text `"+ Add Hero"` → `"+ Thêm Hero"` (the real button already said the Vietnamese text).
4. User pointed out the EN pages had their own copy of the disclaimer sentence ("Resource and tier/Satellite names are shown in English for now.") — meaningless on an English page. Removed from both `contents/en/.../collections-tomes.md` and `robots-satellites.md`.
5. User asked to reformat the intro-paragraph resource mentions as "Vietnamese (English)" pairs, applied consistently across all 4 tools (first mention paired, later mentions in the same paragraph use the Vietnamese term alone): e.g. "Bảo điển (Seal) và Xu kỷ niệm (Trove Coin)", "Đĩa dữ liệu (Data Disk), Tiền tệ Hành tinh (Planet Coin) và Mô-đun Cấp điện Thông thường (Power Module)", "Kinh nghiệm Trang bị (Equipment EXP), Nam châm (Magnet), Bánh răng Chính xác (Precision Gear) và Potential Coil" (no VI yet, so no pairing), "Mảnh anh hùng (Redeem) và Mảnh trang bị độc quyền (Exclusive Weapon Parts)".
6. User asked about a claim that the 8 blocked items (exotic tiers, SSR satellites) were "already translated" — verified against the actual yml (`git diff`/`grep`), found they were NOT, reported this back rather than acting on the unverified claim. User then clarified: those 8 are deliberately untranslated because real in-game VI text isn't available yet — a genuine block, not queued work. Recorded in memory `pending-vi-translations-in-game-data` so it isn't mistaken for unfinished work in a future session.
7. User: "Mô-đun Cấp điện Thông thường too long" → shortened to "Mô-đun Cấp điện Thường" in both `_data/lands_of_jail/robots_satellites.yml` (flows through to every consumer of that resource label) and the VI intro paragraph.
8. Verified every batch: `node --test tests/*.test.mjs` (10/10 throughout) + live Chrome checks on both languages for all 4 pages after each change.

## Success Criteria
- [x] All 4 VI titles renamed consistently across page + nav.
- [x] No stale English tool/track/troop names remain in the 4 VI intro paragraphs (re-verified via a dedicated pass).
- [x] EN pages no longer carry the VI-only disclaimer sentence.
- [x] VI(EN) pairing format applied consistently across all 4 tools' intro paragraphs.
- [x] `PowerModule` VI label shortened everywhere it's sourced from (yml + intro prose).
- [x] `node --test tests/*.test.mjs` — 10/10 passing after every change in this phase.
- [ ] Phase 4's 9 modified files committed.

## Risk Assessment
Low — pure content/copy, no code logic changes except the `hero-stars-exclusive-equipment.js` VI message-string updates (verified live: breakdown-table row labels render correctly, no console errors). Main risk was scope drift (English words used generically vs. genuine staleness) — mitigated by asking the user to confirm scope before the 2 more ambiguous fixes (Satellite→Vệ tinh, Hero Stars/Exclusive Equipment track names) rather than guessing.
