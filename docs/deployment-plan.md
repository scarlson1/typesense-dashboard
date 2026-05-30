# Easy deployment for typesense-dashboard

## Context

The project is a **100% client-side static SPA** (Vite + React 19 + TanStack Router with
`createHashHistory`, see `src/main.tsx:34`). It has no backend: the user enters their Typesense
host/port/protocol/API key at runtime on the `/#/auth` route, stored in session storage, and the
browser talks directly to Typesense. Build output is static files in `dist/`.

Today it only ships to **GitHub Pages** (`base: '/typesense-dashboard'` in `vite.config.ts:24`).
Goal: make it as easy to self-host as Typelens (`https://typelens.copperline.io/`, "Deploy on
Railway"). Two complementary deliverables:

1. **Static hosting** — a trivial, free, server-less path for the dashboard alone.
2. **Railway one-click** — a template that provisions **Typesense (auto-HTTPS) + dashboard**
   together, which is the real value of Railway: it eliminates the documented TLS / mixed-content
   pain (`README.md:29-44`) where an HTTPS dashboard can't reach an HTTP Typesense.

Because routing is hash-based, **no SPA-fallback rewrite rules are needed** on any static host.

## Part 1 — Static hosting (Cloudflare Pages / Vercel / Netlify)

Primary recommendation: **Cloudflare Pages** (free, fast, auto-HTTPS, custom domains); Vercel and
Netlify are equivalent fallbacks. Steps:

- **Make `base` root-relative when not on GitHub Pages.** In `vite.config.ts`, drive `base` from an
  env var (e.g. `process.env.VITE_BASE_PATH ?? '/'`) so the GH Pages build keeps
  `/typesense-dashboard` while a root-domain host uses `/`. Keep the GH Pages workflow passing the
  old value.
- **Confirm Sentry plugin no-ops without a token.** `sentryVitePlugin` in `vite.config.ts` runs on
  every build; ensure a missing `SENTRY_AUTH_TOKEN` just skips upload (it does by default) so
  third-party builds don't fail.
- **Add host config files** (no code changes):
  - Vercel: `vercel.json` (or dashboard) — build `pnpm build`, output `dist`.
  - Netlify: `netlify.toml` — `[build] command = "pnpm build"`, `publish = "dist"`.
  - Cloudflare Pages: configured in dashboard — build `pnpm build`, output `dist`.
- **Build-time env vars** the host must set: `VITE_MAPBOX_TOKEN` (geosearch), optional
  `VITE_APP_VERSION`. `VITE_*` are baked at build time — without them geosearch silently degrades.
- **README**: add a "Deploy" section with one-click buttons (Vercel/Netlify deploy URLs).

## Part 2 — Railway one-click (Typesense + dashboard)

- **Add a production Dockerfile** (the existing `Dockerfile` only runs `pnpm run dev` and is
  unsuitable for production). New multi-stage build:
  - Stage 1: `node:alpine`, `pnpm install --frozen-lockfile`, `pnpm build` (pass `VITE_*` build
    args).
  - Stage 2: lightweight static server (`nginx:alpine` or `serve`) serving `dist/`, listening on
    `$PORT`.
  - Keep it separate from the dev `Dockerfile` (e.g. `Dockerfile.prod`) so dev compose is untouched.
- **Add a Railway template** defining two services:
  - `typesense` — image `typesense/typesense:30.2`, persistent volume at `/data`, `--enable-cors`,
    a generated API key, exposed over Railway's auto-HTTPS domain.
  - `dashboard` — built from `Dockerfile.prod`, `base = '/'`.
  - Provide via a `railway.json`/`railway.toml` plus a published Railway template, then add the
    **"Deploy on Railway"** button to `README.md`.
- **Optional polish**: have the template inject the Typesense host/key into the dashboard's auth
  prefill URL so the deployed stack is connected out of the box.

## Critical files

- `vite.config.ts` — env-driven `base`; verify Sentry no-op.
- `Dockerfile.prod` (new) — multi-stage production build + static serve.
- `railway.json` / `railway.toml` (new) + Railway template — two-service stack.
- `vercel.json` / `netlify.toml` (new, optional) — static host configs.
- `README.md` — Deploy section + one-click buttons.
- `.github/workflows/pages-build-deployment.yaml` — pass `VITE_BASE_PATH=/typesense-dashboard` to
  preserve current GH Pages behavior.

## Verification

- `pnpm build` locally with `VITE_BASE_PATH=/` and `VITE_MAPBOX_TOKEN=<token>`; confirm `dist/`
  asset paths are root-relative and geosearch loads.
- `pnpm preview` and load `/#/auth`; connect to a Typesense instance to confirm hash routing + the
  SPA work from the new base.
- Build `Dockerfile.prod`, run the container, hit it over HTTP, verify the static app serves and
  routes.
- On Railway: deploy the template, confirm Typesense comes up with an HTTPS domain and the
  dashboard connects to it without mixed-content errors.
- Confirm the existing GitHub Pages deploy still works unchanged (base path preserved).
