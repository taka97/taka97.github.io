# Bilingual Games Wiki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN root, VI under `/vi/`) Jekyll + Just the Docs game-guides site at `games.taka97it.com`, seeded with the "Lands of Jail" Notion content, deployed via GitHub Actions.

**Architecture:** Jekyll 4 with the pinned `just-the-docs` gem (theme), `jekyll-polyglot` for two-language builds, and two vendored theme-include overrides (`head.html` for the custom `<title>`+hreflang, `nav_footer_custom.html` for the language switcher). Content is hierarchical pages (game → season → guide) using Just the Docs nav front matter. GitHub Actions runs `bundle exec jekyll build` and deploys to Pages.

**Tech Stack:** Ruby/Bundler, Jekyll 4.3.x, just-the-docs 0.10.1, jekyll-polyglot, jekyll-seo-tag, jekyll-include-cache, GitHub Actions Pages deploy.

**Spec:** `docs/superpowers/specs/2026-06-28-games-wiki-bilingual-design.md`

## Global Constraints

- Theme pinned: `just-the-docs` **0.10.1**. Jekyll **4.3.x**.
- `default_lang: "en"`, `languages: ["en", "vi"]`. EN at root, VI under `/vi/`.
- `parallel_localization: false` (Windows compatibility). `sass.sourcemap: never`.
- `url: "https://games.taka97it.com"`, `baseurl: ""` (custom domain at root).
- Plugins exactly: `jekyll-seo-tag`, `jekyll-include-cache`, `jekyll-polyglot`.
- Each content page is two files sharing one `permalink`, distinguished by `lang` (`foo.md` = en, `foo.vi.md` = vi).
- Nav front-matter `parent`/`grandparent` reference titles **in the same language** as the file.
- `<title>` scheme: Home → `Game Guides`; game landing → `<Game> - Guides` (VI: `<Game> - Hướng dẫn`); season/guide → `<Game> - <page title>`.
- No Notion property cruft in output; Notion `app.notion.com` links rewritten to internal site links.
- Commit after each task. Conventional Commit messages, no AI references.
- Source content: `D:\working\*.zip` (already extracted in scratchpad during planning; re-extract if needed).

---

### Task 1: Project scaffolding (Gemfile, config, CNAME) + local build proof

**Files:**
- Create: `Gemfile`
- Create: `_config.yml`
- Create: `CNAME`
- Create: `.gitignore`
- Create: `index.md` (temporary minimal home, replaced in Task 4)

**Interfaces:**
- Produces: a buildable Jekyll site. Later tasks rely on `_config.yml` keys (`languages`, `default_lang`, `url`, `theme`, `plugins`) and a working `bundle exec jekyll build`.

- [ ] **Step 1: Create `Gemfile`**

```ruby
source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "just-the-docs", "0.10.1"
gem "jekyll-polyglot", "~> 1.8"
gem "jekyll-seo-tag", "~> 2.8"
gem "jekyll-include-cache", "~> 0.2"

# Windows / JRuby timezone + file-watch support
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
  gem "wdm", "~> 0.1.1"
end
```

- [ ] **Step 2: Create `_config.yml`**

```yaml
title: "Game Guides"
description: "Game guides and strategy wiki"
url: "https://games.taka97it.com"
baseurl: ""

theme: just-the-docs

plugins:
  - jekyll-seo-tag
  - jekyll-include-cache
  - jekyll-polyglot

# --- Polyglot (i18n) ---
languages: ["en", "vi"]
default_lang: "en"
exclude_from_localization: ["CNAME", "assets", "sitemap.xml"]
parallel_localization: false

# --- Just the Docs ---
search_enabled: true
color_scheme: light
back_to_top: true
back_to_top_text: "Back to top"

# --- Jekyll 4 + Polyglot ---
sass:
  sourcemap: never

exclude:
  - Gemfile
  - Gemfile.lock
  - vendor
  - docs/
  - plans/
  - README.md
```

- [ ] **Step 3: Create `CNAME`**

```
games.taka97it.com
```

- [ ] **Step 4: Create `.gitignore`**

