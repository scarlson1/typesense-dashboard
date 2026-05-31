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
