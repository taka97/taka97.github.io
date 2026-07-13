# Deployment Guide — Game Guides

## Production (automatic)

Push to `main` → GitHub Actions builds and deploys to GitHub Pages.

- Workflow: `.github/workflows/deploy.yml` (`bundle exec jekyll build`,
  `JEKYLL_ENV=production`, then `deploy-pages`).
- **One-time settings:** repo **Settings → Pages → Source = GitHub Actions**.
- Custom domain bound by the `CNAME` file (`games.taka97it.com`); HTTPS enforced.
- Manual run available via **Actions → Deploy site to Pages → Run workflow**
  (`workflow_dispatch`).

Check a deploy: watch the Actions run; the `deploy` job outputs the live `page_url`.

## Local build / preview (Docker)

Ruby is **not installed locally** — use Docker `ruby:3.3`. Docker Desktop must be
running. A named volume caches the bundle between runs.

### Build into `_site/`

```sh
docker run --rm \
  -v "$PWD:/site" -v gh_pages_bundle:/usr/local/bundle \
  -w /site ruby:3.3 \
  bash -lc "bundle install && bundle exec jekyll build"
```

### Live preview at http://localhost:4000

```sh
docker run --rm -it -p 4000:4000 \
  -v "$PWD:/site" -v gh_pages_bundle:/usr/local/bundle \
  -w /site ruby:3.3 \
  bash -lc "bundle install && bundle exec jekyll serve --host 0.0.0.0"
```

### Windows Git Bash

Prefix with `MSYS_NO_PATHCONV=1` and use the absolute path:

```sh
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "E:/Cloud/GitHub/taka97.github.io:/site" \
  -v gh_pages_bundle:/usr/local/bundle \
  -w /site ruby:3.3 \
  bash -lc "bundle exec jekyll build"
```

`docker-compose.yaml` is also present for local preview.

## Environment invariants (do not change casually)

- `layout: article` + `show_title: false` in `_config.yml` `defaults` — pages render
  unthemed or with auto-generated `<h1>` without them.
- `text_skin: default` + `highlight_theme: tomorrow-night-eighties` — theme appearance.
- Pinned `jekyll-text-theme ~> 2.2`; `_includes` hooks target that version.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Page renders without theme or title is auto-generated | Missing `layout: article` / `show_title: false` in defaults |
| Switcher links to wrong language or hreflang is malformed | Missing `ref:` field in front matter or ref mismatch between EN/VI |
| VI page 404 from switcher | No `contents/vi/<path>.md` file (both EN + VI files required) |
| Favicon doesn't match game | Logic in `_includes/head/favicon.html` doesn't detect URL; check path match |
| Build fails after theme bump | Verify `_includes` hooks (`head/`, `header`, `footer`) match new theme version |
| Local build fails on Windows paths | Forgot `MSYS_NO_PATHCONV=1` / relative path in Docker command |
| Sidebar nav missing or wrong structure | `_data/navigation.yml` needs `nav: loj-en` / `loj-vi` in page front matter + correct group keys |

## Rollback

Pages serves the last successful deploy. To roll back, revert the offending commit on
`main` (or re-run an earlier green workflow) — redeploys automatically.
