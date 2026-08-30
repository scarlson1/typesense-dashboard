# Typesense Dashboard — Marketing Site

Marketing/landing site for the Typesense Dashboard. This is a **standalone**
project: it has its own `package.json` and `node_modules` and does **not** share
dependencies with the dashboard app in the repo root.

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [TanStack Start](https://tanstack.com/start) (SSR) on
  [TanStack Router](https://tanstack.com/router) file-based routing
- [MUI](https://mui.com/material-ui/) (Material UI) with Emotion for styling

## Getting started

```bash
cd website
pnpm install
pnpm dev        # http://localhost:3000
```

## Build & run

```bash
pnpm build      # vite build + tsc --noEmit -> dist/
```

The build produces a server bundle at `dist/server/server.js` and static client
assets at `dist/client`. Serve it with any Node host, e.g.:

```bash
pnpm dlx srvx --prod -s dist/client dist/server/server.js
```

TanStack Start uses Nitro under the hood, so host-specific presets (Vercel,
Netlify, Cloudflare, Node) are available — see
<https://tanstack.com/start/latest/docs/framework/react/hosting>.

## Styling notes

MUI is wired up in [`src/routes/__root.tsx`](src/routes/__root.tsx): an Emotion
`CacheProvider` wraps `ThemeProvider` + `CssBaseline` so styles render
server-side (no flash of unstyled content). The theme lives in
[`src/setup/theme.ts`](src/setup/theme.ts).

Two Vite config details make MUI SSR work (see
[`vite.config.ts`](vite.config.ts)):

- `ssr.noExternal: ['@mui/*', '@emotion/*']` — bundle MUI/Emotion for SSR.
- `resolve.dedupe: [...]` — keep a single React/Emotion instance so MUI's
  context hooks don't hit a null dispatcher during SSR.

Note: with MUI v9, system style props (`alignItems`, `maxWidth`, etc.) are no
longer accepted directly on components — pass them via the `sx` prop.

## SEO

All crawler- and unfurler-facing metadata is centralised in [`src/seo.ts`](src/seo.ts)
and wired into the document head from
[`src/routes/__root.tsx`](src/routes/__root.tsx):

- title/description, `robots`, `theme-color`
- Open Graph + Twitter `summary_large_image` (card art at `public/og.jpg`, 1200x630)
- `rel=canonical`
- JSON-LD `SoftwareApplication` for rich results

`robots.txt` and `sitemap.xml` are **server routes**
([`src/routes/robots[.]txt.ts`](src/routes/robots[.]txt.ts),
[`src/routes/sitemap[.]xml.ts`](src/routes/sitemap[.]xml.ts)) rather than files in
`public/`, so the absolute URLs they contain are resolved from the request origin
and stay correct on preview deploys and custom domains.

### Site URL

Canonical, `og:url`, `og:image` and the sitemap need an absolute origin. It is
inlined at build time by [`vite.config.ts`](vite.config.ts):

1. `VITE_SITE_URL` if set (use this for a custom domain), else
2. `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel injects automatically, else
3. empty - in which case the URL-dependent tags are **omitted**. That is
   deliberate: no canonical is better than one pointing at a domain we don't own.

So Vercel needs no configuration. For local checks, put
`VITE_SITE_URL=https://example.com` in a `.env` (gitignored).

### Images and Core Web Vitals

React 19 emits `<link rel=preload as=image>` during SSR for any `<img>` it renders
without `loading="lazy"`. The below-the-fold screenshots therefore carry explicit
`loading='lazy'` and intrinsic `width`/`height` - the former keeps several MB of
screenshots out of the preload set, the latter reserves the aspect ratio so they
don't shift layout (CLS).

## Routing

File-based routing in `src/routes`. Add a route by adding a file; the route tree
(`src/routeTree.gen.ts`) is generated automatically. Use the MUI-integrated
`ButtonLink` in [`src/components/ButtonLink.tsx`](src/components/ButtonLink.tsx)
for router-aware MUI buttons.