```
_site/
.jekyll-cache/
.jekyll-metadata
vendor/
.bundle/
```

- [ ] **Step 5: Create temporary `index.md`**

```markdown
---
title: Home
nav_order: 1
lang: en
permalink: /
title_override: "Game Guides"
---

# Game Guides

Placeholder home.
```

- [ ] **Step 6: Install deps**

Run: `bundle install`
Expected: resolves and installs jekyll, just-the-docs 0.10.1, jekyll-polyglot, etc. Creates `Gemfile.lock`.
(If Ruby/Bundler is not installed: install Ruby+Devkit 3.x and run `gem install bundler` first.)

- [ ] **Step 7: Build to verify the toolchain works**

Run: `bundle exec jekyll build`
Expected: "done in N seconds", exit 0. `_site/index.html` exists AND `_site/vi/index.html` exists (Polyglot produced both languages — even though the VI home isn't authored yet, it falls back to EN).

- [ ] **Step 8: Commit**

```bash
git add Gemfile Gemfile.lock _config.yml CNAME .gitignore index.md
git commit -m "chore: scaffold jekyll just-the-docs site with polyglot"
```

---

### Task 2: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the buildable site + `Gemfile.lock` from Task 1.
- Produces: a Pages deployment on push to `main`.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# Allow one concurrent deployment
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3"
          bundler-cache: true
      - name: Build with Jekyll
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate YAML locally**

Run: `bundle exec ruby -ryaml -e "YAML.load_file('.github/workflows/deploy.yml'); puts 'workflow OK'"`
Expected: prints `workflow OK` (no parse error).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add github actions pages deploy workflow"
```

> **Manual steps (record for the user, not automatable here):**
> After first push: repo **Settings → Pages → Source = GitHub Actions**.
> DNS: add a `CNAME` record `games` → `taka97.github.io` at the registrar.

---

### Task 3: Theme include overrides — custom `<title>`, hreflang, language switcher

**Files:**
- Create: `_includes/head.html` (override of theme include, based on just-the-docs v0.10.1)
- Create: `_includes/nav_footer_custom.html`

**Interfaces:**
- Consumes: `_config.yml` (`languages`, `default_lang`, `url`, `baseurl`), Polyglot's `site.active_lang` and `{% static_href %}` tag.
- Produces: per-page `<title>`, `<link rel="alternate" hreflang>` tags, and a sidebar language switcher. Relies on page front matter `title`, `parent`, `grandparent`, `has_children`, `title_override`.

- [ ] **Step 1: Create `_includes/head.html`**

This is the v0.10.1 theme `head.html` with two changes: `{% seo %}` → `{% seo title=false %}`, and a custom `<title>` + hreflang block added before `head_custom.html`.

```liquid
{%- comment -%}
  Overrides just-the-docs v0.10.1 _includes/head.html.
  Changes: custom <title> logic, hreflang alternates, seo title disabled.
{%- endcomment -%}
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">

  <link rel="stylesheet" href="{{ '/assets/css/just-the-docs-default.css' | relative_url }}">
  <link rel="stylesheet" href="{{ '/assets/css/just-the-docs-head-nav.css' | relative_url }}" id="jtd-head-nav-stylesheet">

  <style id="jtd-nav-activation">
  {% include css/activation.scss.liquid %}
  </style>

  {% if site.ga_tracking != nil %}
    {% assign ga_tracking_ids = site.ga_tracking | split: "," %}
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ ga_tracking_ids.first }}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      {% for ga_property in ga_tracking_ids %}
        gtag('config', '{{ ga_property }}'{% unless site.ga_tracking_anonymize_ip == nil %}, { 'anonymize_ip': true }{% endunless %});
      {% endfor %}
    </script>
  {% endif %}

  {% if site.search_enabled != false %}
    <script src="{{ '/assets/js/vendor/lunr.min.js' | relative_url }}"></script>
  {% endif %}

  <script src="{{ '/assets/js/just-the-docs.js' | relative_url }}"></script>

  <meta name="viewport" content="width=device-width, initial-scale=1">

  {% include_cached favicon.html %}

  {%- comment -%} Custom <title> {%- endcomment -%}
  {%- if page.title_override -%}
    {%- assign full_title = page.title_override -%}
  {%- elsif page.parent -%}
    {%- assign game = page.grandparent | default: page.parent -%}
    {%- assign full_title = game | append: " - " | append: page.title -%}
  {%- elsif page.has_children -%}
    {%- if site.active_lang == "vi" -%}{%- assign guides_word = "Hướng dẫn" -%}{%- else -%}{%- assign guides_word = "Guides" -%}{%- endif -%}
    {%- assign full_title = page.title | append: " - " | append: guides_word -%}
  {%- elsif page.title -%}
    {%- assign full_title = page.title -%}
  {%- else -%}
    {%- assign full_title = site.title -%}
  {%- endif -%}
  <title>{{ full_title }}</title>

  {%- comment -%} hreflang alternates (bypass polyglot href rewriting) {%- endcomment -%}
  {%- for lang in site.languages -%}
    <link rel="alternate" hreflang="{{ lang }}" {% static_href %}href="{{ site.url }}{{ site.baseurl }}{% if lang != site.default_lang %}/{{ lang }}{% endif %}{{ page.url }}"{% endstatic_href %} />
  {%- endfor -%}

  {% seo title=false %}

  {% include head_custom.html %}
