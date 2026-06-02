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

## Routing

File-based routing in `src/routes`. Add a route by adding a file; the route tree
(`src/routeTree.gen.ts`) is generated automatically. Use the MUI-integrated
`ButtonLink` in [`src/components/ButtonLink.tsx`](src/components/ButtonLink.tsx)
for router-aware MUI buttons.
