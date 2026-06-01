# Railway one-click template (Typesense + dashboard)

This documents the two-service Railway template that provisions a Typesense
server (with auto-HTTPS) **and** the dashboard together. Deploying both on
Railway eliminates the TLS / mixed-content pain described in the README: the
dashboard is served over HTTPS and reaches Typesense over Railway's HTTPS domain,
so there is no `ERR_NETWORK` error and no need for ngrok/self-signed certs.

`railway.json` in the repo root configures the **dashboard** service (build from
`Dockerfile.prod`). The Typesense service and the wiring between the two live in
the published Railway template, which is created in the Railway dashboard
(Account → Templates → New Template) using the settings below, then published so
the "Deploy on Railway" button in the README points at it.

## Service 1 — `typesense`

- **Source:** Docker image `typesense/typesense:30.2`
- **Volume:** mount a persistent volume at `/data`
- **Start command:**
  ```
  /opt/typesense-server --data-dir /data --api-key ${{TYPESENSE_API_KEY}} --api-port ${{PORT}} --enable-cors
  ```
  A custom start command **overrides the image's `ENTRYPOINT`** (`/opt/typesense-server`),
  so the binary must be named explicitly — otherwise Railway tries to exec the
  first flag and fails with `The executable '--data-dir' could not be found`.
  Railway terminates TLS at its edge, so Typesense itself serves plain HTTP on
  `$PORT` while the public domain is HTTPS.
- **Variables:**
  - `TYPESENSE_API_KEY` — generate a strong default (e.g. Railway's
    `${{ secret(32) }}` template function) so each deploy gets a unique key.
  - `PORT=8108` — so `--api-port ${{PORT}}` resolves deterministically and
    matches the public-domain target port.
- **Networking:** enable a public **HTTP** domain (Railway auto-HTTPS); set the
  target port to `8108`. Public (not private) because the client-side dashboard
  connects to Typesense directly from the browser.

## Service 2 — `dashboard`

- **Source:** this repo (`Dockerfile.prod` via `railway.json`).
- **Build args / variables:**
  - `VITE_BASE_PATH=/` (root-relative; this is also the default).
  - `VITE_MAPBOX_TOKEN` — optional. Geosearch is normally enabled per-user by
    entering a Mapbox token in-app (stored in the browser), so the template can
    leave this unset. Setting it bakes a default token into the build for every
    visitor of that instance — only do this with a token you intend to share.
- **Networking:** enable a public domain (Railway auto-HTTPS). nginx listens on
  `$PORT`, which Railway injects.

## Optional polish — prefill the auth route

The dashboard reads connection details from the `/#/auth` query string, so the
template can deploy "connected out of the box" by pointing users at a prefilled
URL built from the Typesense service's public domain and API key:

```
https://<dashboard-domain>/#/auth?node=<typesense-domain>&port=443&protocol=https&apiKey=<TYPESENSE_API_KEY>
```

Expose this as the template's post-deploy instructions, or inject it as a
`DASHBOARD_AUTH_URL` template variable referencing
`${{typesense.RAILWAY_PUBLIC_DOMAIN}}` and `${{typesense.TYPESENSE_API_KEY}}`.

## After publishing

Copy the published template URL (e.g.
`https://railway.com/deploy/<template-id>`) into the **Deploy on Railway** button
in `README.md`.
