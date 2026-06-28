# Design System — Game Guides

Visual design spec for the custom theme layered on **Just the Docs 0.10.1**.
This is the source of truth for colors, typography, and component styling. Values
here map directly to the Sass files; change those files, not the theme gem.

## Files

| Purpose | File |
| --- | --- |
| Color scheme (theme variable overrides) | `_sass/color_schemes/custom.scss` |
| CSS tweaks (non-variable overrides, loaded last) | `_sass/custom/custom.scss` |
| Header hook (language switcher) | `_includes/header_custom.html` |
| Sidebar footer (copyright) | `_includes/nav_footer_custom.html` |
| Activation | `color_scheme: custom` in `_config.yml` |

> **Activation step:** the theme is only applied when `_config.yml` sets
> `color_scheme: custom` (default ships as `light`). Changing `_config.yml`
> requires a Jekyll server restart to take effect.

## Color palette

### Brand

| Token | Hex | Swatch use |
| --- | --- | --- |
| `indigo-700` | `#3b41c5` | Hover / pressed accent |
| `indigo-500` | `#4c6ef5` | Primary accent (links, buttons) |
| `teal-500` | `#0ca678` | Secondary accent (reserved) |
| `amber-500` | `#f59f00` | Highlight accent (reserved) |

### Applied roles

| Theme variable | Value | Where it shows |
| --- | --- | --- |
| `$link-color` | `indigo-500` | Links throughout content & nav |
| `$btn-primary-color` | `indigo-500` | Primary buttons |
| `$body-heading-color` | `#14142b` | All headings (h1–h6) |
| `$body-text-color` | `#353748` | Body copy |
| `$sidebar-color` | `#f7f8fc` | Left navigation background |
| `$nav-child-link-color` | `#5c6275` | Nested sidebar links |
| `$border-color` | `#e6e8f0` | Dividers, sidebar edge |
| `$search-result-preview-color` | `#6b7280` | Search result snippets |
| `$code-background-color` | `#f5f6fa` | Inline & block code background |
| `$code-linenumber-color` | `#adb5bd` | Code line numbers |

### Principles

- **One accent.** Indigo carries all interactive emphasis. Teal/amber are held
  in reserve for future callouts/badges — introduce intentionally, not casually.
- **Calm neutrals.** Near-black headings, soft grey body, very light sidebar.
  Keeps long strategy guides readable.
- **Contrast.** Indigo `#4c6ef5` on white passes WCAG AA for normal text.

## Typography

Inherits Just the Docs defaults (system font stack). Customizations:

- **Body line-height `1.6`** on `.main-content p, li` — improves readability of
  dense guide text (`_sass/custom/custom.scss`).
- **Active sidebar link `font-weight: 600`** — clearer "you are here" cue.
- Heading scale and font family: theme defaults (not overridden).

## Components

### Sidebar navigation
- Background `$sidebar-color` (`#f7f8fc`), edge uses `$border-color`.
- Game → season → guide hierarchy via Just the Docs `parent`/`grandparent`
  front matter. Active link bolded.

### Tables (stat / loot tables)
- Header row background `#f0f1f8` for scan-ability of game data tables.
- Defined in `_sass/custom/custom.scss` under `.main-content table th`.

### Code blocks
- Background `#f5f6fa`, muted line numbers. Used for config snippets, commands.

### Language switcher
- EN · VI switcher in the **main header**, right of the search box
  (`_includes/header_custom.html`, the theme's header hook).
- Right-aligned via `margin-left: auto`, vertically centered, no-wrap. Active
  language bolded; inactive language is an indigo link.
- Uses Polyglot `static_href` so each link targets its own language URL.
- The sidebar footer (`_includes/nav_footer_custom.html`) now holds only the
  copyright line.

## Bilingual notes

- Every page is two files sharing one permalink (`lang: en` / `lang: vi`).
  Styling is language-agnostic; the design applies identically to `/` and `/vi/`.
- **Known gap:** the search box placeholder ("Search Game Guides") is not yet
  localized for the VI side. Tracked as a future enhancement, not a design rule.

## Dark mode (not yet implemented)

Not currently shipped. To add later:

1. Create `_sass/color_schemes/dark-custom.scss` building on the theme's `dark`
   base with the same brand accents.
2. Add a toggle button using Just the Docs' `jtd.setTheme()` JS API.
3. Persist preference in `localStorage`.

Defer until requested — YAGNI.

## How to change the theme

1. **Recolor:** edit hex values in `_sass/color_schemes/custom.scss`.
2. **Tweak layout/spacing/components:** edit `_sass/custom/custom.scss`
   (overrides win — loaded last).
3. **Preview:** Docker Jekyll serve with live reload; refresh the browser.
   Restart the server only for `_config.yml` changes.
4. Update this document when palette roles or components change.