</head>
```

- [ ] **Step 2: Create `_includes/nav_footer_custom.html`**

```liquid
{%- comment -%}
  Language switcher in the sidebar footer.
  static_href stops Polyglot from rewriting these hrefs to the active language,
  so each link points at its own language explicitly.
{%- endcomment -%}
<div class="lang-switcher" role="navigation" aria-label="Language">
  {%- for lang in site.languages -%}
    {%- if lang == site.active_lang -%}
      <span class="lang-switcher__active" aria-current="true">{{ lang | upcase }}</span>
    {%- else -%}
      <a {% static_href %}href="{{ site.baseurl }}{% if lang != site.default_lang %}/{{ lang }}{% endif %}{{ page.url }}"{% endstatic_href %}>{{ lang | upcase }}</a>
    {%- endif -%}
    {%- unless forloop.last %} · {% endunless -%}
  {%- endfor -%}
</div>

<footer class="site-footer">
  &copy; {{ "now" | date: "%Y" }} {{ site.title }}
</footer>
```

- [ ] **Step 3: Build**

Run: `bundle exec jekyll build`
Expected: exit 0, no Liquid errors.

- [ ] **Step 4: Verify EN home title**

Run: `grep -o "<title>[^<]*</title>" _site/index.html`
Expected: `<title>Game Guides</title>`

- [ ] **Step 5: Verify hreflang + switcher emitted**

Run: `grep -c 'rel="alternate" hreflang' _site/index.html && grep -c 'lang-switcher' _site/index.html`
Expected: first count `2` (en + vi), second count `>= 1`.

- [ ] **Step 6: Verify VI home falls back and switcher links to EN**

Run: `grep -o 'href="[^"]*"' _site/vi/index.html | grep -E '/(vi)?/?"?$' | head`
Expected: switcher contains a link to `/` (EN home) from the VI page. (Manual eyeball acceptable.)

- [ ] **Step 7: Commit**

```bash
git add _includes/head.html _includes/nav_footer_custom.html
git commit -m "feat: custom title, hreflang, and language switcher"
```

---

### Task 4: Home portal page (EN + VI)

**Files:**
- Modify: `index.md` (replace temporary version)
- Create: `index.vi.md`

**Interfaces:**
- Consumes: title override logic from Task 3.
- Produces: the site landing page linking to each game; `permalink: /` shared by both langs.

- [ ] **Step 1: Replace `index.md`**

```markdown
---
title: Home
nav_order: 1
lang: en
permalink: /
title_override: "Game Guides"
---

# Game Guides

Strategy guides and tips for the games I play.

## Games

- [Lands of Jail](/lands-of-jail/)
```

- [ ] **Step 2: Create `index.vi.md`**

```markdown
---
title: Trang chủ
nav_order: 1
lang: vi
permalink: /
title_override: "Game Guides"
---

