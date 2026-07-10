import { sentryVitePlugin } from '@sentry/vite-plugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    // Only upload source maps when an auth token is present so third-party /
    // self-hosted builds (Vercel, Netlify, Docker, Railway) don't fail or warn.
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
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  // Root-relative by default (Cloudflare Pages / Vercel / Netlify / Docker / Railway).
  // The GitHub Pages build sets VITE_BASE_PATH=/typesense-dashboard to keep its subpath.
  base: process.env.VITE_BASE_PATH ?? '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'sentry',
    rollupOptions: {
      output: {
        // monaco-editor bundles its full language set (~1.3MB gzip) and is only
        // reached through the lazily-loaded JSON editors. Without an explicit
        // chunk it gets hoisted into the entry bundle (shared across many lazy
        // import sites), bloating first load and producing a single ~5MB chunk
        // that exhausts Node's heap during the production build. Isolate it.
        //
        // The vite preload helper must get its own chunk first: otherwise it
        // co-locates into the monaco chunk, and every chunk that dynamically
        // imports anything (incl. the entry) then statically pulls monaco just
        // to reach the helper — eagerly preloading all 4MB. Splitting it out
        // keeps monaco loaded only when a JSON editor actually mounts.
        manualChunks: (id) => {
          if (id.includes('vite/preload-helper')) return 'vite-preload';
          if (id.includes('node_modules/monaco-editor')) return 'monaco';
          return undefined;
        },
      },
    },
  },
}));

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tanstackRouter({
//       target: 'react',
//       autoCodeSplitting: true,
//     }),
//     react(),
//     sentryVitePlugin({
//       org: process.env.SENTRY_ORG || 'spencer-carlson',
//       project: process.env.SENTRY_PROJECT || 'typesense-dashboard',
//       authToken: process.env.SENTRY_AUTH_TOKEN,
//     }),
//   ],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//   },
//   base: '/typesense-dashboard/',
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, 'src'),
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: false,
//   },
// });
