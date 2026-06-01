# Deploying typesense-dashboard as an Electron app

## Context

The dashboard is a client-side static SPA (Vite 6 + React 19 + TanStack Router with
`createHashHistory`, `src/main.tsx:34`). Packaging it as an Electron desktop app gives users a
native, installable binary and — most importantly — **sidesteps the browser TLS / mixed-content
pain documented in `README.md:29-44`**: a desktop renderer can talk to a local or plain-HTTP
Typesense without certificates, ngrok, or `nip.io`.

Two properties of the app make this a good fit:

- **Hash routing** (`createHashHistory`) works directly when the app is loaded from `file://`, so
  no dev-server or custom protocol is required to serve routes.
- `src/main.tsx:38` already derives the router `basepath` from `import.meta.env.BASE_URL`, so a
  relative Vite `base` will keep routing correct inside Electron.

## Recommended toolchain (current versions, verified May 2026)

| Tool | Version | Role |
| --- | --- | --- |
| **Electron** | **41.7.1** (stable) | Desktop runtime (Chromium + Node) |
| **electron-vite** (`alex8088`) | **5.0.0** (stable) | Build tooling; requires Node 20.19+/22.12+, **Vite 5.0+** — compatible with the repo's Vite 6.3.5 |
| **electron-builder** | **26.8.1** | Packaging, installers, code-signing, auto-update |

Notes:
- electron-vite **6.0.0-beta** exists but stick with **stable 5.0.0** for Vite 6.
- **electron-builder** is recommended over Electron Forge here: it produces signed cross-platform
  installers and supports auto-update with the least config. (Forge v7 is the official alternative;
  v8 is still alpha.)
- Requires bumping the local Node toolchain to **20.19+ / 22.12+** (repo `engines` currently says
  `>=18.12`).

## Architecture

electron-vite expects three build targets. The existing Vite app becomes the **renderer**; add a
thin **main** and **preload**:

```
electron/
  main.ts        # creates BrowserWindow, loads renderer, app lifecycle
  preload.ts     # contextBridge: expose minimal safe APIs (e.g. app version)
electron.vite.config.ts   # main/preload/renderer configs (renderer reuses existing plugins)
```

- **Renderer config** reuses the current `vite.config.ts` plugins: `tanstackRouter`, `react`,
  `@` alias, and `sentryVitePlugin` (already no-ops without `SENTRY_AUTH_TOKEN`). Set
  `base: './'` for `file://` loading.
- **main.ts**: create a `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`,
  load `dist/index.html` in production / dev-server URL in development (electron-vite wires this via
  `process.env['ELECTRON_RENDERER_URL']`).
- **preload.ts**: expose only what's needed (e.g. `VITE_APP_VERSION`, platform) via `contextBridge`.

## Solving CORS / TLS (the main payoff)

Pick one, in order of preference:

1. **Relax web security for Typesense origins only** — in `main.ts`, use
   `session.defaultSession.webRequest.onHeadersReceived` to inject permissive CORS headers, so the
   Typesense JS client (renderer `fetch`/XHR) can hit any host without the server needing
   `--enable-cors` and without HTTPS. Keeps `webSecurity: true` for everything else.
2. **Proxy through the main process** — expose a `typesenseFetch` over the preload bridge that runs
   requests from Node (no CORS at all). Most secure but requires adapting the client transport.
3. Last resort: `webSecurity: false` (simplest, least safe — avoid for a distributed app).

Recommendation: **option 1**. It removes the documented TLS headache while keeping isolation.

## Implementation steps

1. **Add deps** (dev): `electron@41`, `electron-vite@5`, `electron-builder@26`. Bump `engines.node`
   to `>=20.19`.
2. **Add `electron/main.ts` + `electron/preload.ts`** as above.
3. **Add `electron.vite.config.ts`** with `main`, `preload`, and a `renderer` section that imports
   the existing renderer plugins/alias and sets `base: './'`.
4. **Scripts** in `package.json`:
   - `electron:dev` → `electron-vite dev`
   - `electron:build` → `electron-vite build`
   - `electron:pack` → `electron-vite build && electron-builder` (use `--mac`/`--win`/`--linux`)
5. **`electron-builder.yml`**: `appId`, `productName`, targets (dmg/nsis/AppImage), `files`
   (built `out/`), icons under `build/`. Configure `publish` (e.g. GitHub Releases) for auto-update.
6. **Env vars**: `VITE_APP_VERSION` is baked at renderer build time — pass it in the build script /
   CI. Geosearch is enabled per-user via an in-app Mapbox token (stored locally); released
   installers ship without a baked `VITE_MAPBOX_TOKEN` so they don't leak the maintainer's key.
7. **CI** (optional): a `release` workflow running `electron-builder` on macOS + Windows + Linux
   runners, uploading artifacts to GitHub Releases. Code-signing certs/notarization via secrets.

## Critical files

- `electron/main.ts`, `electron/preload.ts` (new) — Electron process code.
- `electron.vite.config.ts` (new) — three-target build; renderer reuses existing plugins, `base: './'`.
- `electron-builder.yml` (new) — packaging/targets/publish config.
- `package.json` — add deps, `electron:*` scripts, `engines.node`, optional `"main"` entry.
- `src/main.tsx` — already BASE_URL-aware (`:38`); verify routing under `base: './'`.
- `vite.config.ts` — unchanged for web; renderer config in electron-vite mirrors its plugins.