# Game Guides

Hướng dẫn và mẹo chơi cho các game tôi chơi.

## Trò chơi

- [Lands of Jail](/lands-of-jail/)
```

- [ ] **Step 3: Build**

Run: `bundle exec jekyll build`
Expected: exit 0.

- [ ] **Step 4: Verify both homes link to the game**

Run: `grep -o 'href="[^"]*lands-of-jail[^"]*"' _site/index.html _site/vi/index.html`
Expected: EN home links to `/lands-of-jail/`; VI home links to `/vi/lands-of-jail/` (Polyglot localizes the in-content link on the VI build).

- [ ] **Step 5: Commit**

```bash
git add index.md index.vi.md
git commit -m "feat: bilingual home portal page"
```

---

### Task 5: Lands of Jail game landing page (EN + VI)

Source: scratchpad `extracted/4/Lands of Jail *.md`. Keep the Gorilla ratios, Characters/Builds, Notes. Rewrite the Notion "Guides" links to internal links. Drop the `Trạng Thái` line.

**Files:**
- Create: `lands-of-jail/index.md`
- Create: `lands-of-jail/index.vi.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: top-level nav node `Lands of Jail` (`has_children: true`) that season pages reference as `grandparent` and `parent`.

- [ ] **Step 1: Create `lands-of-jail/index.md`**

```markdown
---
title: Lands of Jail
nav_order: 2
has_children: true
lang: en
permalink: /lands-of-jail/
---

# Lands of Jail

## Tips & Tactics

### Ratios for Gorilla

- Space Gorilla — 0/5/95
- Wise Gorilla — 5/25/70
- Primal Gorilla — 5/30/65
- Cyber Gorilla — 0/0/100
- Armed Gorilla — 0/30/70
- Treasure Gorilla — 0/35/65
- Gorilla Warlord — 0/35/65

## Guides

### Season 1

- [Satellite](/lands-of-jail/season-1/satellite/)

### Season 2

- [Heroes](/lands-of-jail/season-2/heroes/)
- [Robots](/lands-of-jail/season-2/robots/)

## Characters / Builds / Loadouts

_Add character builds here._

## Additional Notes

_Add notes here._
```

- [ ] **Step 2: Create `lands-of-jail/index.vi.md`**

```markdown
---
title: Lands of Jail
nav_order: 2
has_children: true
lang: vi
permalink: /lands-of-jail/
---

# Lands of Jail

## Mẹo & Chiến thuật

### Tỉ lệ cho Gorilla

- Space Gorilla — 0/5/95
- Wise Gorilla — 5/25/70
- Primal Gorilla — 5/30/65
- Cyber Gorilla — 0/0/100
- Armed Gorilla — 0/30/70
- Treasure Gorilla — 0/35/65
- Gorilla Warlord — 0/35/65

## Hướng dẫn

### Season 1

- [Satellite](/lands-of-jail/season-1/satellite/)

### Season 2

- [Heroes](/lands-of-jail/season-2/heroes/)
- [Robots](/lands-of-jail/season-2/robots/)

## Nhân vật / Build / Trang bị

_Thêm build nhân vật tại đây._

## Ghi chú thêm

_Thêm ghi chú tại đây._
```

- [ ] **Step 3: Build**

Run: `bundle exec jekyll build`
Expected: exit 0.

- [ ] **Step 4: Verify title + page output**

Run: `grep -o "<title>[^<]*</title>" _site/lands-of-jail/index.html`
Expected: `<title>Lands of Jail - Guides</title>`

Run: `grep -o "<title>[^<]*</title>" _site/vi/lands-of-jail/index.html`
Expected: `<title>Lands of Jail - Hướng dẫn</title>`

- [ ] **Step 5: Commit**

```bash
git add lands-of-jail/index.md lands-of-jail/index.vi.md
git commit -m "feat: lands of jail game landing page (en+vi)"
```

---

### Task 6: Season index pages (EN + VI)

**Files:**
- Create: `lands-of-jail/season-1/index.md`, `lands-of-jail/season-1/index.vi.md`
- Create: `lands-of-jail/season-2/index.md`, `lands-of-jail/season-2/index.vi.md`

