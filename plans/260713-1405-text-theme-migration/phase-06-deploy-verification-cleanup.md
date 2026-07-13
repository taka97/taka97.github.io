---
phase: 6
title: "Deploy verification & cleanup"
status: done
effort: ""
---

# Phase 6: Deploy verification & cleanup

## Overview

Final integration: remove all remaining JtD/polyglot residue, handle URL-change SEO
(redirects for the EN-off-root move), verify the GitHub Actions build deploys green with
the custom domain, and update project docs to describe the TeXt stack.

## Requirements

- Functional: production build deploys; custom domain + HTTPS intact; no dead links.
- Non-functional: repo contains no orphaned JtD/polyglot files; docs match reality.

## Architecture

The GitHub Actions workflow (`.github/workflows/deploy.yml`) already self-builds with
`bundle exec jekyll build` on `ruby/setup-ruby@v1` and deploys via `actions/deploy-pages`.
It needs **no structural change** — it is theme-agnostic — but the build must pass with the
new Gemfile. `CNAME` (`games.taka97it.com`) is preserved. The main new concern is the URL
scheme change (EN moved from `/` to `/en/`), which needs redirects and refreshed
`sitemap`/`hreflang`.

## Related Code Files

- Verify (no change expected): `.github/workflows/deploy.yml`, `CNAME`.
- Create: root redirect(s) — `/ → /en/` (and optionally old `/lands-of-jail/*` →
  `/en/lands-of-jail/*`) via `jekyll-redirect-from` or static `redirect.html` pages, so old
  inbound links don't 404.
- Delete (orphans, if not already removed in Phases 4–5):
  `_sass/color_schemes/`, `_sass/custom/custom.scss` (JtD), stale JtD `_includes/*`,
  any lingering `.vi.md` originals left after the Phase 2 move.
- Modify docs: `.claude/CLAUDE.md` (rewrite theme/i18n/gotchas sections for TeXt),
  `README.md`, and `docs/` (system-architecture / conventions) to describe:
  TeXt gem, `text_skin`, TeXt-native i18n + `_data/locale.yml` `vi` block, navigation.yml
  nav groups, new language-directory URL scheme, and the Docker build (unchanged).
- Verify: `sitemap.xml` regenerates (now via `jekyll-sitemap`); update any hardcoded
  sitemap exclusions.

## Implementation Steps

1. **Full clean build** via Docker `ruby:3.3`; inspect `_site/` for both `/en/` and `/vi/`
   trees, working nav, switcher, favicons, titles, skin.
2. **Link audit:** grep built HTML (or source) for `/lands-of-jail/` without `/en|/vi`
   prefix and any `just-the-docs`/`polyglot` strings; fix stragglers.
3. **Redirects:** add `/ → /en/`; decide whether to redirect old deep URLs (recommended for
   SEO given the site is live/indexed). Use `jekyll-redirect-from` (add gem) or static
   meta-refresh pages.
4. **SEO:** confirm `sitemap.xml`, `hreflang` alternates (Phase 5), and `<title>`s are
   correct for the new URLs.
5. **Update docs** (`CLAUDE.md`, `README.md`, `docs/`) — remove polyglot gotchas
   (`parallel_localization`, `static_href`, `sass.sourcemap`) and JtD content conventions;
   document TeXt equivalents.
6. **Deploy dry-run:** push branch, open PR, let Actions build. Confirm green. (Merge to
   `main` only on user approval — do not auto-merge.)
7. **Post-deploy check:** custom domain serves the new site over HTTPS; spot-check EN/VI
   pages and switcher in the browser.

## Success Criteria

- [ ] Clean Docker build produces a complete `/en/` + `/vi/` site with no JtD/polyglot output.
- [ ] `/` redirects to `/en/`; old primary URLs redirect (or the change is consciously
      accepted and documented).
- [ ] GitHub Actions build passes on the branch; custom domain + HTTPS verified after deploy.
- [ ] `sitemap.xml` and `hreflang` reflect the new URL scheme.
- [ ] `CLAUDE.md`, `README.md`, and `docs/` describe the TeXt stack; no JtD/polyglot
      instructions remain.
- [ ] No orphaned JtD/polyglot files in the repo.

## Risk Assessment

- **SEO regression** from the URL change is the biggest real risk for a live, indexed site.
  The symmetric `/en/` scheme is confirmed (Validation Session 1), so mitigation is
  mandatory here: redirects for old EN URLs (`/ → /en/` and old deep links) + updated
  sitemap/hreflang. Verify redirects resolve before merging.
- **Actions build differs from local Docker** (bundler cache, plugin versions): mitigate by
  matching Ruby 3.3 and committing a resolved `Gemfile.lock`.
- **Memory note:** deploy has pending manual steps (per project memory
  `games-wiki-build-and-deploy`) — Pages source must be "GitHub Actions"; confirm that
  setting is unchanged after the theme swap.