## Gotchas

- **Node version**: electron-vite 5 needs Node 20.19+/22.12+ — update local + CI before installing.
- **`base: './'`**: required so `file://` finds assets; `import.meta.env.BASE_URL` then resolves and
  `src/main.tsx:38` keeps the router basepath correct.
- **Sentry plugin** runs during renderer build; harmless without `SENTRY_AUTH_TOKEN` (skips upload).
- **Mapbox token**: entered in-app and stored in `localStorage`; an optional build-time
  `VITE_MAPBOX_TOKEN` acts only as a fallback default. Without either, the Map view prompts for a
  token instead of rendering.
- **Code-signing**: macOS notarization + Windows signing need certs/secrets — required to avoid
  Gatekeeper/SmartScreen warnings on distribution. See [Code signing](#code-signing) below.

## Verification

- `pnpm electron:dev` — window opens, hash routes work, hot reload functions.
- In dev, open `/#/auth` and connect to a **plain-HTTP local Typesense** (no certs) — confirm the
  CORS/TLS workaround lets requests through.
- `pnpm electron:pack` for the host platform — install the produced artifact and launch; confirm
  assets load from `file://`, geosearch works (with token), and Typesense connection succeeds.
- Verify the existing web (GitHub Pages / static) build still works unchanged — Electron config is
  additive and must not alter `vite.config.ts` web output.

## Releases

The [Build Electron installers](../.github/workflows/electron-release.yaml) workflow runs on a
`v*.*.*` tag push (or manual dispatch). On a tag push it calls
`electron-builder --publish always`, which uploads the per-OS installers and the `latest*.yml`
update manifests to a **draft** GitHub Release. Cutting a release:

1. Bump `version` in `package.json` (electron-builder derives the release tag/version from it).
2. Commit, then push a matching tag: `git tag v1.2.3 && git push origin v1.2.3`.
3. Wait for the three matrix jobs (macOS/Windows/Linux) to finish, then open the draft Release on
   GitHub, confirm all installers attached, and click **Publish**.
4. The README links to `/releases/latest`, so publishing makes the downloads live automatically.

Manual `workflow_dispatch` runs skip publishing and only upload artifacts to the workflow run
(useful for test builds).

## Code signing

Unsigned builds work but trip OS protections: macOS Gatekeeper blocks the `.dmg` ("can't be opened
because Apple cannot check it for malicious software") and Windows SmartScreen flags the `.exe`
("Windows protected your PC"). Signing + notarization removes both. electron-builder reads signing
config from environment variables, so this is all done via GitHub Actions secrets — no `yml`
changes needed beyond exposing the secrets in the `Build & package` step's `env:`.

### macOS (Developer ID + notarization)

Requires a paid Apple Developer account ($99/yr).

1. In the Apple Developer portal create a **Developer ID Application** certificate. Export it from
   Keychain Access as a `.p12` with a password, then base64-encode it:
   `base64 -i cert.p12 | pbcopy`.
2. Create an **app-specific password** (appleid.apple.com → Sign-In and Security) for notarization,
   and note your **Team ID** (Membership page).
3. Add repo secrets:
   - `CSC_LINK` — base64 of the `.p12`
   - `CSC_KEY_PASSWORD` — the `.p12` export password
   - `APPLE_ID` — your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` — the app-specific password
   - `APPLE_TEAM_ID` — your Team ID
4. Expose them in the macOS leg of the `env:` block. electron-builder auto-notarizes when
   `APPLE_ID`/`APPLE_APP_SPECIFIC_PASSWORD`/`APPLE_TEAM_ID` are present (it staples the ticket).
   For hardened-runtime entitlements add a `build/entitlements.mac.plist` and reference it under
   `mac.entitlements` in `electron-builder.yml`.

### Windows (Authenticode)

Options, cheapest-first:

- **Azure Trusted Signing** (cloud, ~ $10/mo, no SmartScreen reputation wait) — recommended if
  available in your region. Configure via the `azureSignOptions` block in `electron-builder.yml`.
- **OV / EV code-signing certificate** from a CA (DigiCert, Sectigo, …). An EV cert builds
  SmartScreen reputation immediately; OV certs accumulate it over time/installs.

For a file-based cert: base64-encode the `.pfx` and add secrets `WIN_CSC_LINK` (base64 `.pfx`) and
`WIN_CSC_KEY_PASSWORD`, then map them to `CSC_LINK`/`CSC_KEY_PASSWORD` in the Windows leg of `env:`.

### Linux

`.AppImage` needs no code signing. Optionally publish a detached GPG signature / checksum so users
can verify integrity.

### CI wiring sketch

```yaml
      - name: Build & package
        run: pnpm electron:build && pnpm exec electron-builder --publish ${{ startsWith(github.ref, 'refs/tags/') && 'always' || 'never' }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VITE_APP_VERSION: ${{ steps.vars.outputs.tag }}
          # macOS only — ignored on other runners
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

(Use `if: runner.os == 'macOS'` / `'Windows'` guarded steps, or separate env blocks, so each OS
only sees its own cert. Once signed, drop the "not yet code-signed" note from the README.)