**Interfaces:**
- Consumes: `parent: Lands of Jail` node from Task 5.
- Produces: season nav nodes (`has_children: true`) referenced by guide pages as `parent`.

- [ ] **Step 1: Create `lands-of-jail/season-1/index.md`**

```markdown
---
title: Season 1
parent: Lands of Jail
nav_order: 1
has_children: true
lang: en
permalink: /lands-of-jail/season-1/
---

# Season 1

Guides for Season 1.

- [Satellite](/lands-of-jail/season-1/satellite/)
```

- [ ] **Step 2: Create `lands-of-jail/season-1/index.vi.md`**

```markdown
---
title: Season 1
parent: Lands of Jail
nav_order: 1
has_children: true
lang: vi
permalink: /lands-of-jail/season-1/
---

# Season 1

Hướng dẫn cho Season 1.

- [Satellite](/lands-of-jail/season-1/satellite/)
```

- [ ] **Step 3: Create `lands-of-jail/season-2/index.md`**

```markdown
---
title: Season 2
parent: Lands of Jail
nav_order: 2
has_children: true
lang: en
permalink: /lands-of-jail/season-2/
---

# Season 2

Guides for Season 2.

- [Heroes](/lands-of-jail/season-2/heroes/)
- [Robots](/lands-of-jail/season-2/robots/)
```

- [ ] **Step 4: Create `lands-of-jail/season-2/index.vi.md`**

```markdown
---
title: Season 2
parent: Lands of Jail
nav_order: 2
has_children: true
lang: vi
permalink: /lands-of-jail/season-2/
---

# Season 2

Hướng dẫn cho Season 2.

- [Heroes](/lands-of-jail/season-2/heroes/)
- [Robots](/lands-of-jail/season-2/robots/)
```

- [ ] **Step 5: Build + verify titles**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -o "<title>[^<]*</title>" _site/lands-of-jail/season-1/index.html`
Expected: `<title>Lands of Jail - Season 1</title>`

- [ ] **Step 6: Commit**

```bash
git add lands-of-jail/season-1 lands-of-jail/season-2
git commit -m "feat: season index pages (en+vi)"
```

---

### Task 7: Satellite guide (EN + VI)

Source: scratchpad `extracted/2/Lands of Jail - Satellite *.md`. Drop the `Season: Season 1` property line. EN = source content; VI = translation.

**Files:**
- Create: `lands-of-jail/season-1/satellite.md`
- Create: `lands-of-jail/season-1/satellite.vi.md`

**Interfaces:**
- Consumes: `parent: Season 1`, `grandparent: Lands of Jail` nodes.
- Produces: leaf guide page.

- [ ] **Step 1: Create `lands-of-jail/season-1/satellite.md`**

```markdown
---
title: Satellite
parent: Season 1
grandparent: Lands of Jail
nav_order: 1
lang: en
permalink: /lands-of-jail/season-1/satellite/
---

# Lands of Jail - Satellite

## Overview

### 1️⃣ TOP PRIORITY: LASER SATELLITE 🔵

The engine of your progression.

**Why:** It's the only satellite that passively generates the resources needed to upgrade the other satellites.

**Rewards:** 5 chests/day containing Space Parts and EXP Disks.

**Verdict:** Max this one first to create a "snowball effect" on your space economy.

### PvE OPTIMIZATION: RADIANCE SATELLITE 🔵

The field specialist.

**Effect:** +11% Attack & Defense during prisoner arrests.

**Usefulness:** Essential for clearing difficult PvE stages and completing your daily mission objectives.

**Note:** Useless in PvP; focus on it once your Laser Satellite is stable.

### SECONDARY SUPPORT: OBSERVATION SATELLITE 🔵

The comfort bonus.

**Effect:** Reduced HP for deflectors + daily resource chest.

**Verdict:** Leave this one for last. The bonuses are nice but have less impact than the Laser or Radiance combat boost.

## Priority Order

