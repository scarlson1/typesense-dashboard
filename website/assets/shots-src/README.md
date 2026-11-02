# Screenshot sources

Full-resolution dashboard screenshots. **Nothing here is deployed** — this
directory sits outside `public/`, so the ~14MB of PNGs never reaches the
build output. The landing page serves downscaled AVIF/WebP derivatives from
`public/assets/shots/` instead.

## Workflow

1. Drop or replace a PNG export here, keeping the filename stable.
2. Run the generator from `website/`:

```bash
npm run shots
```

That wipes and rebuilds `public/assets/shots/` (640w / 1024w / 1600w in both
AVIF and WebP, never upscaling past the source) and regenerates the typed
manifest at `src/components/landing/shots.gen.ts`. Components read intrinsic
dimensions from that manifest, so nothing needs hand-editing when a screenshot
is re-exported at a different size.

Requires ImageMagick 7 (`brew install imagemagick`). Commit both the source
PNG and the regenerated derivatives.

## Where each shot is used

| File                      | Used in                         | Theme |
| ------------------------- | ------------------------------- | ----- |
| `cluster-dark.png`        | Gallery (wide)                  | Dark  |
| `search-light.png`        | Search highlight + Gallery      | Light |
| `search-dark.png`         | Search highlight                | Dark  |
| `map-light.png`           | Geosearch highlight             | Light |
| `map-dark.png`            | Geosearch highlight             | Dark  |
| `map-mobile-dark.png`     | Gallery (tall, mobile)          | Dark  |
| `schema-light.png`        | Open-source highlight           | Light |
| `schema-dark.png`         | Open-source highlight + Gallery | Dark  |
| `schema-mobile-light.png` | Gallery (tall, mobile)          | Light |
| `keys-light.png`          | Gallery                         | Light |
| `keys-dark.png`           | Gallery                         | Dark  |
| `add-docs-light.png`      | Gallery                         | Light |
