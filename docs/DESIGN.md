# Design System — Game Guides

Visual design spec for the custom theme layered on **jekyll-text-theme ~> 2.2**.
This is the source of truth for typography and component styling. Values here map
directly to the Sass file; change it, not the theme gem.

## Files

| Purpose | File |
| --- | --- |
| Typography + components | `_sass/custom.scss` |
| Header hook (language switcher) | `_includes/header.html` |
| Head hook (favicon + hreflang) | `_includes/head/favicon.html`, `head/custom.html` |
| Footer hook (copyright) | `_includes/footer.html` |
| Navigation structure | `_data/navigation.yml` |
| UI strings (locales) | `_data/locale.yml` |
| Theme activation | `text_skin: default`, `highlight_theme: tomorrow-night-eighties` in `_config.yml` |

> **Activation:** TeXt's skin and highlight theme are applied by `_config.yml` settings.
> Changing `_config.yml` requires a Jekyll server restart to take effect.

## Color palette

The site uses **TeXt's `default` skin** (light theme). The old custom indigo/teal
palette (from Just the Docs era) is no longer in use. Current colors are TeXt defaults.

### TeXt default skin colors (informational)

Links, headings, body text, sidebar, and borders follow TeXt's light-theme defaults.
The design is calm and high-contrast for long strategy guides. If a recolor is needed,
add a new custom Sass file or override in `_sass/custom.scss`.

### Design principles

- **Readable neutrals.** Light backgrounds, dark text, subtle borders. Good contrast
  for long-form guides.
- **Accessibility.** Defaults follow WCAG AA standards. Custom colors should maintain
  contrast ratios before deploying.
- **Reserved accents.** Teal/amber are held in reserve for future callouts/badges —
  introduce intentionally, not casually.

## Typography

Inherits TeXt defaults (system font stack). Customizations in `_sass/custom.scss`:

- **Body line-height `1.6`** on `.main-content p, li` — improves readability of
  dense guide text (stats, walkthroughs).
- **Table header tint** — subtle background for stat/loot table headers, improves
  scan-ability.
- **Language switcher styling** — positioned in the header, right of search, with
  bold active lang and indigo inactive lang.
- Heading scale and font family: theme defaults (not overridden).

## Components

### Sidebar navigation
- Per-language groups defined in `_data/navigation.yml` (`loj-en` / `loj-vi`).
- Game → season → guide hierarchy expressed as **two levels** (TeXt limitation):
  season groups with guide children. Game name is a non-link section title.
- Active link bolded for "you are here" cue.

### Tables (stat / loot tables)
- Header row gets a subtle background tint for scan-ability of game data tables.
- Defined in `_sass/custom/custom.scss` under `.main-content table th`.

### Code blocks
- Theme default styling. Used for config snippets, commands.

### Language switcher
- EN · VI switcher in the **main header**, right of the search box
  (`_includes/header.html`, the theme's header hook).
- Right-aligned via `margin-left: auto`, vertically centered, no-wrap. Active
  language bolded; inactive language is a styled link.
- Finds the language pair via shared `ref` + opposite `lang` field in front matter.

### Header + Footer
- Header: TeXt default bar with site title + search + language switcher.
- Footer: copyright line with year from `_data/locale.yml`.

## Bilingual notes

- Every page has a EN version (`contents/en/<path>.md`) and VI version (`contents/vi/<path>.md`),
  linked by shared `ref`. Styling is language-agnostic; design applies to both.
- **Known gap:** the search box placeholder ("Search") is rendered by TeXt in EN only.
  Tracked as a future enhancement (low priority).

## Dark mode (not yet implemented)

Not currently shipped. TeXt supports dark skins via configuration. To add later:

1. Change `text_skin` in `_config.yml` to a dark variant (check TeXt docs for available skins).
2. Test that custom `_sass/custom.scss` styles remain readable on dark background.
3. Consider a JavaScript toggle using TeXt's theme API (if available).

Defer until requested — YAGNI.

## How to change the theme

1. **Adjust spacing/typography/components:** edit `_sass/custom.scss`
   (loaded last in cascade, so overrides win).
2. **Change color scheme:** modify `text_skin` in `_config.yml` (see TeXt docs for
   available skins) or override variables in custom Sass if needed.
3. **Navigation layout:** edit `_data/navigation.yml` structure (groups + children).
4. **UI strings (locales):** edit `_data/locale.yml` (en + vi blocks).
5. **Preview:** Docker Jekyll serve with live reload; refresh the browser.
   Restart the server only for `_config.yml` or `_data/` changes.
6. Update this document when component styles, navigation structure, or color scheme change.