1. **LASER 🔵 (Economy):** Satellite resources
2. **SENTINEL 🟣 (Reinforcement):** Instant troop training
3. **ARGUS 🟡 (Growth):** Increases expedition capacity
4. **ARBITER 🟣 (Combat):** Extra damage during the Cage event
5. **POLARIS 🟡 (Target):** Gorilla attack bonus
6. **RADIANCE 🔵 (PvE Strength):** Attack bonus for PvE arrests
7. **OBSERVATION 🔵 (Support):** Daily resource chest and support bonus
```

- [ ] **Step 2: Create `lands-of-jail/season-1/satellite.vi.md`**

```markdown
---
title: Satellite
parent: Season 1
grandparent: Lands of Jail
nav_order: 1
lang: vi
permalink: /lands-of-jail/season-1/satellite/
---

# Lands of Jail - Satellite

## Tổng quan

### 1️⃣ ƯU TIÊN HÀNG ĐẦU: LASER SATELLITE 🔵

Động cơ cho sự phát triển của bạn.

**Vì sao:** Đây là vệ tinh duy nhất tự động tạo ra tài nguyên cần thiết để nâng cấp các vệ tinh khác.

**Phần thưởng:** 5 rương/ngày chứa Space Parts và EXP Disks.

**Kết luận:** Max cái này đầu tiên để tạo "hiệu ứng quả cầu tuyết" cho nền kinh tế vũ trụ của bạn.

### TỐI ƯU PvE: RADIANCE SATELLITE 🔵

Chuyên gia thực chiến.

**Hiệu ứng:** +11% Tấn công & Phòng thủ khi bắt giữ tù nhân.

**Hữu ích:** Cần thiết để vượt các màn PvE khó và hoàn thành nhiệm vụ hằng ngày.

**Lưu ý:** Vô dụng trong PvP; chỉ tập trung khi Laser Satellite đã ổn định.

### HỖ TRỢ PHỤ: OBSERVATION SATELLITE 🔵

Phần thưởng tiện ích.

**Hiệu ứng:** Giảm HP của deflector + rương tài nguyên hằng ngày.

**Kết luận:** Để cái này sau cùng. Lợi ích tốt nhưng ít tác động hơn Laser hay Radiance.

## Thứ tự ưu tiên

1. **LASER 🔵 (Kinh tế):** Tài nguyên vệ tinh
2. **SENTINEL 🟣 (Tăng viện):** Huấn luyện lính tức thì
3. **ARGUS 🟡 (Phát triển):** Tăng sức chứa viễn chinh
4. **ARBITER 🟣 (Chiến đấu):** Sát thương thêm trong sự kiện Cage
5. **POLARIS 🟡 (Mục tiêu):** Thưởng tấn công Gorilla
6. **RADIANCE 🔵 (Sức mạnh PvE):** Thưởng tấn công khi bắt giữ PvE
7. **OBSERVATION 🔵 (Hỗ trợ):** Rương tài nguyên hằng ngày và thưởng hỗ trợ
```

- [ ] **Step 3: Build + verify title**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -o "<title>[^<]*</title>" _site/lands-of-jail/season-1/satellite/index.html`
Expected: `<title>Lands of Jail - Satellite</title>`

- [ ] **Step 4: Commit**

```bash
git add lands-of-jail/season-1/satellite.md lands-of-jail/season-1/satellite.vi.md
git commit -m "feat: satellite guide (en+vi)"
```

---

### Task 8: Heroes guide (EN + VI)

Source: scratchpad `extracted/3/Lands of Jail - Season 2 - Heroes *.md`. Drop the `Season: Season 2` line.

**Files:**
- Create: `lands-of-jail/season-2/heroes.md`
- Create: `lands-of-jail/season-2/heroes.vi.md`

- [ ] **Step 1: Create `lands-of-jail/season-2/heroes.md`**

```markdown
---
title: Heroes
parent: Season 2
grandparent: Lands of Jail
nav_order: 1
lang: en
permalink: /lands-of-jail/season-2/heroes/
---

# Lands of Jail - Heroes

## 🔹 CÉSAR — Defensive • Defensive deflector

- Troop resurrection
- Rally defense
- Prison gate

## 🔹 ALPH — Versatile • Defense

- Solo attack & rally
- ↓ Enemy lethality
- ↑ Attack & Defense
- ↓ Enemy defense

## 🔹 LANCHESTER — Building Defense • Defensive bomber

- Best for buildings & prison

## 🔹 MIREYA — Attack • Main marksman for rallies

- Also effective in solo attacks.
```

