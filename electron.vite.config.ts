import { sentryVitePlugin } from '@sentry/vite-plugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';

// electron-vite builds three targets. The renderer mirrors the web vite.config.ts
// (same plugins + `@` alias) so the existing SPA runs unchanged inside Electron;
// only the base differs (relative for file:// loading in the packaged app).
export default defineConfig(({ command }) => ({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/main.ts') },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/preload.ts') },
      },
    },
  },
  renderer: {
    root: '.',
    // Dev server is served from '/'; the production build must be relative so
    // assets resolve under file://. src/main.tsx normalizes the resulting
    // BASE_URL ('./') back to a '/' router basepath.
    base: command === 'serve' ? '/' : './',
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      // Only upload source maps when an auth token is present so local /
      // CI Electron builds don't fail or warn (mirrors vite.config.ts).
      ...(process.env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG || 'spencer-carlson',
              project: process.env.SENTRY_PROJECT || 'typesense-dashboard',
              authToken: process.env.SENTRY_AUTH_TOKEN,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: { index: resolve(__dirname, 'index.html') },
        output: {
          // Mirrors vite.config.ts: keep monaco-editor's full language set out
          // of the entry chunk. It's only reached via the lazy JSON editors, so
          // isolating it shrinks first load and caps the largest chunk, which
          // is what was OOM-killing `electron-vite build` in CI. The vite
          // preload helper must get its own chunk first, or it co-locates into
          // the monaco chunk and the entry then statically pulls monaco again.
          manualChunks: (id: string) => {
            if (id.includes('vite/preload-helper')) return 'vite-preload';
            if (id.includes('node_modules/monaco-editor')) return 'monaco';
            return undefined;
          },
        },
      },
    },
  },
}));
