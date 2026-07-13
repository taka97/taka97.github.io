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

- `parallel_localization: false` — Polyglot uses `fork` otherwise; breaks on Windows.
- `sass.sourcemap: never` — avoids a Jekyll 4 + Polyglot Sass issue.
- `layout: default` in `_config.yml` `defaults` — pages render unthemed without it.
- Pinned `just-the-docs 0.10.1`; `_includes` overrides target that version.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Page renders without theme | Missing `layout: default` / removed `defaults` |
| Switcher or hreflang points at wrong language | Missing `{% static_href %}` wrap |
| VI page 404 from switcher | No `.vi.md` for that permalink (EN-only page) |
| Build fails after theme bump | Overridden `_includes` drifted from new theme version |
| Local build fails on Windows paths | Forgot `MSYS_NO_PATHCONV=1` / relative path |

## Rollback

Pages serves the last successful deploy. To roll back, revert the offending commit on
`main` (or re-run an earlier green workflow) — redeploys automatically.