- [ ] **Step 2: Create `lands-of-jail/season-2/heroes.vi.md`**

```markdown
---
title: Heroes
parent: Season 2
grandparent: Lands of Jail
nav_order: 1
lang: vi
permalink: /lands-of-jail/season-2/heroes/
---

# Lands of Jail - Heroes

## 🔹 CÉSAR — Phòng thủ • Deflector phòng thủ

- Hồi sinh quân
- Phòng thủ rally
- Cổng nhà tù

## 🔹 ALPH — Đa năng • Phòng thủ

- Tấn công solo & rally
- ↓ Sát thương kẻ địch
- ↑ Tấn công & Phòng thủ
- ↓ Phòng thủ kẻ địch

## 🔹 LANCHESTER — Phòng thủ công trình • Bomber phòng thủ

- Tốt nhất cho công trình & nhà tù

## 🔹 MIREYA — Tấn công • Xạ thủ chính cho rally

- Cũng hiệu quả khi tấn công solo.
```

- [ ] **Step 3: Build + verify title**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -o "<title>[^<]*</title>" _site/lands-of-jail/season-2/heroes/index.html`
Expected: `<title>Lands of Jail - Heroes</title>`

- [ ] **Step 4: Commit**

```bash
git add lands-of-jail/season-2/heroes.md lands-of-jail/season-2/heroes.vi.md
git commit -m "feat: heroes guide (en+vi)"
```

---

### Task 9: Robots guide (EN + VI)

Source: scratchpad `extracted/1/Lands of Jail - Season 2 - Robots *.md`. Drop the `Season: Season 2` line.

**Files:**
- Create: `lands-of-jail/season-2/robots.md`
- Create: `lands-of-jail/season-2/robots.vi.md`

- [ ] **Step 1: Create `lands-of-jail/season-2/robots.md`**

```markdown
---
title: Robots
parent: Season 2
grandparent: Lands of Jail
nav_order: 2
lang: en
permalink: /lands-of-jail/season-2/robots/
---

# Lands of Jail - Robots

## 🔹 Robot 4 — Ranger ⭐ TOP PRIORITY

- Max level: 90
- Pure Attack + Defense (armor bonus)
- +60% Marksman Attack / +30% Other Troops

## 🔹 Robot 3 — Resurrection • Essential 🔑

- Activate before attacking
- Saves dead troops
- Level 60 is enough

## 🔹 Robot 1 — Construction

- Use with Quick Construction ⚡
- Supreme Prison bonus (+10% → +18%)
- Use with construction decree
- ⚠️ Utility robots: do not max — upgrade last.
```

- [ ] **Step 2: Create `lands-of-jail/season-2/robots.vi.md`**

```markdown
---
title: Robots
parent: Season 2
grandparent: Lands of Jail
nav_order: 2
lang: vi
permalink: /lands-of-jail/season-2/robots/
---

# Lands of Jail - Robots

## 🔹 Robot 4 — Ranger ⭐ ƯU TIÊN HÀNG ĐẦU

- Cấp tối đa: 90
- Thuần Tấn công + Phòng thủ (thưởng giáp)
- +60% Tấn công Xạ thủ / +30% Quân khác

## 🔹 Robot 3 — Hồi sinh • Thiết yếu 🔑

- Kích hoạt trước khi tấn công
- Cứu quân đã chết
- Cấp 60 là đủ

## 🔹 Robot 1 — Xây dựng

- Dùng với Quick Construction ⚡
- Thưởng Supreme Prison (+10% → +18%)
- Dùng với sắc lệnh xây dựng
- ⚠️ Robot tiện ích: đừng max — nâng cấp sau cùng.
```

- [ ] **Step 3: Build + verify title**

Run: `bundle exec jekyll build`
Expected: exit 0.

Run: `grep -o "<title>[^<]*</title>" _site/lands-of-jail/season-2/robots/index.html`
Expected: `<title>Lands of Jail - Robots</title>`

- [ ] **Step 4: Commit**

```bash
git add lands-of-jail/season-2/robots.md lands-of-jail/season-2/robots.vi.md
git commit -m "feat: robots guide (en+vi)"
```

---

### Task 10: Full-site verification + serve check

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `rm -rf _site && bundle exec jekyll build`
Expected: exit 0, no warnings about missing includes or Liquid errors.

- [ ] **Step 2: Verify all expected output pages exist**

Run:
```bash
for p in \
  index.html vi/index.html \
  lands-of-jail/index.html vi/lands-of-jail/index.html \
  lands-of-jail/season-1/satellite/index.html vi/lands-of-jail/season-1/satellite/index.html \
  lands-of-jail/season-2/heroes/index.html vi/lands-of-jail/season-2/heroes/index.html \
  lands-of-jail/season-2/robots/index.html vi/lands-of-jail/season-2/robots/index.html ; do
  test -f "_site/$p" && echo "OK $p" || echo "MISSING $p" ; done
```
Expected: all `OK`, no `MISSING`.

- [ ] **Step 3: Verify CNAME copied to output**

Run: `cat _site/CNAME`
Expected: `games.taka97it.com`

- [ ] **Step 4: Verify every EN page title matches the scheme**

Run:
```bash
for f in index lands-of-jail/index lands-of-jail/season-1/satellite lands-of-jail/season-2/heroes lands-of-jail/season-2/robots ; do
  echo "$f: $(grep -o '<title>[^<]*</title>' _site/$f.html 2>/dev/null || grep -o '<title>[^<]*</title>' _site/$f/index.html)"; done
```
Expected: `Game Guides`, `Lands of Jail - Guides`, `Lands of Jail - Satellite`, `Lands of Jail - Heroes`, `Lands of Jail - Robots`.

- [ ] **Step 5: Serve and smoke-test (optional, manual)**

Run: `bundle exec jekyll serve` then open `http://localhost:4000/` and `http://localhost:4000/vi/`.
Check: sidebar shows Lands of Jail → Season 1/2 → guides; search works; language switcher flips between `/` and `/vi/` on the same page.

- [ ] **Step 6: Final commit (if any lockfile/config drift)**

```bash
git add -A && git commit -m "chore: verify full bilingual site build" || echo "nothing to commit"
```

> **Post-merge manual steps (user):**
> 1. Push `main`; confirm the Actions run succeeds.
> 2. Settings → Pages → Source = **GitHub Actions**.
> 3. Add DNS `CNAME`: `games` → `taka97.github.io`. Wait for propagation, then enable "Enforce HTTPS".

---

## Self-Review

- **Spec coverage:** tech/hosting (T1), Actions deploy (T2), CNAME (T1), hierarchy + nav (T5/T6/T7-9), home portal (T4), i18n config (T1), file convention `.vi.md`+shared permalink (all content tasks), switcher + hreflang (T3), custom title scheme incl. localized "Guides"/"Hướng dẫn" (T3, verified T5), Notion link rewrite + cruft drop (T5/T7-9), add-a-game workflow (documented in spec; structure proven by T5-9), full verification (T10). No gaps.
- **Placeholder scan:** Content "_Add … here._" lines in T5 are intentional empty-section markers from the source (the Notion page had empty Characters/Notes sections), not plan placeholders; all code/config steps are complete.
- **Type/name consistency:** nav titles consistent (`Lands of Jail`, `Season 1`, `Season 2`); permalinks match links used in portal/landing; `title_override`, `has_children`, `parent`, `grandparent` used consistently with the Task 3 title logic.

## Open Risks

- Polyglot `static_href` + `page.url` switcher/hreflang URLs are the least-certain piece; T3 steps 4-6 verify output. If `page.url` includes the lang prefix on the VI build, drop the `/{{ lang }}` prepend.
- Local build requires Ruby/Bundler on Windows; if unavailable, rely on the Actions build (T2) for verification instead of local `bundle exec` steps.
